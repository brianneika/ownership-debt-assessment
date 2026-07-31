'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  saveAnswer,
  setDrsProfile,
  setWorkflowModes,
  setTeaserCompleted,
  refineDrsProfile,
  answerToMode,
  B_QUESTION_TO_WORKFLOW,
  type WorkflowKey,
} from '@/lib/assessment';
import { getSupabaseServer } from '@/lib/supabase-server';
import { upsertHubspotContact } from '@/lib/hubspot';

// The 5 teaser questions, in display order.
const TEASER_KEYS = ['A006', 'B001', 'B002', 'B003', 'B004'] as const;

// ─── Start the teaser ─────────────────────────────────────────────────────────
// Reads the 5 answers, creates a teaser-origin session, saves them, and pre-routes
// the full assessment (drs_profile + workflow modes) exactly as Sections A/B would,
// so the eventual handoff opens pre-filled and pre-branched. Redirects to the
// preview.
export async function startTeaser(formData: FormData) {
  const values: Record<string, string> = {};
  for (const key of TEASER_KEYS) {
    const v = ((formData.get(key) as string) ?? '').trim();
    if (!v) return; // all 5 required; the client guards this too
    values[key] = v;
  }

  const sessionId = await createSession('teaser');
  const supabase = getSupabaseServer();

  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_key')
    .in('question_key', [...TEASER_KEYS]);
  const qId = Object.fromEntries((questions ?? []).map((q) => [q.question_key, q.id]));

  await Promise.all(
    TEASER_KEYS.map((key) =>
      qId[key]
        ? saveAnswer(sessionId, qId[key], {
            answer_type: 'categorical_radio',
            text_value: values[key],
          })
        : Promise.resolve(),
    ),
  );

  // Pre-route: set workflow modes + drs_profile now (same logic as advanceSectionB).
  const modes: Partial<Record<WorkflowKey, 'A' | 'B' | 'C'>> = {};
  for (const [bKey, wfKey] of Object.entries(B_QUESTION_TO_WORKFLOW)) {
    modes[wfKey as WorkflowKey] = answerToMode(values[bKey]);
  }
  await setWorkflowModes(sessionId, modes);

  const profile = refineDrsProfile(values['A006'], {
    C: modes.C ?? null,
    D: modes.D ?? null,
    E: modes.E ?? null,
    F: modes.F ?? null,
  });
  await setDrsProfile(sessionId, profile);

  await setTeaserCompleted(sessionId);

  redirect(`/teaser/${sessionId}`);
}

// ─── Unlock → full assessment ─────────────────────────────────────────────────
// The real conversion point. Captures name + business + email (+ consent by
// submission), saves A001/A002 so the full flow, admin, and HubSpot have identity,
// syncs the lead, then hands off into the full assessment with Sections A/B already
// answered on the board.
export async function unlockFullAssessment(sessionId: string, formData: FormData) {
  const name = ((formData.get('name') as string) ?? '').trim();
  const businessName = ((formData.get('business_name') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();

  if (!name || !businessName || !email.includes('@') || !email.includes('.')) return;

  const supabase = getSupabaseServer();
  const consentedAt = new Date().toISOString();

  // Save A001 (name) + A002 (business name) — the identity the full flow normally
  // collects on its landing page, which the teaser visitor skipped.
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_key')
    .in('question_key', ['A001', 'A002']);
  const qId = Object.fromEntries((questions ?? []).map((q) => [q.question_key, q.id]));

  await Promise.all([
    qId['A001']
      ? saveAnswer(sessionId, qId['A001'], { answer_type: 'free_text', text_value: name })
      : Promise.resolve(),
    qId['A002']
      ? saveAnswer(sessionId, qId['A002'], { answer_type: 'free_text', text_value: businessName })
      : Promise.resolve(),
  ]);

  // Email + consent — same by-submission mechanism as the results gate (migration 006).
  const { error } = await supabase
    .from('assessment_sessions')
    .update({ respondent_email: email, consented_at: consentedAt })
    .eq('id', sessionId);
  if (error) {
    console.error('[unlockFullAssessment] session update failed:', error);
    // Never lose the email itself (e.g. deployed before migration 006 ran).
    await supabase
      .from('assessment_sessions')
      .update({ respondent_email: email })
      .eq('id', sessionId);
  }

  // Sync the lead to HubSpot — side channel, never blocks the handoff.
  try {
    await Promise.race([
      upsertHubspotContact(sessionId, email, name, businessName, consentedAt),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('hubspot timeout')), 5000),
      ),
    ]);
  } catch (err) {
    console.error('[unlockFullAssessment] hubspot sync failed:', err);
  }

  redirect(`/assessment/${sessionId}/a`);
}
