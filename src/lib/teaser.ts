// lib/teaser.ts
// The teaser "estimate band": a directional preview computed from the teaser
// answers. This is NOT the real ODS/DRS; it is an honest proxy, always labeled
// preliminary. The real scores come from the full assessment (src/lib/scoring.ts)
// once Sections C through H are answered.
//
// Teaser v2 (2026-09-11, plans/tasks/20260911-teaser-named-owner-grid.md):
//   - a Yes/No named-owner grid for the four workflows (stored on B001 to B004)
//   - Q079, whether decision authority actually transfers (0 to 4)
//   - Q074, whether handed-off work stays handed off (0 to 4)
// A named owner only earns credit in proportion to the authority answer, so a TC
// on paper with a leader who still makes every call no longer reads as delegated.
//
// Pure functions only, no DB, no side effects.

import { answerToMode, B_QUESTION_TO_WORKFLOW, type WorkflowKey } from './assessment';

// 'getting_started' (v2): no one to hand work to yet, so no readiness tier is
// claimed for a staffing fact.
export type DelegationTier = 'low' | 'developing' | 'ready' | 'getting_started';

export interface TeaserEstimate {
  // Headline: rough share of the 4 core workflows that still route through the owner.
  ownerDependencePct: number;
  // Qualitative label for the headline number (never false precision).
  bandLabel: string;
  // Secondary: how ready the leader looks to let work stay handed off.
  tier: DelegationTier;
  tierLabel: string;
  tierBlurb: string;
  // Mode tallies across the 4 workflows, for optional UI detail.
  modeA: number; // owner still runs it (team_leader / grid "No")
  modeB: number; // a named owner exists (grid "Yes" or a role)
  modeC: number; // shared / no clear owner (legacy full-flow value)
  // Number of the 4 workflow answers we actually have.
  answered: number;
  // v2: workflows marked "We don't do this", left out of the headline.
  notDone?: number;
  // v2 headline (Bri, 2026-10-19): a plain count replaces the percentage.
  ownerOnly?: number; // rows answered "No": no owner but the leader
  measured?: number; // rows not marked "We don't do this"
  countLine?: string;
  // The two leader answers, 0 to 4, when present.
  authority: number | null;
  takeBack: number | null;
}

// The teaser answers, as raw stored values.
export interface TeaserAnswers {
  b: Partial<Record<WorkflowKey, string | null>>; // B001 to B004 values by workflow key
  authority: number | null; // Q079 score_value
  takeBack: number | null;  // Q074 score_value
}

const TIER_LABEL: Record<DelegationTier, string> = {
  low: 'Low',
  developing: 'Developing',
  ready: 'Ready',
  getting_started: 'Getting started',
};

const TIER_BLURB: Record<DelegationTier, string> = {
  low: 'Work that leaves your plate tends to come back. The gap is in the handoff, not the people.',
  developing: 'Some things stay handed off, some come back. A delegation foundation is forming.',
  ready: 'What you hand off tends to stay handed off. Your team looks ready to carry more.',
  getting_started:
    "You don't have anyone to hand work to yet. The full assessment looks at what to set up before your first hire.",
};

// Share of a named-owner workflow that still routes through the leader, by the
// Q079 authority answer. 0 = every decision still needs approval, 4 = full transfer.
const NAMED_OWNER_DEPENDENCE: Record<number, number> = {
  0: 1.0,
  1: 0.75,
  2: 0.5,
  3: 0.25,
  4: 0,
};

// "Shared / no clear owner" in practice means it lands back on the owner.
const SHARED_DEPENDENCE = 0.75;

function bandLabelFor(pct: number): string {
  if (pct >= 75) return 'Heavily owner-run';
  if (pct >= 50) return 'Owner-heavy';
  if (pct >= 25) return 'Shared load';
  return 'Largely delegated';
}

function clampScore(v: number | null): number | null {
  if (v === null || Number.isNaN(v)) return null;
  return Math.max(0, Math.min(4, Math.round(v)));
}

