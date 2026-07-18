# Admin user management (master admin)

**Status:** Not started

## Objective

Let a master admin create and manage additional admin/coach accounts, replacing
the single env-credentialed login, so the team can grow beyond one person.

## Methods / background

- Today: one admin via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars
  (`src/lib/auth.ts`), JWT cookie, edge guard in `src/proxy.ts`. The dormant
  `admin_users` table is the landing zone.
- Raised 2026-07-18: the admin area is the sales call's working surface, and
  there's currently no way to add users as the team grows.
- Open questions to settle before building:
  - Roles: master admin vs. coach — what can a coach *not* do?
  - Does a coach see all sessions or only their own clients? (Ties into the
    `clients` table and roadmap theme 3 — may be deferred to keep this task
    focused on accounts + roles.)
  - Invite flow: master admin sets a password, or email invite? (If email:
    depends on the email provider decision in
    [20260718-retake-push-and-linking](20260718-retake-push-and-linking.md).)

## Progress

- [ ] Settle roles + visibility scope with Brianne
- [ ] Activate `admin_users`; migrate login to check it
- [ ] Master-admin UI: add / deactivate users
