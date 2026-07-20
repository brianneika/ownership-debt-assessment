// lib/admin.ts
// Data-fetching helpers for the admin dashboard. Server-side only —
// uses the service role client and reads pre-computed dimension_scores
// plus raw answers (for the DRS category breakdown, which isn't persisted).

import { getSupabaseServer } from './supabase-server';
import { WORKFLOW_NAMES, type WorkflowKey } from './assessment';
import {
  calcDrsCategoryBreakdown,
  type AnswerRow,
  type DrsCategoryScore,
  type WorkflowMode,
} from './scoring';
import {
  extractRedFlags,
  extractWorkflowDiagnostics,
  type InsightAnswer,
  type RedFlag,
  type WorkflowDiagnostics,
} from './insight';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreSummary {
  score: number;
  bandLabel: string | null;
  bandColor: string | null;
  bandDescription: string | null;
}

export interface SessionListItem {
  sessionId: string;
  name: string;
  businessName: string;
  completedAt: string | null;
  ods: ScoreSummary | null;
  drs: ScoreSummary | null;
}

export interface OqiDimensionScore {
  label: string; // 'DO' | 'IE' | 'SC' | 'EC' | 'OA' | 'CT' (pre-005 rows were relabeled by the migration)
  weight: number;
  normalizedScore: number;
}

export interface WorkflowDetail {
  key: WorkflowKey;
  name: string;
  mode: WorkflowMode | null;
  owner: string | null; // display label from B001–B004
  ods: ScoreSummary | null;
  oqi: ScoreSummary | null;
  oqiBreakdown: OqiDimensionScore[]; // only populated for Mode B
  diagnostics: WorkflowDiagnostics | null; // mode-appropriate answer detail
}

export interface SectionHDetail {
  urgency: string | null;       // Q087 label
  urgencyValue: number | null;  // Q087 raw 1–5
  goal: string | null;          // Q088 label
  consultantNote: string | null; // Q089
  successVision: string | null;  // Q090
}

export interface SessionDetail {
  sessionId: string;
  name: string;
  businessName: string;
  completedAt: string | null;
  businessModel: string | null;   // A003
  transactionVolume: string | null; // A004
  sideFocus: string | null;       // A005
  teamSize: string | null;        // A006
  ods: ScoreSummary | null;
  drs: ScoreSummary | null;
  drsProfile: 'team' | 'solo' | null;
  drsCategoryBreakdown: DrsCategoryScore[];
  workflows: WorkflowDetail[];
  sectionH: SectionHDetail;
  redFlags: RedFlag[];
  // "How we can help" bodies from recommendation_templates, keyed to the
  // overall ODS / DRS band. Empty until migration 007's seed is applied.
  recommendations: { ods: string[]; drs: string[] };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

interface ScoreBandJoin {
  label: string;
  color_hex: string;
  description?: string | null;
}

interface DimensionScoreRow {
  session_id: string;
  workflow_key: string | null;
  normalized_score: number;
  score_band_id?: number | null;
  dimensions: { slug: string } | { slug: string }[];
  score_bands: ScoreBandJoin | ScoreBandJoin[] | null;
}

function unwrapOne<T>(v: T | T[] | null): T | null {
  if (v === null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function toScoreSummary(row: DimensionScoreRow | undefined): ScoreSummary | null {
  if (!row) return null;
  const band = unwrapOne(row.score_bands);
  return {
    score: row.normalized_score,
    bandLabel: band?.label ?? null,
    bandColor: band?.color_hex ?? null,
    bandDescription: band?.description ?? null,
  };
}

// ─── List view ────────────────────────────────────────────────────────────────

export async function fetchCompletedSessions(): Promise<SessionListItem[]> {
  const supabase = getSupabaseServer();

  const { data: sessions, error: sessionsErr } = await supabase
    .from('assessment_sessions')
    .select('id, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (sessionsErr) throw new Error(`Failed to fetch sessions: ${sessionsErr.message}`);
  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);

  const [{ data: scores }, { data: nameAnswers }] = await Promise.all([
    supabase
      .from('dimension_scores')
      .select('session_id, workflow_key, normalized_score, dimensions(slug), score_bands(label, color_hex)')
      .in('session_id', sessionIds)
      .is('workflow_key', null)
      .returns<DimensionScoreRow[]>(),
    supabase
      .from('answers')
      .select('session_id, text_value, questions!inner(question_key)')
      .in('session_id', sessionIds)
      .in('questions.question_key', ['A001', 'A002']),
  ]);

  // Build session_id → { A001, A002 } map
  const namesBySession = new Map<string, { name: string; businessName: string }>();
  for (const row of (nameAnswers ?? []) as any[]) {
    const key = row.questions?.question_key ?? unwrapOne(row.questions)?.question_key;
    const entry = namesBySession.get(row.session_id) ?? { name: '', businessName: '' };
    if (key === 'A001') entry.name = row.text_value ?? '';
    if (key === 'A002') entry.businessName = row.text_value ?? '';
    namesBySession.set(row.session_id, entry);
  }

  // Build session_id → { ods, drs } map
  const scoresBySession = new Map<string, { ods?: DimensionScoreRow; drs?: DimensionScoreRow }>();
  for (const row of scores ?? []) {
    const slug = unwrapOne(row.dimensions)?.slug;
    const entry = scoresBySession.get(row.session_id) ?? {};
    if (slug === 'ods') entry.ods = row;
    if (slug === 'drs') entry.drs = row;
    scoresBySession.set(row.session_id, entry);
  }

  return sessions.map((s) => {
    const names = namesBySession.get(s.id) ?? { name: '(unnamed)', businessName: '(no business name)' };
    const sc = scoresBySession.get(s.id) ?? {};
    return {
      sessionId: s.id,
      name: names.name || '(unnamed)',
      businessName: names.businessName || '(no business name)',
      completedAt: s.completed_at,
      ods: toScoreSummary(sc.ods),
      drs: toScoreSummary(sc.drs),
    };
  });
}

// ─── Respondent name (lightweight — for the PDF document title) ─────────────────

export async function fetchSessionName(sessionId: string): Promise<string | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('answers')
    .select('text_value, questions!inner(question_key)')
    .eq('session_id', sessionId)
    .eq('questions.question_key', 'A001')
    .limit(1)
    .maybeSingle();
  return (data as { text_value: string | null } | null)?.text_value ?? null;
}

// ─── Detail view ──────────────────────────────────────────────────────────────

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  const supabase = getSupabaseServer();

  const { data: session, error: sessionErr } = await supabase
    .from('assessment_sessions')
    .select('id, completed_at, drs_profile, wf_c_mode, wf_d_mode, wf_e_mode, wf_f_mode')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) return null;

