# Assessment copy B: rewrite the intake page with APPLE

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Rewrite the `/assessment` intake page (cold visitors) and the teaser's unlock box (teaser finishers, who skip intake) so each reader feels understood, knows what they're in for, and starts.

## Methods / background

- Depends on task A (`20261016-assessment-copy-a-brief-and-review.md`): use its brief and the intake review.
- File: `src/app/assessment/page.tsx` (headline, subhead, the three "What to expect" items, form labels and placeholders, button, footer line). Copy only; keep layout, theme and the `createAssessmentSession` action.
- Also: the unlock box in `src/app/teaser/[sessionId]/TeaserResult.tsx` (heading, paragraph, consent line). Folded in 2026-10-16 because it does the intake page's job for teaser finishers.
- Framework: `vai-va-training/plans/apple-framework.md`, Write version.

## Decided (2026-10-16)

- H1: "How much of your business still depends on you?" with a small label "The Ownership Debt Assessment" above it.
- **Remove** the privacy line ("Your answers are private...") altogether.
- Explain "ownership debt" in plain words before asking them to start (cold visitors don't know the term).
- No em dashes (the current copy has several).
- Time: "15 to 20 minutes".
- Drop "your single highest-leverage next move" on both screens; say "the one gap holding you back".
- Consent line (teaser unlock): name "Vai Holdings, LLC (VAI)"; don't say we email results (nothing sends them).
- Say "real estate teams and solo agents", not just teams.

## Known issues from the quick review

- Acknowledge missing: nothing recognizes that everything still runs through the leader.
- Project weak: "Two scores you keep" is a feature; lead with what they can do with it.
- Let them know weak: say it's free; say the email is asked at the end (no surprise at the gate).
- Energize weak: "Start Assessment →" is generic.

## Progress

- [ ] Draft per the brief, with a facts-to-confirm note
- [ ] Bri approves copy
- [ ] Update `page.tsx`, check on phone width and localhost
- [ ] Deploy, verify live, set Done
