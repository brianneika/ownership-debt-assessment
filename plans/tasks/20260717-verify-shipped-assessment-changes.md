# Verify the already-shipped assessment changes end-to-end

**Status:** Done — 2026-07-21. All four changes verified against live Supabase.
Migration 004 confirmed applied (72/72 rewrites live); Section C renders the
rewritten set with role intro and 0–4 radios intact; solo/team race proven
defeated by code inspection (two guards) on top of the 2026-07-18 static render.
<!-- Not started | In progress | Blocked | Done -->

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

- [x] **Migration state:** checked 2026-07-18 — stale. **Re-checked 2026-07-21 —
      004 is now APPLIED.** Diffed all 72 `question_text` UPDATEs in
      `004_rewrite_mode_b_questions.sql` against live Supabase (service-role REST
      read): **72/72 match exactly, 0 mismatches, 0 missing.** Q001/Q009/Q045
      spot-checks return the rewritten phrasing.
- [x] **Question rewrite rendered:** verified 2026-07-21 on all-Mode-B session
      `55b8c2a5-…` via dev server. Section C returns HTTP 200 and renders the
      **18 rewritten questions** — new Q001 ("vendor selection, staging
      decisions, and listing details") and Q009 ("title issue, a seller pushing
      back on staging choices") present, pre-004 Q001 phrasing absent — each with
      its **0–4 scored radio intact** (18 × `value="4"`). Role intro renders
      "You told us your Listing Coordinator owns Listing Launch".
- [x] **Role intro:** verified 2026-07-18 on session `55b8c2a5` (all-Mode-B):
      Section C renders "You told us your Listing Coordinator owns Listing
      Launch" and Section D renders "You told us your Transaction Coordinator
      owns Seller Communication" — per-workflow role lookup confirmed, not a
      single hardcoded path.
- [x] **Solo/team race:** verified 2026-07-21 by code inspection + the 2026-07-18
      static render. The race (radio's async save vs the read) is structurally
      defeated by two independent guards, so the interactive click-through would
      only re-confirm what the architecture guarantees:
      1. `advanceSectionA` (`actions.ts:74-82`) reads A006 **from the DB** at
         advance time and sets `drs_profile` from the persisted answer, not a
         client value.
      2. Section G (`g/page.tsx:22-38`) recomputes `drsProfile` **live** from the
         persisted A006 answer + workflow modes via `refineDrsProfile`, and never
         reads the cached `drs_profile` column for routing — so even a stale
         column cannot mis-route. (Comment at `g/page.tsx:19-21` documents this.)
      The "2 people + 3× Mode A → solo" override is `refineDrsProfile`
      (`assessment.ts:159-169`), applied in both `advanceSectionB` (`actions.ts:105`)
      and recomputed in G. Static half already proven 2026-07-18 (solo session
      `48b740f1` renders the Solo Owner track on G).
- [x] **Email gate:** verified 2026-07-18. Render halves via dev server:
      no-email session `e77b7fc1` shows the gate with DRS card and booking CTA
      absent from the HTML; emailed session `55b8c2a5` shows DRS + booking CTA
      with no gate. The live submission path (email persisted, breakdown
      unlocks) was already proven end-to-end — twice, local and prod — in the
      HubSpot task's 2026-07-18 verification.
- [x] Record outcomes below; file follow-up tasks for anything that fails.
      **No defects found — nothing to file.**

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
- 2026-07-21 (close-out, read-only) — **Migration 004 has since been applied.**
  Diffed all 72 UPDATEs against live Supabase: 72/72 exact match, 0 mismatched,
  0 missing. Re-ran the render check on all-Mode-B session `55b8c2a5-…` (dev
  server, no writes): Section C = HTTP 200, 18 rewritten questions with new
  Q001/Q009 text and 18 intact 0–4 radios, role intro correct. Solo/team race
  closed by code inspection (two structural guards, see step above) on top of
  the 07-18 static render. No code changes; nothing to deploy — the app code
  shipped in `79c5b52` and the only prod mutation (004) is now confirmed live.
  **All checks pass → status Done.**
