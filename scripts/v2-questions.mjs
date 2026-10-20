// scripts/v2-questions.mjs
// The v2 question bank (Ownership Debt Assessment, instrument version 2), written
// once here. `node scripts/v2-questions.mjs` rewrites the generated rows block inside
// supabase/migrations/009_instrument_v2.sql (between the BEGIN/END GENERATED ROWS markers).
//
// Sources (both approved by Bri 2026-10-19, in ~/Code Folder/vai-va-training/output/):
//   20261019-assessment-v2-question-audit.md   wording and answer lists
//   20261019-assessment-v2-scoring-rules.md    groups, weights, not-applicable answers
//
// Value conventions the scoring code (src/lib/scoring-v2.ts) relies on:
//   - Scored and numeric answers store a RANK in score_value: 0 is the most debt or
//     least ready answer, n-1 the least debt or most ready. Display order is the
//     order of response_options, which can differ from the rank.
//   - Not-applicable answers ("This didn't come up", "Nothing came to me",
//     "Nothing has gone wrong recently") store 5 and carry `"na": true`.
//   - Scoring spreads ranks evenly over 0..4 using the count of non-na options.
//   - `variants.each_agent` holds the wording used when the owner answer is
//     "Each agent handles their own".
//   - `show_if` hides a question until another answer on the same page matches.
//
// No em dashes anywhere in respondent-facing text.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WF = {
  C: {
    name: 'listing launch',
    plural: 'listing launches',
    span: 'from signed listing agreement to live on MLS',
  },
  D: {
    name: 'seller communication',
    plural: 'seller communication',
    span: 'from weekly updates and feedback to price review prep',
  },
  E: {
    name: 'file opening',
    plural: 'file openings',
    span: 'from executed contract to critical date calendar',
  },
  F: {
    name: 'lender tracking',
    plural: 'lender tracking',
    span: 'from appraisal and underwriting to clear to close and closing coordination',
  },
};

const NA = 5;

// Options from display-ordered labels. `ranks` gives each label's rank; default is
// ascending (first label = rank 0). Labels prefixed with "na:" become na options.
function opts(labels, ranks) {
  let real = 0;
  return labels.map((label, i) => {
    if (label.startsWith('na:')) return { value: NA, label: label.slice(3), na: true };
    const value = ranks ? ranks[i] : real;
    real += 1;
    return { value, label };
  });
}
function cat(pairs) {
  return pairs.map(([value, label]) => ({ value, label }));
}

const questions = [];
let order = 1000;
function q(row) {
  order += 1;
  questions.push({
    answer_type: 'scored_radio',
    is_scored: true,
    mode: null,
    oqi_dimension: null,
    drs_category: null,
    applies_to_profile: 'both',
    dimension: null,
    response_options: null,
    show_if: null,
    variants: null,
    ...row,
    question_order: order,
  });
}

// ─── Part 1: About you (3) ──────────────────────────────────────────────────
q({
  question_key: 'V2A_SETUP', section: 'A', answer_type: 'categorical_radio', is_scored: false,
  question_text: 'How is your business set up?',
  response_options: cat([
    ['solo_agent', "Solo agent: I'm the producing agent"],
    ['team_lead', 'Team lead: agents produce under me'],
    ['brokerage_owner', 'Brokerage owner or team of teams'],
    ['other', 'Other'],
  ]),
});
q({
  question_key: 'V2A_DEALS', section: 'A', answer_type: 'categorical_radio', is_scored: false,
  question_text: 'How many transactions did you (and your team, if you have one) close in the last 12 months?',
  response_options: cat([
    ['under_12', 'Fewer than 12'],
    ['12_to_24', '12 to 24'],
    ['25_to_49', '25 to 49'],
    ['50_to_99', '50 to 99'],
    ['100_to_199', '100 to 199'],
    ['200_plus', '200 or more'],
  ]),
});
q({
  question_key: 'V2A_SUPPORT', section: 'A', answer_type: 'categorical_radio', is_scored: false,
  question_text:
    'Not counting you, how many people support your business? Include assistants, coordinators, VAs and outside providers like an outsourced TC.',
  response_options: cat([
    ['none', 'None'],
    ['1', '1'],
    ['2', '2'],
    ['3_to_4', '3 to 4'],
    ['5_to_7', '5 to 7'],
    ['8_plus', '8 or more'],
  ]),
});

