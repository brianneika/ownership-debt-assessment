// lib/insight-v2.ts
// Instrument v2 reads, built on src/lib/scoring-v2.ts: one view per workflow, the
// first-workflow pick and first move (call screen), and the respondent's results
// blocks ("What this is based on", "Where to start", "What this doesn't cover").
//
// Pure functions, no DB. Rules: vai-va-training/output/20261019-assessment-v2-scoring-rules.md
// sections 5 to 8. Respondent wording below is the DRAFT from section 8 of that
// spec, filled out for every case; final wording comes with the section copy
// (task Phase 6). No em dashes in anything here.

import {
  V2_WORKFLOWS,
  V2_GROUP_NAMES,
  indexAnswers,
  optionLabel,
  rankOf,
  isNotApplicable,
  type V2Answer,
  type V2Mode,
  type V2ScoringResult,
  type V2SessionInput,
  type V2WorkflowKey,
} from './scoring-v2';

export const V2_WORKFLOW_NAMES: Record<V2WorkflowKey, string> = {
  C: 'listing launch',
  D: 'seller communication',
  E: 'file opening',
  F: 'lender tracking',
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// ─── Owner ──────────────────────────────────────────────────────────────────

export interface V2Owner {
  value: string;
  label: string; // admin display, e.g. "Another person or provider (outsourced TC)"
  phrase: string; // respondent wording, e.g. "your listing coordinator"
  plural: boolean; // "your agents"
}

const OWNER_PHRASES: Record<string, string> = {
  tc: 'your transaction coordinator',
  listing_coordinator: 'your listing coordinator',
  operations_manager: 'your operations manager',
  assistant_va: 'your assistant or VA',
  each_agent: 'your agents',
  named_owner: 'your team member', // teaser grid "Yes": role not given yet
};

export function ownerFor(byKey: Map<string, V2Answer>, wf: V2WorkflowKey): V2Owner | null {
  const a = byKey.get(`V2B_${wf}`);
  const value = a?.text_value ?? null;
  if (!value) return null;
  const role = (byKey.get(`V2B_${wf}_ROLE`)?.text_value ?? '').trim();
  let label = optionLabel(a) ?? value;
  if (value === 'named_owner') label = 'Named owner (role not given)';
  if (value === 'other_provider' && role) label = `${label} (${role})`;
  const phrase =
    value === 'other_provider'
      ? role
        ? `your ${role.replace(/^(an?|the|my|our|your)\s+/i, '')}`
        : 'your outside provider'
      : OWNER_PHRASES[value] ?? 'your team member';
  return { value, label, phrase, plural: value === 'each_agent' };
}

// ─── One view per workflow ──────────────────────────────────────────────────

export interface RankLabel {
  rank: number;
  n: number;
  label: string;
}

export interface V2WorkflowView {
  key: V2WorkflowKey;
  name: string; // "listing launch"
  title: string; // "Listing launch"
  mode: V2Mode | null;
  ods: number | null;
  owner: V2Owner | null;
  // Owner-run
  hours: RankLabel | null; // rank 0 = 8 or more hours
  tiedUp: RankLabel | null; // rank 0 = it stops
  why: { value: string; label: string } | null;
  keptOnPurpose: boolean;
  written: RankLabel | null;
  someone: RankLabel | null; // rank 0 = "I don't have support right now"
  obstacle: string | null;
  // Team-owned
  howItRuns: RankLabel | null; // 2 healthy, 1 waits on decisions, 0 you step in
  groups: { label: string; normalizedScore: number }[];
  naCount: number;
  limited: boolean;
  // No one accountable
  noOwnerWhy: string | null;
  couldOwn: RankLabel | null; // rank 2+ = with training or now
  fallThrough: RankLabel | null; // rank 0 = most weeks
}

function rl(a: V2Answer | undefined): RankLabel | null {
  const r = rankOf(a);
  if (!r) return null;
  return { ...r, label: optionLabel(a) ?? String(r.rank) };
}

export function buildWorkflowViews(
  session: V2SessionInput,
  answers: V2Answer[],
  scores: V2ScoringResult,
): V2WorkflowView[] {
  const byKey = indexAnswers(answers);
  return V2_WORKFLOWS.map((wf) => {
    const mode = session.modes[wf];
    const s = scores.workflows[wf];
    const whyA = mode === 'A' ? byKey.get(`V2${wf}_WHY`) : undefined;
    const pick = (suffix: string, m: V2Mode) => (mode === m ? byKey.get(`V2${wf}_${suffix}`) : undefined);
    return {
      key: wf,
      name: V2_WORKFLOW_NAMES[wf],
      title: cap(V2_WORKFLOW_NAMES[wf]),
      mode,
      ods: s.ods,
      owner: ownerFor(byKey, wf),
      hours: rl(pick('HOURS', 'A')),
      tiedUp: rl(pick('TIED_UP', 'A')),
      why: whyA?.text_value ? { value: whyA.text_value, label: optionLabel(whyA) ?? whyA.text_value } : null,
      keptOnPurpose: s.keptOnPurpose,
      written: rl(pick('WRITTEN', 'A')),
      someone: rl(pick('SOMEONE', 'A')),
      obstacle: pick('OBSTACLE', 'A')?.text_value?.trim() || null,
      howItRuns: rl(pick('HOW_IT_RUNS', 'B')),
      groups: s.groups.map((g) => ({ label: g.label, normalizedScore: g.normalizedScore })),
      naCount: s.naCount,
      limited: s.limited,
      noOwnerWhy: optionLabel(pick('NO_OWNER_WHY', 'C')),
      couldOwn: rl(pick('COULD_OWN', 'C')),
      fallThrough: rl(pick('FALL_THROUGH', 'C')),
    };
  });
}

// Not-applicable answers on the workflow's current path, for "what this doesn't cover".
export function notApplicableCount(answers: V2Answer[], wf: V2WorkflowKey, mode: V2Mode | null): number {
  return answers.filter(
    (a) => a.question.section === wf && a.question.mode === mode && isNotApplicable(a),
  ).length;
}

// ─── First workflow and first move (call screen) ────────────────────────────

export type V2MoveKind =
  | 'spell_out'
  | 'kept_by_choice'
  | 'capacity_first'
  | 'sop_sprint'
  | 'train'
  | 'schedule'
  | 'map'
  | 'strengthen'
  | 'name_owner'
  | 'build_capacity';

// First workflow: highest debt, skipping workflows kept on purpose. Ties on the
// rounded score: owner-run first, then more hours.
export function pickFirstWorkflow(views: V2WorkflowView[]): V2WorkflowView | null {
  const candidates = views
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.ods !== null && !v.keptOnPurpose);
  candidates.sort((a, b) => {
    const da = Math.round(a.v.ods!);
    const db = Math.round(b.v.ods!);
    if (da !== db) return db - da;
    const ma = a.v.mode === 'A' ? 0 : 1;
    const mb = b.v.mode === 'A' ? 0 : 1;
    if (ma !== mb) return ma - mb;
    const ha = a.v.hours?.rank ?? 99; // lower rank = more hours
    const hb = b.v.hours?.rank ?? 99;
    if (ha !== hb) return ha - hb;
    return a.i - b.i;
  });
  return candidates[0]?.v ?? null;
}

