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
import {
  V2_GROUP_NAMES,
  v2RedFlagAnswers,
  rankOf,
  optionLabel as v2OptionLabel,
  type V2Answer,
  type V2ScoringResult,
  type V2SessionInput,
} from './scoring-v2';
import {
  buildWorkflowViews,
  buildPlan,
  moveKindFor,
  weakestGroups,
  classifyReadV2,
  V2_READS,
  type V2WorkflowView,
} from './insight-v2';

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
  max?: number; // v2: top of the scale when it isn't 4
}

export interface ModeADiagnostics {
  mode: 'A';
  hoursPerWeek: string | null;         // TBx1 label
  reasonNotDelegated: string | null;   // TBx2 label
  obstacle: string | null;             // TBx3 free text, verbatim
  process: ScoredAnswerDetail | null;  // TBx4 — documented process
  readyPerson: ScoredAnswerDetail | null; // TBx5 — someone ready to own it
  // v2 only
  tiedUp?: string | null; // what happens when the leader is tied up
  keptOnPurpose?: boolean;
  move?: { headline: string; detail: string; steps: string[] } | null;
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
  // v2 only
  howItRuns?: string | null;
  limited?: boolean;
  naCount?: number;
}

export interface ModeCDiagnostics {
  mode: 'C';
  noOwnerReason: string | null;             // RCx1 label
  capacity: ScoredAnswerDetail | null;      // RCx2 — can anyone own it?
  fallthrough: ScoredAnswerDetail | null;   // RCx3 raw value — high = more fallthrough
}

// v2: "We don't do this work"
export interface ModeNDiagnostics {
  mode: 'N';
}

export type WorkflowDiagnostics = ModeADiagnostics | ModeBDiagnostics | ModeCDiagnostics | ModeNDiagnostics;

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
    case 'N':
      return { mode: 'N' };
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

// ─── Respondent-facing synthesis ────────────────────────────────────────────────
// Same quadrant classification as the coach playbook above, but phrased for the
// person who took the assessment (VAI voice, no em-dashes). This backs the "what
// do the two scores mean together" block on the results page. It diagnoses the
// situation and names the single weakest readiness category; the step-by-step
// plan stays reserved for the consultant call (READINESS_LEVERS, coach-only).

const RESPONDENT_QUADRANTS: Record<QuadrantKey, { headline: string; body: string }> = {
  transfer_now: {
    headline: "You're ready to start handing work off",
    body:
      'A lot of your business still runs through you, but you have the readiness to change ' +
      'that. This is a systems problem, not a willingness one. With documented processes and ' +
      'named owners, you can start transferring real ownership now.',
  },
  build_readiness: {
    headline: 'Build readiness before you hand off',
    body:
      'A lot of your business still depends on you, and right now your team is not fully set ' +
      'up to take it on. Work handed off today would likely bounce back to you. The fastest ' +
      'path is to close the one readiness gap below first, then start transferring.',
  },
  optimize_scale: {
    headline: 'Solid foundation, ready to scale',
    body:
      'You have kept your business from leaning too heavily on you, and your team is ready ' +
      'for more. The opportunity now is scale: deepen your systems and raise the bar before ' +
      'growth tests what works today.',
  },
  protect: {
    headline: 'Stable today, worth protecting',
    body:
      'Your business does not lean too heavily on you right now, but that stability depends ' +
      'on things staying exactly as they are. Before growth or a team change forces the issue, ' +
      'lock in what works and build your team readiness.',
  },
};

// Plain, respondent-facing one-liner for each DRS category (team + solo). Used to
// explain the weakest lever by name without giving away the coaching steps.
const RESPONDENT_CATEGORY_DESC: Record<string, string> = {
  'Willingness': 'how ready you feel to let go of outcomes, not just tasks',
  'Delegation Quality': 'how clearly work gets handed off, with a real definition of done',
  'Team Capacity': 'whether your team has room to take on more ownership',
  'Authority Framework': 'written guardrails so your team knows what they can decide without you',
  'Transfer Readiness': 'how ready one workflow is to hand to a new owner',
  'Hiring Readiness': 'how clear your plan is for your first or next hire',
  'Systems Mindset': 'whether recurring problems become written systems instead of living in your head',
};

