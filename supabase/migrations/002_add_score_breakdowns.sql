-- Migration 002: score_breakdowns table
-- Persists OQI per-dimension and DRS per-category scores so they don't
-- need to be recomputed from raw answers on every admin page load.
--
-- breakdown_type: 'oqi' | 'drs'
-- workflow_key:   'C'|'D'|'E'|'F' for OQI rows (which workflow), NULL for DRS rows
-- label:          OQI dimension slug ('FA','RA','SC','ET','OA','CC')
--                 or DRS category name ('Willingness','Delegation Quality', etc.)
-- weight:         the weight applied in the final score formula
-- normalized_score: 0–100

create table if not exists score_breakdowns (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references assessment_sessions(id) on delete cascade,
  breakdown_type   text not null check (breakdown_type in ('oqi', 'drs')),
  workflow_key     text check (workflow_key in ('C','D','E','F')),
  label            text not null,
  weight           numeric(5,4) not null,
  normalized_score numeric(5,2) not null,
  computed_at      timestamptz not null default now()
);

create index idx_score_breakdowns_session on score_breakdowns(session_id);
