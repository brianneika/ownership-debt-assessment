// lib/teaser.ts
// The teaser "estimate band" — a directional preview computed from just the 5
// teaser answers (A006 + B001–B004). This is NOT the real ODS/DRS: it is an
// honest proxy, always labeled preliminary. The real scores come from the full
// assessment (src/lib/scoring.ts) once Sections C–H are answered.
//
// Pure functions only — no DB, no side effects — so the proxy is easy to reason
// about and stays consistent with the real scoring direction (see the task doc
// plans/tasks/20260730-teaser-short-assessment.md).

import { answerToMode, B_QUESTION_TO_WORKFLOW, type WorkflowKey } from './assessment';

export type DelegationTier = 'low' | 'developing' | 'ready';

export interface TeaserEstimate {
  // Headline: rough share of the 4 core workflows still run by the owner.
  ownerDependencePct: number;
  // Qualitative label for the headline number (never false precision).
  bandLabel: string;
  // Secondary: how ready the team looks to carry the work.
  tier: DelegationTier;
  tierLabel: string;
  tierBlurb: string;
  // Mode tallies across the 4 workflows, for optional UI detail.
  modeA: number; // owner still runs it (team_leader)
  modeB: number; // a named owner exists (TC / LC / Ops)
  modeC: number; // shared / no clear owner
  // Number of the 4 B-workflow answers we actually have.
  answered: number;
}

// The 5 teaser answers, as raw stored text_values.
export interface TeaserAnswers {
  a006: string | null;              // team size (just_me / 2_people / …)
  b: Partial<Record<WorkflowKey, string | null>>; // B001–B004 named-owner values by workflow key
}

const TIER_LABEL: Record<DelegationTier, string> = {
  low: 'Low',
  developing: 'Developing',
  ready: 'Ready',
};

const TIER_BLURB: Record<DelegationTier, string> = {
  low: 'Most core work still routes back to you. There is real room to hand it off.',
  developing: 'Some workflows have owners, some still lean on you — a delegation foundation is forming.',
  ready: 'Most core workflows already have named owners. Your team looks ready to carry more.',
};

function bandLabelFor(pct: number): string {
  if (pct >= 75) return 'Heavily owner-run';
  if (pct >= 50) return 'Owner-heavy';
  if (pct >= 25) return 'Shared load';
  return 'Largely delegated';
}

export function computeTeaserEstimate(answers: TeaserAnswers): TeaserEstimate {
  let modeA = 0;
  let modeB = 0;
  let modeC = 0;
  let answered = 0;

  for (const wfKey of Object.values(B_QUESTION_TO_WORKFLOW)) {
    const value = answers.b[wfKey];
    if (!value) continue;
    answered += 1;
    const mode = answerToMode(value);
    if (mode === 'A') modeA += 1;
    else if (mode === 'B') modeB += 1;
    else modeC += 1;
  }

  // Owner-dependence % — share of the 4 workflows the owner still runs themselves.
  // 4/4 → 100%, 1/4 → 25% (per the task's agreed mapping). We always divide by the
  // full 4 so a missing answer reads as "not yet owner-run," keeping the number honest.
  let pct = Math.round((modeA / 4) * 100);

  // A006 = "just me" nudges toward the high end: a true solo operator ultimately
  // has everything run through them, so we lift the estimate (never past 100, and
  // never when it is already 100). Gentle and directional — this is a preview.
  if (answers.a006 === 'just_me' && pct < 100) {
    pct = Math.min(100, pct + 15);
  }

  // Round to the nearest 5 so the headline reads as an estimate, not false precision.
  pct = Math.round(pct / 5) * 5;

  // Delegation-readiness tier — from the same 4 answers.
  //   owner owns most (≥3 Mode A)      → low
  //   named owners on most (≥3 Mode B) → ready
  //   anything mixed                   → developing
  let tier: DelegationTier;
  if (modeA >= 3) tier = 'low';
  else if (modeB >= 3) tier = 'ready';
  else tier = 'developing';

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
  };
}
