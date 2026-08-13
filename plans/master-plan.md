# Master Plan

_Last updated: 2026-08-13. Rewritten: the 2026-07-19 version framed this app as
a client-facing coaching tool. The coaching offer was removed on 2026-08-04
(removed, not demoted), and VAI's business is the managed-AI-workforce VA
placement described in `vai-va-training/plans/master-plan.md`, which is the
source of truth on the offer. This plan reframes the same product vision around
the business that actually exists. See
[the retirement task](tasks/20260813-retire-coaching-from-assessment-repo.md)
and the corrected [business model doc](../docs/vai-business-model.md)._

## Vision

The Ownership Debt Assessment starts life as a lead-gen funnel, but that's the
foundation, not the destination. It is the **measurement backbone of VAI's
placement business**: a team leader takes the assessment as a prospect, the
results qualify them and pick the first workflow their placed VA attacks, and
retakes after each transferred workflow prove the delta. The assessment stops
being a one-shot marketing touchpoint and becomes the instrument that makes
"we measured the before and after, in writing" true, which is the claim nobody
else in the category can make.

Four jobs, in the order a client meets them:

1. **Lead generation**: the free teaser score plus the email gate.
2. **Qualification**: the score is the pitch; a low score, or four workflows
   already owned by team members, disqualifies before anything is sold.
3. **The work plan**: results pick the placed VA's first workflow and seed
   their takeover backlog (the 90-day playbook consumes this directly).
4. **The proof**: the day-90 retake delta, per workflow, drives the renewal
   conversation and the company's headline metric.

## Who it's for

**Real estate team leaders**: owners and leaders of real estate teams who are
carrying too much of their business themselves. The question bank speaks their
language (Listing Launch, Transaction Coordinators, buyer/listing workflows).
Two hats, one person:

- **The prospect**: arrives via marketing, takes the assessment cold, gets a
  teaser score, trades an email for the full breakdown, and books a
  consultation. This is today's flow and it keeps working while the product
  grows.
- **The placement client**: the same person after they sign. For them the
  assessment becomes a recurring instrument: their pre-sale assessment is the
  baseline, they retake after each workflow their VA fully absorbs, and the
  movement is visible per workflow and per dimension.

The second audience is **VAI itself** (Brianne today, operations staff later):
working the consultation call from the admin session page, pushing retakes at
each workflow completion, and looking across all clients' results. The placed
VA is a downstream consumer too: reading their client's full results end to end
is a day-1 requirement of the placement playbook
([docs/va-90-day-playbook.md](../docs/va-90-day-playbook.md)).

## Guiding principles

- **The respondent's flow is sacred.** Integrations (CRM, email, anything
  external) never block or break the assessment/results experience; timeouts
  and swallowed errors on the side channels, never on the critical path.
- **Scores are a measurement instrument; treat them like one.** Score semantics
  never change silently. Renames don't regroup, slugs are never reused with new
  meanings, and any change that could move a number is its own explicitly
  scoped task. Comparability across time is the whole point of a proof
  instrument.
- **Questions live in the database; migrations are the change mechanism.** The
  app renders what Supabase holds; copy and scoring changes ship as numbered
  migrations, mirrored in `supabase/schema.sql` and
  `docs/question-bank-export.md`.
- **Low friction first, identity when it earns its keep.** Prospects take the
  assessment with no account, anonymous until the email gate. Identity beyond
  that gets introduced only where the retake vision requires it (linking
  sessions), not as a default gate.
- **Work against a task.** Every non-trivial change starts as a task doc in
  [`tasks/`](tasks/) that ladders up to this plan; the task file, not chat
  history, is the record.

## Current state

The lead-gen funnel works end-to-end (see
[application-flow.md](application-flow.md) for the full flow): intake → branching
sections A–H → scoring → email-gated results → HubSpot contact upsert → booking
CTA (Google Calendar; the sale happens off-platform in the call).

- **Solid:** the assessment flow, mode-based question branching, scoring to
  `dimension_scores`, the email gate, the HubSpot integration, the admin
  session page with the Start Here call-prep panel, and tokenized retake links.
- **Rough:** CRM delivery is fire-and-forget (an outage silently drops the
  lead, though the email survives in Supabase), email validation is client-side
  only, and admin login is a single env-credentialed account.
