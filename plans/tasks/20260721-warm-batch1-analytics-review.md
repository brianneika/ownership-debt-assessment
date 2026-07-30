# Read warm Test-100 batch-1 analytics, then iterate before batch 2

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Use Claude in Chrome (read-only) to pull and interpret the HubSpot
performance data for the first warm send (the Welcome-Back / Cost-angle email
to 92 past clients), diagnose **why nobody clicked**, and turn that into concrete
edits before the next 100 warm past-clients (batch 2) go out.

## Decisions (agreed 2026-07-21)

- **Next 100 = batch 2 of the warm list** — the next 100 contacts from source
  list **9253 "VAI — Send — Warm (Past Private Client)"** (~560 total; batch 1
  took the first 100 by Create Date ascending, so batch 2 is roughly contacts
  101–200). Same warm audience, so batch 1's numbers are a fair read for batch 2.
- **Claude in Chrome is read-only.** It navigates HubSpot, records the numbers,
  and reports an interpretation + recommended edits. **It changes nothing** in
  HubSpot and edits no copy. Bri makes the actual changes. (Consistent with the
  open consent / from-name-vs-signature flags — a human decides.)
- **Judge on all three together** — deliverability, opens, and clicks — as a
  combined funnel health check. But the real question driving this is: *how do we
  get people to actually click?* Batch 1 recorded ~zero clicks.

## The honest statistics caveat (read this before over-reacting)

At **92 recipients**, "no one clicked" is *directionally* concerning but a thin
signal on its own:

- A genuinely good email at ~3% click-through would produce only **2–3 clicks**
  on 92 sends. A run of ordinary bad luck lands at zero without the email being
  broken.
- So the click number alone can't tell us much. The **better-powered signals** at
  n=92 are **opens** (bigger denominator) and **deliverability** (bounces /
  spam / unsubscribes). Weight those.
- The single most valuable thing to confirm first is that **click tracking
  actually worked** — a "0 clicks" reading is also what a broken/untracked link
  looks like. Rule that out before concluding the copy failed.
- Batch 2 roughly doubles the sample (~184–200 sent cumulatively), which gives a
  real read on clicks. Treat batch 1 as a **smoke test + funnel diagnostic**, not
  a verdict on the copy.

## The diagnostic funnel (where does it break?)

Locate the drop, because each drop points to a *different* fix:

| Stage | If this is the problem… | Likely fix for batch 2 |
|---|---|---|
| **Delivered** low / bounces high | list quality or domain auth (SPF/DKIM/DMARC) | clean the list; verify sending-domain auth before batch 2 |
| **Opened** low (bot-cleaned) | subject line, preview text, send time (5am local), or landing in spam/promotions | new subject/preview; revisit 5am; check spam placement |
| **Opened OK but ~0 clicks** | the body / CTA / offer / trust | stronger single CTA, button placement above the fold, reduce friction, fix the from-name (Brianne) vs sign-off (Verl / WSS) mismatch that can read as "who is this?" |
| **Clicks recorded in HubSpot but 0 downstream** | UTM / redirect / landing page broke | fix the link target; test the full click→assessment path |
| **0 clicks AND link looks fine** | genuinely thin engagement (or just small-sample noise) | improve the click path anyway; let batch 2 give a real read |

## Methods / background

- **Batch-1 email performance page:**
  https://app.hubspot.com/email/6225387/details/217591955970/performance
  (WSS portal 6225387, email id 217591955970).
- Batch 1 = single regular email (not the A/B): **VAI — Warm Welcome-Back — Cost
  angle — Test 100**. Cost-angle copy, `utm_content=reactivation-pastclient-cost`,
  button "See what it's costing you →". Sent to **92 of 100** (8 suppressed by
  "don't send to unengaged"). Bot filtering ON, so open/click metrics are
  bot-cleaned. Full record: [20260718-hubspot-email-drafts.md](20260718-hubspot-email-drafts.md)
  (2026-07-21 progress log).
- Copy source for any edits: [docs/hubspot-email-1-paste-ready.md](../../docs/hubspot-email-1-paste-ready.md)
  (warm "welcome back" A/B, scar vs cost).
