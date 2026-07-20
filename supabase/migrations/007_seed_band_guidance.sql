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

-- Bodies are newline-separated step plans; the admin page renders them
-- with `whitespace-pre-line`, so each numbered step shows on its own line.

delete from recommendation_templates;

insert into recommendation_templates (score_band_id, body, priority)
select b.id, v.body, 1
from (values
  ('ods', 'Optimized',
   E'Plan: protect the position while growing.\n1. Put a quarterly ownership review on the calendar: every workflow, its named owner, and whether the SOP is current.\n2. Make each workflow''s owner responsible for keeping its SOP updated — documentation changes with the process, not after it.\n3. Watch the two early-warning signs: approvals creeping back to the leader, and new work arriving without a named owner.\n4. Retake the assessment after each growth push (new hire, volume jump) to catch debt rebuilding early.'),
  ('ods', 'Developing',
   E'Plan: finish the incomplete handoffs (90-day target).\n1. List the workflows where decisions or final steps still route through the leader — usually two or three.\n2. For each, close the authority gap in writing: what the owner decides alone, what escalates, and the exact threshold.\n3. Move every remaining "final approval" step to the owner, with a written quality standard in its place.\n4. Target: in 90 days, zero routine approvals on the leader''s plate.'),
  ('ods', 'Elevated',
   E'Plan: a structured transfer program, one workflow at a time.\n1. Rank the four workflows by debt (the Start Here panel does this) and take the highest first.\n2. Run document → train → transfer: a 2-week SOP sprint, the owner runs it shadowed, then solo with authority in writing.\n3. Set the standard for "done well" and a weekly 15-minute check-in so quality stays visible without the leader in the work.\n4. Time-box each transfer to 30–45 days, then move to the next workflow.\nExpect visible time recovery after one or two cycles.'),
  ('ods', 'Critical',
   E'Plan: get the first workflow off the leader''s plate fast, then systematize.\n1. Pick the single highest-debt workflow (named in Start Here) and put a 30-day transfer date on it this week.\n2. Document it as the leader runs it — a checklist SOP plus templates for the routine communications.\n3. Name the owner, transfer the decision authority in writing, and define the 2–3 situations that still escalate.\n4. Hold a weekly 15-minute review for the first month; log every time work bounces back to the leader and why.\n5. Repeat with the next workflow — one per 30–45 day cycle — while readiness work closes the gaps behind it.'),

  ('drs', 'Not Ready',
   E'Plan: build readiness before transferring work — early transfers will bounce back and reinforce "it''s faster to do it myself."\n1. Start with the weakest readiness category (named in Start Here) and work only that lever for 30 days.\n2. In parallel, document one workflow so a transfer is ready the moment readiness is.\n3. Hand off one small, low-risk task now as a practice rep — outcome standard defined, leader hands-off for 30 days.\n4. Reassess at 60 days; start real transfers when the weakest category clears 50.'),
  ('drs', 'Developing',
   E'Plan: make delegation stick.\n1. Formalize the next handoff on one page: what "done well" looks like, the decisions the owner makes alone, and the check-in cadence — no verbal handoffs.\n2. Coach the leader through the itch to intervene: different-from-my-way is not a miss; only a miss against the written standard is.\n3. Log every piece of work that comes back to the leader and what triggered it — the pattern names the next fix.\n4. As delegated scope grows, add written guardrails so authority keeps pace with responsibility.'),
  ('drs', 'Emerging',
   E'Plan: convert readiness into transfers now.\n1. Pick the first workflow (Start Here names it) and run a clean handoff: SOP, written standard, transferred authority.\n2. Write the escalation line so the owner knows exactly what still comes to the leader — everything else doesn''t.\n3. Review weekly for the first month, then monthly.\n4. Schedule the retake now, so progress shows up on the scores while momentum is high.'),
  ('drs', 'Ready',
   E'Plan: velocity — readiness isn''t the constraint, sequencing is.\n1. Map all high-debt workflows into a transfer sequence for the next quarter, highest ODS first.\n2. Transfer with outcome standards, not task lists — the owner owns the result, not the checklist.\n3. Make the payoff explicit: list the growth work the leader''s recovered hours go to, so the time doesn''t refill with noise.\n4. Retake after each transferred workflow to confirm the debt actually moved.')
) as v(slug, label, body)
join dimensions d on d.slug = v.slug
join score_bands b on b.dimension_id = d.id and b.label = v.label;

-- ── Verify ──────────────────────────────────────────────────────
-- Expect 12 rows, all with non-null description:
--   select d.slug, b.label, left(b.description, 40) from score_bands b
--   join dimensions d on d.id = b.dimension_id order by d.slug, b.min_score;
-- Expect 8 rows:
--   select count(*) from recommendation_templates;
