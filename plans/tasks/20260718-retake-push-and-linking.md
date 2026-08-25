# Retake push & respondent linking

**Status:** Not started (revalidated 2026-08-25; next up when Bri picks a build slot)

## Objective

Link assessment sessions to a person and let VAI push a retake to a client via
an emailed tokenized link — the structural core of the retakes-and-progress
vision (roadmap theme 2, the day-90 proof event in the placement playbook).

> **Language note (2026-08-25):** this doc predates the coaching retirement
> (2026-08-04). "Coach" below means the VAI admin (Bri) working the placement
> engagement; the mechanics are unchanged and the reframed master plan already
> describes them in placement terms.

> **Revalidation (2026-08-25):** Bri asked whether the website flow needs an
> up-front company-info page with backend linking, or standalone sessions she
> groups by hand later ("assessment 001 + 501 labeled day 1 / day 30"). Answer,
> consistent with the 2026-07-18 decisions: neither. The public flow stays
> anonymous and friction-free; identity is captured once at the results email
> gate (`respondent_email`); linking happens on VAI's side by activating the
> dormant `respondents` table, and every pushed retake opens a session
> pre-linked to the same respondent, so day-1 vs day-30 grouping is automatic,
> never manual. Manual session-ID grouping stays out: it's error-prone and the
> schema already has the right shape.

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
  the "send retake" button lives on the admin client/session page. Confirmed
  2026-08-25: the app never writes `client_id`/`respondent_id` today — sessions
  are created bare in `createSession()` (`src/lib/assessment.ts`) and the only
  identity captured is `respondent_email` at the results gate, so respondent
  linking starts by backfilling from that column.
- **Flag:** the app currently sends no email at all — this task needs an email
  provider decision (also unblocks results emails and the 30-day nurture).
- Likely splits into sub-tasks when picked up: (1) respondent linking,
  (2) push + tokenized link + email send, (3) delta results view.

## Progress

- [ ] Confirm email provider and sending domain
- [ ] Schema: activate `respondents`, link `assessment_sessions`
- [ ] Coach "send retake" → tokenized link → new pre-linked session
- [ ] Delta view on `/results/[sessionId]` for linked sessions
