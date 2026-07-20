# Fix the OQI dimension label mismatch

**Status:** Done (2026-07-19) — pending prod deploy, see final log entry <!-- Not started | In progress | Blocked | Done -->

## Objective

Rename the six Mode B OQI dimension labels so they describe what the 18 questions
per workflow actually measure — without changing any question grouping, weight, or
score value.

## Decisions (agreed 2026-07-17)

- **Rename only, never regroup.** The six 3-question groups and their weights stay
  exactly as they are, so every score — overall OQI, workflow ODS, and per-dimension
  sub-scores — is numerically unchanged. Only the names become truthful. Regrouping
  questions into semantically pure dimensions would be a scoring-model change and is
  explicitly out of scope.
- **Retire every misleading slug rather than reusing it.** The obvious fix would
  relabel Q001–Q003 to `RA` (Role Accountability), but `RA` already means something
  else in historical `score_breakdowns` rows. Reusing a slug with a new meaning
  makes old and new rows silently incomparable, so all four wrong labels get fresh
  slugs. Only `SC` and `OA` survive (they were already correct).
- **Relabel historical `score_breakdowns` rows in the same migration** (no
  recompute needed — values don't change, only `label`).

## Proposed new labels

Weights follow the question groups, unchanged from `OQI_WEIGHTS`:

| Keys (per workflow) | Old slug | New slug | New name | Weight |
|---|---|---|---|---|
| Q001–Q003 | FA | `DO` | Decision Ownership | 0.20 |
| Q004–Q006 | RA | `IE` | Independent Execution | 0.22 |
| Q007–Q009 | SC | `SC` | Systems & Checklists | 0.18 |
| Q010–Q012 | ET | `EC` | Escalation & Coverage | 0.15 |
| Q013–Q015 | OA | `OA` | Outcome Accountability | 0.15 |
| Q016–Q018 | CC | `CT` | Confidence & Track Record | 0.10 |

**Confirmed with Bri 2026-07-18:**

1. Q010–Q012 renamed to `EC` "Escalation & Coverage" (not `AF` "Authority
   Framework") to avoid colliding with the existing DRS category of the same name.
   DO / IE / CT approved as proposed.
2. Weights belong to the *question groups*, not the original concepts — proceed
   with the pure relabel; no score changes.

## Methods / background

Read the _OQI Dimension Mismatch (Known Issue)_ section of
[question-bank-export.md](../../docs/question-bank-export.md) first — it documents
how the mismatch happened (`seed-questions-v2.sql` rewrote question text but left
the `oqi_dimension` column from the original seed) and what each group actually
measures. Migration 004 (the 2026 copy rewrite) also left the labels untouched.

Every place a dimension slug lives:

| Where | What |
| --- | --- |
| `supabase/schema.sql` (~line 40) | `oqi_dimension` check constraint `in ('FA','RA','SC','ET','OA','CC')`. Update to the new slug set (drop constraint → update rows → re-add, or alter in the right order). |
| `questions` table (live DB) | 72 Mode B rows carry the old slugs. New migration `005_relabel_oqi_dimensions.sql`: **one UPDATE with a CASE expression** — sequential per-slug updates would double-map any reused value. |
| `score_breakdowns` table (live DB) | Historical rows store the slug in `label` (`breakdown_type = 'oqi'` only — don't touch `'drs'` rows, they use DRS category names). Same CASE-mapping update, same migration. No check constraint here. |
| `src/lib/scoring.ts` | `OqiDimension` type (line 18) and `OQI_WEIGHTS` keys (lines 85–92). Values unchanged. |
| `src/app/admin/sessions/[sessionId]/page.tsx` (~line 223) | Renders the raw slug. Add a slug → display-name map so admins see "Decision Ownership" etc., not just a cryptic two-letter code. |
| `docs/question-bank-export.md` | Update the dimension tables (`OQI Dimensions and Questions`, the per-question table's `OQI Dim` column, the seed notes) and **delete the Known Issue section** — it's resolved by this task. |

### Prevention (the "so it doesn't happen again" part)

Add a short warning where the next person will trip: a comment block at the top of
the question-rewrite migration pattern and a note in `question-bank-export.md`
stating that any migration touching `question_text` for Mode B must re-verify
`oqi_dimension` still matches the content, and that slugs are never to be reused
with a new meaning.

## Implementation steps

- [x] Confirm the two naming/weight questions above with Bri.
- [x] Write `supabase/migrations/005_relabel_oqi_dimensions.sql`: drop/re-add the
      check constraint, CASE-update `questions.oqi_dimension`, CASE-update
      `score_breakdowns.label` where `breakdown_type = 'oqi'`.
- [x] Update `supabase/schema.sql` to match (it's the canonical schema doc).
- [x] Update `OqiDimension` + `OQI_WEIGHTS` in `src/lib/scoring.ts`.
- [x] Add the slug → display-name map to the admin session detail page.
- [x] Update `docs/question-bank-export.md`; remove the Known Issue section; add
      the prevention note.
- [x] Run the migration against live Supabase. Done 2026-07-19 — Bri executed
      the agent-prepared runner (see log) which applied 004 *and* 005.
- [x] Verify: `npx tsc --noEmit` + `npm run build` (✅ both pass 2026-07-18);
      score invariance and relabel proven at the DB level 2026-07-19 (see log).
      The admin visual check is a 10-second confirm for Bri next time she opens
      a Mode B session detail page: dimension bars should read "Decision
      Ownership" etc., not two-letter codes.

## Out of scope (follow-ups)

- Regrouping questions into different dimensions (scoring-model change).
- Any change to DRS category labels — they were never wrong.
- Reweighting dimensions.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-17 — Task drafted after auditing the label pipeline: slug lives in
  `questions.oqi_dimension`, is check-constrained in `schema.sql`, keys
  `OQI_WEIGHTS`, is copied verbatim into `score_breakdowns.label`, and is rendered
  raw in the admin UI. Overall OQI is label-independent (sums all 18 questions via
  per-group weights), so a pure rename provably cannot move scores.
- 2026-07-18 — Naming confirmed with Bri: `EC` "Escalation & Coverage" for
  Q010–Q012 (avoids the DRS "Authority Framework" collision); `DO`/`IE`/`CT`
  approved; weights confirmed as belonging to the question groups. All code +
  docs changes made; `tsc` and `npm run build` pass.
- 2026-07-18 — Checked live Supabase state via REST (service-role, read-only):
  - `questions.oqi_dimension` still carries the six old slugs, 12 rows each (72
    total) — as expected.
  - `score_breakdowns` has 108 `breakdown_type='oqi'` rows (18 per old slug)
    awaiting relabel.
  - **Migration 004 was never run against live** — Q001/Q009/Q045 still show the
    pre-rewrite text. 004 must be applied before (or together with) 005.
- 2026-07-18 — **Blocker:** the migration can't be executed from this machine.
  No `psql`, no supabase CLI, and no Postgres password in any env file (only the
  PostgREST service-role key, which can't run DDL — and the check constraint
  blocks a REST-only relabel of `questions`). Action for Bri: open the Supabase
  dashboard → SQL editor and run, in order,
  `supabase/migrations/004_rewrite_mode_b_questions.sql` then
  `supabase/migrations/005_relabel_oqi_dimensions.sql`.
- 2026-07-18 — **Deploy-order warning:** the updated `scoring.ts` keys
  `OQI_WEIGHTS` by the new slugs, so deploying it before 005 runs would make
  Mode B dimension groups come up empty at scoring time. Do not
  `npx vercel --prod` until the migration has been applied. (Committing/pushing
  is safe — git push does not deploy.)
- Follow-up noted: `seed-questions.sql` still inserts old slugs; a fresh DB
  bootstrapped from the updated `schema.sql` + old seeds would violate the new
  check constraint. Fine as long as fresh DBs replay migrations in order, but
  worth a cleanup task if we ever re-seed from scratch.
- 2026-07-19 — **Migrations applied to live.** Direct SQL was permission-blocked
  for the agent, so it prepared a transactional Node runner
  (scratchpad `run-migrations.mjs`, `pg` client, connection string read locally
  from `.env.local`) and Bri executed it. Two wrinkles hit on the way: the
  direct `db.<ref>.supabase.co` host is IPv6-only (ENOTFOUND locally — script
  auto-derives Session-pooler candidates instead; landed on `aws-1-us-east-2`),
  and the first draft guessed a `value` column in `score_breakdowns` (actual:
  `weight` + `normalized_score`; failed safely in the read-only preflight).
  **This also applied migration 004** (question rewrite), which the 2026-07-18
  check had found was never run — unblocking the verify task's remaining items.
- 2026-07-19 — **Exit checks all green**, from the runner and re-confirmed
  independently via REST: questions 12×each of DO/IE/SC/EC/OA/CT (old slugs
  gone); Q001/Q009/Q045 render 004's text; check constraint live with the new
  slug set; 148 `score_breakdowns` rows with **zero** id/weight/normalized_score
  changes and all 108 oqi labels correctly CASE-mapped; `assessment_sessions`
  byte-identical pre/post. Admin render check via HTTP wasn't possible
  (ADMIN_PASSWORD env holds a bcrypt hash, so the agent can't log in) — DB
  labels exactly match the page's `OQI_DIMENSION_NAMES` keys, so risk is nil;
  Bri eyeballs it on next admin visit.
- 2026-07-19 — **Deploy required:** prod still runs pre-relabel code whose
  `OQI_WEIGHTS` keys are the old slugs; a Mode B assessment submitted on prod
  before the next deploy would compute an empty dimension breakdown. Deploy
  `main` via `npx vercel --prod` (with Bri's OK) promptly.
