// lib/scoring.ts
// Pure-math scoring engine. No AI calls. No side effects except the final DB upsert.
//
// Formula sources (confirmed):
//   ODS Mode A:  100 − ((TBx4 + TBx5) / 8) × 100         — high TB scores = low debt
//   ODS Mode B:  100 − OQI
//   ODS Mode C:  100 − (RCx2 / 4) × 50 [+ 12.5 if RCx3 ≥ 3]  — high RC2 = less debt; high RC3 ≥ 3 = more fallthrough = +debt
//   OQI:         weighted avg of 6 dimensions, each normalized (dim_avg/4)×100
//   DRS Team:    Willingness×0.30 + DelegationQuality×0.25 + TeamCapacity×0.25 + AuthorityFramework×0.20
//   DRS Solo:    Willingness×0.30 + TransferReadiness×0.25 + HiringReadiness×0.25 + SystemsMindset×0.20

import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkflowKey = 'C' | 'D' | 'E' | 'F';
export type WorkflowMode = 'A' | 'B' | 'C';
type OqiDimension = 'DO' | 'IE' | 'SC' | 'EC' | 'OA' | 'CT';
export type DrsCategory =
  | 'Willingness'
  | 'Delegation Quality'
  | 'Team Capacity'
  | 'Authority Framework'
  | 'Transfer Readiness'
  | 'Hiring Readiness'
  | 'Systems Mindset';

interface SessionRow {
  id: string;
  drs_profile: 'team' | 'solo' | null;
  wf_c_mode: WorkflowMode | null;
  wf_d_mode: WorkflowMode | null;
  wf_e_mode: WorkflowMode | null;
  wf_f_mode: WorkflowMode | null;
}

export interface QuestionMeta {
  question_key: string;
  section: string;
  mode: string | null;
  oqi_dimension: OqiDimension | null;
  drs_category: DrsCategory | null;
  is_scored: boolean;
  reverse_scored: boolean;
  applies_to_profile: string;
}

export interface AnswerRow {
  score_value: number | null;
  text_value: string | null;
  answer_type: string;
  // Supabase sometimes returns nested joins as a single-element array instead
  // of a plain object. unwrapQuestion() normalises both cases.
  questions: QuestionMeta | QuestionMeta[];
}

function unwrapQuestion(row: AnswerRow): QuestionMeta | null {
  if (!row.questions) return null;
  if (Array.isArray(row.questions)) return row.questions[0] ?? null;
  return row.questions;
}

interface DimensionRow {
  id: number;
  slug: string;
}

interface ScoreBandRow {
  id: number;
  dimension_id: number;
  min_score: number;
  max_score: number;
}

