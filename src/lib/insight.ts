// lib/insight.ts
// Display-only call-prep insight for the admin session page: red flags,
// per-workflow answer diagnostics, and the "Start Here" quadrant playbook.
//
// Everything here is derived from already-scored data — no scoring semantics
// live in this module. All thresholds and coach-facing copy are kept in this
// one file so wording can iterate without touching src/lib/scoring.ts.
//
// COPY STATUS: draft (2026-07-19) — pending Bri's approval pass before it
// backs a real call. See plans/tasks/20260718-admin-call-prep-insight.md.

import { WORKFLOW_NAMES, SECTION_LABELS, type WorkflowKey, type WorkflowMode } from './assessment';

// ─── Thresholds ───────────────────────────────────────────────────────────────

// A scored answer at or below this (after reverse-scoring) is a red flag.
export const RED_FLAG_THRESHOLD = 1;

// "High" means the Elevated/Critical ODS bands or the Emerging/Ready DRS bands
// (both start at 51 in score_bands).
const HIGH_SCORE_CUTOFF = 51;

// ─── Input shape ──────────────────────────────────────────────────────────────
// A normalized answer row: admin.ts unwraps the Supabase join before calling in.

export interface InsightQuestion {
  question_key: string;
  question_text: string;
  section: string;
  mode: string | null;
  oqi_dimension: string | null;
  drs_category: string | null;
  is_scored: boolean;
  reverse_scored: boolean;
  response_options: { value: number | string; label: string }[] | null;
}

export interface InsightAnswer {
  score_value: number | null;
  text_value: string | null;
  answer_type: string;
  question: InsightQuestion;
}

// ─── Shared labels ────────────────────────────────────────────────────────────

export const OQI_DIMENSION_NAMES: Record<string, string> = {
  DO: 'Decision Ownership',
  IE: 'Independent Execution',
  SC: 'Systems & Checklists',
  EC: 'Escalation & Coverage',
  OA: 'Outcome Accountability',
  CT: 'Confidence & Track Record',
};

function effectiveScore(raw: number, reversed: boolean): number {
  return reversed ? 4 - raw : raw;
}

function optionLabel(a: InsightAnswer): string | null {
  const raw = a.answer_type === 'scored_radio' ? a.score_value : a.text_value;
  if (raw === null || raw === undefined) return null;
  const match = a.question.response_options?.find((o) => String(o.value) === String(raw));
  return match?.label ?? String(raw);
}

function contextLabel(section: string): string {
  if (section === 'C' || section === 'D' || section === 'E' || section === 'F') {
    return WORKFLOW_NAMES[section as WorkflowKey];
  }
  return SECTION_LABELS[section] ?? section;
}

function findByKey(answers: InsightAnswer[], questionKey: string): InsightAnswer | undefined {
  return answers.find((a) => a.question.question_key === questionKey);
}

function scoredDetail(a: InsightAnswer | undefined): { value: number; label: string } | null {
  if (!a || a.score_value === null) return null;
  return { value: a.score_value, label: optionLabel(a) ?? String(a.score_value) };
}

// ─── Red flags ────────────────────────────────────────────────────────────────
// Every scored answer at ≤ RED_FLAG_THRESHOLD after reverse-scoring — the
// call's talking-point list.

export interface RedFlag {
  questionKey: string;
  questionText: string;
  section: string;        // raw section letter, for sorting/grouping
  contextLabel: string;   // e.g. 'Listing Launch', 'Delegation Readiness'
  answerLabel: string;    // the option the respondent actually chose
  effectiveScore: number; // 0–4 after reverse-scoring
}

