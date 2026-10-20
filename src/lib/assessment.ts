// lib/assessment.ts
// Shared types, constants, and DB helpers for the assessment flow.
// Functions that mutate data use the service role client (server-side only).
// Read-only helpers can be called from either side using the appropriate client.

import { getSupabaseServer } from './supabase-server';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkflowKey = 'C' | 'D' | 'E' | 'F';
// 'N' = "We don't do this work" (instrument v2 only): the workflow is skipped and
// left out of the score.
export type WorkflowMode = 'A' | 'B' | 'C' | 'N';
export type InstrumentVersion = 1 | 2;

// The instrument new sessions start on. v1 sessions keep v1 forever
// (assessment_sessions.instrument_version, migration 009).
export const CURRENT_INSTRUMENT_VERSION: InstrumentVersion = 2;
export type DrsProfile = 'team' | 'solo';
export type AnswerType = 'scored_radio' | 'categorical_radio' | 'free_text';

export interface ResponseOption {
  value: number | string;
  label: string;
  // v2: a not-applicable choice ("This didn't come up"); never scored.
  na?: boolean;
}

// v2: show this question only when another answer on the same page matches.
export interface ShowIf {
  key: string;
  equals: string;
}

// v2: alternate wording keyed by owner answer ("each_agent").
export type QuestionVariants = Record<string, { text?: string; options?: ResponseOption[] }>;

export interface Question {
  id: number;
  question_key: string;
  question_text: string;
  question_order: number;
  section: string;
  mode: string | null;
  answer_type: AnswerType;
  is_scored: boolean;
  oqi_dimension: string | null;
  drs_category: string | null;
  reverse_scored: boolean;
  applies_to_profile: string;
  weight: number;
  // Exact option labels from the live question bank. When present, the UI
  // renders these instead of the generic LIKERT_OPTIONS / CATEGORICAL_OPTIONS fallback.
  response_options: ResponseOption[] | null;
  // v2 only (migration 009); undefined on v1 rows.
  show_if?: ShowIf | null;
  variants?: QuestionVariants | null;
}

export interface SavedAnswer {
  question_id: number;
  question_key: string;
  answer_type: AnswerType;
  score_value: number | null;
  text_value: string | null;
}

// Strips the [Placeholder ...] prefix written into question_text during seeding.
// e.g. '[Placeholder C-FA-1] Financial processes...' → 'Financial processes...'
export function cleanQuestionText(raw: string): string {
  return raw.replace(/^\[Placeholder[^\]]*\]\s*/, '').trim();
}

// As of seed-questions-v2.sql, question_text in the DB is the exact, final
// copy from the live question bank — no [Placeholder] prefixes, no generic
// "Workflow X" references (workflow names are baked in per question_key).
// cleanQuestionText is kept as a defensive no-op in case older rows linger.
export function getDisplayQuestionText(_questionKey: string, rawText: string): string {
  return cleanQuestionText(rawText);
}

export interface AssessmentSession {
  id: string;
  drs_profile: DrsProfile | null;
  wf_c_mode: WorkflowMode | null;
  wf_d_mode: WorkflowMode | null;
  wf_e_mode: WorkflowMode | null;
  wf_f_mode: WorkflowMode | null;
  status: string;
  instrument_version: InstrumentVersion;
}

// ─── Display constants ────────────────────────────────────────────────────────

export const WORKFLOW_NAMES: Record<WorkflowKey, string> = {
  C: 'Listing Launch',
  D: 'Seller Communication',
  E: 'File Opening',
  F: 'Lender Tracking',
};

// Sentence-case names shown on the assessment's own screens and progress bar.
export const WORKFLOW_SECTION_NAMES: Record<WorkflowKey, string> = {
  C: 'Listing launch',
  D: 'Seller communication',
  E: 'File opening',
  F: 'Lender tracking',
};

export const SECTION_LABELS: Record<string, string> = {
  A: 'About You',
  B: 'Your Workflows',
  C: 'Listing Launch',
  D: 'Seller Communication',
  E: 'File Opening',
  F: 'Lender Tracking',
  G: 'Delegation Readiness',
  H: 'Final Reflections',
};

// Ordered list of section slugs used for progress bar + routing
export const SECTION_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export type SectionSlug = (typeof SECTION_ORDER)[number];

// ─── Question option definitions ─────────────────────────────────────────────
// Categorical and Likert options are defined here — not in the DB.
// scored_radio questions all use the LIKERT_OPTIONS scale (0–4).

export const LIKERT_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Fully' },
] as const;

export const URGENCY_OPTIONS = [
  { value: 1, label: '1 — Not urgent at all' },
  { value: 2, label: '2 — Low urgency' },
  { value: 3, label: '3 — Moderate urgency' },
  { value: 4, label: '4 — High urgency' },
  { value: 5, label: '5 — Critical, needs immediate attention' },
] as const;

