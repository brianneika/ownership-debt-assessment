# Cohort analytics instrument + pre-registered pattern read

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Build the aggregate ("across all respondents") analytics view for assessment
results, and pre-register the patterns we expect it to show and what each would
mean, so the instrument pays off the moment real volume arrives instead of being
a scramble later.

## The honest starting point (read this first)

**We have essentially no data to mine yet.** As of 2026-07-22, real completed
sessions under the *current* question bank number roughly **3 to 4**. Older
sessions can't be pooled in: migrations `004_rewrite_mode_b_questions` and
`005_relabel_oqi_dimensions` changed what the Mode B / OQI questions measure, so
pre-migration sessions were taken with a different instrument (the master plan's
"scores are a measurement instrument" principle forbids comparing across that
change).

So this task is deliberately **not** "find the patterns in the results." At n=4
that would be tea-leaf reading, exactly the trap the batch-1 email task
([20260721-warm-batch1-analytics-review.md](20260721-warm-batch1-analytics-review.md))
was careful to avoid at n=92. Instead this task builds the *instrument* that
reads patterns, and does the one piece of pattern *thinking* that's honest with
zero data: deciding in advance what we're looking for and what we'd do about it.

## What this is really three things

1. **The cohort view** (the instrument). An aggregate read over completed
   sessions, not one respondent. Same data the admin session page already
   computes, rolled up across everyone.
2. **The pre-registered pattern map** (the thinking). For each pattern we expect,
   write down now what it would mean for product/content, sales/messaging, and
   business strategy. Decide the response before the data can bias it.
3. **The plumbing that makes future data trustworthy** (the prerequisite). A
   clean test-vs-real filter, a comparability epoch, and the funnel denominator.
   Without these, the first 100 real completions produce a dirty, un-poolable,
   score-only view.

## Purpose (why we're doing it) — all three levers are in scope

Decided with Bri 2026-07-22: this feeds **product & content**, **sales &
messaging**, and **business strategy** at once. That's why the pattern map below
has a column for each: the point of the aggregate story is to sort what's
*common enough to productize / automate* from what stays *individual coaching
work* (a direct input to the VAI cash-vs-equity / coaching / licensing calls, see
[docs/vai-business-model.md](../../docs/vai-business-model.md)).

## Snapshot AND movement

Decided with Bri 2026-07-22: design for **movement over time**, not just a
cross-section. Caveat: movement leans on the still-dormant **retakes** feature
([20260718-retake-push-and-linking.md](20260718-retake-push-and-linking.md)) and
the `respondents` link, which don't exist yet. So the movement piece is a
*design constraint* here (schema and view shaped so trends drop in cleanly later),
not something we can populate today. Snapshot is buildable now; movement is
built-ready-for.

## The pre-registered pattern map

The mineable patterns, given the schema (`dimension_scores`, `score_breakdowns`,
`answers`, Section H text). For each: what we'd look at, and what it would tell
each lever. **Fill in the "what we saw" column only once real n clears a stated
threshold** (see caveats).

| Pattern | How it's read | If it shows → product/content | If it shows → sales/messaging | If it shows → business strategy |
|---|---|---|---|---|
| **Quadrant distribution** | Cross overall ODS≥51 with DRS≥51 across sessions | If most land 🟠 "high debt / not ready", results copy + nurture lead with *readiness*, not systems | Ad + email angle leads with "you're not ready to hand off yet, here's why" | Readiness-building is the repeatable product; systems work is more bespoke |
| **Dominant highest-debt workflow** | Frequency of each session's top per-workflow ODS (Listing Launch / TC / Lead / Ops) | Build the deepest content + SOP templates for the most common trap | The ad hook names *that* workflow specifically | If one workflow dominates, it's the licensable/productizable wedge |
| **Workflow Mode shape** | Distribution of A (owner-led) / B (has-owner-weak) / C (no-owner) per workflow | Content matches the dominant failure shape (capacity vs SOP vs assignment) | Messaging matches: "no one to hand to" vs "it's stuck in your head" | Mode A dominance = coaching-heavy; Mode B dominance = more automatable |
| **Population-wide weakest DRS lever** | Most-frequent weakest of Willingness / Delegation Quality / Team Capacity / Authority Framework (solo: Transfer/Hiring/Systems) | The most productizable single insight: build the fix for the common lever | Lead the pitch with the lever most owners fail | A common, teachable lever is a licensing candidate for brokerages |
| **Weakest OQI dimensions (Mode B)** | Frequency of the two weakest of the six OQI dims | Content targets the common weak dimension | Diagnostic language in copy | — |
| **Section H urgency** | Distribution of urgency n/5 (≥4 = hot) | — | What share are ready-to-buy vs need-nurture; sizes the hot pool | Conversion economics of the funnel |
| **Section H free-text themes** | Cluster goals / 90-day vision / consultant notes (the one AI-worthy step) | Real language for copy, in their words | Objection + desire themes for the script | Whether stated goals match what coaching sells |
| **Funnel denominator** | started → finished → gave email → booked | Where the flow leaks (may matter more than any score) | — | True cost-per-booked-call |

