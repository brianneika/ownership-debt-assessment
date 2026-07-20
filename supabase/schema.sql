-- ============================================================
-- OWNERSHIP ASSESSMENT — SCHEMA v2
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. DIMENSIONS (exactly 3 rows)
-- ============================================================
create table dimensions (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  description   text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

insert into dimensions (slug, name, display_order) values
  ('ods', 'Ownership Debt Score',       1),
  ('oqi', 'Ownership Quality Index',    2),
  ('drs', 'Delegation Readiness Score', 3);

-- ============================================================
-- 2. QUESTIONS
-- ============================================================
create table questions (
  id                 serial primary key,
  question_key       text unique,          -- e.g. 'A001', 'Q001', 'TBC4', 'RC_C2', 'SDQ1'
  dimension_id       int references dimensions(id) on delete restrict,
  question_text      text not null,
  question_order     int not null,
  section            text check (section in ('A','B','C','D','E','F','G','H')),
  answer_type        text not null
                       check (answer_type in ('scored_radio','categorical_radio','free_text')),
  is_scored          boolean not null default true,
  -- workflow mode this question belongs to (null = applies regardless of mode, e.g. Section A/B/G/H)
  mode               text check (mode in ('A','B','C')),
  oqi_dimension      text check (oqi_dimension in ('DO','IE','SC','EC','OA','CT')),
  drs_category       text check (drs_category in (
                       'Willingness','Delegation Quality','Team Capacity',
                       'Authority Framework','Transfer Readiness',
                       'Hiring Readiness','Systems Mindset'
                     )),
  reverse_scored     boolean not null default false,
  applies_to_profile text not null default 'both'
                       check (applies_to_profile in ('both','team','solo')),
  weight             numeric(4,2) not null default 1.0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  unique(question_order)
);

-- ============================================================
-- 3. SCORE BANDS
-- ============================================================
create table score_bands (
  id           serial primary key,
  dimension_id int references dimensions(id) on delete cascade,
  min_score    numeric(5,2) not null,
  max_score    numeric(5,2) not null,
  label        text not null,
  color_hex    text,
  description  text,
  created_at   timestamptz not null default now()
);

-- Band descriptions seeded by migration 007 (display-only guidance copy)

-- ODS: low score = less debt = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex, description) values
  ((select id from dimensions where slug='ods'),  0, 30,  'Optimized',  '#22c55e',
   'Little of the business depends on the owner personally. Workflows have named owners and documented processes; the leader''s time is going to growth, not operations.'),
  ((select id from dimensions where slug='ods'), 31, 50,  'Developing', '#eab308',
   'Some workflows still route through the owner. Debt is manageable, but a few handoffs are incomplete — decisions or final steps still come back to the leader.'),
  ((select id from dimensions where slug='ods'), 51, 70,  'Elevated',   '#f97316',
   'A meaningful share of daily operations depends on the owner. Growth is capped by the leader''s personal capacity, and time is going to work someone else could own.'),
  ((select id from dimensions where slug='ods'), 71, 100, 'Critical',   '#ef4444',
   'The business runs through the owner. Most workflows stall without the leader''s direct involvement — the leader is the bottleneck, and stepping away isn''t currently possible.');

-- DRS: high score = more ready = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex, description) values
  ((select id from dimensions where slug='drs'),  0, 30,  'Not Ready',  '#ef4444',
   'Delegation would likely fail today — the willingness, systems, or people to absorb ownership aren''t in place yet. Readiness has to be built before work can move.'),
  ((select id from dimensions where slug='drs'), 31, 50,  'Developing', '#f97316',
   'Some foundations exist, but delegation is inconsistent — handoffs are informal, authority stays with the leader, or the team can''t absorb more yet.'),
  ((select id from dimensions where slug='drs'), 51, 70,  'Emerging',   '#eab308',
   'Most of the readiness pieces are in place. With clearer standards and transferred authority, delegation can start now and stick.'),
  ((select id from dimensions where slug='drs'), 71, 100, 'Ready',      '#22c55e',
   'The leader and team are ready to absorb ownership. Anything still on the leader''s plate is there by habit, not necessity — transfers can start immediately.');

-- OQI: high score = more documented/optimized = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex, description) values
  ((select id from dimensions where slug='oqi'),  0, 30,  'Undocumented', '#ef4444',
   'This workflow runs on memory and availability — no reliable SOP, standards, or backup. It works only while nothing changes.'),
  ((select id from dimensions where slug='oqi'), 31, 50,  'Fragile',      '#f97316',
   'The workflow functions, but depends on specific people and informal knowledge. One absence or departure would break it.'),
  ((select id from dimensions where slug='oqi'), 51, 70,  'Functional',   '#eab308',
   'Documented and mostly independent, with gaps in authority, escalation, or accountability that still pull the leader back in.'),
  ((select id from dimensions where slug='oqi'), 71, 100, 'Optimized',    '#22c55e',
   'Fully documented, independently executed, and accountable. The named owner runs it to standard without the leader.');