// ─── Part 2: Who owns what (4, plus a role box shown for "Another person or provider") ──
const OWNER_OPTIONS = cat([
  ['me', 'Me'],
  ['tc', 'Transaction coordinator'],
  ['listing_coordinator', 'Listing coordinator'],
  ['operations_manager', 'Operations manager'],
  ['assistant_va', 'Assistant or VA'],
  ['each_agent', 'Each agent handles their own'],
  ['other_provider', 'Another person or provider'],
  ['no_one', 'No one in particular'],
  ['not_done', "We don't do this work"],
]);
for (const wf of ['C', 'D', 'E', 'F']) {
  const w = WF[wf];
  q({
    question_key: `V2B_${wf}`, section: 'B', answer_type: 'categorical_radio', is_scored: false,
    question_text: `Who's accountable for keeping ${w.name} moving, ${w.span}? Several people may help. Pick the one who makes sure it gets done.`,
    response_options: OWNER_OPTIONS,
  });
  q({
    question_key: `V2B_${wf}_ROLE`, section: 'B', answer_type: 'free_text', is_scored: false,
    question_text: "What's their role? For example, outsourced TC",
    show_if: { key: `V2B_${wf}`, equals: 'other_provider' },
  });
}

// ─── Team-owned workflows (13 each), mode B ─────────────────────────────────
// Per-workflow wording. `they` versions first; `agents` versions are used when the
// owner answer is "Each agent handles their own".
const TEAM = {
  updates: {
    C: 'How often do routine listing launch updates to the seller go out without your review?',
    D: 'How often does the weekly seller update go out without your review?',
    E: 'How often do the file details sent to title, escrow and the other agent go out without your review?',
    F: 'How often do lender updates, like an appraisal result or a clear-to-close confirmation, go out without your review?',
  },
  fixes: {
    C: 'like an MLS error or a missed deadline',
    D: 'like a seller upset about a scheduling issue or a communication gap',
    E: 'like a critical date entered wrong or a missing document',
    F: 'like a stale underwriting update or a missed closing detail',
  },
  first: {
    C: 'When a seller calls with a last-minute change, like new photos needed or a showing conflict, who fields that call first?',
    D: 'When a seller reaches out with a concern between updates, who responds first?',
    E: "When something's off with a new file, like a missing signature, who catches it first?",
    F: 'When a lender issue comes up, like a delayed appraisal or a stalled underwriting file, who follows up first?',
  },
  plan: {
    C: 'When something comes up mid-launch, like a delayed photographer or a seller who wants changes,',
    D: "When a seller starts asking why there's been no activity after weeks on market,",
    E: 'When a file opening issue comes up, like a document discrepancy,',
    F: 'When a lending delay threatens the closing date,',
  },
  templates: {
    C: 'How many of the routine listing launch emails and updates are templated?',
    D: 'How many of the routine seller communication emails and updates, like the weekly update and feedback summary, are templated?',
    E: 'How many of the routine file opening emails and notices, like confirmations and critical date notices, are templated?',
    F: 'How many of the routine lender tracking emails and updates, like status updates and closing confirmations, are templated?',
  },
  backup: {
    C: ['If they were out for a day mid-launch, what would happen to listing launch?',
        'If one of your agents were out for a day mid-launch, what would happen to their listing launch?'],
    D: ['If they were out for a few days, what would happen to seller communication?',
        'If one of your agents were out for a few days, what would happen to their seller communication?'],
    E: ['If they were out for a day, what would happen to file opening?',
        'If one of your agents were out for a day, what would happen to their file opening?'],
    F: ['If they were out for a day near closing, what would happen to lender tracking?',
        'If one of your agents were out for a day near closing, what would happen to their lender tracking?'],
  },
  wentWell: {
    C: 'How do you know whether a listing launch went well, beyond the steps getting done?',
    D: 'How do you know whether seller communication is going well, beyond the updates going out, like whether the seller feels informed?',
    E: 'How do you know whether a file was opened well, beyond the steps getting done, like every date and detail being correct?',
    F: 'How do you know whether lender tracking went well, beyond the follow-ups getting done, like milestones tracked, delays spotted early and next steps coordinated?',
  },
  confidence: {
    C: 'keep listing launches moving',
    D: 'keep seller communication on track',
    E: 'open files and build the critical date calendar correctly',
    F: 'keep files moving from appraisal to closing',
  },
};