// Team-owned workflows that wait on the leader because decisions aren't spelled out.
export function waitingOnDecisions(views: V2WorkflowView[]): V2WorkflowView[] {
  return views.filter((v) => v.mode === 'B' && v.howItRuns?.rank === 1);
}

export function moveKindFor(v: V2WorkflowView): V2MoveKind {
  if (v.mode === 'A') {
    if (v.keptOnPurpose) return 'kept_by_choice';
    const p = v.written?.rank ?? null;
    const r = v.someone?.rank ?? null;
    if (p === null || r === null) return 'map';
    if (r <= 1) return 'capacity_first';
    if (p <= 1) return 'sop_sprint';
    if (r === 2) return 'train';
    return 'schedule';
  }
  if (v.mode === 'C') return (v.couldOwn?.rank ?? 0) >= 2 ? 'name_owner' : 'build_capacity';
  if (v.howItRuns?.rank === 1) return 'spell_out';
  return 'strengthen';
}

export interface V2Plan {
  firstWorkflow: V2WorkflowView | null;
  // When two or more team-owned workflows wait on the same fix (or the first
  // workflow does), "spell out what they can decide" goes first across them.
  spellOut: V2WorkflowView[];
  firstMoveKind: V2MoveKind | null;
}

export function buildPlan(views: V2WorkflowView[]): V2Plan {
  const firstWorkflow = pickFirstWorkflow(views);
  const waiting = waitingOnDecisions(views);
  if (waiting.length >= 2) return { firstWorkflow, spellOut: waiting, firstMoveKind: 'spell_out' };
  if (firstWorkflow && moveKindFor(firstWorkflow) === 'spell_out') {
    return { firstWorkflow, spellOut: [firstWorkflow], firstMoveKind: 'spell_out' };
  }
  return { firstWorkflow, spellOut: [], firstMoveKind: firstWorkflow ? moveKindFor(firstWorkflow) : null };
}