export interface ScoringResult {
  overallOds: number;
  workflowOds: Record<WorkflowKey, number | null>;
  workflowOqi: Record<WorkflowKey, number | null>;
  drs: number;
  drsProfile: 'team' | 'solo';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OQI_WEIGHTS: Record<OqiDimension, number> = {
  DO: 0.20, // Decision Ownership          (Q001–Q003 per workflow)
  IE: 0.22, // Independent Execution       (Q004–Q006)
  SC: 0.18, // Systems & Checklists        (Q007–Q009)
  EC: 0.15, // Escalation & Coverage       (Q010–Q012)
  OA: 0.15, // Outcome Accountability      (Q013–Q015)
  CT: 0.10, // Confidence & Track Record   (Q016–Q018)
};

const DRS_TEAM_WEIGHTS: Partial<Record<DrsCategory, number>> = {
  'Willingness':           0.30,
  'Delegation Quality':    0.25,
  'Team Capacity':         0.25,
  'Authority Framework':   0.20,
};

const DRS_SOLO_WEIGHTS: Partial<Record<DrsCategory, number>> = {
  'Willingness':          0.30,
  'Transfer Readiness':   0.25,
  'Hiring Readiness':     0.25,
  'Systems Mindset':      0.20,
};

// TBx4 and TBx5 question keys per workflow (Mode A)
const MODE_A_KEYS: Record<WorkflowKey, [string, string]> = {
  C: ['TBC4', 'TBC5'],
  D: ['TBD4', 'TBD5'],
  E: ['TBE4', 'TBE5'],
  F: ['TBF4', 'TBF5'],
};

// RCx2 (capacity) and RCx3 (fallthrough) question keys per workflow (Mode C)
const MODE_C_KEYS: Record<WorkflowKey, [string, string]> = {
  C: ['RCC2', 'RCC3'],
  D: ['RCD2', 'RCD3'],
  E: ['RCE2', 'RCE3'],
  F: ['RCF2', 'RCF3'],
};

const WORKFLOWS: WorkflowKey[] = ['C', 'D', 'E', 'F'];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applyReverse(rawValue: number, reversed: boolean): number {
  return reversed ? 4 - rawValue : rawValue;
}

function findScoreBandId(
  bands: ScoreBandRow[],
  dimensionId: number,
  score: number,
): number | null {
  const match = bands.find(
    (b) =>
      b.dimension_id === dimensionId &&
      score >= b.min_score &&
      score <= b.max_score,
  );
  return match?.id ?? null;
}

// ─── OQI (Mode B workflows only) ─────────────────────────────────────────────

interface OqiBreakdown {
  score: number; // rolled-up 0–100
  byDimension: { label: OqiDimension; weight: number; normalizedScore: number }[];
}

function calcOqiWithBreakdown(answers: AnswerRow[], wfKey: WorkflowKey): OqiBreakdown | null {
  const relevant = answers.filter((a) => {
    const q = unwrapQuestion(a);
    return (
      q &&
      q.section === wfKey &&
      q.mode === 'B' &&
      q.is_scored &&
      q.oqi_dimension !== null &&
      a.score_value !== null
    );
  });

  if (relevant.length === 0) return null;

  const byDim: Partial<Record<OqiDimension, number[]>> = {};
  for (const a of relevant) {
    const q = unwrapQuestion(a)!;
    const val = applyReverse(a.score_value!, q.reverse_scored);
    (byDim[q.oqi_dimension!] ??= []).push(val);
  }

  let oqi = 0;
  const byDimension: OqiBreakdown['byDimension'] = [];
  for (const [dim, weight] of Object.entries(OQI_WEIGHTS) as [OqiDimension, number][]) {
    const dimAvg = avg(byDim[dim] ?? []);
    const normalizedScore = clamp((dimAvg / 4) * 100, 0, 100);
    oqi += normalizedScore * weight;
    byDimension.push({ label: dim, weight, normalizedScore });
  }

  return { score: clamp(oqi, 0, 100), byDimension };
}

function calcOqi(answers: AnswerRow[], wfKey: WorkflowKey): number | null {
  return calcOqiWithBreakdown(answers, wfKey)?.score ?? null;
}

// ─── Per-workflow ODS ─────────────────────────────────────────────────────────

function calcWorkflowOds(
  answers: AnswerRow[],
  wfKey: WorkflowKey,
  mode: WorkflowMode,
): number | null {
  const byKey = new Map(
    answers
      .map((a) => [unwrapQuestion(a)?.question_key, a] as const)
      .filter(([k]) => k != null),
  );

  switch (mode) {
    case 'B': {
      const oqi = calcOqi(answers, wfKey);
      return oqi === null ? null : clamp(100 - oqi, 0, 100);
    }

    case 'A': {
      const [k4, k5] = MODE_A_KEYS[wfKey];
      const v4 = byKey.get(k4)?.score_value ?? null;
      const v5 = byKey.get(k5)?.score_value ?? null;
      if (v4 === null || v5 === null) return null;
      return clamp(100 - ((v4 + v5) / 8) * 100, 0, 100);
    }

    case 'C': {
      const [k2, k3] = MODE_C_KEYS[wfKey];
      const rc2 = byKey.get(k2)?.score_value ?? null;
      const rc3 = byKey.get(k3)?.score_value ?? null;
      if (rc2 === null) return null;
      let ods = 100 - (rc2 / 4) * 50;
      if (rc3 !== null && rc3 >= 3) ods += 12.5;
      return clamp(ods, 0, 100);
    }
  }
}

// ─── DRS ──────────────────────────────────────────────────────────────────────

function calcDrs(answers: AnswerRow[], profile: 'team' | 'solo'): number {
  const weights = profile === 'team' ? DRS_TEAM_WEIGHTS : DRS_SOLO_WEIGHTS;

  const eligible = answers.filter((a) => {
    const q = unwrapQuestion(a);
    return (
      q &&
      q.is_scored &&
      a.score_value !== null &&
      q.drs_category !== null &&
      (q.applies_to_profile === 'both' || q.applies_to_profile === profile)
    );
  });

  const byCategory: Partial<Record<DrsCategory, number[]>> = {};
  for (const a of eligible) {
    const q = unwrapQuestion(a)!;
    const cat = q.drs_category!;
    if (weights[cat] === undefined) continue;
    const val = applyReverse(a.score_value!, q.reverse_scored);
    (byCategory[cat] ??= []).push(val);
  }

  // Each category: avg(0–4) → normalize to 0–1 → multiply by weight → sum → ×100
  let drs = 0;
  for (const [cat, weight] of Object.entries(weights) as [DrsCategory, number][]) {
    const vals = byCategory[cat] ?? [];
    const catAvg = avg(vals);   // 0–4
    const catNorm = catAvg / 4; // 0–1
    drs += catNorm * weight;
  }

  return clamp(drs * 100, 0, 100);
}

// ─── DRS category breakdown (admin display only — not persisted) ────────────
// Same bucketing as calcDrs, but returns per-category scores instead of
// collapsing to one number. Used by the admin session detail page.

export interface DrsCategoryScore {
  category: DrsCategory;
  weight: number;
  normalizedScore: number; // 0–100
}

export function calcDrsCategoryBreakdown(
  answers: AnswerRow[],
  profile: 'team' | 'solo',
): DrsCategoryScore[] {
  const weights = profile === 'team' ? DRS_TEAM_WEIGHTS : DRS_SOLO_WEIGHTS;

  const eligible = answers.filter((a) => {
    const q = unwrapQuestion(a);
    return (
      q &&
      q.is_scored &&
      a.score_value !== null &&
      q.drs_category !== null &&
      (q.applies_to_profile === 'both' || q.applies_to_profile === profile)
    );
  });

  const byCategory: Partial<Record<DrsCategory, number[]>> = {};
  for (const a of eligible) {
    const q = unwrapQuestion(a)!;
    const cat = q.drs_category!;
    if (weights[cat] === undefined) continue;
    const val = applyReverse(a.score_value!, q.reverse_scored);
    (byCategory[cat] ??= []).push(val);
  }

  return (Object.entries(weights) as [DrsCategory, number][]).map(([category, weight]) => {
    const catAvg = avg(byCategory[category] ?? []); // 0–4
    return {
      category,
      weight,
      normalizedScore: clamp((catAvg / 4) * 100, 0, 100),
    };
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function calculateScores(sessionId: string): Promise<ScoringResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [
    { data: session, error: sessionErr },
    { data: answers, error: answersErr },
    { data: dimensions },
    { data: bands },
  ] = await Promise.all([
    supabase
      .from('assessment_sessions')
      .select('id, drs_profile, wf_c_mode, wf_d_mode, wf_e_mode, wf_f_mode')
      .eq('id', sessionId)
      .single<SessionRow>(),
    supabase
      .from('answers')
      .select(`
        score_value,
        text_value,
        answer_type,
        questions (
          question_key,
          section,
          mode,
          oqi_dimension,
          drs_category,
          is_scored,
          reverse_scored,
          applies_to_profile
        )
      `)
      .eq('session_id', sessionId)
      .returns<AnswerRow[]>(),
    supabase.from('dimensions').select('id, slug').returns<DimensionRow[]>(),
    supabase.from('score_bands').select('id, dimension_id, min_score, max_score').returns<ScoreBandRow[]>(),
  ]);

  if (sessionErr || !session) {
    throw new Error(`Session not found: ${sessionId} — ${sessionErr?.message}`);
  }
  if (answersErr || !answers) {
    throw new Error(`Failed to fetch answers: ${answersErr?.message}`);
  }

  const dimBySlug = Object.fromEntries((dimensions ?? []).map((d) => [d.slug, d]));
  const scoreBands = bands ?? [];

  const odsDim = dimBySlug['ods'];
  const oqiDim = dimBySlug['oqi'];
  const drsDim = dimBySlug['drs'];

  if (!odsDim || !oqiDim || !drsDim) {
    throw new Error('Dimension rows missing — run schema.sql seed first.');
  }

  const wfModes: Record<WorkflowKey, WorkflowMode | null> = {
    C: session.wf_c_mode,
    D: session.wf_d_mode,
    E: session.wf_e_mode,
    F: session.wf_f_mode,
  };

  const workflowOds: Record<WorkflowKey, number | null> = { C: null, D: null, E: null, F: null };
  const workflowOqi: Record<WorkflowKey, number | null> = { C: null, D: null, E: null, F: null };
  const workflowOqiBreakdown: Record<WorkflowKey, OqiBreakdown | null> = { C: null, D: null, E: null, F: null };

  for (const wf of WORKFLOWS) {
    const mode = wfModes[wf];
    if (!mode) continue;
    workflowOds[wf] = calcWorkflowOds(answers, wf, mode);
    if (mode === 'B') {
      const oqiResult = calcOqiWithBreakdown(answers, wf);
      workflowOqi[wf] = oqiResult?.score ?? null;
      workflowOqiBreakdown[wf] = oqiResult ?? null;
    }
  }

  const validOds = WORKFLOWS.map((wf) => workflowOds[wf]).filter((v): v is number => v !== null);
  if (validOds.length === 0) {
    throw new Error('No workflow ODS values could be computed — wf_*_mode fields may not be set on the session.');
  }
  const overallOds = avg(validOds);

  let drsProfile: 'team' | 'solo' = session.drs_profile ?? 'team';
  if (!session.drs_profile) {
    const modeACount = WORKFLOWS.filter((wf) => wfModes[wf] === 'A').length;
    if (modeACount >= 3) drsProfile = 'solo';
  }

  const drs = calcDrs(answers, drsProfile);

  // DELETE + INSERT instead of upsert to avoid Supabase null-column conflict issues
  const { error: deleteErr } = await supabase
    .from('dimension_scores')
    .delete()
    .eq('session_id', sessionId);

  if (deleteErr) {
    throw new Error(`Failed to clear old dimension_scores: ${deleteErr.message}`);
  }

  const rows = [
    { session_id: sessionId, dimension_id: odsDim.id, workflow_key: null,
      raw_score: overallOds, normalized_score: overallOds,
      score_band_id: findScoreBandId(scoreBands, odsDim.id, overallOds) },
    { session_id: sessionId, dimension_id: drsDim.id, workflow_key: null,
      raw_score: drs, normalized_score: drs,
      score_band_id: findScoreBandId(scoreBands, drsDim.id, drs) },
    ...WORKFLOWS
      .filter((wf) => workflowOds[wf] !== null)
      .map((wf) => ({
        session_id: sessionId, dimension_id: odsDim.id, workflow_key: wf,
        raw_score: workflowOds[wf]!, normalized_score: workflowOds[wf]!,
        score_band_id: findScoreBandId(scoreBands, odsDim.id, workflowOds[wf]!),
      })),
    ...WORKFLOWS
      .filter((wf) => workflowOqi[wf] !== null)
      .map((wf) => ({
        session_id: sessionId, dimension_id: oqiDim.id, workflow_key: wf,
        raw_score: workflowOqi[wf]!, normalized_score: workflowOqi[wf]!,
        score_band_id: findScoreBandId(scoreBands, oqiDim.id, workflowOqi[wf]!),
      })),
  ];

  const { error: insertErr } = await supabase.from('dimension_scores').insert(rows);

  if (insertErr) {
    throw new Error(`Failed to write dimension_scores: ${insertErr.message}`);
  }

  // ── Persist sub-score breakdowns ──────────────────────────────────────────
  // Delete existing breakdowns first (re-scoring shouldn't duplicate rows)
  await supabase.from('score_breakdowns').delete().eq('session_id', sessionId);

  const drsCategoryBreakdown = calcDrsCategoryBreakdown(answers, drsProfile);

  const breakdownRows = [
    // DRS per-category
    ...drsCategoryBreakdown.map((cat) => ({
      session_id: sessionId,
      breakdown_type: 'drs' as const,
      workflow_key: null,
      label: cat.category,
      weight: cat.weight,
      normalized_score: cat.normalizedScore,
    })),
    // OQI per-dimension (Mode B workflows only)
    ...WORKFLOWS.flatMap((wf) => {
      const bd = workflowOqiBreakdown[wf];
      if (!bd) return [];
      return bd.byDimension.map((d) => ({
        session_id: sessionId,
        breakdown_type: 'oqi' as const,
        workflow_key: wf,
        label: d.label,
        weight: d.weight,
        normalized_score: d.normalizedScore,
      }));
    }),
  ];

  if (breakdownRows.length > 0) {
    const { error: bdErr } = await supabase.from('score_breakdowns').insert(breakdownRows);
    if (bdErr) {
      throw new Error(`Failed to write score_breakdowns: ${bdErr.message}`);
    }
  }

  return { overallOds, workflowOds, workflowOqi, drs, drsProfile };
}
