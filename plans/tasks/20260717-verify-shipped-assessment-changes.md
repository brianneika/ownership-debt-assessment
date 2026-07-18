# Verify the already-shipped assessment changes end-to-end

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Prove, in the running app against live Supabase, that four already-implemented
changes actually behave as designed: the Mode B question rewrite (migration 004),
the role-based section intros, the solo/team routing race fix, and the
results-screen email gate.

## Methods / background

A 2026-07-17 audit found that what was requested as new work is already implemented
and committed (in `79c5b52`):

1. **Solo/team routing race** — `src/app/assessment/[sessionId]/g/page.tsx` computes
   the DRS profile live from the A006 answer via `refineDrsProfile()` instead of
   trusting the cached `drs_profile` column; `advanceSectionB` in
   `src/app/assessment/actions.ts` also re-reads A006 and persists the refined
   profile, so scoring (which reads the column at submit) is covered too.
2. **Email capture at results** — `EmailGate.tsx` gates the DRS score + full
   breakdown behind an email form at the results reveal (ODS teaser stays visible);
   `captureEmail` saves `respondent_email` to the session. Nothing between landing
   and results reads the email, so the placement is safe. CRM delivery is now the
   HubSpot upsert — see [replace-lovable-with-hubspot](replace-lovable-with-hubspot.md);
   its end-to-end verify stays in *that* task (blocked on Bri's manual HubSpot setup)
   and is not duplicated here.
3. **72 Mode B question rewrites** —
   `supabase/migrations/004_rewrite_mode_b_questions.sql`, sourced from the three
   docs in `docs/` with the 12 licensing-safe supersessions applied (audit
   spot-checked Q009 and Q045 — exact match). **Unknown: whether 004 has been run
   against the live Supabase instance.** The repo can't answer that; the app renders
   questions from the DB.
4. **Role-based section intros** — all four workflow pages (c/d/e/f) render
   "You told us your [role] owns [Workflow]…" in Mode B, from the B001–B004 answer.

This task is the proof pass. No code changes expected — if verification uncovers a
defect, log it here and spin up a separate task for the fix.

## Implementation steps

- [ ] **Migration state:** query live Supabase (e.g.
      `select question_text from questions where question_key in ('Q001','Q009','Q045')`)
      and compare against migration 004. If stale, run 004 and re-check.
- [ ] **Question rewrite rendered:** run the app, take a session through Section B
      choosing a named owner for Listing Launch (Mode B), and confirm Section C
      renders the 18 rewritten questions — including the licensing-safe Q002, Q005,
      Q009 variants — with the 0–4 scored radio unchanged.
- [ ] **Role intro:** in the same session, confirm the Section C intro reads
      "You told us your Transaction Coordinator owns Listing Launch…" (matching the
      role picked at B001), and spot-check one other workflow (D/E/F).
- [ ] **Solo/team race:** exercise the race scenario — answer A006 as solo and
      advance immediately (the radio's async save vs `advanceSectionA` read), then
      confirm Section G shows the Solo Owner track and solo question set. Also
      verify the "2 people + 3× Mode A → solo" override path.
- [ ] **Email gate:** at results, confirm the DRS card and full breakdown are
      hidden until an email is submitted; submit one and confirm
      `assessment_sessions.respondent_email` is populated and the breakdown
      unlocks. (HubSpot delivery: covered by the other task.)
- [ ] Record outcomes below; file follow-up tasks for anything that fails.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-17 — Task created from the audit findings above.