// As of seed-questions-v2.sql, every categorical and scored question has
// exact option labels stored in the DB `response_options` column — that is
// now the single source of truth, populated via fetchQuestions(). This map
// is kept empty as a defensive fallback only (used if a question somehow
// has a null response_options, which should not happen post-seed-v2).
export const CATEGORICAL_OPTIONS: Record<string, { value: string; label: string }[]> = {};

// ─── Mode detection ───────────────────────────────────────────────────────────

// Maps a B001–B004 answer value to a workflow mode
// B001–B004 named-owner values (from seed-questions-v2.sql):
//   team_leader          → the respondent still runs it themselves → Mode A (Transfer Barrier)
//   tc / listing_coordinator / operations_manager → a named owner exists → Mode B (Full OQI)
//   shared               → no single owner → Mode C (Role Clarity)
export function answerToMode(answerValue: string): WorkflowMode {
  switch (answerValue) {
    case 'team_leader':
      return 'A';
    case 'tc':
    case 'listing_coordinator':
    case 'operations_manager':
    case 'named_owner': // teaser grid "Yes": a named owner exists, role not yet known
      return 'B';
    case 'shared':
    default:
      return 'C';
  }
}

// ─── Instrument v2 routing ────────────────────────────────────────────────────

// Owner question per workflow ("Who's accountable for keeping X moving?").
export const V2_OWNER_KEYS: Record<WorkflowKey, string> = {
  C: 'V2B_C',
  D: 'V2B_D',
  E: 'V2B_E',
  F: 'V2B_F',
};

// v2 owner answer to path. Shared work with one accountable lead lands on a named
// role, so it gets the team-owned questions (decided 2026-10-17).
export function ownerAnswerToModeV2(value: string): WorkflowMode {
  switch (value) {
    case 'me':
      return 'A';
    case 'no_one':
      return 'C';
    case 'not_done':
      return 'N';
    default:
      // tc, listing_coordinator, operations_manager, assistant_va, each_agent,
      // other_provider, and the teaser grid's named_owner
      return 'B';
  }
}

// v2 readiness track: on whether support exists, nothing else (decision 5).
// "None" = the no-support track (stored as 'solo').
export function drsProfileFromSupportV2(supportValue: string | null | undefined): DrsProfile {
  return supportValue === 'none' ? 'solo' : 'team';
}

// Swap in the "Each agent handles their own" wording where a question has it.
export function applyOwnerVariant(questions: Question[], ownerValue: string | null | undefined): Question[] {
  if (!ownerValue) return questions;
  return questions.map((q) => {
    const v = q.variants?.[ownerValue];
    if (!v) return q;
    return {
      ...q,
      question_text: v.text ?? q.question_text,
      response_options: v.options ?? q.response_options,
    };
  });
}

// Maps B001–B004 question keys to workflow keys
export const B_QUESTION_TO_WORKFLOW: Record<string, WorkflowKey> = {
  B001: 'C',
  B002: 'D',
  B003: 'E',
  B004: 'F',
};

// ─── DRS profile detection ────────────────────────────────────────────────────

// Primary detection from A006 answer (called immediately when A006 is answered)
export function detectDrsProfileFromA006(a006Value: string): DrsProfile {
  return a006Value === 'just_me' ? 'solo' : 'team';
}

// Refinement after Section B: "2 people" + 3+ Mode A → override to solo
export function refineDrsProfile(
  a006Value: string,
  modes: Record<WorkflowKey, WorkflowMode | null>,
): DrsProfile {
  if (a006Value === 'just_me') return 'solo';
  if (a006Value === '2_people') {
    const modeACount = Object.values(modes).filter((m) => m === 'A').length;
    if (modeACount >= 3) return 'solo';
  }
  return 'team';
}

// ─── DB helpers (server-side only) ───────────────────────────────────────────

export async function createSession(entry: 'full' | 'teaser' = 'full'): Promise<string> {
  const supabase = getSupabaseServer();
  // The `entry` column only gets written on the teaser path (migration 008).
  const base: Record<string, string | number> = { status: 'in_progress' };
  if (entry === 'teaser') base.entry = 'teaser';

  // New sessions start on the current instrument. If migration 009 hasn't run yet
  // (instrument_version missing), fall back to a plain insert, which the column
  // default (or its absence) makes a v1 session, so the app keeps working on v1.
  let { data, error } = await supabase
    .from('assessment_sessions')
    .insert({ ...base, instrument_version: CURRENT_INSTRUMENT_VERSION })
    .select('id')
    .single();

  if (error && /instrument_version/.test(error.message)) {
    console.error('[createSession] instrument_version not available, starting a v1 session:', error.message);
    ({ data, error } = await supabase.from('assessment_sessions').insert(base).select('id').single());
  }

  if (error || !data) throw new Error(`Failed to create session: ${error?.message}`);
  return data.id;
}

