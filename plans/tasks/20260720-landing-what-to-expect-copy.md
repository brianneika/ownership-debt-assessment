# Assessment landing "What to expect" — honest copy + intake fields

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Rewrite the landing page's "What to expect" card so it tells the truth about the
assessment (15 minutes, does **not** save as you go, delivers **two** named scores)
and confirm the intake form stays low-friction (name + business only, no phone).

## Why / how it ladders up

The current "What to expect" card in `src/app/assessment/page.tsx` makes two claims
the product doesn't keep:

- It says answers are **"saved as you go"** — twice (the `~15 minutes` item and a
  standalone `Saved as you go` item). Save-and-resume is still **Not started**
  (see `plans/tasks/20260720-assessment-save-resume.md`), so this is currently false.
- It promises a single **"Ownership Assessment Score,"** but the results page
  actually delivers **two** named scores — Ownership Debt Score (ODS) and Delegation
  Readiness Score (DRS) — plus a booking CTA (see
  `src/app/results/[sessionId]/EmailGate.tsx`). The landing copy is inconsistent with
  both the results page and the launch email.

Ladders up to the master plan's trust/"low friction first" principles — the landing
promise has to match the real experience, and the intake stays frictionless.

## Decisions (agreed with Bri, 2026-07-20)

- **Results framing: name both scores.** Match the results page and launch email —
  ODS + DRS, not a single "Ownership Assessment Score."
- **No "saved as you go" claim** until the save-resume task ships. Set the
  expectation honestly instead: "do it in one sitting."
- **No phone number.** Keep the landing intake to **name + business name**. Email is
  captured at the results gate (peak intent); phone, if ever needed, is collected by
  the Google Calendar booking flow — not added to the landing form (which would lower
  assessment starts on a free tool). Intake fields are unchanged by this task.

## Scope

**In:**
- Rewrite `EXPECT_ITEMS` in `src/app/assessment/page.tsx` (3 items):
  1. **~15 minutes** — "Eight sections that adapt to how your business runs — the more
     you've delegated, the deeper it goes. Set aside 15 minutes to do it in one sitting."
  2. **Built for real estate teams** — "Walks through how your listings launch, your
     transactions close, and your people escalate." (replaces the false
     "Saved as you go" item; keep/choose an appropriate icon)
  3. **Two scores you keep** — "Your Ownership Debt Score (how much the business still
     depends on you) and your Delegation Readiness Score (how ready your team is to
     carry it) — plus your single highest-leverage next move." (keep the chart icon)
- Remove all "saved as you go / saved automatically" language from the card.

**Out (explicit follow-ups):**
- Adding a phone field anywhere (decided against).
- Restoring a "come back and finish later" reassurance — that belongs to the
  save-resume task (`20260720-assessment-save-resume.md`), which will re-add honest
  resume copy once shipped.
- The launch-email "answers save as you go" copy — tracked in the save-resume task.

## Methods / background

- **File:** `src/app/assessment/page.tsx` — `EXPECT_ITEMS` array (lines ~4-32) drives
  the card; the intake `<form>` below it stays as-is (name + business_name).
- Cross-check final copy against `src/app/results/[sessionId]/EmailGate.tsx` (score
  names/subtitles) and `docs/wss-launch-email-campaign.md` (two-score framing) so all
  three surfaces agree.
- Icons are inline SVGs in the item objects — reuse the existing clock/chart icons;
  pick a fitting icon for the new "Built for real estate teams" item.

## Verification

- Load `/assessment` → card shows 3 items, no "saved as you go" anywhere, both scores
  named in the results item.
- Copy on the card matches the score names on the results page and the launch email.
- Intake form still asks only name + business name.

## Progress

Running log — check things off and note decisions as you go.

- [ ] Rewrite `EXPECT_ITEMS` (3 items) per copy above; remove save-as-you-go language
- [ ] Confirm intake form unchanged (name + business, no phone)
- [ ] Verify card wording matches results page + launch email
- [ ] Commit + push to `main`
