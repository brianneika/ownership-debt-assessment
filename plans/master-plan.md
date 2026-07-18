# Master Plan

_Last updated: 2026-07-18_

## Vision

The Ownership Debt Assessment starts life as a lead-gen funnel, but that's the
foundation, not the destination. It is becoming a **client-facing coaching tool**:
something Workman Success coaches and their clients use *during* an engagement — a
team leader takes the assessment at the start of coaching, retakes it as the work
progresses, and both client and coach watch the Ownership Debt and Delegation
Readiness scores move over time. The assessment stops being a one-shot marketing
touchpoint and becomes the measurement backbone of the coaching relationship.

## Who it's for

**Real estate team leaders** — owners and leaders of real estate teams who are
carrying too much of their business themselves. The question bank speaks their
language (Listing Launch, Transaction Coordinators, buyer/listing workflows). Two
hats, one person:

- **The prospect** — arrives via marketing, takes the assessment cold, gets a
  teaser score, trades an email for the full breakdown, and books a consultation.
  This is today's flow and it keeps working while the product grows.
- **The coaching client** — the same person after they sign. For them the
  assessment becomes a recurring instrument: a baseline, periodic retakes, and
  visible progress. The **coach** is the second audience, looking across their
  clients' results.

## Guiding principles

- **The respondent's flow is sacred.** Integrations (CRM, email, anything
  external) never block or break the assessment/results experience — timeouts and
  swallowed errors on the side channels, never on the critical path.
- **Scores are a measurement instrument — treat them like one.** Score semantics
  never change silently. Renames don't regroup, slugs are never reused with new
  meanings, and any change that could move a number is its own explicitly-scoped
  task. Comparability across time is the whole point of a coaching tool.
- **Questions live in the database; migrations are the change mechanism.** The app
  renders what Supabase holds — copy and scoring changes ship as numbered
  migrations, mirrored in `supabase/schema.sql` and `docs/question-bank-export.md`.
- **Low friction first, identity when it earns its keep.** Prospects take the
  assessment with no account — anonymous until the email gate. Identity beyond
  that gets introduced only where the coaching vision requires it (linking
  sessions for retakes), not as a default gate.
- **Work against a task.** Every non-trivial change starts as a task doc in
  [`tasks/`](tasks/) that ladders up to this plan; the task file, not chat
  history, is the record.

## Current state

The lead-gen funnel works end-to-end (see
[application-flow.md](application-flow.md) for the full flow): intake → branching
sections A–H → scoring → email-gated results → HubSpot contact upsert → booking
CTA (Google Calendar; the sale happens off-platform in the call).

- **Solid:** the assessment flow, mode-based question branching, scoring to
  `dimension_scores`, the email gate, and the fresh HubSpot integration (local
  end-to-end verified; prod env + verify pending).
- **Rough:** CRM delivery is fire-and-forget (an outage silently drops the lead —
  though the email survives in Supabase), email validation is client-side only,
  and the OQI dimension labels don't match what the Mode B questions measure
  (relabel task drafted).
- **Absent (by design, so far):** any notion of a returning respondent. Sessions
  are single-shot; nothing links two sessions by the same person. This is the
  main structural gap between today's app and the coaching-tool vision.

## Roadmap / themes

Roughly in order. Each theme becomes one or more tasks in [`tasks/`](tasks/).

1. **Stabilize what's shipped.** Land the in-flight tasks: HubSpot prod
   verification ([replace-lovable-with-hubspot](tasks/replace-lovable-with-hubspot.md)),
   the end-to-end verify pass
   ([20260717-verify-shipped-assessment-changes](tasks/20260717-verify-shipped-assessment-changes.md)),
   and the OQI dimension relabel
   ([20260717-oqi-dimension-relabel](tasks/20260717-oqi-dimension-relabel.md)) —
   the relabel especially, since honest dimension names are a prerequisite for
   showing clients their breakdown over time.
2. **Retakes & progress.** The core of the vision: let the same team leader take
   the assessment more than once and see the delta. Needs a way to link sessions
   to a person (likely keyed off the captured email at first), a retake entry
   point, and a results view that shows movement per score and per dimension.
3. **Coach-facing views.** Evolve the admin area from an internal inspection tool
   into a surface a coach actually works from: their clients' latest scores,
   per-client history and dimension breakdowns, and trends across retakes.

The funnel side (results emails, booking polish, durable CRM delivery, richer
HubSpot data) stays on the radar as supporting work but is not a driving theme
right now — items graduate from the "rough" list above into tasks as they start
to hurt.

## Out of scope

- **Other industries.** The assessment stays real-estate-specific. No
  genericizing the question bank or copy for other verticals — depth for team
  leaders beats breadth.
