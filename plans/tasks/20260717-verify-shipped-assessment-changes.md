# Verify the already-shipped assessment changes end-to-end

**Status:** In progress — blocked on Bri applying migration 004 (see 2026-07-18 log) <!-- Not started | In progress | Blocked | Done -->

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

- [x] **Migration state:** checked 2026-07-18 — **stale.** Q001/Q009/Q045 live
      text is the pre-004 phrasing (found independently by two sessions).
      Direct DB write from the agent was permission-blocked; **Bri applies 004
      via the Supabase SQL editor** (audited: exactly 72 `question_text`
      UPDATEs, no scoring columns), then re-check the three keys.
- [ ] **Question rewrite rendered:** run the app, take a session through Section B
      choosing a named owner for Listing Launch (Mode B), and confirm Section C
      renders the 18 rewritten questions — including the licensing-safe Q002, Q005,
      Q009 variants — with the 0–4 scored radio unchanged.
- [x] **Role intro:** verified 2026-07-18 on session `55b8c2a5` (all-Mode-B):
      Section C renders "You told us your Listing Coordinator owns Listing
      Launch" and Section D renders "You told us your Transaction Coordinator
      owns Seller Communication" — per-workflow role lookup confirmed, not a
      single hardcoded path.
- [ ] **Solo/team race:** exercise the race scenario — answer A006 as solo and
      advance immediately (the radio's async save vs `advanceSectionA` read), then
      confirm Section G shows the Solo Owner track and solo question set. Also
      verify the "2 people + 3× Mode A → solo" override path.
- [x] **Email gate:** verified 2026-07-18. Render halves via dev server:
      no-email session `e77b7fc1` shows the gate with DRS card and booking CTA
      absent from the HTML; emailed session `55b8c2a5` shows DRS + booking CTA
      with no gate. The live submission path (email persisted, breakdown
      unlocks) was already proven end-to-end — twice, local and prod — in the
      HubSpot task's 2026-07-18 verification.
- [ ] Record outcomes below; file follow-up tasks for anything that fails.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-17 — Task created from the audit findings above.
- 2026-07-18 — (From the OQI-relabel task) The migration-state question is
  answered: **migration 004 has NOT been run against live Supabase.** Q001, Q009,
  and Q045 all still return the pre-rewrite text via REST. 004 needs to be run
  in the Supabase SQL editor (before 005). The "question rewrite rendered" step
  below can only pass after that.
- 2026-07-18 (verify pass, read-only) — Confirmed the 004 finding independently
  (same three keys via REST), audited 004 as pure copy (72 `question_text`
  UPDATEs, nothing else), and ran the rendering checks against the already-
  running dev server (PID 82341, port 3000) with existing live sessions — no
  writes, no new test data:
  - Section C on all-Mode-B session `55b8c2a5` renders the **current DB text**
    (old Q001 phrasing present, 004 phrasing absent) — the render path is
    faithful to the DB, so the "rewrite rendered" check will pass trivially
    once 004 runs; re-verify then.
  - Role intros verified on two workflows with two different roles (C: Listing
    Coordinator, D: Transaction Coordinator).
  - Email gate render states verified both ways (gated `e77b7fc1`, unlocked
    `55b8c2a5`); live submission already covered by the HubSpot task's e2e.
  - Solo session `48b740f1` renders the Solo Owner track on Section G — the
    static half of the race check. **Still open:** the live race itself
    (answer A006 → advance immediately) and the "2 people + 3× Mode A → solo"
    override need an interactive run-through (no browser automation available
    in this session; Bri click-through with a script, or a browser-equipped
    session).
  - Direct application of 004 by the agent was permission-blocked (prod DB
    write) — deliberately not worked around. Bri: paste
    `supabase/migrations/004_rewrite_mode_b_questions.sql` into the Supabase
    SQL editor and run; then the agent re-checks Q001/Q009/Q045 and Section C.
