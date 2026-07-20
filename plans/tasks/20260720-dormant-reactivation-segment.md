# Dormant Non-Buying Reactivation — HubSpot segment build

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Build a HubSpot active list ("Dormant Non-Buying Reactivation — Active
(Build)") of WSS contacts who are dormant, not currently paying clients, and
plausible fits for the ownership-assessment CTA — to use as an additional
send segment alongside the cold "full segment" list in
[docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md).

## Methods / background

- This is a HubSpot-side list build (no app code involved) but feeds directly
  into the launch campaign's audience, so it's tracked here rather than left
  as chat history.
- Sits on **WSS's own HubSpot list**, under WSS's existing consent — distinct
  from the VAI HubSpot drafts work in
  [20260718-hubspot-email-drafts](20260718-hubspot-email-drafts.md).
- I (assistant) have no direct HubSpot access this session — all counts and
  property checks below come from Bri running them in the portal. Advisory
  only until confirmed.

## Current filter spec

**Gate 1 — Emailable** (settled, no changes):
- Marketing contact status is Marketing contact
- Email hard bounce reason is unknown
- Unsubscribed from all email is not True (incl. empty)
- Email is known
- Email doesn't contain role-based prefixes (`info@`, `admin@`, etc.)

**Gate 2 — Dormant + non-buying + not a current client** (settled logic, floor is the sizing lever):
- Lifecycle stage is none of Customer (incl. empty)
- Last marketing email open date is more than **90 days** ago (sizing lever — see below)
- Internal Lifecycle Stage is none of **"Private Coaching / Signer"** — sourced
  directly from this custom property rather than proxied through Deals or
  Lifecycle Stage; dropped the pool from 4,953 → 2,133, confirming a lot of
  "dormant-looking" contacts were actually active Signers on service mail.
- Churn-recency ("no purchase in 12–18mo") dropped: no stage-change date field
  exists on Internal Lifecycle Stage (only on the standard Lifecycle Stage
  pipeline). Carried instead by Gates 2/3's existing recency filters.

**Gate 3 — Not mid-campaign / no double-tap** (BLOCKED):
- Last marketing email send date is more than 30 days ago (settled)
- List membership → is not a member of [active nurture/workflow lists] —
  **blocked on Bri naming the currently-live nurture/campaign lists** so they
  can be added as exclusions. Nothing freezes until this is filled in.

**Gate 4 — Engagement ceiling** (sizing lever):
- Last marketing email open date within the last N months. Measured:
  6mo=49, 9mo=86, 12mo=145. All far short of the original ~700 target.
- **Recommendation (2026-07-20): don't force 700.** The real dormant-but-still-somewhat-engaged
  population tops out at 145; going wider than 12 months starts pulling in
  2+ year stale opens, which is the deliverability risk this gate exists to
  avoid. Proposed: run 145 as a single send-day test; treat a wider "ever
  opened, no ceiling" pool (~2,133) as a separate, more cautious second-wave
  list later.
- If Bri still wants ~700: widen in this order (smaller quality cost first) —
  (1) lower Gate 2's floor from 90 to 60, then 45 days, keeping the 12-month
  ceiling; (2) only if still short, step the ceiling out past 12 months
  (15mo, 18mo) and re-check counts at each step. Stop at whichever step first
  clears ~700 rather than overshooting.

**Gate 5 — Persona/ICP fit** (NEW, not yet built — blocked):
- Nothing in Gates 1–4 confirms these contacts are actually **team
  leaders/owners** — the assessment's actual audience per the campaign doc.
  Dormancy/non-buying filters predict "safe and plausibly interested in WSS
  content," not "has a team to run."
- **Blocked on Bri confirming** whether WSS's portal has a job-title, role,
  or team-size property to filter on (e.g., title contains "team lead" /
  "owner" / "broker-owner", or an explicit team-size field). If none exists,
  accept the gap and rely on the email copy's self-selection — a non-team-leader
  bounces off "could your team run a closing without you" cheaply — but note
  the limitation on the read of this cohort's results.

**Segmentation split (messaging, not a filter — apply after the list is built):**
- **Past clients** (Internal Lifecycle Stage = any "Past Private Client (...)"
  value): already know WSS and the coaching framework — give them a
  "welcome back" opener that acknowledges the prior relationship instead of
  the cold "the mirror" open.
- **Never-bought dormant subscribers**: genuinely cold — the existing email 1
  copy in the campaign doc is built for exactly this case, no change needed.

**Tracking:** tag this segment's assessment link with its own UTM (e.g.
`utm_content=reactivation`, and ideally `-pastclient` vs. `-cold` variants) so
its completion rate is visible separately from the cold full-segment send in
the campaign doc's measurement table — this is the first real data on whether
"dormant + non-buying" predicts assessment interest at all.

## Implementation steps

- [x] Build Gates 1–2 logic; confirm Internal Lifecycle Stage as the correct
  currently-active-client exclusion (2,133 after exclusion).
- [x] Test Gate 4 sizing at 6/9/12 months (49 / 86 / 145).
- [ ] Bri: name active nurture/campaign lists for Gate 3 exclusion.
- [ ] Bri: confirm whether a role/team-size property exists for Gate 5.
- [ ] Decide final Gate 2/4 combination (145 recommended vs. a wider
  floor+ceiling combo if still targeting ~700) and re-check the count.
- [ ] Split into past-client vs. cold-subscriber sub-segments; draft the
  past-client "welcome back" opener variant.
- [ ] Add reactivation-specific UTM to the assessment link for this segment.
- [ ] Save as active list → convert to static → send, only after Gates 3 and
  5 are resolved (or explicitly accepted as gaps) and Bri gives the go-ahead.

## Flags / risks

- **Don't inflate to 700 by trading away the engagement ceiling** — the
  deliverability risk lands on every future WSS send, not just this one.
- **Persona gap**: sending to non-team-leaders wastes sends and muddies the
  read on whether this list-building approach (dormancy + non-buying) is a
  good predictor of assessment interest — worth closing before a full send
  even if it delays things slightly.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-20 — Built Gates 1–2, tested Gate 4 sizing options with Bri.
  Recommended Internal Lifecycle Stage over Deals for the current-client
  exclusion (Bri's correction). Recommended accepting ~145 over
  engineering to 700; gave the floor-then-ceiling widening order if Bri
  wants to push for a larger count anyway. Flagged the missing persona/ICP
  filter (Gate 5) and the past-client vs. cold-subscriber messaging split.
  Still blocked on: Gate 3 active-nurture-list names, Gate 5 property
  existence, final sizing decision.