export interface RespondentSynthesis {
  quadrant: QuadrantKey;
  headline: string;
  body: string;
  // The single lowest DRS category, named for the respondent. null only when no
  // category breakdown was persisted for the session.
  weakestCategory: { category: string; score: number; descriptor: string } | null;
}

export function buildRespondentSynthesis(input: {
  odsScore: number | null;
  drsScore: number | null;
  drsCategoryBreakdown: { category: string; normalizedScore: number }[];
}): RespondentSynthesis | null {
  if (input.odsScore === null || input.drsScore === null) return null;

  const quadrant = classifyQuadrant(input.odsScore, input.drsScore);
  const copy = RESPONDENT_QUADRANTS[quadrant];

  let weakestCategory: RespondentSynthesis['weakestCategory'] = null;
  if (input.drsCategoryBreakdown.length > 0) {
    const weakest = [...input.drsCategoryBreakdown].sort(
      (a, b) => a.normalizedScore - b.normalizedScore,
    )[0];
    weakestCategory = {
      category: weakest.category,
      score: weakest.normalizedScore,
      descriptor: RESPONDENT_CATEGORY_DESC[weakest.category] ?? 'the lowest-scoring readiness category',
    };
  }

  return { quadrant, headline: copy.headline, body: copy.body, weakestCategory };
}

// Weakest-DRS-category levers, for the build_readiness quadrant. Covers both
// team and solo profile categories. `move` is the one-line read; `steps` are
// the concrete actions to give the client, in order.
const READINESS_LEVERS: Record<string, { move: string; steps: string[] }> = {
  'Willingness': {
    move: 'Control coaching — practice releasing outcomes, not just tasks, and keeping delegated work delegated.',
    steps: [
      'Pick one low-risk task and hand it off this week — with the outcome, not the method, as the standard.',
      "Leader commits to a 30-day no-touch rule: no checking, no redoing, no 'quick fixes.'",
      "Debrief weekly: separate 'it felt uncomfortable' from 'it actually went wrong.' Only the second gets acted on.",
      'Repeat with a bigger task each month — willingness is built on evidence, not persuasion.',
    ],
  },
  'Delegation Quality': {
    move: "Formalize handoffs — define 'done,' transfer decision authority with the task, no verbal delegation.",
    steps: [
      "For the next handoff, write one page: the task, what 'done well' looks like, and the decisions the owner can make without asking.",
      'Hand it off in a sit-down, not in passing — walk the page together and confirm the standard.',
      'Set a check-in cadence up front (start weekly) instead of ad-hoc check-ups.',
      'After 30 days, cut the check-ins in half if the standard is being met.',
    ],
  },
  'Team Capacity': {
    move: "Rebalance or hire — the team can't absorb more ownership at its current load.",
    steps: [
      'This week, list what each support person owns and roughly how many hours it takes.',
      'Identify what can be dropped, templated, or moved before adding any new ownership.',
      "If the load is still full, scope the next hire: role, what they'd own from day one, and the revenue/volume trigger.",
      'Only transfer new ownership into cleared capacity — never on top of an overload.',
    ],
  },
  'Authority Framework': {
    move: 'Written guardrails and escalation thresholds, so the team knows what they can decide without approval.',
    steps: [
      'List the 5 most frequent decisions that currently wait on the leader.',
      'For each, write the guardrail: what staff decide alone, what escalates, and the exact threshold (dollar amount, deadline risk, client type).',
      'Share the one-pager with the team and apply it for 30 days without exceptions.',
      'Track every escalation for a month — anything escalated that was within the guardrails gets coached back down.',
    ],
  },
  'Transfer Readiness': {
    move: "Package one workflow as if you were hiring tomorrow — responsibilities, authority, and the standard for 'done well.'",
    steps: [
      'Pick the workflow you most want off your plate and write down every step the next 2–3 times you run it.',
      'Turn the notes into a checklist SOP with the templates you actually use.',
      "Add a half-page role definition: what the future owner decides alone and what 'done well' means.",
      'Result: a handoff packet — ready the day you hire or assign someone.',
    ],
  },
  'Hiring Readiness': {
    move: "A concrete first-hire plan: what they'd own from day one, and the trigger that starts the search.",
    steps: [
      'Draft the first-hire role: the 2–3 workflows they own from day one, with the authority that goes with each.',
      'Set the trigger in numbers: the transaction volume or weekly admin-hours count that starts the search.',
      'Price it: what the role costs vs. the leader-hours it buys back.',
      'Document the highest-volume workflow now so onboarding takes days, not months.',
    ],
  },
  'Systems Mindset': {
    move: "Build processes that stay solved — recurring fixes become written systems that don't depend on the owner.",
    steps: [
      'Next time a problem repeats, solve it — then spend 30 minutes writing the fix as a process before moving on.',
      'Keep one running list of "things only I know" and document one item per week.',
      "Run the vacation test monthly: if you were unreachable for a week, what breaks first? Document that next.",
      'Store everything in one place the future hire will inherit.',
    ],
  },
};

