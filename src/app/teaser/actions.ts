'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  saveAnswer,
  setDrsProfile,
  setWorkflowModes,
  setTeaserCompleted,
  answerToMode,
  B_QUESTION_TO_WORKFLOW,
  type WorkflowKey,
} from '@/lib/assessment';
import { getSupabaseServer } from '@/lib/supabase-server';
import { upsertHubspotContact } from '@/lib/hubspot';

// Teaser v2 (plans/tasks/20260911-teaser-named-owner-grid.md):
//   grid rows  B001 to B004  -> 'yes' | 'no'   (stored as named_owner | team_leader)
//   authority  Q079          -> '0'..'4'       (stored as score_value, same as Section G)
//   take back  Q074          -> '0'..'4'       (stored as score_value, same as Section G)
const TEASER_GRID_KEYS = ['B001', 'B002', 'B003', 'B004'] as const;
const TEASER_AUTHORITY_KEY = 'Q079';
const TEASER_TAKE_BACK_KEY = 'Q074';

// Grid "Yes" is stored as this value on B001 to B004. answerToMode maps it to
// Mode B; the full flow's section intros fall back to "your team member" because
// it matches no role option, and Section B lets the leader pick the actual role.
const NAMED_OWNER_VALUE = 'named_owner';

function parseScore(raw: string): number | null {
  if (!/^[0-4]$/.test(raw)) return null;
  return Number(raw);
}

// ─── Start the teaser ─────────────────────────────────────────────────────────
// Reads the grid plus the two leader answers, creates a teaser-origin session,
// saves everything in the shapes the full flow already uses, pre-routes the four
// workflows, and redirects to the preview.
export async function startTeaser(formData: FormData) {
  const grid: Record<string, string> = {};
  for (const key of TEASER_GRID_KEYS) {
    const v = ((formData.get(key) as string) ?? '').trim();
    if (v !== 'yes' && v !== 'no') return; // all rows required; the client guards this too
    grid[key] = v === 'yes' ? NAMED_OWNER_VALUE : 'team_leader';
  }
  const authority = parseScore(((formData.get(TEASER_AUTHORITY_KEY) as string) ?? '').trim());
  const takeBack = parseScore(((formData.get(TEASER_TAKE_BACK_KEY) as string) ?? '').trim());
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

  // Pre-route: set workflow modes now (same logic as advanceSectionB).
  const modes: Partial<Record<WorkflowKey, 'A' | 'B' | 'C'>> = {};
  for (const [bKey, wfKey] of Object.entries(B_QUESTION_TO_WORKFLOW)) {
    modes[wfKey as WorkflowKey] = answerToMode(grid[bKey]);
  }
  await setWorkflowModes(sessionId, modes);

  // The teaser no longer asks team size. Four "No" rows read as a solo operator
  // for now; Section A (A006) and Section B refine this on unlock.
  const allOwnerRun = Object.values(modes).every((m) => m === 'A');
  await setDrsProfile(sessionId, allOwnerRun ? 'solo' : 'team');

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
