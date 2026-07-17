'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  saveAnswer,
  fetchSessionAnswers,
  fetchSession,
  setDrsProfile,
  setWorkflowModes,
  completeSession,
  detectDrsProfileFromA006,
  refineDrsProfile,
  answerToMode,
  B_QUESTION_TO_WORKFLOW,
  type WorkflowKey,
} from '@/lib/assessment';
import { calculateScores } from '@/lib/scoring';
import { getSupabaseServer } from '@/lib/supabase-server';

// ─── Landing page ─────────────────────────────────────────────────────────────

// Creates session, saves A001 (name) + A002 (business name), redirects to /a
export async function createAssessmentSession(formData: FormData) {
  const name         = (formData.get('name') as string ?? '').trim();
  const businessName = (formData.get('business_name') as string ?? '').trim();

  if (!name || !businessName) return;

  const sessionId = await createSession();

  const supabase = getSupabaseServer();

  // Fetch A001 and A002 question IDs
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_key')
    .in('question_key', ['A001', 'A002']);

  const q = Object.fromEntries((questions ?? []).map((q) => [q.question_key, q.id]));

  await Promise.all([
    saveAnswer(sessionId, q['A001'], { answer_type: 'free_text', text_value: name }),
    saveAnswer(sessionId, q['A002'], { answer_type: 'free_text', text_value: businessName }),
  ]);

  redirect(`/assessment/${sessionId}/a`);
}

// ─── Per-answer save (called from client radio onChange) ─────────────────────

export async function saveRadioAnswer(
  sessionId: string,
  questionId: number,
  answerType: 'scored_radio' | 'categorical_radio',
  value: string,
) {
  if (answerType === 'scored_radio') {
    await saveAnswer(sessionId, questionId, {
      answer_type: 'scored_radio',
      score_value: parseInt(value, 10),
    });
  } else {
    await saveAnswer(sessionId, questionId, {
      answer_type: 'categorical_radio',
      text_value: value,
    });
  }
}

// ─── Section A → finalize + advance ──────────────────────────────────────────

// Reads A006 from DB, sets drs_profile, advances to Section B.
export async function advanceSectionA(sessionId: string) {
  // fetchSessionAnswers is now keyed by question_key — look up directly by key
  const answers = await fetchSessionAnswers(sessionId);
  const a006Value = answers.get('A006')?.text_value ?? '';

  const profile = detectDrsProfileFromA006(a006Value);
  await setDrsProfile(sessionId, profile);

  redirect(`/assessment/${sessionId}/b`);
}

// ─── Section B → finalize + advance ──────────────────────────────────────────

// Reads B001–B004 from DB, computes and saves workflow modes,
// refines drs_profile if needed, redirects to Workflow C.
export async function advanceSectionB(sessionId: string) {
  // fetchSessionAnswers is keyed by question_key — look up B001–B004 and A006 directly
  const answers = await fetchSessionAnswers(sessionId);

  const modes: Partial<Record<WorkflowKey, 'A' | 'B' | 'C'>> = {};
  for (const [qKey, wfKey] of Object.entries(B_QUESTION_TO_WORKFLOW)) {
    const textValue = answers.get(qKey)?.text_value;
    if (textValue) {
      modes[wfKey as WorkflowKey] = answerToMode(textValue);
    }
  }

  await setWorkflowModes(sessionId, modes);

  // Refine drs_profile: "2 people" + 3+ Mode A → override to solo
  const a006Value = answers.get('A006')?.text_value ?? '';
  const refinedProfile = refineDrsProfile(a006Value, {
    C: modes.C ?? null,
    D: modes.D ?? null,
    E: modes.E ?? null,
    F: modes.F ?? null,
  });
  await setDrsProfile(sessionId, refinedProfile);

  redirect(`/assessment/${sessionId}/c`);
}

// ─── Workflow sections C–F → save free text + advance ────────────────────────

// Mode A only: saves TBx3 obstacle text before advancing.
export async function advanceWorkflow(
  sessionId: string,
  nextSection: string,
  formData: FormData,
) {
  // Save any free_text answers passed in form (TBx3 fields)
  const freeTextEntries = [...formData.entries()].filter(([k]) => k.startsWith('ft_'));
  if (freeTextEntries.length > 0) {
    const supabase = getSupabaseServer();
    await Promise.all(
      freeTextEntries.map(async ([key, value]) => {
        const questionId = parseInt(key.replace('ft_', ''), 10);
        await saveAnswer(sessionId, questionId, {
          answer_type: 'free_text',
          text_value: value as string,
        });
      }),
    );
  }

  redirect(`/assessment/${sessionId}/${nextSection}`);
}

// ─── Section H → submit assessment ───────────────────────────────────────────

export async function submitAssessment(sessionId: string, formData: FormData) {
  const supabase = getSupabaseServer();

  // Q089 and Q090 are free_text fields named ft_<question_id> in the form.
  // Look up their IDs so we can read the right form field names.
  const { data: hQuestions } = await supabase
    .from('questions')
    .select('id, question_key')
    .in('question_key', ['Q089', 'Q090']);

  const qMap = Object.fromEntries((hQuestions ?? []).map((q) => [q.question_key, q.id]));

  const q089 = (formData.get(`ft_${qMap['Q089']}`) as string ?? '').trim();
  const q090 = (formData.get(`ft_${qMap['Q090']}`) as string ?? '').trim();

  await Promise.all([
    q089 && qMap['Q089']
      ? saveAnswer(sessionId, qMap['Q089'], { answer_type: 'free_text', text_value: q089 })
      : Promise.resolve(),
    q090 && qMap['Q090']
      ? saveAnswer(sessionId, qMap['Q090'], { answer_type: 'free_text', text_value: q090 })
      : Promise.resolve(),
  ]);

  await completeSession(sessionId);

  let scoring;
  try {
    scoring = await calculateScores(sessionId);
  } catch (err) {
    console.error('[submitAssessment] calculateScores failed:', err);
  }

  redirect(`/results/${sessionId}`);
}
