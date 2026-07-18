# Retake push & respondent linking

**Status:** Not started

## Objective

Link assessment sessions to a person and let a coach push a retake to a client
via an emailed tokenized link — the structural core of the coaching-tool vision
(roadmap theme 2).

## Methods / background

- Master plan: _Retakes & progress_ theme; journey diagram in
  [architecture.md](../architecture.md) (phase ③).
- Decisions locked 2026-07-18:
  - **Baseline = the pre-sale assessment.** No fresh retake at engagement start.
  - **Cadence = after each completed workflow** (Listing Launch, Seller Comm,
    File Opening, Lender Tracking). The trigger is a coaching milestone, so the
    coach pushes it — no automated schedule.
  - **Entry point = emailed tokenized link, no client login.** Email stays the
    identity key ("low friction first"). The link opens a new session
    pre-linked to the same respondent.
  - **Delta is client-visible** on the results page after each retake — vs.
    baseline and vs. previous, per score and per workflow (per-workflow ODS
    rows in `dimension_scores` make the delta attributable). No client
    dashboard yet.
- Landing zones: dormant `respondents` table (link sessions by captured email);
  coach-side "send retake" button lives on the admin client/session page.
- **Flag:** the app currently sends no email at all — this task needs an email
  provider decision (also unblocks results emails and the 30-day nurture).
- Likely splits into sub-tasks when picked up: (1) respondent linking,
  (2) push + tokenized link + email send, (3) delta results view.

## Progress

- [ ] Confirm email provider and sending domain
- [ ] Schema: activate `respondents`, link `assessment_sessions`
- [ ] Coach "send retake" → tokenized link → new pre-linked session
- [ ] Delta view on `/results/[sessionId]` for linked sessions
