# 30-day nurture retake (no-signup prospects)

**Status:** Not started

## Objective

Prospects who complete the assessment but don't sign up get an automated email
30 days later inviting them to retake and compare — surfacing whether things
got better or worse, especially their Section H urgency answers.

## Methods / background

- Raised 2026-07-18; journey diagram in [architecture.md](../architecture.md)
  (phase ② "no signup" branch).
- **Depends on** the retake-push mechanism from
  [20260718-retake-push-and-linking](20260718-retake-push-and-linking.md) —
  this is the same tokenized-link push, triggered by a timer instead of a
  coach. Sequence it after that task lands.
- Open questions to settle before building:
  - What signals "didn't sign up"? (HubSpot deal/lifecycle stage? A manual flag
    on the session? Absence of a booking?)
  - One nudge or a sequence? What does the email say, and does it quote their
    own urgency answer back to them?
  - Scheduling mechanism (cron/queue) — nothing in the app runs on a timer
    today.
- Guardrail: this is a side channel — sending failures must never affect any
  respondent-facing flow.

## Progress

- [ ] Define the "didn't sign up" signal
- [ ] Draft the nudge email copy with Brianne
- [ ] Build on top of the retake-push mechanism + a scheduler