function agentsOnly(text, options) {
  return { each_agent: { ...(text ? { text } : {}), ...(options ? { options } : {}) } };
}

for (const wf of ['C', 'D', 'E', 'F']) {
  const w = WF[wf];
  const base = { section: wf, mode: 'B', dimension: 'oqi' };

  // Decisions
  q({
    ...base, question_key: `V2${wf}_HOW_IT_RUNS`, oqi_dimension: 'DO',
    question_text: `Most weeks, which is closest to how ${w.name} runs?`,
    response_options: opts([
      'They handle the routine work and bring me the decisions that should come to me.',
      "They can do the work, but they wait on me for decisions because we haven't spelled out what they can decide.",
      'I regularly check, correct or step in to finish the work.',
    ], [2, 1, 0]),
    variants: agentsOnly(null, opts([
      'My agents handle the routine work and bring me the decisions that should come to me.',
      "My agents can do the work, but they wait on me for decisions because we haven't spelled out what they can decide.",
      'I regularly check, correct or step in to finish the work.',
    ], [2, 1, 0])),
  });
  q({
    ...base, question_key: `V2${wf}_DECISION_RIGHTS`, oqi_dimension: 'DO',
    question_text: `Have you spelled out which ${w.name} decisions are theirs and which come to you?`,
    response_options: opts(['Not yet', "We've talked about it, nothing written", 'Written for some decisions', 'Written for most decisions']),
    variants: agentsOnly(`Have you spelled out which ${w.name} decisions are your agents' and which come to you?`),
  });
  q({
    ...base, question_key: `V2${wf}_RIGHT_DECISIONS`, oqi_dimension: 'DO',
    question_text: `In the last 60 days, when they brought you a ${w.name} decision, how often did it really need you?`,
    response_options: opts(['Almost never', 'Sometimes', 'About half the time', 'Usually', 'Almost always', 'na:Nothing came to me']),
    variants: agentsOnly(`In the last 60 days, when your agents brought you a ${w.name} decision, how often did it really need you?`),
  });

  // Running the work
  q({
    ...base, question_key: `V2${wf}_UPDATES`, oqi_dimension: 'IE',
    question_text: TEAM.updates[wf],
    response_options: opts(['Never', 'Rarely', 'Sometimes', 'Usually', 'Always']),
  });
  q({
    ...base, question_key: `V2${wf}_FIXES`, oqi_dimension: 'IE',
    question_text: `When something goes wrong in ${w.name}, ${TEAM.fixes[wf]}, who follows through on fixing it?`,
    response_options: opts([
      'I do', 'Mostly me, they help', 'We split it', 'They do, and I check the fix',
      'They do, and bring me in only when it needs me', 'na:Nothing has gone wrong recently',
    ]),
    variants: agentsOnly(null, opts([
      'I do', 'Mostly me, my agents help', 'We split it', 'My agents do, and I check the fix',
      'My agents do, and bring me in only when it needs me', 'na:Nothing has gone wrong recently',
    ])),
  });
  q({
    ...base, question_key: `V2${wf}_FIRST_RESPONSE`, oqi_dimension: 'IE',
    question_text: TEAM.first[wf],
    response_options: opts(['Always me', 'Usually me', 'About equally', 'Usually them', 'Always them', "na:This didn't come up"]),
    variants: agentsOnly(null, opts(['Always me', 'Usually me', 'About equally', 'Usually my agents', 'Always my agents', "na:This didn't come up"])),
  });
  q({
    ...base, question_key: `V2${wf}_PLAN`, oqi_dimension: 'IE',
    question_text: `${TEAM.plan[wf]} do they bring you a plan, or do they bring you the problem?`,
    response_options: opts([
      'They bring me the problem', 'Sometimes a suggestion, mostly they wait for direction',
      'About half the time a plan', 'Usually a plan', 'Almost always a plan, and I approve or adjust',
      "na:This didn't come up",
    ]),
    variants: agentsOnly(`${TEAM.plan[wf]} do your agents bring you a plan, or do they bring you the problem?`),
  });

  // Systems
  q({
    ...base, question_key: `V2${wf}_PROCESS`, oqi_dimension: 'SC',
    question_text: `Which is closest for ${w.name}?`,
    response_options: opts([
      'Nothing written down', 'Written, but out of date or incomplete', 'Written and current, but not really used',
      'Written, current and used most of the time', 'Written, current and used every time',
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_TEMPLATES`, oqi_dimension: 'SC',
    question_text: TEAM.templates[wf],
    response_options: opts(['None', 'A few', 'About half', 'Most', 'All of them']),
  });

  // Coverage
  q({
    ...base, question_key: `V2${wf}_BACKUP`, oqi_dimension: 'EC',
    question_text: TEAM.backup[wf][0],
    response_options: opts([
      "It would wait until they're back", 'It would come to me', 'Someone could cover the basics',
      'Someone could cover most of it', 'Someone could fully cover it',
    ]),
    variants: agentsOnly(TEAM.backup[wf][1]),
  });

  // Standards
  q({
    ...base, question_key: `V2${wf}_WENT_WELL`, oqi_dimension: 'OA',
    question_text: TEAM.wentWell[wf],
    response_options: opts([
      "We don't have a way to tell", 'I go by feel', "We've agreed what good looks like, but don't check it",
      "We've agreed and check it now and then", "We've agreed and check it regularly",
    ]),
  });

  // Track record
  q({
    ...base, question_key: `V2${wf}_CONFIDENCE`, oqi_dimension: 'CT',
    question_text: `How confident are you that they can ${TEAM.confidence[wf]}, bringing you only the decisions that need you?`,
    response_options: opts(['Not confident', 'Slightly', 'Moderately', 'Very', 'Fully confident']),
    variants: agentsOnly(`How confident are you that your agents can ${TEAM.confidence[wf]}, bringing you only the decisions that need you?`),
  });
  q({
    ...base, question_key: `V2${wf}_HOW_LONG`, oqi_dimension: 'CT',
    question_text: `How long have they been running ${w.name} this way, bringing you only what needs you?`,
    response_options: opts(['Not yet', 'Less than 3 months', '3 to 6 months', '6 to 12 months', 'More than a year']),
    variants: agentsOnly(`How long have your agents been running ${w.name} this way, bringing you only what needs you?`),
  });
}

// ─── Owner-run workflows (6 each, 2 scored), mode A ─────────────────────────
for (const wf of ['C', 'D', 'E', 'F']) {
  const w = WF[wf];
  const base = { section: wf, mode: 'A' };
  q({
    ...base, question_key: `V2${wf}_HOURS`, dimension: 'ods',
    question_text: `How many hours per week do you personally spend on ${w.name} tasks?`,
    // Display: least hours first. Rank: 8 or more = 0 (most debt).
    response_options: opts(['Less than 1 hour', '1 to under 2', '2 to under 4', '4 to under 8', '8 or more'], [4, 3, 2, 1, 0]),
  });
  q({
    ...base, question_key: `V2${wf}_TIED_UP`, dimension: 'ods',
    question_text: `When you're tied up for a few days, what happens to ${w.name}?`,
    response_options: opts([
      "It stops until I'm back", 'It slows down and some things slip', 'It mostly keeps moving',
      'It keeps moving; someone or something covers it',
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_WHY`, answer_type: 'categorical_radio', is_scored: false,
    question_text: `What's the main reason you run ${w.name} yourself?`,
    response_options: cat([
      ['on_purpose', "I keep it on purpose; it's where I add the most value"],
      ['no_support', "I don't have anyone to hand it to"],
      ['budget', 'Budget'],
      ['no_skills', 'No one on my team has the skills yet'],
      ['not_written', "It isn't written down"],
      ['came_back', "I've handed it off before and it came back"],
      ['not_comfortable', "I'm not comfortable handing it off yet"],
      ['not_priority', "It hasn't been a priority"],
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_WRITTEN`, is_scored: false,
    question_text: `Is ${w.name} written down well enough that someone else could follow it?`,
    response_options: opts(['Nothing written', 'Some notes', 'Partly written', 'Mostly written', 'Fully written and current']),
  });
  q({
    ...base, question_key: `V2${wf}_SOMEONE`, is_scored: false,
    question_text: `Could someone on your team take ${w.name} on?`,
    response_options: opts([
      "I don't have support right now", 'No one on my team could', 'Someone could, with a lot of training',
      'Someone could, with some preparation', 'Someone could take it now',
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_OBSTACLE`, answer_type: 'free_text', is_scored: false,
    question_text: `If you decided to hand off ${w.name}, what would make it hardest? (Optional)`,
  });
}

// ─── No one accountable (3 each, 1 scored), mode C ──────────────────────────
for (const wf of ['C', 'D', 'E', 'F']) {
  const w = WF[wf];
  const base = { section: wf, mode: 'C' };
  q({
    ...base, question_key: `V2${wf}_NO_OWNER_WHY`, answer_type: 'categorical_radio', is_scored: false,
    question_text: `Why does no one own ${w.name}?`,
    response_options: cat([
      ['between_roles', 'It falls between roles'],
      ['never_assigned', "We've never assigned it"],
      ['tried', "We tried, and it didn't stick"],
      ['not_sure', "I'm not sure who should"],
      ['whoever_has_time', 'It goes to whoever has time'],
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_COULD_OWN`, is_scored: false,
    question_text: `If you assigned ${w.name} to one person, could someone on your team own it?`,
    response_options: opts([
      'No one could', 'Someone could, with a lot of help', 'Someone could, with training',
      "Someone could now; it just hasn't been assigned",
    ]),
  });
  q({
    ...base, question_key: `V2${wf}_FALL_THROUGH`, dimension: 'ods',
    question_text: `In the last 60 days, how often did something in ${w.name} fall through the cracks?`,
    response_options: opts(['Never', 'Once', 'A few times', 'Often', 'Most weeks'], [4, 3, 2, 1, 0]),
  });
}

// ─── Part 7: Delegation readiness ───────────────────────────────────────────
// applies_to_profile: 'team' = has support, 'solo' = no support yet.
const G = { section: 'G', dimension: 'drs' };
q({
  ...G, question_key: 'V2G_WRONG_TEAM', drs_category: 'Willingness', applies_to_profile: 'team',
  question_text: "When work you've handed off goes wrong, what do you usually do?",
  response_options: opts([
    'I take it back and fix it myself', 'I tell them how to fix it',
    'They fix it, and I check the result', 'They fix it, and we talk about what to change',
  ]),
});
q({
  ...G, question_key: 'V2G_WRONG_NOSUP', drs_category: 'Willingness', applies_to_profile: 'solo',
  question_text: "If someone working for you made a mistake on work you'd handed them, what would you most likely do?",
  response_options: opts([
    'I take it back and fix it myself', 'I tell them how to fix it',
    'They fix it, and I check the result', 'They fix it, and we talk about what to change',
  ]),
});
q({
  ...G, question_key: 'V2G_MOVED', drs_category: 'Willingness', applies_to_profile: 'team',
  question_text: 'In the last 90 days, have you moved something off your plate and kept it there?',
  response_options: opts([
    'No, nothing has moved', 'I tried, and took it back', 'Yes, but I still step in often',
    'Yes, and it mostly stays with them', 'Yes, and it stays with them',
  ]),
});
q({
  ...G, question_key: 'V2G_DIFFERENT_TEAM', drs_category: 'Willingness', applies_to_profile: 'team',
  question_text: 'When someone does a task differently than you would, and the result is good, what do you usually do?',
  response_options: opts([
    'I redo it or correct it', "I point out how I'd have done it", 'I notice, and let it go',
    'I let it stand; the result is what counts',
  ]),
});
q({
  ...G, question_key: 'V2G_DIFFERENT_NOSUP', drs_category: 'Willingness', applies_to_profile: 'solo',
  question_text: 'If someone you hired did a task differently than you would, and the result was good, what would you most likely do?',
  response_options: opts([
    'I redo it or correct it', "I point out how I'd have done it", 'I notice, and let it go',
    'I let it stand; the result is what counts',
  ]),
});
q({
  ...G, question_key: 'V2G_INVOLVED', answer_type: 'categorical_radio', is_scored: false, dimension: null,
  question_text: "What most often keeps you involved in work you'd like someone else to own?",
  response_options: cat([
    ['their_skills', 'Their skills'],
    ['their_time', 'Their time'],
    ['expectations_unclear', "Expectations aren't clear"],
    ['decisions_unclear', "What they can decide isn't clear"],
    ['my_comfort', 'My own comfort letting go'],
    ['no_one', "I don't have anyone to hand it to"],
    ['budget', 'Budget'],
    ['nothing', 'Nothing right now'],
  ]),
});
// Team track
q({
  ...G, question_key: 'V2G_HANDOFF', drs_category: 'Delegation Quality', applies_to_profile: 'team',
  question_text: 'When you hand something off, how do you usually do it?',
  response_options: opts([
    'In passing ("can you handle this?")', 'A quick explanation', 'An explanation plus written notes',
    "A sit-down covering the goal and what's expected", 'A written handoff they can come back to',
  ]),
});
q({
  ...G, question_key: 'V2G_DONE', drs_category: 'Delegation Quality', applies_to_profile: 'team',
  question_text: "When you hand something off, how often do you say what 'done well' looks like, not just what the task is?",
  response_options: opts(['Never', 'Rarely', 'Sometimes', 'Usually', 'Always']),
});
q({
  ...G, question_key: 'V2G_DECISIONS', drs_category: 'Delegation Quality', applies_to_profile: 'team',
  question_text: 'When you hand something off, how are the decisions handled?',
  response_options: opts([
    'They still come to me', 'Most still come to me', 'Some are theirs, most come to me',
    'Most are theirs, and they bring me the rest',
    "They decide within limits we've agreed, and bring me what's outside them",
  ]),
});
q({
  ...G, question_key: 'V2G_ROOM', drs_category: 'Team Capacity', applies_to_profile: 'team',
  question_text: 'Do the people who support you have room to take on more without being overloaded?',
  response_options: opts([
    "No, everyone's full", "Unlikely, they're stretched", 'A little room', 'Reasonable room', 'Clear room for more',
  ]),
});
q({
  ...G, question_key: 'V2G_LEARN', drs_category: 'Team Capacity', applies_to_profile: 'team',
  question_text: 'When someone new joins, how do they learn your workflows?',
  response_options: opts([
    'By asking me and watching me', 'Mostly from me, with a few notes', 'Half from me, half from written guides',
    'Mostly from written guides', "From written guides; I'm rarely needed",
  ]),
});
q({
  ...G, question_key: 'V2G_TEAM_DECIDE', drs_category: 'Authority Framework', applies_to_profile: 'team',
  question_text: 'Across your business, have you written down what your team can decide on their own and what comes to you?',
  response_options: opts([
    'Not yet', "We've talked about it, nothing written", 'Written for some things', 'Written for most things',
    'Written, and the team uses it',
  ]),
});
q({
  ...G, question_key: 'V2G_WAITING', drs_category: 'Authority Framework', applies_to_profile: 'team',
  question_text:
    'How often does work stop or slow down because someone on your team needs your approval before moving forward on something they probably could have handled?',
  response_options: opts(['Daily', 'A few times a week', 'About once a week', 'A few times a month', 'Rarely or never']),
});
// No-support track
q({
  ...G, question_key: 'V2G_HIRE_SPEED', drs_category: 'Systems Mindset', applies_to_profile: 'solo',
  question_text: 'If you brought on a coordinator or assistant tomorrow, how soon could they run your most important workflow?',
  response_options: opts(['A few months', '6 to 8 weeks', '3 to 4 weeks', '1 to 2 weeks', 'Within a week']),
});
q({
  ...G, question_key: 'V2G_FIRST_HIRE', drs_category: 'Hiring Readiness', applies_to_profile: 'solo',
  question_text: 'Do you know what your first support hire would own from day one?',
  response_options: opts([
    'Not yet', 'A general idea of what I need help with', 'I know the role, not the specific duties',
    'I know the duties, nothing written', 'I know exactly, and could write the job description today',
  ]),
});
q({
  ...G, question_key: 'V2G_AFFORD', drs_category: 'Hiring Readiness', applies_to_profile: 'solo',
  question_text:
    'Is your current transaction volume and revenue at a level where bringing on a support person would be financially viable?',
  response_options: opts(['Not yet', 'Getting close', 'Possible, but tight', 'Yes, the numbers work', 'Easily; I could hire today']),
});
q({
  ...G, question_key: 'V2G_TARGET', drs_category: 'Hiring Readiness', applies_to_profile: 'solo',
  question_text: 'Have you set a specific target, a timeline or transaction volume, for when you plan to make your first support hire?',
  response_options: opts([
    'No target yet', 'A vague intention', 'A rough idea, not committed', 'A target, no steps yet',
    "A target, and I'm working toward it",
  ]),
});
q({
  ...G, question_key: 'V2G_SOLVE_ONCE', drs_category: 'Systems Mindset', applies_to_profile: 'solo',
  question_text:
    'When you solve a recurring problem in your business, do you build a process so it stays solved, or do you solve it in the moment and move on?',
  response_options: opts(['I solve it and move on', 'Now and then I write it down', 'About half the time', 'Usually I build a process', 'Always']),
});
q({
  ...G, question_key: 'V2G_UNREACHABLE', drs_category: 'Systems Mindset', applies_to_profile: 'solo',
  question_text: 'If you were unreachable for a full week right now, what would happen to your active transactions?',
  response_options: opts([
    'They would stall or fail; everything depends on me personally',
    'Significant problems; clients and deadlines would suffer',
    'Some things would hold, but critical items would fall apart',
    'Most things would be fine, with some hiccups',
    'Everything would run; my systems and contacts are documented',
  ]),
});
q({
  ...G, question_key: 'V2G_NOW_LATER', drs_category: 'Systems Mindset', applies_to_profile: 'solo',
  question_text: 'Are you building systems now, or is that for later?',
  response_options: opts([
    'Later; production comes first right now', "It matters, but I haven't started", 'I work on it now and then',
    'I make regular time for it', "It's how I run everything",
  ]),
});

// ─── Part 8: Final questions (4) ────────────────────────────────────────────
q({
  question_key: 'V2H_URGENCY', section: 'H', is_scored: false,
  question_text: 'How urgent is it to take some of the day-to-day off your plate in the next 90 days?',
  // 1 to 5, like v1's urgency question, so admin's "4 or 5 = urgent" reads the same.
  response_options: cat([[1, 'Not urgent'], [2, 'Low'], [3, 'Moderate'], [4, 'High'], [5, 'I need this now']]),
});
q({
  question_key: 'V2H_GOAL', section: 'H', answer_type: 'categorical_radio', is_scored: false,
  question_text: 'Which of these best describes your main goal for this assessment?',
  response_options: cat([
    ['depends_on_me', 'See where my business depends on me most'],
    ['first_handoff', 'Find which workflow to hand off first'],
    ['make_case', 'Make the case for a hire or a change in roles'],
    ['grow', 'Get ready to grow'],
    ['time_back', 'Get time back'],
  ]),
});
q({
  question_key: 'V2H_NOTE', section: 'H', answer_type: 'free_text', is_scored: false,
  question_text: "Anything you'd like Bri to know before she reviews your results? (Optional)",
});
q({
  question_key: 'V2H_SUCCESS', section: 'H', answer_type: 'free_text', is_scored: false,
  question_text: 'What does success look like for you 90 days from now? (Optional)',
});

export { questions };

// ─── SQL generation ─────────────────────────────────────────────────────────

function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}
function json(v) {
  return v === null || v === undefined ? 'null' : `${lit(JSON.stringify(v))}::jsonb`;
}

function toSql() {
  const rows = questions.map((r) =>
    `  (${[
      lit(r.question_key),
      2,
      r.dimension ? `(select id from dimensions where slug = ${lit(r.dimension)})` : 'null',
      lit(r.question_text),
      r.question_order,
      lit(r.section),
      lit(r.answer_type),
      lit(r.is_scored),
      lit(r.mode),
      lit(r.oqi_dimension),
      lit(r.drs_category),
      'false',
      lit(r.applies_to_profile),
      '1.0',
      'false',
      json(r.response_options),
      json(r.show_if),
      json(r.variants),
    ].join(', ')})`,
  );
  return rows.join(',\n');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const emDash = questions.filter((r) =>
    JSON.stringify([r.question_text, r.response_options, r.variants]).includes('\u2014'),
  );
  if (emDash.length) {
    console.error('Em dash found in:', emDash.map((r) => r.question_key).join(', '));
    process.exit(1);
  }
  const target = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../supabase/migrations/009_instrument_v2.sql');
  const template = fs.readFileSync(target, 'utf8');
  const start = '-- BEGIN GENERATED ROWS';
  const end = '-- END GENERATED ROWS';
  const a = template.indexOf(start);
  const b = template.indexOf(end);
  if (a < 0 || b < 0) throw new Error('Markers not found in 009_instrument_v2.sql');
  const out = template.slice(0, a + start.length) + '\n' + toSql() + '\n' + template.slice(b);
  fs.writeFileSync(target, out);
  console.log(`Wrote ${questions.length} v2 question rows into ${target}`);
}
