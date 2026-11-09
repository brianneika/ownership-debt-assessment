-- Migration 009: Blueprint PDF leads
-- See plans/tasks/20261109-blueprint-landing-page.md.
--
-- /blueprint offers the 90-Day Leverage Blueprint PDF for name, email, and phone.
-- These leads are not assessment sessions, so they get their own table. The app
-- treats this insert as best-effort: if the table is missing, the visitor still
-- gets the PDF and Bri still gets the alert email.

create table if not exists blueprint_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  email text not null,
  phone text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  meta_event_id text
);

create index if not exists blueprint_leads_created_at_idx on blueprint_leads (created_at desc);

-- Server-only table: written with the service role key, never read by the browser.
alter table blueprint_leads enable row level security;
