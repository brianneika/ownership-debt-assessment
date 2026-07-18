# Fix the OQI dimension label mismatch

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

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

- [ ] Confirm the two naming/weight questions above with Bri.
- [ ] Write `supabase/migrations/005_relabel_oqi_dimensions.sql`: drop/re-add the
      check constraint, CASE-update `questions.oqi_dimension`, CASE-update
      `score_breakdowns.label` where `breakdown_type = 'oqi'`.
- [ ] Update `supabase/schema.sql` to match (it's the canonical schema doc).
- [ ] Update `OqiDimension` + `OQI_WEIGHTS` in `src/lib/scoring.ts`.
- [ ] Add the slug → display-name map to the admin session detail page.
- [ ] Update `docs/question-bank-export.md`; remove the Known Issue section; add
      the prevention note.
- [ ] Run the migration against live Supabase.
- [ ] Verify: `npx tsc --noEmit` + `npm run build`; complete a Mode B assessment
      locally and confirm (a) the admin breakdown shows the new names, (b) the OQI
      and ODS numbers for an existing pre-migration session are byte-identical to
      before (relabel must not move any score).

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