const SECTION_SORT_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function extractRedFlags(answers: InsightAnswer[]): RedFlag[] {
  const flags: RedFlag[] = [];
  for (const a of answers) {
    const q = a.question;
    if (!q.is_scored || a.score_value === null) continue;
    const eff = effectiveScore(a.score_value, q.reverse_scored);
    if (eff > RED_FLAG_THRESHOLD) continue;
    flags.push({
      questionKey: q.question_key,
      questionText: q.question_text,
      section: q.section,
      contextLabel: contextLabel(q.section),
      answerLabel: optionLabel(a) ?? String(a.score_value),
      effectiveScore: eff,
    });
  }
  return flags.sort((x, y) => {
    if (x.effectiveScore !== y.effectiveScore) return x.effectiveScore - y.effectiveScore;
    const xs = SECTION_SORT_ORDER.indexOf(x.section);
    const ys = SECTION_SORT_ORDER.indexOf(y.section);
    if (xs !== ys) return xs - ys;
    return x.questionKey.localeCompare(y.questionKey);
  });
}

// ─── Per-workflow diagnostics ─────────────────────────────────────────────────
// The mode-appropriate raw-answer detail the page never showed.

export interface ScoredAnswerDetail {
  value: number; // raw 0–4
  label: string;
}

export interface ModeADiagnostics {
  mode: 'A';
  hoursPerWeek: string | null;         // TBx1 label
  reasonNotDelegated: string | null;   // TBx2 label
  obstacle: string | null;             // TBx3 free text, verbatim
  process: ScoredAnswerDetail | null;  // TBx4 — documented process
  readyPerson: ScoredAnswerDetail | null; // TBx5 — someone ready to own it
}

export interface ModeBLowAnswer {
  dimension: string; // full name, e.g. 'Decision Ownership'
  questionText: string;
  answerLabel: string;
  effectiveScore: number;
}

export interface ModeBDiagnostics {
  mode: 'B';
  lowAnswers: ModeBLowAnswer[]; // scored ≤ RED_FLAG_THRESHOLD, grouped by dimension order
}

export interface ModeCDiagnostics {
  mode: 'C';
  noOwnerReason: string | null;             // RCx1 label
  capacity: ScoredAnswerDetail | null;      // RCx2 — can anyone own it?
  fallthrough: ScoredAnswerDetail | null;   // RCx3 raw value — high = more fallthrough
}

export type WorkflowDiagnostics = ModeADiagnostics | ModeBDiagnostics | ModeCDiagnostics;

export function extractWorkflowDiagnostics(
  answers: InsightAnswer[],
  wfKey: WorkflowKey,
  mode: WorkflowMode,
): WorkflowDiagnostics {
  switch (mode) {
    case 'A': {
      const tb1 = findByKey(answers, `TB${wfKey}1`);
      const tb2 = findByKey(answers, `TB${wfKey}2`);
      const tb3 = findByKey(answers, `TB${wfKey}3`);
      return {
        mode: 'A',
        hoursPerWeek: tb1 ? optionLabel(tb1) : null,
        reasonNotDelegated: tb2 ? optionLabel(tb2) : null,
        obstacle: tb3?.text_value ?? null,
        process: scoredDetail(findByKey(answers, `TB${wfKey}4`)),
        readyPerson: scoredDetail(findByKey(answers, `TB${wfKey}5`)),
      };
    }
    case 'B': {
      const dimOrder = Object.keys(OQI_DIMENSION_NAMES);
      const lowAnswers: ModeBLowAnswer[] = answers
        .filter((a) => {
          const q = a.question;
          return (
            q.section === wfKey &&
            q.mode === 'B' &&
            q.is_scored &&
            a.score_value !== null &&
            effectiveScore(a.score_value, q.reverse_scored) <= RED_FLAG_THRESHOLD
          );
        })
        .map((a) => ({
          dimension: OQI_DIMENSION_NAMES[a.question.oqi_dimension ?? ''] ?? a.question.oqi_dimension ?? '',
          questionText: a.question.question_text,
          answerLabel: optionLabel(a) ?? String(a.score_value),
          effectiveScore: effectiveScore(a.score_value!, a.question.reverse_scored),
        }))
        .sort((x, y) => {
          const xd = dimOrder.findIndex((d) => OQI_DIMENSION_NAMES[d] === x.dimension);
          const yd = dimOrder.findIndex((d) => OQI_DIMENSION_NAMES[d] === y.dimension);
          return xd - yd;
        });
      return { mode: 'B', lowAnswers };
    }
    case 'C': {
      const rc1 = findByKey(answers, `RC${wfKey}1`);
      return {
        mode: 'C',
        noOwnerReason: rc1 ? optionLabel(rc1) : null,
        capacity: scoredDetail(findByKey(answers, `RC${wfKey}2`)),
        fallthrough: scoredDetail(findByKey(answers, `RC${wfKey}3`)),
      };
    }
  }
}

