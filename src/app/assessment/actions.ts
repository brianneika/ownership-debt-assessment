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
  V2_OWNER_KEYS,
  ownerAnswerToModeV2,
  drsProfileFromSupportV2,
  type WorkflowKey,
  type WorkflowMode,
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

// Saves any free-text fields (named ft_<question_id>) posted with a section.
async function saveFreeTextFields(sessionId: string, formData: FormData) {
  const entries = [...formData.entries()].filter(([k]) => k.startsWith('ft_'));
  await Promise.all(
    entries.map(async ([key, value]) => {
      const questionId = parseInt(key.replace('ft_', ''), 10);
      const text = String(value ?? '').trim();
      if (!questionId || !text) return;
      await saveAnswer(sessionId, questionId, { answer_type: 'free_text', text_value: text });
    }),
  );
}

// Reads A006 from DB, sets drs_profile, advances to Section B.
export async function advanceSectionA(sessionId: string) {
  const [session, answers] = await Promise.all([fetchSession(sessionId), fetchSessionAnswers(sessionId)]);

  // v2: the readiness track depends on whether support exists, nothing else.
  if (session?.instrument_version === 2) {
    await setDrsProfile(sessionId, drsProfileFromSupportV2(answers.get('V2A_SUPPORT')?.text_value));
    redirect(`/assessment/${sessionId}/b`);
  }

  const a006Value = answers.get('A006')?.text_value ?? '';

  const profile = detectDrsProfileFromA006(a006Value);
  await setDrsProfile(sessionId, profile);

  redirect(`/assessment/${sessionId}/b`);
}

// ─── Section B → finalize + advance ──────────────────────────────────────────

// Reads B001–B004 from DB, computes and saves workflow modes,
// refines drs_profile if needed, redirects to Workflow C.
export async function advanceSectionB(sessionId: string, formData?: FormData) {
  const session = await fetchSession(sessionId);

  if (session?.instrument_version === 2) {
    // Role boxes for "Another person or provider" are free text on this page.
    if (formData) await saveFreeTextFields(sessionId, formData);
    const answers = await fetchSessionAnswers(sessionId);
    const modes: Partial<Record<WorkflowKey, WorkflowMode>> = {};
    for (const [wf, qKey] of Object.entries(V2_OWNER_KEYS) as [WorkflowKey, string][]) {
      const value = answers.get(qKey)?.text_value;
      if (value) modes[wf] = ownerAnswerToModeV2(value);
    }
    await setWorkflowModes(sessionId, modes);
    // No 2-person override in v2 (decision 5): support alone picks the track.
    await setDrsProfile(sessionId, drsProfileFromSupportV2(answers.get('V2A_SUPPORT')?.text_value));
    redirect(`/assessment/${sessionId}/c`);
  }

  // fetchSessionAnswers is keyed by question_key — look up B001–B004 and A006 directly
  const answers = await fetchSessionAnswers(sessionId);

  const modes: Partial<Record<WorkflowKey, WorkflowMode>> = {};
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
  const session = await fetchSession(sessionId);

  if (session?.instrument_version === 2) {
    // v2 final questions: the two optional notes are the only free text here.
    await saveFreeTextFields(sessionId, formData);
    await completeSession(sessionId);
    try {
      await calculateScores(sessionId);
    } catch (err) {
      console.error('[submitAssessment] calculateScores failed:', err);
    }
    redirect(`/results/${sessionId}`);
  }

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
