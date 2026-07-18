# Architecture diagram & operating workflow doc

**Status:** Done (2026-07-18)

## Objective

Create a reference doc that captures the system architecture (grounded in the
actual codebase) and the operating workflow (how changes move from idea to
`main`), laddering up to the north-star vision in the master plan.

## Methods / background

- Sources: [master-plan.md](../master-plan.md) (vision, principles, roadmap),
  [application-flow.md](../application-flow.md) (respondent journey),
  `src/lib/*` (assessment, scoring, hubspot, auth), `src/proxy.ts`,
  `supabase/schema.sql` + migrations.
- Deliverable lives at [plans/architecture.md](../architecture.md) as a
  longer-lived reference doc, alongside `application-flow.md`.

## Progress

- [x] Read master plan, application flow, and all of `src/lib`, `proxy.ts`,
      schema + migrations.
- [x] Wrote `plans/architecture.md`: current-state architecture diagram
      (mermaid), live-table ER diagram, roadmap→architecture delta table,
      operating-workflow flowchart, guardrails + change-type tables.
- Decisions:
  - Documented the dormant schema tables (`clients`, `respondents`, `reports`,
    `recommendation_templates`, `admin_users`) explicitly as provisioned landing
    zones for the coaching vision — confirmed via grep that no code references
    them yet.
  - Kept the respondent journey detail in `application-flow.md` (linked, not
    duplicated); `architecture.md` covers structure + process instead.
