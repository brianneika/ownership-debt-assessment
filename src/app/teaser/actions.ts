'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  saveAnswer,
  setDrsProfile,
  setWorkflowModes,
  setTeaserCompleted,
  ownerAnswerToModeV2,
  type WorkflowKey,
  type WorkflowMode,
} from '@/lib/assessment';
import { getSupabaseServer } from '@/lib/supabase-server';
import { upsertHubspotContact } from '@/lib/hubspot';
import { TEASER_NO_ONE_VALUE } from '@/lib/teaser';

// Teaser on instrument v2 (plans/tasks/20261017-assessment-v2-questions-and-section-copy.md):
//   grid rows  V2B_C to V2B_F -> 'yes' | 'no' | 'not_done'
//              (stored as named_owner | me | not_done, the full flow's v2 owner values)
//   authority  V2G_DECISIONS  -> '0'..'4'  (stored as score_value, same as Section G)
//   take back  V2G_MOVED      -> '0'..'4', or '5' for "I don't have anyone to hand work to yet"
// The v1 teaser (B001 to B004, Q079, Q074) is retired with v1; v1 teaser sessions
// already in progress still read through /teaser/[sessionId] on v1 keys.
const TEASER_GRID_KEYS = ['V2B_C', 'V2B_D', 'V2B_E', 'V2B_F'] as const;
const TEASER_AUTHORITY_KEY = 'V2G_DECISIONS';
const TEASER_TAKE_BACK_KEY = 'V2G_MOVED';

const GRID_TO_VALUE: Record<string, string> = {
  yes: 'named_owner', // a named owner exists; the full flow's "Who owns what" asks the role
  no: 'me',
  not_done: 'not_done',
};

const GRID_TO_WORKFLOW: Record<string, WorkflowKey> = { V2B_C: 'C', V2B_D: 'D', V2B_E: 'E', V2B_F: 'F' };

function parseScore(raw: string, max = 4): number | null {
  if (!/^[0-9]$/.test(raw)) return null;
  const n = Number(raw);
  return n <= max ? n : null;
}

// ─── Start the teaser ─────────────────────────────────────────────────────────
// Reads the grid plus the two leader answers, creates a teaser-origin session,
// saves everything in the shapes the full flow already uses, pre-routes the four
// workflows, and redirects to the preview.
export async function startTeaser(formData: FormData) {
  const grid: Record<string, string> = {};
  for (const key of TEASER_GRID_KEYS) {
    const v = ((formData.get(key) as string) ?? '').trim();
    if (!GRID_TO_VALUE[v]) return; // all rows required; the client guards this too
    grid[key] = GRID_TO_VALUE[v];
  }
  const authority = parseScore(((formData.get(TEASER_AUTHORITY_KEY) as string) ?? '').trim());
  const takeBack = parseScore(((formData.get(TEASER_TAKE_BACK_KEY) as string) ?? '').trim(), TEASER_NO_ONE_VALUE);
  if (authority === null || takeBack === null) return;

  const sessionId = await createSession('teaser');
  const supabase = getSupabaseServer();

  const keys = [...TEASER_GRID_KEYS, TEASER_AUTHORITY_KEY, TEASER_TAKE_BACK_KEY];
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_key')
    .in('question_key', keys);
  const qId = Object.fromEntries((questions ?? []).map((q) => [q.question_key, q.id]));

  await Promise.all([
    ...TEASER_GRID_KEYS.map((key) =>
      qId[key]
        ? saveAnswer(sessionId, qId[key], {
            answer_type: 'categorical_radio',
            text_value: grid[key],
          })
        : Promise.resolve(),
    ),
    qId[TEASER_AUTHORITY_KEY]
      ? saveAnswer(sessionId, qId[TEASER_AUTHORITY_KEY], {
          answer_type: 'scored_radio',
          score_value: authority,
        })
      : Promise.resolve(),
    qId[TEASER_TAKE_BACK_KEY]
      ? saveAnswer(sessionId, qId[TEASER_TAKE_BACK_KEY], {
          answer_type: 'scored_radio',
          score_value: takeBack,
        })
      : Promise.resolve(),
  ]);

  // Pre-route: set workflow modes now (same mapping as the full flow's v2 Section B).
  const modes: Partial<Record<WorkflowKey, WorkflowMode>> = {};
  for (const key of TEASER_GRID_KEYS) {
    modes[GRID_TO_WORKFLOW[key]] = ownerAnswerToModeV2(grid[key]);
  }
  await setWorkflowModes(sessionId, modes);

  // The teaser doesn't ask support size. "No one to hand work to" reads as the
  // no-support track for now; Section A's support question settles it on unlock.
  await setDrsProfile(sessionId, takeBack === TEASER_NO_ONE_VALUE ? 'solo' : 'team');

  await setTeaserCompleted(sessionId);

  redirect(`/teaser/${sessionId}`);
}

// ─── Unlock → full assessment ─────────────────────────────────────────────────
// The real conversion point. Captures name + business + email (+ consent by
// submission), saves A001/A002 so the full flow, admin, and HubSpot have identity,
// syncs the lead, then hands off into the full assessment with the four workflows
// already routed and Q074/Q079 already on the board.
export async function unlockFullAssessment(sessionId: string, formData: FormData) {
  const name = ((formData.get('name') as string) ?? '').trim();
  const businessName = ((formData.get('business_name') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();

  if (!name || !businessName || !email.includes('@') || !email.includes('.')) return;

  const supabase = getSupabaseServer();
  const consentedAt = new Date().toISOString();

  // Save A001 (name) + A002 (business name), the identity the full flow normally
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

  // Email + consent, same by-submission mechanism as the results gate (migration 006).
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

  // Sync the lead to HubSpot, side channel, never blocks the handoff.
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
