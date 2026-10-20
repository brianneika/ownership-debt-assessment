// lib/scoring-v2.ts
// Instrument v2 scoring. Pure functions only: no DB, no imports beyond types, so
// scripts/verify-v2-scoring.mjs can run it directly against the worked examples.
//
// Rules: vai-va-training/output/20261019-assessment-v2-scoring-rules.md (approved
// by Bri 2026-10-19). v1 sessions never come through here; src/lib/scoring.ts
// dispatches on assessment_sessions.instrument_version.
//
// Answer storage (see scripts/v2-questions.mjs):
//   score_value is a RANK, 0 = most debt or least ready. Ranks spread evenly over
//   0..4 using the count of real (non "na") options, so 3 answers score 0/2/4 and
//   4 answers score 0/1.33/2.67/4. A stored value that is not a real option
//   ("This didn't come up" and friends store 5) is not applicable: left out of
//   every average, never a red flag.

export type V2WorkflowKey = 'C' | 'D' | 'E' | 'F';
export type V2Mode = 'A' | 'B' | 'C' | 'N';
export type V2Profile = 'team' | 'solo';

export interface V2Option {
  value: number | string;
  label: string;
  na?: boolean;
}

export interface V2QuestionMeta {
  question_key: string;
  section: string;
  mode: string | null;
  answer_type: string;
  oqi_dimension: string | null;
  drs_category: string | null;
  is_scored: boolean;
  applies_to_profile: string;
  response_options: V2Option[] | null;
  question_text?: string;
}

export interface V2Answer {
  score_value: number | null;
  text_value: string | null;
  question: V2QuestionMeta;
}

export interface V2SessionInput {
  drs_profile: V2Profile | null;
  modes: Record<V2WorkflowKey, V2Mode | null>;
}

export const V2_WORKFLOWS: V2WorkflowKey[] = ['C', 'D', 'E', 'F'];

// Scores are shown, banded and read as whole numbers (see ./score-bands.ts).
// Used by every consumer, v1 and v2, so the number, band and read always agree.
export function wholeScore(score: number): number {
  return Math.round(score);
}

// Team-owned groups, keyed by the oqi_dimension slugs the rows carry. Slugs keep
// their v1 spelling (the database check allows only these); names and weights are
// v2's own and never mix with v1 results because scoring dispatches by version.
export const V2_GROUP_WEIGHTS: Record<string, number> = {
  DO: 0.25, // Decisions
  IE: 0.2, // Running the work
  SC: 0.18, // Systems
  EC: 0.12, // Coverage
  OA: 0.15, // Standards
  CT: 0.1, // Track record
};

export const V2_GROUP_NAMES: Record<string, string> = {
  DO: 'Decisions',
  IE: 'Running the work',
  SC: 'Systems',
  EC: 'Coverage',
  OA: 'Standards',
  CT: 'Track record',
};

export const V2_DRS_TEAM_WEIGHTS: Record<string, number> = {
  Willingness: 0.3,
  'Delegation Quality': 0.25,
  'Team Capacity': 0.25,
  'Authority Framework': 0.2,
};

// No support yet: Transfer readiness folded into Systems mindset (decision 4).
export const V2_DRS_SOLO_WEIGHTS: Record<string, number> = {
  Willingness: 0.3,
  'Hiring Readiness': 0.35,
  'Systems Mindset': 0.35,
};

// A team-owned workflow with this many "didn't come up" answers is labeled
// "based on limited answers" (decision 9). Four questions can be not applicable.
export const LIMITED_NA_COUNT = 3;

// ─── Answer helpers ─────────────────────────────────────────────────────────

export function realOptions(q: V2QuestionMeta): V2Option[] {
  return (q.response_options ?? []).filter((o) => !o.na && typeof o.value === 'number');
}

// { rank, n } for a real answer; null when unanswered or not applicable.
export function rankOf(a: V2Answer | undefined): { rank: number; n: number } | null {
  if (!a || a.score_value === null || a.score_value === undefined) return null;
  const real = realOptions(a.question);
  if (!real.some((o) => o.value === a.score_value)) return null;
  return { rank: a.score_value, n: real.length };
}

// 0..4, evenly spread. null when unanswered or not applicable.
export function scaledScore(a: V2Answer | undefined): number | null {
  const r = rankOf(a);
  if (!r || r.n < 2) return null;
  return (4 * r.rank) / (r.n - 1);
}

