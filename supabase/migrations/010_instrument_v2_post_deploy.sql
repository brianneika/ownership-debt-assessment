-- ============================================================
-- Migration 010: POST-DEPLOY, OPTIONAL. Mark v2 questions active and v1 inactive.
-- Task: plans/tasks/20261017-assessment-v2-questions-and-section-copy.md, Phase 4
--
-- RUN ONLY AFTER the v2 code is live and verified. Never before, and never if the
-- deploy is rolled back to v1 code: today's (v1) code loads questions by
-- is_active, so running this under v1 code would empty the v1 assessment.
--
-- What it changes: is_active becomes a label for "the current instrument".
-- The v2 code picks questions by instrument_version, never by is_active, so
-- this step changes nothing a respondent sees, and v1 sessions (in progress or
-- completed) keep reading and scoring their v1 questions. No answer, score or
-- session row is touched. A001 and A002 (name, business name) stay active
-- because both versions use them.
--
-- Undo (if the code is ever rolled back to v1):
--   update questions set is_active = (instrument_version = 1) or question_key in ('A001', 'A002');
--
-- Re-runnable. Run in Supabase Dashboard > SQL Editor.
-- ============================================================

update questions
set is_active = (instrument_version = 2) or question_key in ('A001', 'A002');

-- Check (read-only). Expected: v1 = 142 questions, 2 active; v2 = 123 questions, 123 active.
select instrument_version, count(*) as questions, count(*) filter (where is_active) as active
from questions group by instrument_version order by instrument_version;
