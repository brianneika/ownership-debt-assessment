# Results page: self-heal when scoring fails at submit

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Stop respondents from getting stuck on an infinite "Calculating your scores…"
spinner when scoring fails, by recomputing scores on the results page instead of
relying solely on the one-shot scoring run at submit time.

## Background — the incident (2026-07-22)

Tammie Slay completed the assessment and the results page "just spun and spun" —
she never saw scores.

Root cause: scoring runs synchronously inside `submitAssessment`
([src/app/assessment/actions.ts](../../src/app/assessment/actions.ts)), wrapped in a
`try/catch` that logs the error and redirects to `/results/<id>` regardless. When
`calculateScores` throws, **no `dimension_scores` rows are ever written**. The
results page ([src/app/results/[sessionId]/page.tsx](../../src/app/results/%5BsessionId%5D/page.tsx))
then finds zero score rows and renders `CalculatingPage` — a spinner with a Refresh
button. But refresh only re-queries; it never re-scored. So the failure was
permanent and invisible (error swallowed into server logs).

Scoring code itself hadn't changed since 2026-07-19, so this was not a fresh
regression — it was a latent single-point-of-failure that any transient scoring
error (or bad-data edge case) trips into a dead end.

## Fix shipped

In `results/[sessionId]/page.tsx`:

- Extracted the data load into `loadResults()`; the session query now also selects
  `completed_at`.
- **Self-heal:** if the session is `completed_at` but has no score rows, call
  `calculateScores(sessionId)` (idempotent — delete + insert), then re-query. A
  refresh now recovers the respondent.
- **De-silenced failure:** if the recompute itself throws, log it with the session
  id and render a new `ScoringErrorPage` ("We hit a snag scoring your results" +
  Try again) instead of an infinite spinner.
- Results route is `ƒ` dynamic (Supabase reads), so the heal runs on every request.

Deployed to prod 2026-07-22 (`vercel --prod`, dpl efygj1cg8), verified
assessment.vainexus.com aliases to it.

## Progress

- [x] Diagnose: infinite spinner = swallowed scoring error + no recovery path.
- [x] Add self-heal recompute on the results page.
- [x] Add `ScoringErrorPage` so genuine failures are visible, not a spinner.
- [x] `next build` green; deploy to prod; verify prod alias.
- [ ] Confirm Tammie's results now render (have her refresh her results link).
- [ ] If her recompute still throws, capture the logged error and fix root cause
      (likely a workflow-mode / missing-answer edge case in `calculateScores`).

## Follow-ups (out of scope for the hotfix)

- Consider moving scoring out of the request path (queue / on-demand) so submit
  never depends on it.
- Alert (not just `console.error`) when self-heal fails, so we hear about it
  without a customer reporting a spinner.