// Two weakest groups of a team-owned workflow.
export function weakestGroups(v: V2WorkflowView, count = 2): { label: string; name: string; normalizedScore: number }[] {
  return [...v.groups]
    .sort((a, b) => a.normalizedScore - b.normalizedScore)
    .slice(0, count)
    .map((g) => ({ ...g, name: V2_GROUP_NAMES[g.label] ?? g.label }));
}

// ─── Respondent results blocks (draft wording) ──────────────────────────────

const HOURS_PHRASE: Record<number, string> = {
  4: 'less than an hour',
  3: '1 to 2 hours',
  2: '2 to 4 hours',
  1: '4 to 8 hours',
  0: '8 or more hours',
};

function hoursAndTied(v: V2WorkflowView): string {
  const hours = v.hours ? ` about ${HOURS_PHRASE[v.hours.rank]} a week` : '';
  const tied = v.tiedUp?.rank;
  const tail =
    tied === 0
      ? " and stops when you're away"
      : tied === 1
        ? ", and things slip when you're tied up"
        : tied === 2
          ? " and mostly keeps moving when you're tied up"
          : tied === 3
            ? " and keeps moving when you're away"
            : '';
  return `${hours}${tail}`;
}

function ownerVerb(o: V2Owner | null, singular: string, plural: string): string {
  return o?.plural ? plural : singular;
}

export function basedOnLine(v: V2WorkflowView): string | null {
  if (v.mode === 'A') {
    if (!v.hours && !v.tiedUp) return v.keptOnPurpose ? `You run ${v.name} yourself by choice.` : `You run ${v.name} yourself.`;
    if (!v.hours) {
      // No hours answer: build the line from the tied-up answer alone.
      const t = v.tiedUp!.rank;
      const tied =
        t === 0 ? "stops when you're away" : t === 1 ? "slips when you're tied up" : t === 2 ? "mostly keeps moving when you're tied up" : "keeps moving when you're away";
      return v.keptOnPurpose ? `You run ${v.name} yourself by choice. It ${tied}.` : `${v.title} ${tied}.`;
    }
    if (v.keptOnPurpose) return `You run ${v.name} yourself by choice. It takes${hoursAndTied(v)}.`;
    return `${v.title} takes${hoursAndTied(v)}.`;
  }
  if (v.mode === 'B') {
    const who = v.owner?.phrase ?? 'your team';
    const o = v.owner;
    switch (v.howItRuns?.rank) {
      case 2:
        return `${v.title} is with ${who}, who ${ownerVerb(o, 'handles', 'handle')} the routine work and ${ownerVerb(o, 'brings', 'bring')} you the decisions that need you.`;
      case 1:
        return `${v.title} is with ${who}, who ${ownerVerb(o, 'waits', 'wait')} on you for decisions, because no one has spelled out which ones are theirs.`;
      case 0:
        return `${v.title} is with ${who}, but you still step in to finish the work.`;
      default:
        return `${v.title} is with ${who}.`;
    }
  }
  if (v.mode === 'C') {
    const f = v.fallThrough?.rank;
    if (f === undefined) return `No one owns ${v.name} yet.`;
    if (f === 4) return `No one owns ${v.name} yet. Nothing fell through in the last 60 days, but it depends on whoever notices.`;
    const freq = f === 3 ? 'something fell through the cracks once' : f === 2 ? 'things fell through the cracks a few times' : f === 1 ? 'things fell through the cracks often' : 'things fell through the cracks most weeks';
    return `No one owns ${v.name} yet, and ${freq} in the last 60 days.`;
  }
  return null;
}