// Stamp the moment the visitor finished the 5 teaser questions and saw their
// preview number. Teaser-origin sessions only; full completion still uses
// completeSession (status='completed' + completed_at).
export async function setTeaserCompleted(sessionId: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from('assessment_sessions')
    .update({ teaser_completed_at: new Date().toISOString(), last_active_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to set teaser_completed_at: ${error.message}`);
}

export async function fetchSession(sessionId: string): Promise<AssessmentSession | null> {
  const supabase = getSupabaseServer();
  // select('*') so this works whether or not migration 009 has run; a session
  // without instrument_version is v1.
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    drs_profile: data.drs_profile ?? null,
    wf_c_mode: data.wf_c_mode ?? null,
    wf_d_mode: data.wf_d_mode ?? null,
    wf_e_mode: data.wf_e_mode ?? null,
    wf_f_mode: data.wf_f_mode ?? null,
    status: data.status,
    instrument_version: data.instrument_version === 2 ? 2 : 1,
  };
}

export async function setDrsProfile(sessionId: string, profile: DrsProfile): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from('assessment_sessions')
    .update({ drs_profile: profile, last_active_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to set drs_profile: ${error.message}`);
}

export async function setWorkflowModes(
  sessionId: string,
  modes: Partial<Record<WorkflowKey, WorkflowMode>>,
): Promise<void> {
  const supabase = getSupabaseServer();
  const update: Record<string, string> = { last_active_at: new Date().toISOString() };
  if (modes.C) update.wf_c_mode = modes.C;
  if (modes.D) update.wf_d_mode = modes.D;
  if (modes.E) update.wf_e_mode = modes.E;
  if (modes.F) update.wf_f_mode = modes.F;

  const { error } = await supabase
    .from('assessment_sessions')
    .update(update)
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to set workflow modes: ${error.message}`);
}

export async function completeSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from('assessment_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to complete session: ${error.message}`);
}

// Fetch questions for a section, optionally filtered by mode and/or drs_profile.
//
// Questions are picked by instrument version, never by is_active, so a session
// keeps its own version's questions whatever is_active says (migration 010 only
// relabels is_active). v1 rows are every row without the "V2" key prefix; that
// filter works before and after migration 009.
export async function fetchQuestions(
  section: string,
  opts: { mode?: WorkflowMode; drsProfile?: DrsProfile; version?: InstrumentVersion } = {},
): Promise<Question[]> {
  const supabase = getSupabaseServer();
  const version = opts.version ?? 1;
  const columns =
    'id, question_key, question_text, question_order, section, mode, answer_type, ' +
    'is_scored, oqi_dimension, drs_category, reverse_scored, applies_to_profile, weight, response_options' +
    (version === 2 ? ', show_if, variants' : '');

  let query = supabase
    .from('questions')
    .select(columns)
    .eq('section', section)
    .order('question_order', { ascending: true });

  query = version === 2 ? query.eq('instrument_version', 2) : query.not('question_key', 'like', 'V2%');

  if (opts.mode) {
    query = query.eq('mode', opts.mode);
  }

  if (opts.drsProfile) {
    query = query.in('applies_to_profile', ['both', opts.drsProfile]);
  }

  const { data, error } = await query.returns<Question[]>();
  if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
  return data ?? [];
}

// Fetch all saved answers for a session, keyed by question_key (joined from questions table).
// Keying by question_key (not question_id) makes pre-fill lookup exact and immune
// to positional or ordering bugs.
export async function fetchSessionAnswers(
  sessionId: string,
): Promise<Map<string, SavedAnswer>> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('answers')
    .select('question_id, answer_type, score_value, text_value, questions!inner(question_key)')
    .eq('session_id', sessionId);

  if (error) throw new Error(`Failed to fetch answers: ${error.message}`);

  const map = new Map<string, SavedAnswer>();
  for (const row of (data ?? []) as any[]) {
    const qKey: string = row.questions?.question_key ?? '';
    if (!qKey) continue;
    map.set(qKey, {
      question_id: row.question_id,
      question_key: qKey,
      answer_type: row.answer_type,
      score_value: row.score_value,
      text_value: row.text_value,
    });
  }
  return map;
}

// Upsert a single answer — called from Server Actions as the user selects options
export async function saveAnswer(
  sessionId: string,
  questionId: number,
  payload: { answer_type: AnswerType; score_value?: number | null; text_value?: string | null },
): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from('answers').upsert(
    {
      session_id:  sessionId,
      question_id: questionId,
      answer_type: payload.answer_type,
      score_value: payload.score_value ?? null,
      text_value:  payload.text_value ?? null,
      answered_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,question_id' },
  );

  if (error) throw new Error(`Failed to save answer: ${error.message}`);

  // Touch last_active_at so sliding expiry works at the session level too
  await supabase
    .from('assessment_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', sessionId);
}
