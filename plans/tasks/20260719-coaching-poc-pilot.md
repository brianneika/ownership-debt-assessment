# Coaching-concept proof: live retake pilot

**Status:** Not started

## Objective

Prove the coaching-tool concept with a live pilot — a handful of existing WSS
coaching clients take a baseline, retake after a completed workflow via a
tokenized link, and see their delta — before investing in the full Phase 2
build.

## Methods / background

- Master plan: _Retakes & progress_ (theme 2); this is a lean, evidence-first
  cut of [retake push & linking](20260718-retake-push-and-linking.md) /
  implementation-plan Phase 2. The full task stays open — this pilot builds
  the minimum slice of it and validates the concept with real clients.
- **Decisions (2026-07-19, Bri):**
  - **Participants: existing WSS coaching clients, now.** Hand-picked (target
    3–5), not waiting for the founding cohort. Since they're mid-engagement,
    they take a **fresh baseline** at pilot start (deviation from the locked
    "pre-sale session = baseline" rule — that rule still holds for the cohort;
    the pilot just can't have a pre-sale session to lean on).
  - **Send method: manual.** The admin session page generates the tokenized
    retake link; Bri copies it into her own email/text. **No app-sent email**
    — the email-provider gate stays open and unblocked-around, not decided
    here. (Full 2b automation remains in the parent task.)
  - **Retake trigger:** after the client's next completed workflow, same as
    the production cadence — the coach (Bri) decides when.
- **Build scope (the minimum slice of Phase 2):**
  - **Linking (2a, as designed):** create/match `respondents` by captured
    email, set `assessment_sessions.respondent_id`; backfill past gated
    sessions. `respondents` table and FK columns already exist — no
    structural migration.
  - **Link generation (lean 2b):** "Generate retake link" on the admin
    session/client page → tokenized URL → opens a new session pre-linked to
    the same respondent, skipping the email gate (identity already known).
    No email send, no scheduler.
  - **Delta view (2c, as designed):** `/results/[sessionId]` for a linked
    retake shows movement vs. baseline and vs. previous — per score and per
    workflow (per-workflow ODS rows make the delta attributable).
- **Pilot ops (not code):** pick participants with WSS, run baselines, push
  retakes after workflow completion, then a short debrief per participant.
- **Success bar (all three):**
  1. **Loop works end-to-end** — each participant completes baseline + at
     least one retake via link with no login, and the delta renders.
  2. **Clients find it valuable** — debrief says the delta view is
     meaningful (to them and to Bri as coach).
  3. **Scores move credibly** — per-workflow deltas reflect the coaching
     work actually done; the instrument measures what changed.
- **Guardrails:** scoring semantics untouched (measurement-instrument
  principle); respondent flow stays sacred — link/linking failures never
  block an assessment.
- Likely sub-task split when picked up: (1) linking, (2) token link +
  admin button, (3) delta view, (4) pilot run & debrief.

## Progress

Running log — check things off and note decisions as you go.

- [ ] Confirm pilot participants with WSS (target 3–5 existing clients)
- [ ] Linking: respondent create/match on email capture + backfill
- [ ] Admin "Generate retake link" → tokenized, pre-linked, gate-skipping session
- [ ] Delta view on results for linked retakes (vs. baseline, vs. previous, per workflow)
- [ ] Baselines taken by all participants
- [ ] First retakes pushed after completed workflows
- [ ] Debriefs done; verdict against the three-part success bar recorded here
