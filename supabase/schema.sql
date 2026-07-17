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
  oqi_dimension      text check (oqi_dimension in ('FA','RA','SC','ET','OA','CC')),
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

-- ODS: low score = less debt = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex) values
  ((select id from dimensions where slug='ods'),  0, 30,  'Optimized',  '#22c55e'),
  ((select id from dimensions where slug='ods'), 31, 50,  'Developing', '#eab308'),
  ((select id from dimensions where slug='ods'), 51, 70,  'Elevated',   '#f97316'),
  ((select id from dimensions where slug='ods'), 71, 100, 'Critical',   '#ef4444');

-- DRS: high score = more ready = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex) values
  ((select id from dimensions where slug='drs'),  0, 30,  'Not Ready',  '#ef4444'),
  ((select id from dimensions where slug='drs'), 31, 50,  'Developing', '#f97316'),
  ((select id from dimensions where slug='drs'), 51, 70,  'Emerging',   '#eab308'),
  ((select id from dimensions where slug='drs'), 71, 100, 'Ready',      '#22c55e');

-- OQI: high score = more documented/optimized = better
insert into score_bands (dimension_id, min_score, max_score, label, color_hex) values
  ((select id from dimensions where slug='oqi'),  0, 30,  'Undocumented', '#ef4444'),
  ((select id from dimensions where slug='oqi'), 31, 50,  'Fragile',      '#f97316'),
  ((select id from dimensions where slug='oqi'), 51, 70,  'Functional',   '#eab308'),
  ((select id from dimensions where slug='oqi'), 71, 100, 'Optimized',    '#22c55e');

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