- **Known open flag from the build:** from-name is **Brianne Ika** but the
  cost-variant body is signed **Verl Workman / Workman Success Systems**. That
  mismatch is a prime click-killer suspect (trust/"who sent this") — call it out
  explicitly in the read.

## Paste-ready prompt for Claude in Chrome (read-only)

> Copy this into the Claude-in-Chrome extension with the HubSpot tab open and
> logged in. It only reads and reports — it must not click anything that changes
> state (no editing, no sending, no list changes).

```
You are reading HubSpot email analytics in read-only mode. Do NOT edit, send,
schedule, clone, or change any setting. Only navigate, read, and report.

1. Go to:
   https://app.hubspot.com/email/6225387/details/217591955970/performance

2. From the Performance tab, record exact numbers and rates for:
   - Sent / Delivered (and delivered rate)
   - Bounces (hard vs soft if shown)
   - Open rate (bot-cleaned) and unique opens
   - Click rate (of delivered) and Click-through rate (of opens / click-to-open)
   - Unique clicks
   - Unsubscribes
   - Spam reports / marked as spam
   Note whether each figure is bot-filtered.

3. Open the "Clicks" / link-activity view (the clickmap or links breakdown).
   Report which link(s) received clicks and how many. Confirm whether the main
   CTA button ("See what it's costing you →") is present as a tracked link at all
   — if there is no tracked CTA link, that is a tracking problem, not a copy
   problem. Flag it.

4. Open a preview of the SENT email (the actual version recipients got). Verify:
   - the CTA button exists and is a real link (report the destination URL),
   - the URL contains utm_content=reactivation-pastclient-cost,
   - the from-name shown, and the name in the sign-off at the bottom of the body.
   Report if the from-name and the sign-off are different people.

5. If HubSpot shows engagement-over-time, note when opens/clicks happened
   relative to the 5:00am local send.

Then report back in this format:
   A) FUNNEL: delivered / opened / clicked as numbers and rates.
   B) WHERE IT BREAKS: which single stage is the weakest, per the numbers.
   C) TRACKING CHECK: did click tracking work (yes/no/uncertain) and why.
   D) FROM/SIGNATURE: what the from-name is vs the sign-off name.
   E) TOP 3 RECOMMENDED EDITS for batch 2, each tied to a number above.
Do not make any changes.
```

## Implementation steps

- [x] Read the batch-1 performance page and capture the funnel report. (Done via
  screenshots + a read-only pass, not the Chrome agent — Chrome wasn't working.
  Numbers logged in Progress 2026-07-21.)
- [x] **Companion downstream check — N/A.** HubSpot logged genuine 0 clicks
  (tracking confirmed working), so there are 0 assessment visits from
  `utm_content=reactivation-pastclient-cost` to check. Nothing downstream to
  reconcile. Skip.
- [x] Failure stage identified: **open→click**. Delivery (97.78%) and opens
  (~30% bot-cleaned, 26 openers) are healthy; 0 of 26 openers clicked. Not a
  subject/preview/send-time problem — a body/CTA/identity problem.
