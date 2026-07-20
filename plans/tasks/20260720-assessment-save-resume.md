# Assessment save-and-resume (same-browser)

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Let a respondent who leaves mid-assessment return **in the same browser** and pick
up exactly where they left off, instead of silently starting a brand-new session —
so the "your answers save as you go" reassurance we make in marketing copy is
actually true end to end.

## Why / how it ladders up

Answers already persist server-side (each radio writes to `answers` via
`saveAnswer`), but nothing reconnects a returning visitor to their in-progress
session: the `sessionId` lives only in the URL, and the landing form
(`createAssessmentSession`) always calls `createSession()` — a fresh row — every
time. So a team leader who closes the tab and clicks the email link again starts
over from scratch.

The launch email campaign leaned on a "step away and pick it back up" promise that
the product doesn't keep; that copy has been walked back (see
`docs/wss-launch-email-campaign.md` and `src/app/assessment/page.tsx`) with a
pointer to this task. This closes the gap for real.

Ladders up to the master plan's **"Low friction first, identity when it earns its
keep"** — resume without any account or email gate — and keeps the respondent's
flow sacred (no new blocking step, no integration on the critical path).

## Scope

**In:**
- Same-browser resume via a first-party cookie (or localStorage) holding the
  in-progress `sessionId`, set at session creation.
- Landing page detects an in-progress session for this browser and **prompts**:
  "Resume where you left off" vs. "Start a new assessment."
- Resuming redirects to the section the respondent last reached.
- Completed sessions never offer resume (the cookie is cleared / ignored on
  completion; a completed session routes to results, not back into the flow).

**Out (explicit follow-ups):**
- Cross-device / cross-browser resume and any **emailed resume link** — deferred
  until the coaching-retake vision needs earlier identity capture. Pulling email
  capture forward and putting an email send near the critical path is its own task.
- Linking multiple sessions to one person / retake history.

## Decisions (agreed with Bri, 2026-07-20)

- **Scope: same-browser only.** Cookie/localStorage, no identity. Covers the
  dominant real case (accidental close, refresh, stepping away on the same
  machine) without pulling email forward or risking the critical path.
- **UX: prompt, don't auto-redirect.** Real estate teams share computers, so a
  silent auto-resume could drop someone into a colleague's half-finished run.
  A "Resume or start over" choice is barely more work and much safer.

## Methods / background

Read the relevant parts of the [master plan](../master-plan.md) ("Guiding
principles") and [application-flow.md](../application-flow.md) first.

- **Where sessions are created / advanced:** `src/app/assessment/actions.ts`
  (`createAssessmentSession`, `saveRadioAnswer`, `advanceSectionA/B`,
  `advanceWorkflow`). Session helpers live in `src/lib/assessment.ts`
  (`createSession`, `fetchSession`, `completeSession`).
- **The landing page** is `src/app/assessment/page.tsx` — the intake form posts to
  `createAssessmentSession`. This is where the resume prompt goes.
- **Tracking where they left off — pick one:**
  1. *Add a `last_section` column* to `sessions` (a numbered migration, mirrored in
     `supabase/schema.sql`), updated on each `advanceSection*/advanceWorkflow` and
     on the initial redirect to `/a`. Simple and robust — recommended.
  2. *Derive furthest section from existing answers* (which `question_key`s have
     rows) — no schema change, but more branching logic that has to mirror the
     A→B→(modes)→C…H routing exactly. More fragile.
- **Cookie mechanics:** set a first-party cookie (e.g. `nextup_session`) on session
  creation via the server action / route (not the admin `admin_session` cookie —
  that's separate). Clear it in `completeSession`'s call path so a finished run
  doesn't re-prompt. Cookie is fine here vs. localStorage because the landing page
  is a Server Component and can read the cookie server-side to decide whether to
  render the prompt.
- **Resume redirect target:** `fetchSession(sessionId)` → if `status !== 'completed'`
  and the session still exists, redirect to `/assessment/{sessionId}/{lastSection}`.
  If the session row is gone or completed, ignore/clear the cookie and show the
  normal fresh intake.

## Edge cases to handle

- **Completed session** → don't resume; clear cookie; (optionally) offer a link to
  their results instead of dropping them back into questions.
- **Stale / deleted session id** in cookie → treat as no session, show fresh intake,
  clear the cookie.
- **Shared computer** → the prompt (not auto-resume) is the mitigation; "Start a new
  assessment" must reliably create a fresh session and overwrite the cookie.
- **Same person, deliberate retake** → "Start a new assessment" path must work even
  when a completed/in-progress session exists.
- **Intake fields (name/business):** a resumed session already has A001/A002 saved,
  so resume should skip the intake form, not ask again.

## Verification

- Start an assessment, answer a few sections, close the tab, reopen the landing
  page → see the resume prompt → resume lands on the correct section with prior
  answers intact.
- "Start a new assessment" from the prompt creates a distinct session id.
- Complete an assessment, revisit landing → no resume prompt.
- Clear cookies / different browser → fresh intake (confirms scope boundary).

## Progress

Running log — check things off and note decisions as you go.

- [ ] Confirm approach for "last section" tracking (column vs. derive) — recommend column
- [ ] Migration + `schema.sql` update if adding `last_section`
- [ ] Set/clear `nextup_session` cookie on create/complete
- [ ] Update section-advance actions to record last section
- [ ] Landing page: read cookie, render resume-vs-start prompt, wire both paths
- [ ] Handle edge cases (completed / stale / shared machine / retake)
- [ ] Verify end-to-end per checklist above
- [ ] Once shipped: restore the honest "come back and finish later" reassurance in
      `docs/wss-launch-email-campaign.md` and `src/app/assessment/page.tsx`
