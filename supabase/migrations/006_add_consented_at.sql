-- Migration 006: Record email-marketing consent granted at the results gate
-- See plans/tasks/20260718-email-gate-consent-capture.md.
--
-- Consent mechanism is by-submission disclosure: submitting an email at the
-- gate IS the opt-in, and consented_at records when it happened. The timestamp
-- (not a boolean) is the point — sessions gated before this shipped were
-- promised report-only use, so null consented_at = permanently off-limits for
-- marketing email (30-day nurture, future VAI sequences).
--
-- Lives on assessment_sessions next to respondent_email; moves to respondents
-- when respondent linking lands (Phase 2a).

alter table assessment_sessions add column if not exists consented_at timestamptz;