// Answered with a not-applicable choice (or a value outside the real options).
export function isNotApplicable(a: V2Answer | undefined): boolean {
  if (!a || a.score_value === null || a.score_value === undefined) return false;
  if (a.question.answer_type !== 'scored_radio') return false;
  return rankOf(a) === null;
}

export function optionLabel(a: V2Answer | undefined): string | null {
  if (!a) return null;
  const raw = a.question.answer_type === 'scored_radio' ? a.score_value : a.text_value;
  if (raw === null || raw === undefined) return null;
  const match = (a.question.response_options ?? []).find((o) => String(o.value) === String(raw));
  return match?.label ?? String(raw);
}

function avg(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function indexAnswers(answers: V2Answer[]): Map<string, V2Answer> {
  return new Map(answers.map((a) => [a.question.question_key, a]));
}

// Answers that belong to the path this workflow is on now (a respondent who
// changed an owner answer may have stale answers from another path).
function workflowAnswers(answers: V2Answer[], wf: V2WorkflowKey, mode: V2Mode): V2Answer[] {
  return answers.filter((a) => a.question.section === wf && a.question.mode === mode);
}

// ─── Per-workflow scores ────────────────────────────────────────────────────

export interface V2GroupScore {
  label: string; // oqi_dimension slug
  weight: number;
  normalizedScore: number; // 0..100, higher is better
}

export interface V2WorkflowScore {
  key: V2WorkflowKey;
  mode: V2Mode | null;
  ods: number | null; // 0..100, higher = more debt. null = not scored (not done, or incomplete)
  oqi: number | null; // team-owned only: 100 - ods
  groups: V2GroupScore[]; // team-owned only
  naCount: number; // team-owned: answers marked "didn't come up"
  limited: boolean; // team-owned: scored on limited answers
  keptOnPurpose: boolean; // owner-run: "I keep it on purpose"
}

function scoreTeamOwned(scoped: V2Answer[]): Pick<V2WorkflowScore, 'ods' | 'oqi' | 'groups' | 'naCount' | 'limited'> {
  const byGroup: Record<string, number[]> = {};
  let naCount = 0;
  for (const a of scoped) {
    const q = a.question;
    if (!q.is_scored || !q.oqi_dimension || V2_GROUP_WEIGHTS[q.oqi_dimension] === undefined) continue;
    if (isNotApplicable(a)) {
      naCount += 1;
      continue;
    }
    const s = scaledScore(a);
    if (s === null) continue;
    (byGroup[q.oqi_dimension] ??= []).push(s);
  }

  const present = Object.keys(V2_GROUP_WEIGHTS).filter((g) => byGroup[g]?.length);
  if (present.length === 0) return { ods: null, oqi: null, groups: [], naCount, limited: naCount >= LIMITED_NA_COUNT };

  const wsum = present.reduce((s, g) => s + V2_GROUP_WEIGHTS[g], 0);
  let oqi = 0;
  const groups: V2GroupScore[] = [];
  for (const g of present) {
    const normalizedScore = clamp((avg(byGroup[g]) / 4) * 100);
    oqi += (normalizedScore * V2_GROUP_WEIGHTS[g]) / wsum;
    groups.push({ label: g, weight: V2_GROUP_WEIGHTS[g], normalizedScore });
  }
  oqi = clamp(oqi);
  return { ods: clamp(100 - oqi), oqi, groups, naCount, limited: naCount >= LIMITED_NA_COUNT };
}

// Owner-run: hours (half) + what happens when you're tied up (half).
export function ownerRunDebt(hoursScaled: number, tiedScaled: number): number {
  return clamp(((4 - hoursScaled) / 4) * 50 + ((4 - tiedScaled) / 4) * 50);
}

// No one accountable: 25 + how often things fell through in the last 60 days.
export function noOwnerDebt(fallScaled: number): number {
  return clamp(25 + ((4 - fallScaled) / 4) * 75);
}

export function scoreWorkflow(answers: V2Answer[], wf: V2WorkflowKey, mode: V2Mode | null): V2WorkflowScore {
  const empty: V2WorkflowScore = {
    key: wf, mode, ods: null, oqi: null, groups: [], naCount: 0, limited: false, keptOnPurpose: false,
  };
  if (!mode || mode === 'N') return empty;
  const scoped = workflowAnswers(answers, wf, mode);
  const byKey = indexAnswers(scoped);

  if (mode === 'B') return { ...empty, ...scoreTeamOwned(scoped) };

  if (mode === 'A') {
    const h = scaledScore(byKey.get(`V2${wf}_HOURS`));
    const t = scaledScore(byKey.get(`V2${wf}_TIED_UP`));
    const keptOnPurpose = byKey.get(`V2${wf}_WHY`)?.text_value === 'on_purpose';
    return { ...empty, keptOnPurpose, ods: h === null || t === null ? null : ownerRunDebt(h, t) };
  }

  const f = scaledScore(byKey.get(`V2${wf}_FALL_THROUGH`));
  return { ...empty, ods: f === null ? null : noOwnerDebt(f) };
}

// ─── Readiness ──────────────────────────────────────────────────────────────

export interface V2CategoryScore {
  category: string;
  weight: number;
  normalizedScore: number; // 0..100
}

export function scoreReadiness(answers: V2Answer[], profile: V2Profile): { drs: number | null; categories: V2CategoryScore[] } {
  const weights = profile === 'solo' ? V2_DRS_SOLO_WEIGHTS : V2_DRS_TEAM_WEIGHTS;
  const byCat: Record<string, number[]> = {};
  for (const a of answers) {
    const q = a.question;
    if (q.section !== 'G' || !q.is_scored || !q.drs_category) continue;
    if (q.applies_to_profile !== 'both' && q.applies_to_profile !== profile) continue;
    if (weights[q.drs_category] === undefined) continue;
    const s = scaledScore(a);
    if (s === null) continue;
    (byCat[q.drs_category] ??= []).push(s);
  }
  const present = Object.keys(weights).filter((c) => byCat[c]?.length);
  if (present.length === 0) return { drs: null, categories: [] };
  const wsum = present.reduce((s, c) => s + weights[c], 0);
  let drs = 0;
  const categories: V2CategoryScore[] = [];
  for (const c of present) {
    const normalizedScore = clamp((avg(byCat[c]) / 4) * 100);
    drs += (normalizedScore * weights[c]) / wsum;
    categories.push({ category: c, weight: weights[c], normalizedScore });
  }
  return { drs: clamp(drs), categories };
}

// ─── Whole session ──────────────────────────────────────────────────────────

export interface V2ScoringResult {
  overallOds: number | null; // null when every workflow is "We don't do this work"
  workflows: Record<V2WorkflowKey, V2WorkflowScore>;
  drs: number | null;
  drsProfile: V2Profile;
  drsCategories: V2CategoryScore[];
}

export function computeScoresV2(session: V2SessionInput, answers: V2Answer[]): V2ScoringResult {
  const workflows = Object.fromEntries(
    V2_WORKFLOWS.map((wf) => [wf, scoreWorkflow(answers, wf, session.modes[wf])]),
  ) as Record<V2WorkflowKey, V2WorkflowScore>;

  const scored = V2_WORKFLOWS.map((wf) => workflows[wf].ods).filter((v): v is number => v !== null);
  const overallOds = scored.length === 0 ? null : avg(scored);

  const drsProfile: V2Profile = session.drs_profile ?? 'team';
  const { drs, categories } = scoreReadiness(answers, drsProfile);

  return { overallOds, workflows, drs, drsProfile, drsCategories: categories };
}

// ─── Red flags (call screen) ────────────────────────────────────────────────
// Bottom two answers on five-answer questions, bottom answer on three- and
// four-answer questions. Never: not applicable, unscored, workflows they don't
// do, or anything in an owner-run workflow they keep on purpose.

export function isRedFlagAnswer(a: V2Answer): boolean {
  if (!a.question.is_scored) return false;
  const r = rankOf(a);
  if (!r) return false;
  return r.n >= 5 ? r.rank <= 1 : r.rank === 0;
}

export function v2RedFlagAnswers(answers: V2Answer[], session: V2SessionInput): V2Answer[] {
  const out: V2Answer[] = [];
  for (const a of answers) {
    const q = a.question;
    if (!isRedFlagAnswer(a)) continue;
    if (['C', 'D', 'E', 'F'].includes(q.section)) {
      const wf = q.section as V2WorkflowKey;
      const mode = session.modes[wf];
      if (!mode || mode === 'N' || q.mode !== mode) continue;
      if (mode === 'A' && answers.some((x) => x.question.question_key === `V2${wf}_WHY` && x.text_value === 'on_purpose')) continue;
    }
    if (q.section === 'G' && session.drs_profile && q.applies_to_profile !== 'both' && q.applies_to_profile !== session.drs_profile) continue;
    out.push(a);
  }
  return out;
}