// ─── Start Here panel ─────────────────────────────────────────────────────────
// Answers Bri's question directly: where do we start, and why?

export type QuadrantKey = 'transfer_now' | 'build_readiness' | 'optimize_scale' | 'protect';

interface QuadrantCopy {
  key: QuadrantKey;
  title: string;
  body: string;
}

// The 4-quadrant playbook (overall ODS band × DRS band). Kept in code per the
// 2026-07-19 decision — versioned in git, fast to iterate.
const QUADRANTS: Record<QuadrantKey, Omit<QuadrantCopy, 'key'>> = {
  transfer_now: {
    title: 'Ready to delegate — start transferring now',
    body:
      'Ownership debt is high, but readiness is too. This is a systems problem, not a ' +
      'willingness problem — nothing about the leader needs to change first. The workflows ' +
      'need documented processes and named owners; start moving work immediately, beginning ' +
      'with the workflow below.',
  },
  build_readiness: {
    title: 'Build readiness first',
    body:
      'Ownership debt is high and delegation readiness is low — work transferred today would ' +
      'likely bounce back to the leader. The fastest path is the weakest readiness category, ' +
      'named below: fix that lever, then start transferring.',
  },
  optimize_scale: {
    title: 'Optimize and scale',
    body:
      'Debt is under control and readiness is strong. The conversation is about scale: deepen ' +
      'documentation, raise outcome standards, and prepare the next layer of ownership before ' +
      'growth stresses what works today.',
  },
  protect: {
    title: 'Stable but fragile — protect what works',
    body:
      'Debt is low today, but readiness is also low — the current stability depends on things ' +
      'staying exactly as they are. Document what works now, and build readiness before growth ' +
      'or turnover forces the issue.',
  },
};

// Weakest-DRS-category levers, for the build_readiness quadrant. Covers both
// team and solo profile categories.
const READINESS_LEVERS: Record<string, string> = {
  'Willingness':
    'Control coaching — practice releasing outcomes (not just tasks) and keeping delegated work delegated.',
  'Delegation Quality':
    "Define what 'done' looks like for each handoff and transfer decision authority with the task, not just the task itself.",
  'Team Capacity':
    "A hiring or rebalancing conversation — the team can't absorb more ownership at its current load.",
  'Authority Framework':
    'Documented guardrails and escalation thresholds, so the team knows exactly what they can decide without approval.',
  'Transfer Readiness':
    "Package the handoff — document responsibilities, authority, and the standard for 'done well' before anyone is hired into it.",
  'Hiring Readiness':
    "A concrete first-hire plan: what they'd own from day one, and the volume target that triggers the hire.",
  'Systems Mindset':
    "Build processes that stay solved — turn recurring in-the-moment fixes into documented systems that don't depend on the owner.",
};

// Per-dimension plays for Mode B first moves.
const OQI_DIMENSION_PLAYS: Record<string, string> = {
  DO: 'transfer real decision authority — take the leader out of the approval loop',
  IE: 'require recommendations instead of questions, and let the named owner take first action',
  SC: 'run an SOP-and-templates sprint so execution stops depending on memory',
  EC: 'define escalation thresholds and train a backup',
  OA: 'set measurable outcome standards and review them on a cadence',
  CT: 'build a 90-day independent track record with defined wins',
};