export function computeTeaserEstimate(answers: TeaserAnswers): TeaserEstimate {
  const authority = clampScore(answers.authority);
  const takeBack = clampScore(answers.takeBack);

  // When the authority answer is missing, assume the middle of the scale rather
  // than granting full credit for a title.
  const namedOwnerDependence = NAMED_OWNER_DEPENDENCE[authority ?? 2];

  let modeA = 0;
  let modeB = 0;
  let modeC = 0;
  let answered = 0;
  let dependence = 0;

  for (const wfKey of Object.values(B_QUESTION_TO_WORKFLOW)) {
    const value = answers.b[wfKey];
    if (!value) continue;
    answered += 1;
    const mode = answerToMode(value);
    if (mode === 'A') {
      modeA += 1;
      dependence += 1;
    } else if (mode === 'B') {
      modeB += 1;
      dependence += namedOwnerDependence;
    } else {
      modeC += 1;
      dependence += SHARED_DEPENDENCE;
    }
  }

  // Always divide by the full 4 so a missing answer reads as "not yet owner-run".
  let pct = Math.round((dependence / 4) * 100);
  // Round to the nearest 5 so the headline reads as an estimate, not false precision.
  pct = Math.round(pct / 5) * 5;

  // Tier from the take-it-back answer. Never "ready" while the headline says most
  // of the business still routes through the owner.
  let tier: DelegationTier;
  if (takeBack === null) tier = 'developing';
  else if (takeBack <= 1) tier = 'low';
  else if (takeBack === 2) tier = 'developing';
  else tier = 'ready';
  if (tier === 'ready' && pct >= 50) tier = 'developing';

  return {
    ownerDependencePct: pct,
    bandLabel: bandLabelFor(pct),
    tier,
    tierLabel: TIER_LABEL[tier],
    tierBlurb: TIER_BLURB[tier],
    modeA,
    modeB,
    modeC,
    answered,
    authority,
    takeBack,
  };
}

// ─── Teaser on instrument v2 ──────────────────────────────────────────────────
// Same proxy, two v2 changes (audit section 11, scoring spec):
//   - a row marked "We don't do this" is left out of the headline instead of
//     counting as owner-run, so the share is of the workflows they actually do;
//   - "I don't have anyone to hand work to yet" on the moved-something question
//     gives the 'getting_started' tier, never "Low".
// Grid values on V2B_C to V2B_F: 'named_owner' (Yes), 'me' (No), 'not_done'.
// authority = V2G_DECISIONS rank 0..4; takeBack = V2G_MOVED rank 0..4, or 5 for
// "I don't have anyone to hand work to yet".

export const TEASER_NO_ONE_VALUE = 5;

// The v2 headline. ownerOnly = rows answered "No"; measured = rows they do.
export function teaserCountLine(ownerOnly: number, measured: number): string {
  if (measured === 0) {
    return "You told us you don't do any of the four workflows we measure. The full assessment looks at your readiness on its own.";
  }
  if (ownerOnly === 0) return 'None of your core workflows depend on you alone.';
  if (measured === 1) return 'Your one core workflow has no owner but you.';
  if (ownerOnly === measured) return `All ${measured} of your core workflows have no owner but you.`;
  return `${ownerOnly} of your ${measured} core workflows ${ownerOnly === 1 ? 'has' : 'have'} no owner but you.`;
}

export function computeTeaserEstimateV2(answers: TeaserAnswers): TeaserEstimate {
  const authority = clampScore(answers.authority);
  const noOne = answers.takeBack === TEASER_NO_ONE_VALUE;
  const takeBack = noOne ? null : clampScore(answers.takeBack);
  const namedOwnerDependence = NAMED_OWNER_DEPENDENCE[authority ?? 2];

  let modeA = 0;
  let modeB = 0;
  let modeC = 0;
  let answered = 0;
  let notDone = 0;
  let dependence = 0;

  for (const wfKey of ['C', 'D', 'E', 'F'] as WorkflowKey[]) {
    const value = answers.b[wfKey];
    if (!value) continue;
    answered += 1;
    if (value === 'not_done') {
      notDone += 1;
    } else if (value === 'me') {
      modeA += 1;
      dependence += 1;
    } else if (value === 'no_one') {
      modeC += 1;
      dependence += SHARED_DEPENDENCE;
    } else {
      modeB += 1;
      dependence += namedOwnerDependence;
    }
  }

  // Share of the workflows they do. Rows they skipped still count as "not yet
  // owner-run", as in v1; only "We don't do this" leaves the denominator.
  const measured = 4 - notDone;
  let pct = measured > 0 ? Math.round((dependence / measured) * 100) : 0;
  pct = Math.round(pct / 5) * 5;

  let tier: DelegationTier;
  if (noOne) tier = 'getting_started';
  else if (takeBack === null) tier = 'developing';
  else if (takeBack <= 1) tier = 'low';
  else if (takeBack === 2) tier = 'developing';
  else tier = 'ready';
  if (tier === 'ready' && pct >= 50) tier = 'developing';

  return {
    // The percentage still drives the tier cap below it; it is never shown on v2.
    ownerDependencePct: pct,
    bandLabel: measured > 0 ? bandLabelFor(pct) : 'None of the four workflows',
    ownerOnly: modeA,
    measured,
    countLine: teaserCountLine(modeA, measured),
    tier,
    tierLabel: TIER_LABEL[tier],
    tierBlurb: TIER_BLURB[tier],
    modeA,
    modeB,
    modeC,
    answered,
    notDone,
    authority,
    takeBack,
  };
}
