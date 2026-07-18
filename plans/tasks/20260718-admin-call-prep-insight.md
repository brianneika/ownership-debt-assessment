# Admin session page: call-prep insight

**Status:** Not started

## Objective

Make the admin session page a real call-prep surface — answer-level detail and
"how we can help" guidance — so the consultation (and later coaching sessions)
can actually move the client forward, not just recite scores.

## Methods / background

- Today: `src/app/admin/sessions/[sessionId]/page.tsx` + `src/lib/admin.ts`
  show scores, breakdowns (`score_breakdowns`), and answers — but per Brianne
  (2026-07-18): "I'm not getting enough information from the assessment to
  really move the client forward or make a difference in their business."
- Landing zones already in the schema: `recommendation_templates` (guidance
  keyed to score bands via `score_bands`) is dormant and purpose-built for the
  "how we can help" half.
- **Interview Brianne before building** — this task's shape depends on what a
  coach actually needs in the call. Probe:
  - Which answers matter most in the call today? (Section H urgency? The
    workflow-ownership answers from Section B? Reverse-scored red flags?)
  - Is "how we can help" static copy per score band, or tailored to the
    combination (e.g. high debt + low readiness ⇒ different play)?
  - What does she wish she knew walking into a call that the page doesn't say?
- Guardrail: display/insight only — no changes to scoring semantics.

## Progress

- [ ] Interview: what does the coach need on screen during the call?
- [ ] Design the insight layout (answers grouped by workflow? flags? bands?)
- [ ] Seed `recommendation_templates` content with Brianne
- [ ] Build
