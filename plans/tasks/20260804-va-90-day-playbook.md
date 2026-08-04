# VA 90-day ownership transfer playbook

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Write and validate the operating manual a VAI-placed Virtual Assistant follows
for their first 90 days inside a team leader's business, so that placement
delivers a proven workflow transfer (measured by an assessment retake) rather
than a helpful person doing tasks.

## Decisions (2026-08-04, Bri)

- **VAI places the VA.** This is a VAI service line, not a playbook handed to a
  client's existing hire. VAI recruits, trains, and is accountable for the VA.
- **Deliverable now: a `docs/` playbook plus this task doc.** No code. Productizing
  it in the app (a generated 90-day plan off assessment results) is a separate,
  later decision.
- **The client's assessment results drive sequencing.** Which workflow the VA
  attacks first, the day-0 baseline, and the day-90 proof all come from the
  instrument.
- **Tool stack: Claude plus the team's existing CRM**, with the rest to be
  proposed rather than assumed. Provisional stack recommended in playbook §9,
  still an open decision.

## Methods / background

- The playbook is [docs/va-90-day-playbook.md](../../docs/va-90-day-playbook.md).
  Read it first; this task tracks writing and validating it.
- **The instrument already defines the finish line.** Q018 asks whether the named
  owner has run the workflow independently at standard "for at least 90 days," so
  the placement window is the assessment's own definition of a transferred
  workflow, and the day-90 retake is the exam.
- **The six OQI dimensions are the build sequence, not just the scorecard**
  (see [question-bank-export.md](../../docs/question-bank-export.md)): OA is set
  first, then SC, EC, then DO and IE, with CT lagging past day 90 because track
  record needs elapsed time. The dependencies are real: authority cannot be
  handed over before escalation thresholds exist, and thresholds cannot be written
  before the SOP does.
- **Mode routing is the qualification filter.** Mode A (Owner-Led) and Mode C
  (Shared / No Clear Owner) workflows are where a VA belongs. **Mode B
  (Team-Led) workflows already have an owner** and placing a VA there displaces a
  real person. A client whose four workflows all come back Mode B likely needs
  their existing owners coached, not a VA placement. That is a sales
  qualification signal worth surfacing to whoever runs the consultation.
- **The intake is already done.** TBx1 (hours/week the leader personally spends),
  TBx2 (why it has not been delegated), and TBx3 (free-text obstacle, their words)
  give the VA the target workflow, the objection to disarm, and the opening line
  of the contract session, before day 1.
- **Retake mechanism reuses the coaching pilot**
  ([20260719-coaching-poc-pilot.md](20260719-coaching-poc-pilot.md)): tokenized
  link generated from the admin session page, delta view against baseline. This
  task does not build it; it consumes it. **A placement cannot prove itself until
  that pilot's linking and delta view ship.**
- Ladders to the [master plan](../master-plan.md) coaching-tool vision (the
  instrument as the measurement backbone of an engagement) and to the
  [business operations track](20260720-business-operations-track.md), where
  pricing, the comp split, and non-solicit live. The playbook is also the
  reproducible-system asset B3 licensing is waiting on.
- Tone and language follow
  [narrative-source-of-truth.md](../../docs/narrative-source-of-truth.md); the
  two-week question is the contract session's opener.

## Flags / risks

- **The measurement promise has to be set at day 0.** Overall ODS averages four
  workflows and a placement works one, and CT cannot move inside 90 days. If that
  is not written into the contract up front, a real success reads as a failure at
  the retake. Playbook §2.
- **Facilitation skill is the top predictor of VA success**, and it is not what
  VAs are typically hired for. Getting outcomes out of a resistant leader is a
  consulting skill. VA sourcing and certification needs its own task.
- **The coach, never the VA, escalates to the leader.** A VA pressuring a team
  leader loses, then stops trying. Any gate that slips twice goes to the coach.
- **No AI before day 30.** Automating an undocumented workflow makes the mess
  faster and costs trust at the worst moment.
- **Retake comparability.** No full retake at day 45 to "feel progress"; the
  weekly operational metrics carry that load. Score semantics and comparability
  are a master-plan guardrail.
- **Nothing here touches scoring.** The playbook consumes the instrument, it does
  not modify it.

## Progress

Running log — check things off and note decisions as you go.

- [x] 2026-08-04 — Scope interviewed with Bri (four decisions above).
- [x] 2026-08-04 — Playbook written:
  [docs/va-90-day-playbook.md](../../docs/va-90-day-playbook.md). Covers the
  transfer sequence, the Outcome Contract, day-by-day for days 1 to 10 plus five
  phase gates, three tiers of KPIs, the AI layer, twelve failure modes, and the
  day-90 deliverable pack.
- [ ] Bri reviews the playbook and resolves the five open decisions in §13.
- [ ] Build the blank artifact templates the playbook references (Outcome
  Contract, weekly scorecard, escalation ladder, authority memo, deliverable pack
  checklist) so a VA is not authoring them from scratch.
- [ ] Decide whether the master plan gains a VA-placement theme or this sits as a
  delivery layer under the coaching-tool vision.
- [ ] Split out a VA sourcing / training / certification task (failure mode 6).
- [ ] Confirm the tool stack after placement 1, or after three if deciding per
  client (§13).
- [ ] Run placement 1 against the playbook; log every deviation here.
- [ ] Day-90 retake on placement 1; record the per-dimension deltas and check them
  against the predicted order (SC, then EC, then DO/IE, then OA, CT lagging). If
  the predicted order does not hold, the transfer sequence in §4 is wrong and the
  playbook gets corrected.
