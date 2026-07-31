-- Migration 008: Distinguish teaser sessions from full ones + track teaser completion
-- See plans/tasks/20260730-teaser-short-assessment.md.
--
-- The 5-question teaser (A006 + B001–B004) creates a real assessment_sessions row
-- so its answers pre-fill the full assessment when the visitor unlocks. Two markers
-- let admin tell short vs full apart and build the top-of-funnel view:
--
--   entry: how the session began — 'full' (the 15-min flow from /assessment) or
--          'teaser' (the /teaser hook). This is an ORIGIN marker: it never flips,
--          even after a teaser session goes on to a full completion. That is what
--          makes the admin "Version" badge and the teaser funnel meaningful.
--   teaser_completed_at: when the visitor finished the 5 teaser questions and saw
--          their preview number. Null for full-origin sessions and for teaser
--          sessions that dropped before the preview.
--
-- Full completion still uses the existing status='completed' + completed_at, so a
-- teaser session that finishes the full assessment reads as entry='teaser' AND
-- status='completed'. Anonymous teaser-only visitors (no email until unlock) are
-- counted, never listed as named rows — that is correct for top-of-funnel.

alter table assessment_sessions add column if not exists entry text not null default 'full';
alter table assessment_sessions add column if not exists teaser_completed_at timestamptz;

-- Guard the allowed values without a rigid enum (cheap to extend later).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'assessment_sessions_entry_check'
  ) then
    alter table assessment_sessions
      add constraint assessment_sessions_entry_check check (entry in ('full', 'teaser'));
  end if;
end $$;