export interface StartHereWorkflowInput {
  key: WorkflowKey;
  name: string;
  mode: WorkflowMode | null;
  odsScore: number | null;
  diagnostics: WorkflowDiagnostics | null;
  oqiBreakdown: { label: string; normalizedScore: number }[];
}

export interface StartHereInput {
  odsScore: number | null;
  drsScore: number | null;
  drsCategoryBreakdown: { category: string; normalizedScore: number }[];
  workflows: StartHereWorkflowInput[];
}

export interface StartHereInsight {
  quadrant: QuadrantCopy;
  // Only set for build_readiness: the weakest DRS category and its lever.
  readinessLever: { category: string; score: number; move: string } | null;
  firstWorkflow: { key: WorkflowKey; name: string; odsScore: number; whyStuck: string[] } | null;
  firstMove: { headline: string; detail: string } | null;
}

export function buildStartHere(input: StartHereInput): StartHereInsight | null {
  if (input.odsScore === null || input.drsScore === null) return null;

  const highOds = input.odsScore >= HIGH_SCORE_CUTOFF;
  const highDrs = input.drsScore >= HIGH_SCORE_CUTOFF;

  const key: QuadrantKey = highOds
    ? highDrs
      ? 'transfer_now'
      : 'build_readiness'
    : highDrs
      ? 'optimize_scale'
      : 'protect';

  const quadrant: QuadrantCopy = { key, ...QUADRANTS[key] };

  // Weakest readiness category (only surfaced when readiness is the blocker)
  let readinessLever: StartHereInsight['readinessLever'] = null;
  if (key === 'build_readiness' && input.drsCategoryBreakdown.length > 0) {
    const weakest = [...input.drsCategoryBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
    readinessLever = {
      category: weakest.category,
      score: weakest.normalizedScore,
      move: READINESS_LEVERS[weakest.category] ?? 'Coach the weakest readiness category first.',
    };
  }

  // First workflow: highest per-workflow ODS
  const ranked = input.workflows
    .filter((w): w is StartHereWorkflowInput & { odsScore: number } => w.odsScore !== null)
    .sort((a, b) => b.odsScore - a.odsScore);
  const top = ranked[0] ?? null;

  let firstWorkflow: StartHereInsight['firstWorkflow'] = null;
  let firstMove: StartHereInsight['firstMove'] = null;

  if (top) {
    firstWorkflow = {
      key: top.key,
      name: top.name,
      odsScore: top.odsScore,
      whyStuck: describeWhyStuck(top),
    };
    firstMove = deriveFirstMove(top);
  }

  return { quadrant, readinessLever, firstWorkflow, firstMove };
}

function describeWhyStuck(wf: StartHereWorkflowInput): string[] {
  const d = wf.diagnostics;
  if (!d) return [];
  const lines: string[] = [];

  if (d.mode === 'A') {
    if (d.hoursPerWeek) lines.push(`The leader personally spends ${d.hoursPerWeek}/week on it.`);
    if (d.reasonNotDelegated) lines.push(`Stated reason it hasn't been delegated: “${d.reasonNotDelegated}”`);
    if (d.process) lines.push(`Documented process: ${d.process.label} (${d.process.value}/4)`);
    if (d.readyPerson) lines.push(`Someone ready to own it: ${d.readyPerson.label} (${d.readyPerson.value}/4)`);
    if (d.obstacle) lines.push(`90-day obstacle, in their words: “${d.obstacle}”`);
  } else if (d.mode === 'C') {
    if (d.noOwnerReason) lines.push(`Why there's no single owner: “${d.noOwnerReason}”`);
    if (d.capacity) lines.push(`Team capacity to own it: ${d.capacity.label} (${d.capacity.value}/4)`);
    if (d.fallthrough && d.fallthrough.value >= 3) {
      lines.push(`Work falls through the cracks: ${d.fallthrough.label}`);
    }
  } else {
    const lowest = [...wf.oqiBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore).slice(0, 2);
    if (lowest.length > 0) {
      lines.push(
        'Weakest quality dimensions: ' +
          lowest
            .map((x) => `${OQI_DIMENSION_NAMES[x.label] ?? x.label} (${x.normalizedScore.toFixed(0)})`)
            .join(' and '),
      );
    }
  }
  return lines;
}

// The gap-type decision table: TBx4 = documented process, TBx5 = person ready.
function deriveFirstMove(wf: StartHereWorkflowInput): StartHereInsight['firstMove'] {
  const d = wf.diagnostics;
  if (!d) return null;

  if (d.mode === 'A') {
    const p = d.process?.value ?? null;
    const r = d.readyPerson?.value ?? null;
    if (p === null || r === null) {
      return {
        headline: 'Map the workflow with the leader',
        detail: `The transfer-barrier answers for ${wf.name} are incomplete — start by walking the workflow with the leader to find the documentation and people gaps.`,
      };
    }
    if (r <= 1) {
      return {
        headline: 'Capacity first',
        detail:
          `No one on the team is close to ready to own ${wf.name}. Start with a capacity conversation — ` +
          'hire or develop — and document the workflow in parallel so the handoff is ready when the person is.',
      };
    }
    if (p <= 1) {
      return {
        headline: 'SOP sprint, then transfer',
        detail:
          `The person is ready (or close), but the process lives in the leader's head. Run a documentation ` +
          `sprint on ${wf.name} to produce a real SOP, then transfer it with a short shadow period.`,
      };
    }
    if (r === 2) {
      return {
        headline: 'Train against the SOP, transfer in stages',
        detail:
          `A workable process exists for ${wf.name}, but the likely owner needs significant training. ` +
          'Develop them against the SOP and transfer the workflow in stages as they demonstrate each piece.',
      };
    }
    return {
      headline: 'Schedule the handoff now',
      detail:
        `Both the process and the person are close to ready — ${wf.name} is stuck by habit, not by a gap. ` +
        'Put a transfer date on the calendar: a 30-day handoff with a shadow period, and coach the leader on not taking it back.',
    };
  }

  if (d.mode === 'C') {
    const capacity = d.capacity?.value ?? null;
    const fallthroughNote =
      d.fallthrough && d.fallthrough.value >= 3
        ? ` Work is already falling through the cracks (${d.fallthrough.label.toLowerCase()}), so this is urgent.`
        : '';
    if (capacity !== null && capacity >= 2) {
      return {
        headline: 'Name a single owner',
        detail:
          `The capability exists (“${d.capacity!.label}”) — the gap is assignment. Name one owner for ${wf.name}, ` +
          `document their authority, and announce the change to the team.${fallthroughNote}`,
      };
    }
    return {
      headline: 'Build capacity, add a stop-gap',
      detail:
        `No one can own ${wf.name} yet. Open the training or hiring conversation, and in the meantime put a ` +
        `simple checklist and a single point of accountability in place so nothing is ownerless.${fallthroughNote}`,
    };
  }

  // Mode B: target the two weakest OQI dimensions
  const lowest = [...wf.oqiBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore).slice(0, 2);
  if (lowest.length === 0) return null;
  const names = lowest.map((x) => OQI_DIMENSION_NAMES[x.label] ?? x.label);
  const plays = lowest.map((x) => OQI_DIMENSION_PLAYS[x.label]).filter(Boolean);
  return {
    headline: `Strengthen ${names.join(' and ')}`,
    detail:
      `${wf.name} has a named owner — the debt comes from how the workflow runs, not who runs it. ` +
      `First moves: ${plays.join('; ')}.`,
  };
}
