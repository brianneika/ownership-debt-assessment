# Assessment copy A: APPLE brief and scored review of every screen

**Status:** Done (2026-10-16): brief approved by Bri <!-- Not started | In progress | Blocked | Done -->

## Objective

Write one APPLE brief for the whole assessment and score every screen against it, so tasks B, C and D rewrite from the same facts, voice and promises.

## Why

Bri, 2026-10-16: rewrite the copy across the whole assessment flow using APPLE (Acknowledge, Prepare, Project, Let them know, Excite or Energize). A quick review of the intake page found Acknowledge missing, Project and Let them know weak, a privacy claim that overstates, and em dashes throughout. Four screens are being rewritten by four separate tasks; without a shared brief they drift on name, promises and tone.

Ladders up to the master plan's job 1 (lead generation: teaser score plus email gate) and job 2 (qualification reads as fit). The assessment is the Diagnose step; a respondent who quits halfway never becomes a consultation.

## Methods / background

- Framework text: `vai-va-training/plans/apple-framework.md` (Write and Review versions). Run **Review** on each screen, then fill the **Write** brief.
- Screens to review: intake `src/app/assessment/page.tsx`; section intros and progress `src/app/assessment/[sessionId]/{a..h}/page.tsx`, `src/components/assessment/{ProgressBar,SectionTransition,SectionForm}.tsx`; email gate and results `src/app/results/[sessionId]/{page,EmailGate}.tsx`, `src/components/results-visuals.tsx`.
- Also read for context and consistency: the teaser (`src/app/teaser/`), `docs/narrative-source-of-truth.md` (pain and story copy), `docs/reading-assessment-results.md`.
- Communication preferences: Controllers, Supporters, Promoters, Analyticals (same as DISC D, S, I, C); every screen gets a beat for each, layered, not four messages.
- No em dashes anywhere. No invented stats, testimonials, urgency or scarcity.

## Decisions already made (2026-10-16)

- **Arrivals:** mostly cold (ads, social, referral) and teaser finishers. Correction found in review: teaser finishers skip the intake page and the email gate; the teaser unlock box is their intake (now in task B).
- **Headline / name:** H1 is "How much of your business still depends on you?" (sentence case). Small label above it: "The Ownership Debt Assessment", so the name still matches the teaser, the Fathom card and "Your Ownership Debt Results".
- **After completion:** results, then an invite to book a call. The call is **free**. Copy should say so and say who they'll talk to (Bri), not "your VAI consultant".
- **Privacy line on intake:** removed altogether (task B).
- **Question wording is out of scope** for the whole effort: changing it changes what scores mean.

## Open facts to confirm in this task

- [x] Does anything actually email results? **No** (confirmed 2026-10-16): no sender in code; HubSpot gets only the admin link; nurture and email-draft tasks Not started. D must fix the gate line; the teaser unlock line has the same problem.
- [x] Is "15 minutes" still accurate? Bri: say **15 to 20 minutes**. (Production read was blocked; query kept in the deliverable.)
- [x] Legal name in consent text: **"Vai Holdings, LLC (VAI)"** (Bri, 2026-10-16).

## Deliverable

`vai-va-training/output/20261016-assessment-copy-apple-review.md` (or dated the day written): the filled brief, then per screen an APPLE table (function, rating, evidence, change), preference friction, and top three fixes.

## Progress

- [x] Review intake
- [x] Review section intros and progress
- [x] Review email gate, results, booking invite
- [x] Fill the brief (`vai-va-training/output/20261016-assessment-copy-apple-review.md`)
- [x] Confirm open facts with Bri (2026-10-16, deliverable section 7)
- [x] Bri approves the brief; B, C, D can start (2026-10-16)

## Decisions and findings (2026-10-16)

- **Teaser finishers skip intake and the email gate** (teaser unlock collects name, business, email, then goes to Section A). Task B serves cold traffic only; its "or teaser finisher" line should go. The teaser unlock box is uncovered by B, C, D.
- **Promise gap:** intake and teaser promise "your single highest-leverage next move"; results deliberately hold it for the call. Recommended: drop the promise, say "the one gap holding you back".
- **Bug for task C:** SectionForm and WorkflowSection append " →" to labels that already have one, so three buttons show a double arrow.
- "Readiness is the average of these four" is wrong (weighted 30/25/25/20); for task D.
- Narrative source of truth still says "the call earns the cohort" (stale).
- Bri 2026-10-16: drop the "next move" promise; call is free, 30 minutes, with Bri; no 90-day plan promise; no "not a pitch" line; teaser unlock box folded into task B.
- Booking copy comes from Bri's calendar invite text (recorded in the deliverable, section 7): free, 30 minutes, "You'll leave knowing the one or two things costing you the most time, whether we work together or not."