// Per-dimension concrete steps for Mode B first moves.
const OQI_DIMENSION_STEPS: Record<string, string> = {
  DO: 'List every decision in this workflow that currently waits on the leader; move each one below an agreed risk line to the named owner, in writing.',
  IE: "Institute 'bring a recommendation, not a question': for 30 days the owner proposes and the leader only approves or adjusts — then the approvals stop.",
  SC: 'Run a two-week SOP sprint: document the workflow as a checklist and template every routine communication in it.',
  EC: 'Write the escalation thresholds on one page — exactly what the owner handles alone and what comes up — and name a trained backup.',
  OA: "Define 2–3 measurable outcomes for the workflow (not task completion — results) and review them in a weekly 15-minute check-in.",
  CT: 'Set a 90-day independent run with defined milestones, and mark each one hit — confidence gets built on evidence.',
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
  readinessLever: { category: string; score: number; move: string; steps: string[] } | null;
  firstWorkflow: { key: WorkflowKey; name: string; odsScore: number; whyStuck: string[] } | null;
  // headline = the play; detail = why this play; steps = the concrete
  // client-facing actions, in order.
  firstMove: { headline: string; detail: string; steps: string[] } | null;
}

// Overall ODS band × DRS band → quadrant. Shared by the coach playbook
// (buildStartHere) and the respondent synthesis so the two never drift.
export function classifyQuadrant(odsScore: number, drsScore: number): QuadrantKey {
  const highOds = odsScore >= HIGH_SCORE_CUTOFF;
  const highDrs = drsScore >= HIGH_SCORE_CUTOFF;
  return highOds
    ? highDrs
      ? 'transfer_now'
      : 'build_readiness'
    : highDrs
      ? 'optimize_scale'
      : 'protect';
}

