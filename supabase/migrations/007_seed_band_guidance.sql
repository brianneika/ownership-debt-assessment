-- ============================================================
-- Migration 007 — Seed score-band guidance copy
-- Task: plans/tasks/20260718-admin-call-prep-insight.md (Slice 3)
--
-- Fills the previously-null score_bands.description (shown on the
-- admin session page; later reusable on the client results page) and
-- seeds the dormant recommendation_templates table with coach-facing
-- "how we can help" copy per overall ODS / DRS band.
--
-- Display-only: no scoring semantics change. Safe to re-run
-- (idempotent: updates by dimension+label; delete-then-insert seed).
--
-- COPY STATUS: draft (2026-07-19) — Bri approves before running.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- ── 1. score_bands.description ─────────────────────────────────

update score_bands b
set description = v.description
from (values
  -- ODS: what this level of ownership debt means
  ('ods', 'Optimized',
   'Little of the business depends on the owner personally. Workflows have named owners and documented processes; the leader''s time is going to growth, not operations.'),
  ('ods', 'Developing',
   'Some workflows still route through the owner. Debt is manageable, but a few handoffs are incomplete — decisions or final steps still come back to the leader.'),
  ('ods', 'Elevated',
   'A meaningful share of daily operations depends on the owner. Growth is capped by the leader''s personal capacity, and time is going to work someone else could own.'),
  ('ods', 'Critical',
   'The business runs through the owner. Most workflows stall without the leader''s direct involvement — the leader is the bottleneck, and stepping away isn''t currently possible.'),

  -- DRS: what this level of delegation readiness means
  ('drs', 'Not Ready',
   'Delegation would likely fail today — the willingness, systems, or people to absorb ownership aren''t in place yet. Readiness has to be built before work can move.'),
  ('drs', 'Developing',
   'Some foundations exist, but delegation is inconsistent — handoffs are informal, authority stays with the leader, or the team can''t absorb more yet.'),
  ('drs', 'Emerging',
   'Most of the readiness pieces are in place. With clearer standards and transferred authority, delegation can start now and stick.'),
  ('drs', 'Ready',
   'The leader and team are ready to absorb ownership. Anything still on the leader''s plate is there by habit, not necessity — transfers can start immediately.'),

  -- OQI: what this level of workflow quality means (per Mode B workflow)
  ('oqi', 'Undocumented',
   'This workflow runs on memory and availability — no reliable SOP, standards, or backup. It works only while nothing changes.'),
  ('oqi', 'Fragile',
   'The workflow functions, but depends on specific people and informal knowledge. One absence or departure would break it.'),
  ('oqi', 'Functional',
   'Documented and mostly independent, with gaps in authority, escalation, or accountability that still pull the leader back in.'),
  ('oqi', 'Optimized',
   'Fully documented, independently executed, and accountable. The named owner runs it to standard without the leader.')
) as v(slug, label, description),
dimensions d
where d.slug = v.slug
  and b.dimension_id = d.id
  and b.label = v.label;

-- ── 2. recommendation_templates seed ────────────────────────────
-- Coach-facing "how we can help" copy per overall ODS / DRS band.
-- Table was dormant (empty); delete-then-insert keeps re-runs clean.

delete from recommendation_templates;

insert into recommendation_templates (score_band_id, body, priority)
select b.id, v.body, 1
from (values
  ('ods', 'Optimized',
   'Coaching focus: protect the position. Keep documentation current as the team grows, review ownership assignments quarterly, and watch leading indicators so debt doesn''t quietly rebuild during the next growth push.'),
  ('ods', 'Developing',
   'Coaching focus: finish the incomplete handoffs. Identify the two or three workflows that still route through the leader, close the authority gap on each — not just the tasks — and set a 90-day target for full transfer.'),
  ('ods', 'Elevated',
   'Coaching focus: a structured transfer program. Rank workflows by debt, take the highest-debt workflow through document → train → transfer, and coach the leader on staying out of re-delegated work. Expect visible time recovery within one to two workflow cycles.'),
  ('ods', 'Critical',
   'Coaching focus: immediate relief plus systematic buildout. Start with the single highest-debt workflow to prove the transfer pattern, while building the readiness foundation — SOPs, authority guardrails, capacity — to sustain it. High urgency, high impact.'),

  ('drs', 'Not Ready',
   'Coaching focus: build the foundation before transferring work. Start with willingness (control coaching) if that''s the weak category; otherwise systems and capacity. Delegation attempts before readiness will bounce back and reinforce "it''s faster to do it myself."'),
  ('drs', 'Developing',
   'Coaching focus: make delegation stick. Formalize handoffs — a defined "done," transferred authority, documented guardrails — and coach the leader through not taking work back when execution differs from their way.'),
  ('drs', 'Emerging',
   'Coaching focus: convert readiness into transfers. The foundation is in place — pick the first workflow, run a clean handoff with standards and authority, and set a retake cadence so progress is visible.'),
  ('drs', 'Ready',
   'Coaching focus: velocity. Readiness isn''t the constraint — sequence the transfers, set outcome standards, and redirect the leader''s recovered time toward the growth work only they can do.')
) as v(slug, label, body)
join dimensions d on d.slug = v.slug
join score_bands b on b.dimension_id = d.id and b.label = v.label;

-- ── Verify ──────────────────────────────────────────────────────
-- Expect 12 rows, all with non-null description:
--   select d.slug, b.label, left(b.description, 40) from score_bands b
--   join dimensions d on d.id = b.dimension_id order by d.slug, b.min_score;
-- Expect 8 rows:
--   select count(*) from recommendation_templates;
