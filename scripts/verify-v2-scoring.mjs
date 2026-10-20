// scripts/verify-v2-scoring.mjs
// Checks v2 scoring against the three worked examples in the approved scoring
// spec (vai-va-training/output/20261019-assessment-v2-scoring-rules.md, section 8).
// No database: answers are built from the question bank in scripts/v2-questions.mjs.
//
//   node scripts/verify-v2-scoring.mjs
//
// Exits non-zero on any mismatch.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { questions } from './v2-questions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');

// Transpile the two pure modules into a temp dir and import them.
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'v2-scoring-'));
for (const name of ['scoring-v2', 'insight-v2']) {
  const src = fs.readFileSync(path.join(root, 'src/lib', `${name}.ts`), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText.replace(/from '\.\/scoring-v2'/g, "from './scoring-v2.mjs'");
  fs.writeFileSync(path.join(out, `${name}.mjs`), js);
}
// teaser.ts imports two v1 helpers from ./assessment (server code); stub them.
{
  const src = fs.readFileSync(path.join(root, 'src/lib/teaser.ts'), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText.replace(/from '\.\/assessment'/g, "from './assessment-stub.mjs'");
  fs.writeFileSync(path.join(out, 'teaser.mjs'), js);
  fs.writeFileSync(
    path.join(out, 'assessment-stub.mjs'),
    "export const B_QUESTION_TO_WORKFLOW = { B001: 'C', B002: 'D', B003: 'E', B004: 'F' };\n" +
      "export function answerToMode(v) { return v === 'team_leader' ? 'A' : v === 'shared' ? 'C' : 'B'; }\n",
  );
}
const teaser = await import(pathToFileURL(path.join(out, 'teaser.mjs')).href);
const scoring = await import(pathToFileURL(path.join(out, 'scoring-v2.mjs')).href);
const insight = await import(pathToFileURL(path.join(out, 'insight-v2.mjs')).href);

const byKey = new Map(questions.map((q) => [q.question_key, q]));
function meta(key) {
  const q = byKey.get(key);
  if (!q) throw new Error(`No v2 question ${key}`);
  return { ...q, response_options: q.response_options };
}
// Answer by rank (the stored score_value), or 'na', or a categorical text value.
function ans(key, v) {
  const q = meta(key);
  if (q.answer_type === 'scored_radio') return { score_value: v === 'na' ? 5 : v, text_value: null, question: q };
  return { score_value: null, text_value: v, question: q };
}

// The spec's simulation (v2sim.py) lists answers by position in the audit's lists.
// Map positions to stored ranks for the team-owned set.
const TEAM_KEYS = {
  how_it_runs: 'HOW_IT_RUNS', rights: 'DECISION_RIGHTS', right_decisions: 'RIGHT_DECISIONS', updates: 'UPDATES',
  fixes: 'FIXES', first_response: 'FIRST_RESPONSE', plan: 'PLAN', process: 'PROCESS', templates: 'TEMPLATES',
  backup: 'BACKUP', went_well: 'WENT_WELL', confidence: 'CONFIDENCE', how_long: 'HOW_LONG',
};
function team(wf, positions) {
  return Object.entries(positions).map(([k, pos]) => {
    const key = `V2${wf}_${TEAM_KEYS[k]}`;
    if (pos === null) return ans(key, 'na');
    // "How it runs" is listed best first: position 0 = rank 2.
    const rank = k === 'how_it_runs' ? 2 - pos : pos;
    return ans(key, rank);
  });
}
// Owner-run by the sim's positions: hours position 0 = "Less than 1 hour", tied position 0 = "It stops".
function owner(wf, hoursPos, tiedPos, why, writtenRank, someoneRank) {
  return [
    ans(`V2${wf}_HOURS`, 4 - hoursPos),
    ans(`V2${wf}_TIED_UP`, tiedPos),
    ans(`V2${wf}_WHY`, why),
    ans(`V2${wf}_WRITTEN`, writtenRank),
    ans(`V2${wf}_SOMEONE`, someoneRank),
  ];
}

const strong = { how_it_runs: 0, rights: 2, right_decisions: 3, updates: 3, fixes: 3, first_response: 3, plan: 3, process: 3, templates: 3, backup: 2, went_well: 2, confidence: 3, how_long: 3 };
const middling = { how_it_runs: 1, rights: 1, right_decisions: 2, updates: 2, fixes: 2, first_response: 2, plan: 2, process: 2, templates: 2, backup: 1, went_well: 1, confidence: 2, how_long: 2 };
const weak = { how_it_runs: 2, rights: 0, right_decisions: 1, updates: 1, fixes: 1, first_response: 1, plan: null, process: 1, templates: 1, backup: 1, went_well: 1, confidence: 1, how_long: 1 };

const examples = [
  {
    name: 'Example 1: team lead, three support people, all four team-owned',
    session: { drs_profile: 'team', modes: { C: 'B', D: 'B', E: 'B', F: 'B' } },
    answers: [
      ans('V2B_C', 'listing_coordinator'), ans('V2B_D', 'tc'), ans('V2B_E', 'tc'), ans('V2B_F', 'tc'),
      ...team('C', strong), ...team('D', middling), ...team('E', middling), ...team('F', weak),
      // Willingness 2.33 avg (2.67 + 3 + 1.33), Delegation quality 2, Team capacity 2, Authority 1
      ans('V2G_WRONG_TEAM', 2), ans('V2G_MOVED', 3), ans('V2G_DIFFERENT_TEAM', 1),
      ans('V2G_HANDOFF', 2), ans('V2G_DONE', 2), ans('V2G_DECISIONS', 2),
      ans('V2G_ROOM', 2), ans('V2G_LEARN', 2), ans('V2G_TEAM_DECIDE', 1), ans('V2G_WAITING', 1),
    ],
    expect: { workflows: { C: 30, D: 58, E: 58, F: 79 }, ods: 56, drs: 48, weakest: ['Authority Framework', 25] },
    expectPlan: { first: 'F', move: 'spell_out', spellOut: ['D', 'E'] },
  },
  {
    name: 'Example 2: one assistant, runs three, outsourced TC on lender tracking',
    session: { drs_profile: 'team', modes: { C: 'A', D: 'A', E: 'A', F: 'B' } },
    answers: [
      ans('V2B_C', 'me'), ans('V2B_D', 'me'), ans('V2B_E', 'me'), ans('V2B_F', 'other_provider'), ans('V2B_F_ROLE', 'outsourced TC'),
      ...owner('C', 3, 0, 'on_purpose', 2, 3),
      ...owner('D', 2, 1, 'not_written', 0, 3),
      ...owner('E', 1, 2, 'not_priority', 2, 2),
      ...team('F', middling),
      // Willingness 2.22 avg (2.67 + 0 + 4), Delegation quality 1, Team capacity 1, Authority 0.5
      ans('V2G_WRONG_TEAM', 2), ans('V2G_MOVED', 0), ans('V2G_DIFFERENT_TEAM', 3),
      ans('V2G_HANDOFF', 1), ans('V2G_DONE', 1), ans('V2G_DECISIONS', 1),
      ans('V2G_ROOM', 1), ans('V2G_LEARN', 1), ans('V2G_TEAM_DECIDE', 0), ans('V2G_WAITING', 1),
    ],
    expect: { workflows: { C: 88, D: 58, E: 29, F: 58 }, ods: 58, drs: 32, weakest: ['Authority Framework', 13] },
    expectPlan: { first: 'D', move: 'sop_sprint', spellOut: [] },
  },
  {
    name: 'Example 3: solo, no support, no lender tracking',
    session: { drs_profile: 'solo', modes: { C: 'A', D: 'A', E: 'A', F: 'N' } },
    answers: [
      ans('V2B_C', 'me'), ans('V2B_D', 'me'), ans('V2B_E', 'me'), ans('V2B_F', 'not_done'),
      ...owner('C', 3, 0, 'no_support', 0, 0),
      ...owner('D', 2, 0, 'no_support', 0, 0),
      ...owner('E', 1, 1, 'no_support', 1, 0),
      // Willingness 2.67, Hiring readiness 1.33, Systems mindset 1.25
      ans('V2G_WRONG_NOSUP', 2), ans('V2G_DIFFERENT_NOSUP', 2),
      ans('V2G_FIRST_HIRE', 1), ans('V2G_AFFORD', 2), ans('V2G_TARGET', 1),
      ans('V2G_SOLVE_ONCE', 1), ans('V2G_UNREACHABLE', 1), ans('V2G_NOW_LATER', 1), ans('V2G_HIRE_SPEED', 2),
      ans('V2G_INVOLVED', 'no_one'),
    ],
    expect: { workflows: { C: 88, D: 75, E: 46, F: null }, ods: 69, drs: 43, weakest: ['Systems Mindset', 31] },
    expectPlan: { first: 'C', move: 'capacity_first', spellOut: [] },
  },
];

let failures = 0;
function check(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}: got ${JSON.stringify(got)}${ok ? '' : `, want ${JSON.stringify(want)}`}`);
}
const r = (v) => (v === null ? null : Math.round(v));

for (const ex of examples) {
  console.log(`\n${ex.name}`);
  const res = scoring.computeScoresV2(ex.session, ex.answers);
  for (const wf of ['C', 'D', 'E', 'F']) check(`workflow ${wf}`, r(res.workflows[wf].ods), ex.expect.workflows[wf]);
  check('Ownership Debt', r(res.overallOds), ex.expect.ods);
  check('Delegation Readiness', r(res.drs), ex.expect.drs);
  const weakest = [...res.drsCategories].sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
  check('weakest readiness area', [weakest.category, Math.round(weakest.normalizedScore)], ex.expect.weakest);

  const { plan, blocks } = insight.buildResultsBlocks(ex.session, ex.answers, res);
  check('first workflow', plan.firstWorkflow?.key ?? null, ex.expectPlan.first);
  check('first move', plan.firstMoveKind, ex.expectPlan.move);
  check('spell-out workflows', plan.spellOut.map((v) => v.key), ex.expectPlan.spellOut);
  console.log('  -- results page draft --');
  console.log('  Based on:', blocks.basedOn.join(' '));
  console.log('  Where to start:', blocks.whereToStart);
  console.log('  Does not cover:', blocks.doesntCover.join(' '));
  const flags = scoring.v2RedFlagAnswers(ex.answers, ex.session).map((a) => a.question.question_key);
  console.log('  Red flags:', flags.join(', ') || '(none)');
  const text = JSON.stringify(blocks);
  if (text.includes('\u2014')) {
    failures += 1;
    console.log('  FAIL em dash in results text');
  }
}

// Spot checks from the spec's tables.
console.log('\nSpec tables');
check('owner-run 8+ h, stops', scoring.ownerRunDebt(0, 0), 100);
check('owner-run under 1 h, keeps moving', scoring.ownerRunDebt(4, 4), 0);
check('no one accountable, never', scoring.noOwnerDebt(4), 25);
check('no one accountable, once', scoring.noOwnerDebt(3), 43.75);
check('no one accountable, most weeks', scoring.noOwnerDebt(0), 100);
const fourAnswer = ans('V2C_DECISION_RIGHTS', 1);
check('four-answer scale, second answer', Number(scoring.scaledScore(fourAnswer).toFixed(2)), 1.33);
check('na answer is not applicable', scoring.isNotApplicable(ans('V2C_PLAN', 'na')), true);
check('na answer is never a red flag', scoring.isRedFlagAnswer(ans('V2C_PLAN', 'na')), false);
check('five-answer red flag at rank 1', scoring.isRedFlagAnswer(ans('V2C_UPDATES', 1)), true);
check('four-answer no red flag at rank 1', scoring.isRedFlagAnswer(ans('V2C_DECISION_RIGHTS', 1)), false);

// Teaser preview on v2: a proxy, not the debt score. Checks the two v2 changes.
console.log('\nTeaser preview (v2)');
const t1 = teaser.computeTeaserEstimateV2({ b: { C: 'me', D: 'me', E: 'me', F: 'not_done' }, authority: 0, takeBack: 5 });
check('three owner-run + one not done: share of the three', t1.ownerDependencePct, 100);
check('no one to hand work to: tier', t1.tier, 'getting_started');
const t2 = teaser.computeTeaserEstimateV2({ b: { C: 'named_owner', D: 'named_owner', E: 'not_done', F: 'not_done' }, authority: 4, takeBack: 4 });
check('two delegated with full authority, two not done', [t2.ownerDependencePct, t2.tier], [0, 'ready']);
const t3 = teaser.computeTeaserEstimateV2({ b: { C: 'me', D: 'named_owner', E: 'named_owner', F: 'named_owner' }, authority: 2, takeBack: 1 });
const t3v1 = teaser.computeTeaserEstimate({ b: { C: 'team_leader', D: 'named_owner', E: 'named_owner', F: 'named_owner' }, authority: 2, takeBack: 1 });
check('nothing marked not done: same as the v1 preview', [t3.ownerDependencePct, t3.tier], [t3v1.ownerDependencePct, t3v1.tier]);
// The three worked examples, teaser answers as they'd give them, next to the full v2 score.
const previews = [
  ['Example 1', { C: 'named_owner', D: 'named_owner', E: 'named_owner', F: 'named_owner' }, 2, 3, 56],
  ['Example 2', { C: 'me', D: 'me', E: 'me', F: 'named_owner' }, 1, 0, 58],
  ['Example 3', { C: 'me', D: 'me', E: 'me', F: 'not_done' }, 0, 5, 69],
];
for (const [name, b, authority, takeBack, full] of previews) {
  const e = teaser.computeTeaserEstimateV2({ b, authority, takeBack });
  console.log(`  ${name}: preview ~${e.ownerDependencePct}% (${e.bandLabel}, tier ${e.tierLabel}); full v2 Ownership Debt ${full}`);
}

fs.rmSync(out, { recursive: true, force: true });
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
