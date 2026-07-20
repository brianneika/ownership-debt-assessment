-- Migration 005: Relabel OQI dimensions to match what the questions actually measure
-- See plans/tasks/20260717-oqi-dimension-relabel.md and the (now removed) Known Issue
-- section of docs/question-bank-export.md.
--
-- Pure rename: question grouping, weights, and every stored score value are
-- unchanged. Misleading slugs get FRESH slugs (never reused with a new meaning,
-- so historical and new rows stay comparable):
--   FA -> DO  Decision Ownership          (Q001-Q003 group)
--   RA -> IE  Independent Execution       (Q004-Q006 group)
--   SC -> SC  Systems & Checklists        (unchanged)
--   ET -> EC  Escalation & Coverage       (Q010-Q012 group)
--   OA -> OA  Outcome Accountability      (unchanged)
--   CC -> CT  Confidence & Track Record   (Q016-Q018 group)
--
-- NOTE for future migrations: any migration that rewrites Mode B question_text
-- must re-verify oqi_dimension still matches the new content, and slugs must
-- never be reused with a different meaning.

begin;

-- 1. Drop the old check constraint so the update can proceed.
alter table questions drop constraint if exists questions_oqi_dimension_check;

-- 2. Relabel the 72 Mode B question rows in a single CASE update
--    (sequential per-slug updates could double-map a reused value).
update questions
set oqi_dimension = case oqi_dimension
  when 'FA' then 'DO'
  when 'RA' then 'IE'
  when 'ET' then 'EC'
  when 'CC' then 'CT'
  else oqi_dimension
end
where oqi_dimension is not null;

-- 3. Re-add the constraint with the new slug set.
alter table questions add constraint questions_oqi_dimension_check
  check (oqi_dimension in ('DO','IE','SC','EC','OA','CT'));

-- 4. Relabel historical OQI score_breakdowns rows (values untouched — the
--    relabel provably cannot move any score). DRS rows use category names,
--    not these slugs, so they are excluded.
update score_breakdowns
set label = case label
  when 'FA' then 'DO'
  when 'RA' then 'IE'
  when 'ET' then 'EC'
  when 'CC' then 'CT'
  else label
end
where breakdown_type = 'oqi';

commit;