  const [{ data: scores }, { data: answers }, { data: breakdowns }] = await Promise.all([
    supabase
      .from('dimension_scores')
      .select('session_id, workflow_key, normalized_score, score_band_id, dimensions(slug), score_bands(label, color_hex, description)')
      .eq('session_id', sessionId)
      .returns<DimensionScoreRow[]>(),
    supabase
      .from('answers')
      .select(`
        text_value,
        score_value,
        answer_type,
        questions (
          question_key,
          question_text,
          section,
          mode,
          oqi_dimension,
          drs_category,
          is_scored,
          reverse_scored,
          applies_to_profile,
          response_options
        )
      `)
      .eq('session_id', sessionId),
    supabase
      .from('score_breakdowns')
      .select('breakdown_type, workflow_key, label, weight, normalized_score')
      .eq('session_id', sessionId),
  ]);

  const allAnswers = (answers ?? []) as any[];

  // Helper to find answer text/value by question_key, with response_options label lookup
  function findAnswer(questionKey: string) {
    return allAnswers.find((a) => unwrapOne(a.questions)?.question_key === questionKey);
  }

  function labelFor(questionKey: string): string | null {
    const a = findAnswer(questionKey);
    if (!a) return null;
    const q = unwrapOne(a.questions);
    const options: { value: number | string; label: string }[] = q?.response_options ?? [];
    const rawValue = a.answer_type === 'scored_radio' ? a.score_value : a.text_value;
    if (rawValue === null || rawValue === undefined) return null;
    const match = options.find((o) => String(o.value) === String(rawValue));
    return match?.label ?? String(rawValue);
  }

  function textFor(questionKey: string): string | null {
    const a = findAnswer(questionKey);
    return a?.text_value ?? null;
  }

  // Scores: overall (workflow_key null) and per-workflow
  const overall: { ods?: DimensionScoreRow; drs?: DimensionScoreRow } = {};
  const byWorkflow: Record<string, { ods?: DimensionScoreRow; oqi?: DimensionScoreRow }> = {};

  for (const row of scores ?? []) {
    const slug = unwrapOne(row.dimensions)?.slug;
    if (row.workflow_key === null) {
      if (slug === 'ods') overall.ods = row;
      if (slug === 'drs') overall.drs = row;
    } else {
      byWorkflow[row.workflow_key] ??= {};
      if (slug === 'ods') byWorkflow[row.workflow_key].ods = row;
      if (slug === 'oqi') byWorkflow[row.workflow_key].oqi = row;
    }
  }