## "Is AI going to solve it, or a person?" (recorded so we don't relitigate it)

- **The numeric analysis**: a person + SQL/spreadsheet, not AI. At any realistic
  near-term n, deterministic aggregates are more honest than a model, and they
  match the product's deliberate "scoring is pure math, no AI" design
  ([scoring.ts](../../src/lib/scoring.ts)). The **one** place AI earns its seat is
  clustering the Section H free-text into themes.
- **Solving the pain the patterns reveal**: the master plan already sets the
  moat — the *diagnosis* is automated and free, the *prescription (90-day plan)*
  is the human call. So the aggregate story's real job is to sort patterns into
  "common enough to automate/productize" vs "stays a coach's call." That sorting
  *is* the business-strategy deliverable.

## Methods / background

- **Data source**: roll up the same tables the admin session page reads —
  `dimension_scores` (ODS/OQI/DRS + per-workflow), `score_breakdowns` (DRS
  categories, OQI dims), `answers` (Section H text + red-flag answers),
  `assessment_sessions` (drs_profile, wf_*_mode, status, consented_at). Logic
  lives in [src/lib/scoring.ts](../../src/lib/scoring.ts) and
  `src/lib/insight.ts`; this task rolls that per-session logic up to a cohort.
- **Single-person reading already exists** and is the reference for what each
  number means: [docs/reading-assessment-results.md](../../docs/reading-assessment-results.md).
  This task is the *aggregate* companion to it.
- **DB access**: agent is blocked from prod-DB writes; reads go through the
  session pooler and Bri runs prepared scripts (see memory). So step 1 is a
  read-only count script Bri runs, not an agent query.
- **Where the view lives**: extends the admin surface (a new `/admin/analytics`
  or similar), guarded by the same `proxy.ts` JWT. Ladders up to master-plan
  theme 3 "Coach-facing views" (the coach eventually wants the cross-client
  roll-up anyway), so build it where that will live.

## Implementation steps

- [ ] **Establish real n.** Prepare a read-only SQL script (Bri runs it) that
  counts completed sessions, split test vs real, and *only* those taken under the
  current question bank (post-migration 005). This number gates everything below.
- [ ] **Define the test-vs-real filter** and the **comparability epoch** as
  explicit, reusable predicates (a flag or a rule), so every future roll-up
  excludes test sessions and pre-migration sessions automatically.
- [ ] **Instrument the funnel denominator** — started / finished / gave email /
  booked — so the first "pattern" (the leak) is visible even with ~0 completions.
- [ ] **Build the snapshot cohort view** from the pattern map above (aggregates,
  not correlations, until n justifies more). Show n and a caveat banner when n is
  below a stated threshold, so no one over-reads it.
- [ ] **Shape the view + schema for movement** so per-respondent trends drop in
  once retakes exist (do not build trend UI yet; just don't design it out).
- [ ] **Section H theme pass** (the AI step): once there's text worth clustering,
  synthesize goals/vision/notes into themes for copy. Not before there's text.
- [ ] Fill the "what we saw" columns of the pattern map only when n clears the
  threshold, and turn each into a follow-up task on the lever it points at.

## Flags / risks

- **n≈4 today.** Nothing in the pattern map is answerable yet. The deliverable
  now is the instrument + the pre-registered map, not conclusions. Guard against
  anyone reading the empty view as a finding.
- **Instrument changed underneath us.** Pre-migration-005 sessions are a
  different instrument; pooling them would violate the measurement-instrument
  principle. The comparability epoch is not optional.
- **No outcome label.** We can see score patterns but not which patterns predict
  who *buys* or *succeeds in coaching*. Joining scores to conversion is a
  separate, higher-value follow-up once there's booking data.
- **Movement depends on dormant features.** The trend half of this can't be
  populated until retakes + `respondents` ship. Keep it a design constraint, not
  a promise.
- **Self-report bias.** Every input is self-assessment; aggregate patterns may
  reflect reporting style, not reality. Note it wherever the view is read.

## Out of scope (follow-ups)

- Actually mining/interpreting real patterns (there's no data — that's a future
  task gated on volume).
- The email/marketing funnel analytics (that's
  [20260721-warm-batch1-analytics-review.md](20260721-warm-batch1-analytics-review.md)).
- Joining scores to conversion/coaching-outcome data (needs that data to exist).
- Retakes / movement-over-time implementation (theme 2 tasks).

## Progress

- 2026-07-22 — Task defined with Bri. Reframed from "discover patterns in the
  results" to "build the instrument + pre-register the patterns," after
  establishing real n ≈ 3–4 under the current question bank (older sessions
  un-poolable post-migrations 004/005). Purpose = product/content + sales/messaging
  + business strategy (all three). Time horizon = snapshot now, designed for
  movement later (retakes still dormant). Recorded the "AI vs person" call:
  deterministic aggregates + human coach for the prescription; AI only for Section
  H text clustering.