-- ============================================================
-- 4. RECOMMENDATION TEMPLATES
-- ============================================================
create table recommendation_templates (
  id            serial primary key,
  score_band_id int not null references score_bands(id) on delete cascade,
  body          text not null,
  priority      int not null default 0,
  created_at    timestamptz not null default now()
);

-- Coach-facing "how we can help" step plans per overall ODS / DRS band,
-- shown on the admin session page. Seeded by migration 007. Bodies are
-- newline-separated steps (rendered with whitespace-pre-line).
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

-- ============================================================
-- 5. CLIENTS
-- ============================================================
create table clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 6. RESPONDENTS
-- ============================================================
create table respondents (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references clients(id) on delete set null,
  name       text not null,
  email      text,
  role       text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. ASSESSMENT SESSIONS
-- ============================================================
create table assessment_sessions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references clients(id) on delete set null,
  respondent_id  uuid references respondents(id) on delete set null,
  status         text not null default 'in_progress'
                   check (status in ('in_progress','completed','abandoned')),
  -- Set when A006 is answered; drives DRS category weighting
  drs_profile    text check (drs_profile in ('team','solo')),
  -- Set after Section B; drives which question set loads for C–F
  wf_c_mode      text check (wf_c_mode in ('A','B','C')),
  wf_d_mode      text check (wf_d_mode in ('A','B','C')),
  wf_e_mode      text check (wf_e_mode in ('A','B','C')),
  wf_f_mode      text check (wf_f_mode in ('A','B','C')),
  -- Captured at the results email gate (migration 003)
  respondent_email text,
  -- When the respondent granted VAI email consent by submitting the gate
  -- (migration 006). Null = gated pre-consent-capture: off-limits for marketing.
  consented_at   timestamptz,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  last_active_at timestamptz not null default now(),
  metadata       jsonb
);

-- ============================================================
-- 8. ANSWERS
-- ============================================================
create table answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references assessment_sessions(id) on delete cascade,
  question_id int  not null references questions(id) on delete restrict,
  answer_type text not null
                check (answer_type in ('scored_radio','categorical_radio','free_text')),
  -- 0–4 for all scoring questions; Q087 (not scored) uses 1–5, hence upper bound 5
  score_value int  check (score_value between 0 and 5),
  text_value  text,
  answered_at timestamptz not null default now(),
  unique(session_id, question_id)
);

-- scored_radio must carry a score_value
alter table answers add constraint answers_scored_radio_requires_score
  check (answer_type != 'scored_radio' or score_value is not null);

-- free_text must carry a text_value
alter table answers add constraint answers_free_text_requires_text
  check (answer_type != 'free_text' or text_value is not null);

-- ============================================================
-- 9. DIMENSION SCORES
-- workflow_key = 'C'|'D'|'E'|'F' for per-workflow rows; null = overall
-- unique constraint: Postgres treats null as distinct, so overall + per-workflow rows coexist
-- ============================================================
create table dimension_scores (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references assessment_sessions(id) on delete cascade,
  dimension_id     int  not null references dimensions(id) on delete restrict,
  workflow_key     text check (workflow_key in ('C','D','E','F')),
  raw_score        numeric(6,2) not null,
  normalized_score numeric(5,2) not null,   -- 0–100
  score_band_id    int references score_bands(id) on delete set null,
  computed_at      timestamptz not null default now(),
  unique nulls not distinct (session_id, dimension_id, workflow_key)
);

-- ============================================================
-- 10. REPORTS
-- ============================================================
create table reports (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null unique references assessment_sessions(id) on delete cascade,
  overall_score   numeric(5,2),
  overall_band_id int references score_bands(id) on delete set null,
  generated_at    timestamptz not null default now(),
  pdf_url         text,
  viewed_at       timestamptz,
  notes           text
);

-- ============================================================
-- 11. ADMIN USERS
-- ============================================================
create table admin_users (
  id            serial primary key,
  email         text not null unique,
  display_name  text,
  password_hash text not null,
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_questions_section   on questions(section);
create index idx_questions_key       on questions(question_key);
create index idx_questions_mode      on questions(mode);
create index idx_answers_session     on answers(session_id);
create index idx_answers_question    on answers(question_id);
create index idx_dim_scores_session  on dimension_scores(session_id);
create index idx_dim_scores_workflow on dimension_scores(session_id, workflow_key);
create index idx_sessions_client     on assessment_sessions(client_id);
create index idx_sessions_status     on assessment_sessions(status);

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on clients
  for each row execute function set_updated_at();