const GROUP_NEXT_STEP: Record<string, string> = {
  DO: 'The next step is spelling out which decisions are theirs.',
  IE: 'The next step is getting routine updates and fixes moving without you.',
  SC: 'The next step is getting it written down and templated.',
  EC: 'The next step is making sure someone can cover it.',
  OA: 'The next step is agreeing what good looks like, and checking it.',
  CT: 'The next step is giving it a steady run, so your confidence rests on a track record.',
};

export function whereToStart(views: V2WorkflowView[], plan: V2Plan): string | null {
  if (plan.firstMoveKind === 'spell_out' && plan.spellOut.length > 0) {
    const allAgents = plan.spellOut.every((v) => v.owner?.plural);
    const team = allAgents ? 'your agents' : 'your team';
    const people = allAgents ? 'Your agents' : 'Your people';
    return `Spell out what ${team} can decide without you, starting with ${joinList(plan.spellOut.map((v) => v.name))}. ${people} can already do the work. They're waiting for permission.`;
  }

  const v = plan.firstWorkflow;
  if (!v) {
    if (views.some((x) => x.keptOnPurpose)) {
      return 'The workflow that leans on you most is one you run by choice. On the call, we can look at taking the routine parts around it off your plate.';
    }
    return null;
  }

  const kind = moveKindFor(v);
  if (v.mode === 'A') {
    const mostHours =
      v.hours !== null && views.every((x) => x.mode !== 'A' || !x.hours || x.hours.rank >= v.hours!.rank);
    const leans = mostHours ? 'It costs you the most time' : 'It leans on you the most';
    const stop =
      v.tiedUp?.rank === 0 ? ", and when you're away it stops" : v.tiedUp?.rank === 1 ? ", and things slip when you're tied up" : '';
    switch (kind) {
      case 'capacity_first':
        return v.someone?.rank === 0
          ? `${v.title}. ${leans}${stop}. Get it written down so your first hire has something to run from day one.`
          : `${v.title}. ${leans}, and no one on your team could take it yet. Getting it written down is the first step, whoever ends up running it.`;
      case 'sop_sprint':
        return `${v.title}. It isn't written down yet${(v.tiedUp?.rank ?? 9) <= 1 ? ", and it's the one slipping" : ''}. Once it's on paper, someone on your team has something to run.`;
      case 'train':
        return `${v.title}. Some of it is written down, and someone on your team could take it on with training.`;
      case 'schedule':
        return `${v.title}. Some of it is written down, and someone on your team could take it now. What's left is setting a handoff date.`;
      default:
        return `${v.title}. ${leans}${stop}.`;
    }
  }
  if (v.mode === 'C') {
    return kind === 'name_owner'
      ? `${v.title}. No one owns it yet, and someone on your team could. Naming one person is the first step.`
      : `${v.title}. No one owns it yet. Start by making one person accountable for tracking it, even before anyone can run all of it.`;
  }
  const weakest = weakestGroups(v, 1)[0];
  return `${v.title}. It leans on you the most. ${weakest ? GROUP_NEXT_STEP[weakest.label] ?? '' : ''}`.trim();
}

export function doesntCover(
  views: V2WorkflowView[],
  answers: V2Answer[],
  opts: { noSupport: boolean; noDebtScore: boolean },
): string[] {
  const lines: string[] = [];
  // When every workflow is "We don't do this work", the score card and the read
  // already say so; no third mention here.
  if (!opts.noDebtScore) {
    const notDone = views.filter((v) => v.mode === 'N').map((v) => v.name);
    if (notDone.length === 1) lines.push(`You don't do ${notDone[0]}, so it isn't in your score.`);
    if (notDone.length > 1) lines.push(`You don't do ${joinList(notDone)}, so they aren't in your score.`);
  }
  for (const v of views) {
    if (v.mode !== 'B') continue;
    const na = notApplicableCount(answers, v.key, v.mode);
    if (v.limited) {
      lines.push(`Most of the ${v.name} questions that depend on something happening didn't come up for you recently, so its score is based on limited answers.`);
    } else if (na === 1) {
      lines.push(`One ${v.name} question didn't come up for you recently, so that workflow's score is based on your other answers.`);
    } else if (na > 1) {
      lines.push(`${cap(na === 2 ? 'two' : String(na))} ${v.name} questions didn't come up for you recently, so that workflow's score is based on your other answers.`);
    }
  }
  const kept = views.filter((v) => v.mode === 'A' && v.keptOnPurpose);
  if (kept.length > 0) {
    const names = joinList(kept.map((v) => v.name));
    const its = kept.length === 1 ? 'Its hours still count' : 'Their hours still count';
    const it = kept.length === 1 ? "it isn't" : "they aren't";
    lines.push(
      `Running ${names} yourself is your choice, and we treat it that way. ${its} in your score, because that time is real, but ${it} where we'd suggest you start.`,
    );
  }
  if (opts.noSupport) {
    lines.push("You don't have support yet, so your readiness is based on how you'd hand work off, not on past handoffs.");
  }
  return lines;
}