  // B001–B004 map workflow key → owner display label
  const B_QUESTION_KEYS: Record<WorkflowKey, string> = { C: 'B001', D: 'B002', E: 'B003', F: 'B004' };
  const workflowOwners: Record<WorkflowKey, string | null> = { C: null, D: null, E: null, F: null };
  for (const [wf, qKey] of Object.entries(B_QUESTION_KEYS) as [WorkflowKey, string][]) {
    workflowOwners[wf] = labelFor(qKey);
  }

  // OQI dimension breakdowns from persisted score_breakdowns rows
  const oqiBreakdownByWorkflow: Record<WorkflowKey, OqiDimensionScore[]> = { C: [], D: [], E: [], F: [] };
  for (const row of (breakdowns ?? []) as any[]) {
    if (row.breakdown_type === 'oqi' && row.workflow_key) {
      oqiBreakdownByWorkflow[row.workflow_key as WorkflowKey]?.push({
        label: row.label,
        weight: row.weight,
        normalizedScore: row.normalized_score,
      });
    }
  }

  const wfModes: Record<WorkflowKey, WorkflowMode | null> = {
    C: session.wf_c_mode,
    D: session.wf_d_mode,
    E: session.wf_e_mode,
    F: session.wf_f_mode,
  };

  // Normalize answer rows for the insight helpers (unwrap the questions join)
  const insightAnswers: InsightAnswer[] = allAnswers.flatMap((a) => {
    const q = unwrapOne(a.questions);
    if (!q) return [];
    return [{ score_value: a.score_value, text_value: a.text_value, answer_type: a.answer_type, question: q }];
  });

  const workflows: WorkflowDetail[] = (['C', 'D', 'E', 'F'] as WorkflowKey[]).map((key) => ({
    key,
    name: WORKFLOW_NAMES[key],
    mode: wfModes[key],
    owner: workflowOwners[key],
    ods: toScoreSummary(byWorkflow[key]?.ods),
    oqi: toScoreSummary(byWorkflow[key]?.oqi),
    oqiBreakdown: oqiBreakdownByWorkflow[key],
    diagnostics: wfModes[key] ? extractWorkflowDiagnostics(insightAnswers, key, wfModes[key]!) : null,
  }));

  const drsProfile = session.drs_profile ?? null;

  // Use persisted DRS category breakdown when available; fall back to live computation
  // for sessions scored before migration 002 was applied.
  const persistedDrsBreakdown = (breakdowns ?? []).filter((r: any) => r.breakdown_type === 'drs');
  const drsCategoryBreakdown: DrsCategoryScore[] =
    persistedDrsBreakdown.length > 0
      ? persistedDrsBreakdown.map((r: any) => ({
          category: r.label as import('./scoring').DrsCategory,
          weight: r.weight,
          normalizedScore: r.normalized_score,
        }))
      : drsProfile
        ? calcDrsCategoryBreakdown(allAnswers as AnswerRow[], drsProfile)
        : [];

  // "How we can help" copy for the overall ODS / DRS bands (dormant table
  // until migration 007's seed runs — empty arrays render as a hidden section)
  const recommendations: SessionDetail['recommendations'] = { ods: [], drs: [] };
  const odsBandId = overall.ods?.score_band_id ?? null;
  const drsBandId = overall.drs?.score_band_id ?? null;
  const bandIds = [odsBandId, drsBandId].filter((id): id is number => id !== null);
  if (bandIds.length > 0) {
    const { data: recs } = await supabase
      .from('recommendation_templates')
      .select('score_band_id, body, priority')
      .in('score_band_id', bandIds)
      .order('priority', { ascending: true });
    for (const rec of recs ?? []) {
      if (rec.score_band_id === odsBandId) recommendations.ods.push(rec.body);
      if (rec.score_band_id === drsBandId) recommendations.drs.push(rec.body);
    }
  }

  return {
    sessionId,
    name: textFor('A001') ?? '(unnamed)',
    businessName: textFor('A002') ?? '(no business name)',
    completedAt: session.completed_at,
    businessModel: labelFor('A003'),
    transactionVolume: labelFor('A004'),
    sideFocus: labelFor('A005'),
    teamSize: labelFor('A006'),
    ods: toScoreSummary(overall.ods),
    drs: toScoreSummary(overall.drs),
    drsProfile,
    drsCategoryBreakdown,
    workflows,
    sectionH: {
      urgency: labelFor('Q087'),
      urgencyValue: findAnswer('Q087')?.score_value ?? null,
      goal: labelFor('Q088'),
      consultantNote: textFor('Q089'),
      successVision: textFor('Q090'),
    },
    redFlags: extractRedFlags(insightAnswers),
    recommendations,
  };
}