- **Absent (by design, so far):** the operations layer the placement business
  will need: nothing links a session to a client to a placement, and there is
  no cross-client or cross-VA view. The full specification of what that layer
  becomes lives in the corrected partner overview
  ([docs/vai-executive-overview-platform-partner.md](../docs/vai-executive-overview-platform-partner.md)).

## Roadmap / themes

Roughly in order. Each theme becomes one or more tasks in [`tasks/`](tasks/).
Concrete sequencing, dependencies, and decision gates live in
[implementation-plan.md](implementation-plan.md).

1. **Stabilize what's shipped.** Land the in-flight verification and relabel
   tasks; honest dimension names are a prerequisite for showing clients their
   breakdown over time.
2. **Retakes & progress.** The core of the vision, unchanged in mechanics:
   the pre-sale assessment *is* the baseline (decided 2026-07-18; no fresh
   retake at engagement start); clients retake **after each workflow their VA
   fully absorbs**, pushed by VAI as an emailed tokenized link (no client
   login; email stays the identity key); each retake's results page shows
   movement vs. baseline and last time, leaning on per-workflow ODS so the
   delta is attributable to the workflow just transferred. This is the day-90
   proof event in the placement playbook.
   Task: [20260718-retake-push-and-linking](tasks/20260718-retake-push-and-linking.md).
3. **Operations views.** Evolve the admin area from an internal inspection tool
   into the surface VAI works from: client roster, per-client history and
   dimension breakdowns, trends across retakes, and eventually the
   cross-placement owner dashboard specified in the partner overview (phase
   gates, engagement health, exception flags). Two pieces graduate first
   because the admin page is already the sales call's working surface: a
   master admin who can add user accounts
   ([20260718-admin-user-management](tasks/20260718-admin-user-management.md)),
   and answer-level call-prep insight
   ([20260718-admin-call-prep-insight](tasks/20260718-admin-call-prep-insight.md)).
4. **The revenue ledger.** Bring the dormant `clients` / `respondents` tables
   alive: link session → client → placement → revenue, tagged by source. This
   was B1 in the old business-operations track and survives the coaching
   retirement untouched; without it, commissions and any partner arrangement
   are uncomputable.

The funnel side (results emails, booking polish, durable CRM delivery, richer
HubSpot data) stays on the radar as supporting work; items graduate from the
"rough" list above into tasks as they start to hurt. One funnel item is queued
explicitly: prospects who **don't book** get a 30-day nudge to retake and
compare, especially their Section H urgency answers
([20260718-30-day-nurture-retake](tasks/20260718-30-day-nurture-retake.md));
it reuses the retake-push mechanism, so it sequences after theme 2's core.

## Retired

- **The coaching-tool framing (2026-07-19 version of this doc).** The
  Done-With-You coaching offer, the L1/L2/L3 ladder, and the idea of WSS
  coaches using this instrument are all dead (owner, 2026-08-04). Nothing in
  this repo may present coaching as a current offer, and nothing may imply
  WSS endorses or is involved in VAI. The WSS dormant-reactivation campaign
  docs in `docs/` carry RETIRED banners for the same reason.
- **B2 (coach leverage) and B3 (instrument licensing)** from the
  business-operations track are suspended pending re-scoping against the
  placement business.

## Related projects

- **VAI business master plan** — sibling repo `../../vai-va-training`
  (`plans/master-plan.md`): the source of truth on the offer, pricing, terms,
  and compliance non-negotiables. This repo is the instrument that business
  runs on.
- **VAI website** — sibling repo `../../vai-website`
  ([github.com/brianneika/vai-website](https://github.com/brianneika/vai-website)),
  the marketing front door destined for `vainexus.com` (Wix build). The VAI
  brand story (VAI is the Tongan word for water, and VA + AI in one word) and
  the top-of-funnel strategy live in that repo's `plans/master-plan.md`. This
  repo is the **instrument**; the website is the reason people pick it up.
  Neither repo modifies the other.

## Out of scope

- **Other industries.** The assessment stays real-estate-specific. No
  genericizing the question bank or copy for other verticals; depth for team
  leaders beats breadth.