// ─── The read (headline + body) ─────────────────────────────────────────────

export type V2ReadKey = 'transfer_now' | 'build_readiness' | 'optimize_scale' | 'protect' | 'no_support_high' | 'no_support_low' | 'no_debt_score';

// Same 51 line as v1 (decision 6: bands unchanged until real v2 respondents).
export function classifyReadV2(ods: number | null, drs: number | null, noSupport: boolean): V2ReadKey | null {
  if (drs === null) return null;
  if (ods === null) return 'no_debt_score';
  const highOds = ods >= 51;
  if (noSupport) return highOds ? 'no_support_high' : 'no_support_low';
  const highDrs = drs >= 51;
  return highOds ? (highDrs ? 'transfer_now' : 'build_readiness') : highDrs ? 'optimize_scale' : 'protect';
}

export const V2_READS: Record<V2ReadKey, { headline: string; body: string }> = {
  transfer_now: {
    headline: "You're ready to start handing work off",
    body:
      'A lot of your business still runs through you, but you have the readiness to change that. ' +
      'This is a systems problem, not a willingness one. With written processes and clear owners, ' +
      'you can start handing off ownership now.',
  },
  build_readiness: {
    headline: 'Build readiness before you hand off more',
    body:
      'A lot of your business still comes back to you, and work handed off today would likely find ' +
      'its way back. The readiness gap below is the place to start, then the handoffs.',
  },
  optimize_scale: {
    headline: 'Solid foundation, ready to scale',
    body:
      "You've kept your business from leaning too heavily on you, and the people around you are ready " +
      'for more. The opportunity now is scale: deepen your systems and raise the bar before growth ' +
      'tests what works today.',
  },
  protect: {
    headline: 'Stable today, worth protecting',
    body:
      "Your business doesn't lean too heavily on you right now, but that stability depends on things " +
      'staying as they are. Before growth or a change in people forces the issue, lock in what works ' +
      'and build your readiness.',
  },
  no_support_high: {
    headline: 'Get it out of your head before you bring someone in',
    body:
      "Your business runs through you, which is normal when you're on your own. The first step is " +
      'getting your workflows to a place someone else could pick up, so whoever you bring in has ' +
      'something to run.',
  },
  no_support_low: {
    headline: "Your business isn't leaning hard on you right now",
    body:
      "Your workflows don't lean on you heavily right now, which is a good place to be on your own. " +
      "When you're ready to bring someone in, the readiness areas below show what to set up first.",
  },
  no_debt_score: {
    headline: 'Your readiness, on its own',
    body:
      "You told us you don't do any of the four workflows we measure, so there's no Ownership Debt " +
      'Score to read alongside it. Your readiness score below still applies.',
  },
};

export const V2_CLOSING_LINE = 'This is the kind of thing we map out together on your call.';

export interface V2ResultsBlocks {
  basedOn: string[];
  whereToStart: string | null;
  doesntCover: string[];
  closing: string;
}

export function buildResultsBlocks(
  session: V2SessionInput,
  answers: V2Answer[],
  scores: V2ScoringResult,
): { views: V2WorkflowView[]; plan: V2Plan; blocks: V2ResultsBlocks } {
  const views = buildWorkflowViews(session, answers, scores);
  const plan = buildPlan(views);
  const noSupport = scores.drsProfile === 'solo';
  return {
    views,
    plan,
    blocks: {
      basedOn: views.map(basedOnLine).filter((s): s is string => Boolean(s)),
      whereToStart: whereToStart(views, plan),
      doesntCover: doesntCover(views, answers, { noSupport, noDebtScore: scores.overallOds === null }),
      closing: V2_CLOSING_LINE,
    },
  };
}
