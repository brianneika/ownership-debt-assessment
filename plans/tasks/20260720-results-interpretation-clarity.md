# Respondent results: interpret the two scores, and stop them reading as contradictory

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Turn the respondent-facing results page from two bare numbers into a plain-language
read of what the Ownership Debt and Delegation Readiness scores mean *together*,
surface the sub-score that's driving Delegation Readiness, and fix the card visuals
so "low" vs "high" and "good" vs "bad" are unmistakable.

## Why (the feedback that triggered this)

A real tester (most recent completed session, `tina.johnson@wsscoach.com`) took the
assessment and reported: *"My delegation readiness score was low when it should have
been high, and the ownership score was lower which they said is better… so am I doing
a good job handing off or not? The results confused me."* She still booked a session,
but the confusion is a conversion risk and undersells the tool.

**Verified it is not a scoring bug** (read-only DB check, 2026-07-20). The math and
reverse-scoring flags are correct. Her Delegation Readiness of 48 ("Developing") is
real and is dragged down almost entirely by **one** sub-category:

| DRS sub-category | Weight | Score |
| --- | --- | --- |
| Willingness | 30% | 56 |
| Delegation Quality | 25% | 50 |
| Team Capacity | 25% | 69 |
| **Authority Framework** | 20% | **8** |

She answered 0 to "documented guardrails," 0 to "documented escalation thresholds,"
and "work often stops waiting for my sign-off." So the honest read is: *willing,
with team capacity, but no written authority framework, so work still bottlenecks on
her.* That is coherent with a middling Ownership Debt number, and it maps exactly
onto her own takeaway ("I left feeling I need more SOPs and templates" — the SOPs /
guardrails / escalation thresholds **are** the Authority Framework she scored an 8
on). The assessment found the right problem; the results screen never said it in
words, and never showed that three of four sub-scores were fine.

## The three problems to fix

1. **No synthesis.** The respondent sees two independent numbers and has to
   reconcile them alone. There is no sentence telling them what the *pair* means.
2. **No breakdown.** Delegation Readiness shows as a single number; the sub-category
   that's sinking it is invisible. (All of this detail already exists — see below —
   it's just walled off in the consultant report.)
3. **Confusing visuals.** The two `ScoreCard`s look identical but their "good"
   direction is opposite (ODS lower-is-better, DRS higher-is-better), and the fill
   bar means the opposite thing on each card — a full bar is *bad* on ODS and *good*
   on DRS. Same visual language, inverted meaning.

## Methods / background

Read the _"Scores are a measurement instrument"_ and _"The respondent's flow is
sacred"_ principles in the [master plan](../master-plan.md). **This task is
presentation-only — it must not change any score math or semantics.** No migrations,
no scoring.ts changes.

Key files:

- `src/app/results/[sessionId]/page.tsx` — server component; currently reads only
  `dimension_scores` (overall ODS + DRS). Will also need to read `score_breakdowns`
  (DRS per-category rows already persisted by `scoring.ts`) and pass them down.
- `src/app/results/[sessionId]/EmailGate.tsx` — holds `ScoreCard`, `FullResults`,
  and the gated `EmailGate`. This is where the visual + prose changes land. The
  full breakdown is shown post-gate (`FullResults` / unlocked branch); keep the
  pre-gate teaser as-is (ODS teaser + email gate) unless we decide otherwise.
- `src/lib/insight.ts` — **reuse, don't reinvent.** It already contains:
  - the **4-quadrant playbook** (`QuadrantKey`, overall ODS band × DRS band →
    narrative, ~line 229) — this is the two-score synthesis we want.
  - `buildStartHere(...)` and red-flag / low-answer extraction.
  These currently feed only the admin/consultant report
  (`src/app/admin/sessions/[sessionId]/page.tsx`). The task is to surface a
  respondent-appropriate slice of this on the results page.
- `src/lib/scoring.ts` — reference only, for score meaning. `score_breakdowns` is
  written near the bottom of `calculateScores` (breakdown_type `'drs'` / `'oqi'`).

## Scope

**In:**
- A plain-language synthesis block on the unlocked results (what the two scores mean
  together — reuse the quadrant playbook), phrased for the respondent, not the coach.
- A Delegation Readiness sub-breakdown (the four categories with their scores) so the
  driving low sub-score is visible.
- Visual de-confusion of the two cards: make "good direction" explicit, and fix the
  fill bar so it never reads as "more = better" on the ODS card (e.g. show ODS as
  debt-remaining vs an "independence" framing, or invert/relabel — decide in build).

**Out (follow-ups, not this task):**
- Question-bank consolidation (the "combinable template questions" feedback) — noted,
  deferred by Bri on 2026-07-20.
- Percentile / cohort norms ("top X% of team leaders") — needs more responses; separate.
- Per-workflow ODS drill-down on the respondent page (C/D/E/F) — consider later; the
  overall + DRS breakdown is enough to fix the reported confusion.

## Open questions to settle in build

- Voice: this is VAI's results page (VAI consultant books the call). Keep the prose
  in VAI voice, concrete, no em-dashes.
- How much of the quadrant playbook is respondent-safe vs coach-only? Decide which
  fields render pre-sale.
- Does the sub-breakdown show pre-gate (as extra teaser pull) or only post-gate?
  Default: post-gate, matching current gating.

## Progress

Running log — check things off and note decisions as you go.

- [x] Confirmed the confusion is presentation, not a scoring bug (read-only DB check,
      Tina's DRS driven by Authority Framework = 8; 2026-07-20).
- [x] Decided the card/visual fix with Bri (2026-07-20): **marker-on-a-labeled-spectrum**.
      Drop the fill bar entirely; each card shows a dot on a gradient track with both
      ends labeled. Green = the good end on both cards (ODS gradient green→red left→right,
      DRS gradient red→green). Removes the inverted-fill trap. Also added an explicit
      "↓ Lower is better" / "↑ Higher is better" chip per card.
- [x] Decided synthesis depth with Bri (2026-07-20): **diagnose, then hand to the call.**
      Say what the pair means, name the one weakest DRS category, do NOT reveal the
      step-by-step levers (those stay the paid call's value).
- [x] Wire `score_breakdowns` (DRS categories) into the results server component.
- [x] Build the synthesis block reusing `insight.ts` quadrant logic, VAI voice.
      Added `classifyQuadrant()` (shared with `buildStartHere`) + respondent-facing
      `buildRespondentSynthesis()` in `insight.ts`; no score math changed.
- [x] Render the DRS sub-breakdown in `FullResults` / unlocked view (post-gate only).
- [x] Verify end-to-end against a real completed session (2026-07-20). Rendered
      `/results/14288689-...` (Tina's session: ODS 58 Elevated, DRS 48 Developing →
      build_readiness quadrant, weakest Authority Framework 8). Synthesis, weakest-
      category callout, DRS sub-breakdown, direction chips, and labeled spectrum all
      render; zero em-dashes; typecheck + eslint clean.
- [ ] Commit + push to main; deploy via `vercel --prod` (with Bri's OK).