export function buildStartHere(input: StartHereInput): StartHereInsight | null {
  if (input.odsScore === null || input.drsScore === null) return null;

  const key = classifyQuadrant(input.odsScore, input.drsScore);

  const quadrant: QuadrantCopy = { key, ...QUADRANTS[key] };

  // Weakest readiness category (only surfaced when readiness is the blocker)
  let readinessLever: StartHereInsight['readinessLever'] = null;
  if (key === 'build_readiness' && input.drsCategoryBreakdown.length > 0) {
    const weakest = [...input.drsCategoryBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
    const lever = READINESS_LEVERS[weakest.category];
    readinessLever = {
      category: weakest.category,
      score: weakest.normalizedScore,
      move: lever?.move ?? 'Coach the weakest readiness category first.',
      steps: lever?.steps ?? [],
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
  if (!d || d.mode === 'N') return [];
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
  if (!d || d.mode === 'N') return null;

  if (d.mode === 'A') {
    const p = d.process?.value ?? null;
    const r = d.readyPerson?.value ?? null;
    if (p === null || r === null) {
      return {
        headline: 'Map the workflow with the leader',
        detail: `The transfer-barrier answers for ${wf.name} are incomplete — find the documentation and people gaps first.`,
        steps: [
          `Walk ${wf.name} end-to-end with the leader and list every step, template, and decision point.`,
          'Score the two gaps together: is there a real SOP, and is there a person who could own it?',
          'The weaker of the two becomes the first project — documentation sprint or capacity plan.',
        ],
      };
    }
    if (r <= 1) {
      return {
        headline: 'Capacity first',
        detail: `No one on the team is close to ready to own ${wf.name} — a transfer has nowhere to land yet.`,
        steps: [
          'Decide build vs. buy this week: name the closest internal candidate, or scope a TC/coordinator hire (role, cost, volume trigger).',
          `While that runs, the leader documents ${wf.name} as they work it — every step into a checklist SOP over the next 2–3 cycles.`,
          "Write the ownership half-page: the tasks, the decisions the future owner makes alone, and what 'done well' means.",
          "Set the transfer date now — within 30 days of the candidate or hire's start — so the handoff packet has a deadline.",
        ],
      };
    }
    if (p <= 1) {
      return {
        headline: 'SOP sprint, then transfer',
        detail: `The person is ready (or close) — the only thing blocking ${wf.name} is that the process lives in the leader's head.`,
        steps: [
          `Weeks 1–2: the leader documents ${wf.name} while running it — every step, template, and decision point into one checklist SOP.`,
          'Week 3: the ready person runs the workflow from the SOP with the leader shadowing; fix every gap the SOP misses.',
          'Week 4: transfer ownership — they run it solo, with the decisions they own written down, not implied.',
          'Check in daily for the first week, then weekly. Log anything that bounces back to the leader and why.',
        ],
      };
    }
    if (r === 2) {
      return {
        headline: 'Train against the SOP, transfer in stages',
        detail: `A workable process exists for ${wf.name}; the likely owner needs structured training before full ownership.`,
        steps: [
          'Walk the candidate through the SOP end-to-end, then have them run one full cycle with the leader watching.',
          'Split the workflow into 3–4 segments and hand off one at a time — each segment transfers when they run it clean.',
          'Keep a sign-off checklist: once a segment is signed off, it never comes back to the leader.',
          'Target full ownership in 60–90 days, with the authority for each segment transferred in writing as they earn it.',
        ],
      };
    }
    return {
      headline: 'Schedule the handoff now',
      detail: `Both the process and the person are ready — ${wf.name} is stuck by habit, not by a gap.`,
      steps: [
        'Put the transfer date on the calendar this week — no more than 30 days out.',
        'Announce the new owner to the team (and any clients or vendors the workflow touches) so requests stop routing to the leader.',
        'Write the escalation line: the 2–3 situations that still come to the leader; everything else belongs to the owner.',
        "Coach the leader on not taking it back: for 60 days, log every time the work bounces back and what triggered it — that's the coaching material.",
      ],
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
          `The capability exists (“${d.capacity!.label}”) — the gap is assignment, not talent.${fallthroughNote}`,
        steps: [
          `Choose the owner of ${wf.name} this week — one name, not a committee.`,
          "Write a one-page ownership doc: the tasks, the decisions they make alone, and when to escalate.",
          "Announce it to the whole team so 'whoever has time' stops being the default.",
          'Review at 30 days: anything that fell through or bounced back gets a named fix in the doc.',
        ],
      };
    }
    return {
      headline: 'Build capacity, add a stop-gap',
      detail: `No one can own ${wf.name} yet — but it can stop being ownerless today.${fallthroughNote}`,
      steps: [
        `Assign a temporary single point of accountability for ${wf.name} today — even if they can't do it all, they track it all.`,
        'Build a shared checklist for the workflow so nothing depends on memory while ownership is unsettled.',
        'Start the capability conversation: pick the nearest candidate to train, or scope the hire (role, cost, trigger).',
        'Reassess in 30 days — the workflow gets a permanent owner the moment one exists.',
      ],
    };
  }

  // Mode B: target the two weakest OQI dimensions
  const lowest = [...wf.oqiBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore).slice(0, 2);
  if (lowest.length === 0) return null;
  const names = lowest.map((x) => OQI_DIMENSION_NAMES[x.label] ?? x.label);
  const steps = lowest.map((x) => OQI_DIMENSION_STEPS[x.label]).filter((s): s is string => Boolean(s));
  return {
    headline: `Strengthen ${names.join(' and ')}`,
    detail: `${wf.name} has a named owner — the debt comes from how the workflow runs, not who runs it.`,
    steps: [
      ...steps,
      'Review outcomes weekly for the first month; the next assessment retake should show this workflow’s score move.',
    ],
  };
}

// ─── Instrument v2 (call screen) ───────────────────────────────────────────────
// v2 rules: vai-va-training/output/20261019-assessment-v2-scoring-rules.md,
// sections 5 and 6. The per-workflow reads and the first-workflow pick live in
// ./insight-v2 (pure); this part adds the coach-facing move copy and maps v2
// onto the shapes the admin page already renders.

export function oqiDimensionNames(version: 1 | 2): Record<string, string> {
  return version === 2 ? V2_GROUP_NAMES : OQI_DIMENSION_NAMES;
}

const V2_GROUP_STEPS: Record<string, string> = {
  DO: 'List the decisions in this workflow that still wait on the leader. Write down which are theirs and which still come up, and share it.',
  IE: "For 30 days the owner brings a recommendation, not a question, and the leader approves or adjusts. Routine updates go out without the leader's review.",
  SC: 'Run a two-week sprint: write the workflow as a checklist and template every routine email in it.',
  EC: 'Name and train a backup who can keep the workflow moving for a day without the owner or the leader.',
  OA: 'Agree on 2 or 3 outcomes that say the workflow went well, and check them in a weekly 15-minute review.',
  CT: "Set a 90-day run with milestones and mark each one as it's hit, so confidence rests on a track record.",
};

type Move = { headline: string; detail: string; steps: string[] };

function spellOutMove(names: string[]): Move {
  const list = names.length <= 1 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return {
    headline: 'Spell out what they can decide without you',
    detail:
      `${list} ${names.length > 1 ? 'wait' : 'waits'} on the leader for decisions because no one has written down which ones are theirs. ` +
      'The people can already do the work; they are waiting for permission.',
    steps: [
      `List the decisions in ${list} that currently wait on the leader.`,
      "For each, write whether it's theirs or still comes to the leader, on one page, and share it.",
      'Run it for 30 days. Anything brought to the leader that was theirs gets pointed back to the page.',
      'Review the page at 30 days and move more decisions over as they earn them.',
    ],
  };
}

function keptByChoiceMove(name: string): Move {
  return {
    headline: 'Kept by choice: take the routine parts off',
    detail: `The leader runs ${name} on purpose. Keep the judgment calls with them and move the admin around it.`,
    steps: [
      `List the parts of ${name} that need the leader's judgment, and the parts that are routine admin.`,
      'Template the routine emails and updates.',
      'Hand the routine admin to a VA with AI, with the leader keeping the judgment calls.',
      'Check the hours at 30 days: they should drop while the leader keeps the parts they chose to keep.',
    ],
  };
}

function v2Diagnostics(v: V2WorkflowView, answers: V2Answer[], session: V2SessionInput): WorkflowDiagnostics | null {
  if (!v.mode) return null;
  if (v.mode === 'N') return { mode: 'N' };
  if (v.mode === 'A') {
    return {
      mode: 'A',
      hoursPerWeek: v.hours?.label ?? null,
      reasonNotDelegated: v.why?.label ?? null,
      obstacle: v.obstacle,
      process: v.written ? { value: v.written.rank, label: v.written.label } : null,
      readyPerson: v.someone ? { value: v.someone.rank, label: v.someone.label } : null,
      tiedUp: v.tiedUp?.label ?? null,
      keptOnPurpose: v.keptOnPurpose,
      move: v2Move(v),
    };
  }
  if (v.mode === 'C') {
    return {
      mode: 'C',
      noOwnerReason: v.noOwnerWhy,
      capacity: v.couldOwn ? { value: v.couldOwn.rank, label: v.couldOwn.label, max: v.couldOwn.n - 1 } : null,
      // v1 direction (higher = more falls through) so the existing display reads the same.
      fallthrough: v.fallThrough ? { value: 4 - v.fallThrough.rank, label: v.fallThrough.label } : null,
    };
  }
  const flagged = v2RedFlagAnswers(answers, session).filter(
    (a) => a.question.section === v.key && a.question.mode === 'B',
  );
  const order = Object.keys(V2_GROUP_NAMES);
  return {
    mode: 'B',
    lowAnswers: flagged
      .map((a) => ({
        dimension: V2_GROUP_NAMES[a.question.oqi_dimension ?? ''] ?? a.question.oqi_dimension ?? '',
        questionText: a.question.question_text ?? a.question.question_key,
        answerLabel: v2OptionLabel(a) ?? String(a.score_value),
        effectiveScore: rankOf(a)?.rank ?? 0,
        _order: order.indexOf(a.question.oqi_dimension ?? ''),
      }))
      .sort((x, y) => x._order - y._order)
      .map(({ _order, ...rest }) => { void _order; return rest; }),
    howItRuns: v.howItRuns?.label ?? null,
    limited: v.limited,
    naCount: v.naCount,
  };
}

function v2Move(v: V2WorkflowView): Move | null {
  const name = WORKFLOW_NAMES[v.key];
  const kind = moveKindFor(v);
  if (kind === 'kept_by_choice') return keptByChoiceMove(name);
  if (kind === 'spell_out') return spellOutMove([name]);
  if (v.mode === 'A' || v.mode === 'C') {
    // Same decision tables as v1 ("I don't have support right now" ranks 0, so it
    // lands on "Capacity first"; "could someone own it" now or with training
    // ranks 2 or 3, so it lands on "Name a single owner").
    return deriveFirstMove({
      key: v.key,
      name,
      mode: v.mode,
      odsScore: v.ods,
      diagnostics: v2DiagnosticsBare(v),
      oqiBreakdown: [],
    });
  }
  const lowest = weakestGroups(v, 2);
  if (lowest.length === 0) return null;
  return {
    headline: `Strengthen ${lowest.map((g) => g.name).join(' and ')}`,
    detail: `${name} has an accountable owner. The debt comes from how the workflow runs, not who runs it.`,
    steps: [
      ...lowest.map((g) => V2_GROUP_STEPS[g.label]).filter((s): s is string => Boolean(s)),
      "Review outcomes weekly for the first month; the next retake should show this workflow's score move.",
    ],
  };
}

// Diagnostics for the v1 decision tables, without recursion into moves.
function v2DiagnosticsBare(v: V2WorkflowView): WorkflowDiagnostics | null {
  if (v.mode === 'A') {
    return {
      mode: 'A',
      hoursPerWeek: v.hours?.label ?? null,
      reasonNotDelegated: v.why?.label ?? null,
      obstacle: v.obstacle,
      process: v.written ? { value: v.written.rank, label: v.written.label } : null,
      readyPerson: v.someone ? { value: v.someone.rank, label: v.someone.label } : null,
    };
  }
  if (v.mode === 'C') {
    return {
      mode: 'C',
      noOwnerReason: v.noOwnerWhy,
      capacity: v.couldOwn ? { value: v.couldOwn.rank, label: v.couldOwn.label } : null,
      fallthrough: v.fallThrough ? { value: 4 - v.fallThrough.rank, label: v.fallThrough.label } : null,
    };
  }
  return null;
}

function v2WhyStuck(v: V2WorkflowView): string[] {
  const lines: string[] = [];
  if (v.mode === 'A') {
    if (v.hours) lines.push(`The leader spends ${v.hours.label.toLowerCase()} a week on it.`);
    if (v.tiedUp) lines.push(`When they're tied up: ${v.tiedUp.label}`);
    if (v.why) lines.push(`Why they run it: "${v.why.label}"`);
    if (v.written) lines.push(`Written down: ${v.written.label} (${v.written.rank}/4)`);
    if (v.someone) lines.push(`Someone who could take it: ${v.someone.label} (${v.someone.rank}/4)`);
    if (v.obstacle) lines.push(`What would make a handoff hardest, in their words: "${v.obstacle}"`);
  } else if (v.mode === 'C') {
    if (v.noOwnerWhy) lines.push(`Why no one owns it: "${v.noOwnerWhy}"`);
    if (v.couldOwn) lines.push(`Could someone own it: ${v.couldOwn.label}`);
    if (v.fallThrough) lines.push(`Fell through in the last 60 days: ${v.fallThrough.label}`);
  } else if (v.mode === 'B') {
    if (v.howItRuns) lines.push(`How it runs: "${v.howItRuns.label}"`);
    const lowest = weakestGroups(v, 2);
    if (lowest.length > 0) {
      lines.push('Weakest groups: ' + lowest.map((g) => `${g.name} (${g.normalizedScore.toFixed(0)})`).join(' and '));
    }
    if (v.limited) lines.push('Scored on limited answers: most event questions did not come up.');
  }
  return lines;
}

export interface StartHereInsightV2 extends StartHereInsight {
  // Workflows the leader keeps on purpose, each with "Kept by choice" (never the first workflow).
  keptByChoice: { name: string; move: Move }[];
  // Set when "spell out what they can decide" goes first across these workflows.
  spellOutWorkflows: string[];
}

export function buildV2CallScreen(input: {
  session: V2SessionInput;
  answers: V2Answer[];
  scores: V2ScoringResult;
}): {
  views: V2WorkflowView[];
  diagnostics: Record<WorkflowKey, WorkflowDiagnostics | null>;
  startHere: StartHereInsightV2 | null;
  redFlags: RedFlag[];
} {
  const { session, answers, scores } = input;
  const views = buildWorkflowViews(session, answers, scores);
  const plan = buildPlan(views);

  const diagnostics = Object.fromEntries(
    views.map((v) => [v.key, v2Diagnostics(v, answers, session)]),
  ) as Record<WorkflowKey, WorkflowDiagnostics | null>;

  let startHere: StartHereInsightV2 | null = null;
  if (scores.drs !== null) {
    const key = classifyQuadrant(scores.overallOds ?? 0, scores.drs);
    const quadrant: QuadrantCopy = { key, ...QUADRANTS[key] };
    let readinessLever: StartHereInsight['readinessLever'] = null;
    if (key === 'build_readiness' && scores.drsCategories.length > 0) {
      const weakest = [...scores.drsCategories].sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
      const lever = READINESS_LEVERS[weakest.category];
      readinessLever = {
        category: weakest.category,
        score: weakest.normalizedScore,
        move: lever?.move ?? 'Coach the weakest readiness category first.',
        steps: lever?.steps ?? [],
      };
    }
    const top = plan.firstWorkflow;
    const spellOutNames = plan.spellOut.map((v) => WORKFLOW_NAMES[v.key]);
    startHere = {
      quadrant,
      readinessLever,
      firstWorkflow:
        top && top.ods !== null
          ? { key: top.key, name: WORKFLOW_NAMES[top.key], odsScore: top.ods, whyStuck: v2WhyStuck(top) }
          : null,
      firstMove: plan.firstMoveKind === 'spell_out' ? spellOutMove(spellOutNames) : top ? v2Move(top) : null,
      keptByChoice: views
        .filter((v) => v.mode === 'A' && v.keptOnPurpose)
        .map((v) => ({ name: WORKFLOW_NAMES[v.key], move: keptByChoiceMove(WORKFLOW_NAMES[v.key]) })),
      spellOutWorkflows: plan.firstMoveKind === 'spell_out' ? spellOutNames : [],
    };
  }

  const redFlags: RedFlag[] = v2RedFlagAnswers(answers, session)
    .map((a) => ({
      questionKey: a.question.question_key,
      questionText: a.question.question_text ?? a.question.question_key,
      section: a.question.section,
      contextLabel: contextLabel(a.question.section),
      answerLabel: v2OptionLabel(a) ?? String(a.score_value),
      effectiveScore: rankOf(a)?.rank ?? 0,
    }))
    .sort((x, y) => {
      if (x.effectiveScore !== y.effectiveScore) return x.effectiveScore - y.effectiveScore;
      const xs = SECTION_SORT_ORDER.indexOf(x.section);
      const ys = SECTION_SORT_ORDER.indexOf(y.section);
      if (xs !== ys) return xs - ys;
      return x.questionKey.localeCompare(y.questionKey);
    });

  return { views, diagnostics, startHere, redFlags };
}

// Respondent read for v2: today's four reads lightly reworded, plus a version for
// people with no support yet (spec section 7).
export function buildRespondentSynthesisV2(input: {
  odsScore: number | null;
  drsScore: number | null;
  noSupport: boolean;
  drsCategoryBreakdown: { category: string; normalizedScore: number }[];
}): { quadrant: string; headline: string; body: string; weakestCategory: RespondentSynthesis['weakestCategory'] } | null {
  const key = classifyReadV2(input.odsScore, input.drsScore, input.noSupport);
  if (!key) return null;
  const copy = V2_READS[key];
  let weakestCategory: RespondentSynthesis['weakestCategory'] = null;
  if (input.drsCategoryBreakdown.length > 0) {
    const weakest = [...input.drsCategoryBreakdown].sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
    weakestCategory = {
      category: weakest.category,
      score: weakest.normalizedScore,
      descriptor: RESPONDENT_CATEGORY_DESC[weakest.category] ?? 'the lowest-scoring readiness category',
    };
  }
  return { quadrant: key, headline: copy.headline, body: copy.body, weakestCategory };
}