- [x] Batch-2 edit direction decided (pending Bri's confirm on identity + A/B):
  - **Fix the from-name vs sign-off mismatch** — send as **Verl** and sign as
    **Verl** (past private clients know Verl). Highest-conviction fix.
  - **Rework the CTA** — move a clear CTA higher, outcome-specific label
    ("Get my two scores"), button + plain-text link.
  - **Do NOT change** subject, preview, or 5am send — they're working; changing
    them only adds confounds.
  - **Run batch 2 as the two-angle A/B (scar vs cost)** — fix identity + CTA in
    *both* variants, then A/B only the emotional angle, since the angle is exactly
    what's failing.
  - List hygiene: suppress the 2 hard bounces; the "9 not sent" are the
    time-zone-send pending recipients (benign) — let the send finish.
- [ ] Apply the chosen edits to the batch-2 email in HubSpot (Bri), re-verify
  preview desktop+mobile, then schedule batch 2 from list 9253 (contacts
  ~101–200). Consider turning OFF the "don't send to unengaged" suppression to
  actually reach the full 100.
- [ ] Log the batch-1 numbers and the batch-2 changes in the Progress section
  and in the hubspot-email-drafts task.

## Flags / risks

- **Sample is thin but the read is on openers, not sends.** 0 clicks out of **26
  openers** (not 92 sends) — enough to rule out "good email, unlucky" (a 10% CTO
  email lands on exactly 0 only ~6% of the time) and act on the click path, while
  not proving the copy is catastrophic. Batch 2 sharpens it.
- **Tracking confirmed working** — CTA is a tracked anchor to
  `https://assessment.vainexus.com/` with the correct UTMs; "0 clicks" is genuine
  engagement, not instrumentation. Downstream Supabase check therefore N/A (0
  clicks = 0 visits).
- **From-name / signature mismatch** (Brianne vs Verl/WSS) is unresolved from the
  build and is a credible reason a warm recipient hesitates to click. Resolve
  before batch 2.
- **Consent / deliverability** flags from the send still stand for any batch
  beyond this warm past-client list.

## Out of scope (follow-ups)

- Cold-list send and VAI-sent emails 2–3 (separate audiences/tasks).
- Any HubSpot changes made by Claude in Chrome (read-only here by decision).
- Building consent opt-in at the email gate (its own task).

## Progress

- 2026-07-21 — Task defined with Bri after batch 1 (warm cost-angle to 92) came
  back with ~zero clicks. Decided: batch 2 = next 100 warm past-clients; Claude in
  Chrome is read-only (report, don't change); judge on all three metrics with the
  driving question being how to earn clicks. Wrote the read-only Claude-in-Chrome
  prompt and the diagnostic funnel. Flagged the from-name/signature mismatch as
  the top click-killer suspect.
- 2026-07-21 — **Batch-1 numbers read** (via screenshots; Chrome agent wasn't
  working). Still a time-zone send in Processing, so figures may tick up.
  - Sent 90 · Delivered 88 (**97.78%**) · Not-sent-yet 9 (time-zone pending).
  - Bounces 2 (**2.22%**, both hard / "unknown user": forsalebyjeff.net,
    powerhouserealtypei.com). 0 soft.
  - **Open rate 29.55% bot-cleaned** (45.45% incl. bots) · 26 unique openers ·
    37 total opens.
  - **Clicks 0** · CTR 0% · click-to-open 0%. Unsubscribes 0 · Spam 0 · Replies 0.
  - **Tracking confirmed working** (CTA is a tracked anchor to
    assessment.vainexus.com with correct UTMs incl. `utm_content=
    reactivation-pastclient-cost`); the 0 is genuine, not instrumentation.
  - **From/sign-off mismatch confirmed:** from-name **Brianne Ika**, body signed
    **Verl Workman / WSS**.
  - **Diagnosis:** funnel breaks entirely at **open→click**. Delivery + opens
    healthy; 26 opened, 0 clicked. It's a body/CTA/identity problem, not a
    subject/preview/send-time problem.
  - **Batch-2 plan:** send + sign as Verl; CTA higher + outcome-specific
    ("Get my two scores") + plain-text link; keep subject/preview/5am; run as the
    scar-vs-cost A/B with identity+CTA fixed in both variants; suppress the 2 hard
    bounces. Awaiting Bri's confirm on the Verl identity call and A/B-for-batch-2.
- 2026-07-21 — **Copy diagnosis refined with Bri: the body was too long** and the
  CTA buried. Rewrote both warm welcome-back variants in
  [docs/hubspot-email-1-paste-ready.md](../../docs/hubspot-email-1-paste-ready.md)
  to **~150 words (from ~280), emotion-first, button in the upper half**, CTA label
  standardized to "Get my two scores →" so the A/B tests only the angle. Kept
  subjects/preview/5am (opens were healthy). Bri approved the shortened cost body;
  scar mirrored to match. Build settings noted in the sheet: from-name = Verl,
  suppress the 2 hard bounces. Still open: confirm A/B vs single for batch 2.
