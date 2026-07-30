# Fix the next warm send (batch 3): restore 5am, finally run the scar-vs-cost A/B

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Fix the next warm past-client send (contacts from ~201 onward) so we stop
learning nothing per send: restore the 5:00am recipient-local time-zone send,
build the scar-vs-cost A/B that was decided but never actually created, and send
a big enough batch that clicks finally mean something.

## The diagnosis this fixes (read first)

Batch 2 (101-200, ID 217657232816, sent 2026-07-21 3:00pm MDT) looked worse than
batch 1, but the click number is not the story. What the numbers actually say:

- **Clicks are uninformative at n≈96.** ~22 openers; a genuinely good email at
  ~5% click-to-open produces about **1 click** on 22 openers. Batch 1's "1 click"
  and batch 2's "0 clicks" are statistically identical noise. We have NOT shown
  the copy is broken. We've shown the sample is too small to see through clicks.
- **The trustworthy signal — opens — got worse, and it's the send time, not the
  copy.** Batch 1 went at **5am recipient-local** (time-zone send). Batch 2 went
  at **3pm Mountain, fixed** (afternoon locally, 5pm for East Coast, buried). Same
  subject, preview, audience, copy. Opens fell **34.83% → 22.92%**. Fewer opens
  mechanically caps clicks. This is the likeliest reason batch 2 reads worse.
- **The one real copy signal is the unsubscribe spike: 0% → 5.21%** (5 of 96).
  High for a warm past-client list. The "here's what it still costs you" cost
  framing may read as a scold to people who knew Verl. That is the cost angle
  specifically — exactly what the never-built scar-vs-cost A/B was meant to test.
- **The A/B never got built.** Both sends were cost-only (Chrome confirmed: no
  "scar" email exists in the portal). After ~190 warm sends we still have zero
  read on angle. We keep spending audience without running the experiment.

Net: we've been changing several things at once on tiny batches, so each send
teaches almost nothing. This task stops that.

## Decisions (baked into this plan; confirm the flagged lever)

1. **Restore the 5:00am recipient-local time-zone send.** Non-negotiable. It is
   the biggest lever and it removes the confound that made batch 2 look bad.
2. **Finally build and run the scar-vs-cost A/B.** 50/50 split, winner by
   **clicks** (not opens). Identity + CTA are already fixed in the source copy;
   the A/B tests only the emotional angle. This also directly tests whether the
   softer "scar" angle stops the cost angle's unsubscribes.
3. **Send the remaining warm list as ONE powered batch (recommended).** The rest
   of source list **9253 "VAI — Send — Warm (Past Private Client)"** from ~201
   onward (~360 contacts) as a single A/B send gives ~180/variant — the first
   sample big enough to make clicks meaningful. This supersedes the 100-at-a-time
   drip. **This is the one lever still open:** if Bri wants to stay conservative,
   fall back to the next 100 (202-300), accepting that clicks stay uninformative
   and the test drags across more sends.
4. **Each variant keeps its own angle-matched subject** (scar subject vs cost
   subject, as already written in the build sheet) — this is a full-content angle
   A/B, so the subject is part of the package being tested, not a confound. The
   fix for the batch-2 open drop is the **send time** (5am vs 3pm), not the
   subject; batch 1 and 2 shared the cost subject, so the subject is not implicated
   in the open drop.
5. **Suppress before sending:** the 5 batch-2 unsubscribers and any bounces from
   batches 1-2. Keep "don't send to unengaged" OFF (Bri's earlier call) so the
   full batch actually goes out.

## Methods / background

- Master plan: this ladders up to the warm-reactivation funnel (getting past
  private clients back into the assessment). See [master-plan](../master-plan.md).
- **Copy source (both angles already written, identity + CTA fixed):**
  [docs/hubspot-email-1-paste-ready.md](../../docs/hubspot-email-1-paste-ready.md)
  — warm welcome-back A/B, scar (`utm_content=reactivation-pastclient-scar`) vs
  cost (`utm_content=reactivation-pastclient-cost`), both ~150 words, button
  "Get my two scores →" in the upper half, sent + signed as Verl.
- **Prior sends for comparison:**
  - Batch 1 (Test 100), ID 217591955970 — 5am time-zone send, opens 34.83%,
    1 human click, 0 unsub.
  - Batch 2 (101-200), ID 217657232816 — 3pm MDT fixed send, opens 22.92%,
    0 human clicks, 5 unsub (5.21%).
- **Full analysis + funnel diagnostics:**
  [20260721-warm-batch1-analytics-review.md](20260721-warm-batch1-analytics-review.md).
- WSS HubSpot portal **6225387**. Source list **9253**.
- Identity note (minor, confirm intent): display from-name and sign-off are both
  **Verl Workman** ✓, but the from-address is still **brianne@workmansuccess.com**
  and the send is executed by Brianne's mailbox. Decide whether to move the
  sending mailbox to Verl or keep Brianne's under Verl's display name.

## Implementation steps

- [ ] Bri: confirm the one open lever — send the remaining warm list at once
  (~201-560) vs. just the next 100 (202-300). Default: send the rest at once.
- [ ] Build the batch-3 list from source list 9253: contacts from ~201 onward
  (by Create Date ascending, matching how batches 1-2 were sliced), **excluding**
  the batch-1/2 recipients, the 5 batch-2 unsubscribers, and any bounces.
- [ ] Create the HubSpot **A/B email** (not two separate regular sends): variant A
  = scar copy, variant B = cost copy, from the paste-ready sheet. 50/50, winner by
  clicks. Each variant keeps its angle-matched subject. From-name Verl, sign-off
  Verl. Full screen-by-screen steps in the build sheet:
  [docs/hubspot-warm-batch3-build-sheet.md](../../docs/hubspot-warm-batch3-build-sheet.md).
- [ ] Set the send to **5:00am recipient-local time-zone send** (not a fixed
  clock time). Verify this is actually a time-zone send, not a single MDT time.
- [ ] Verify both variant previews (desktop + mobile): button renders, `there`
  first-name fallback works, CTA points to assessment.vainexus.com with the
  correct per-variant `utm_content` (scar vs cost).
- [ ] Confirm suppression list (unsubs + bounces) is applied and "don't send to
  unengaged" is OFF.
- [ ] Schedule the send. Log the send details here (email IDs, list name, count).
- [ ] After results land: read both variants read-only (reuse the Chrome prompt in
  the batch-1 review task), record the funnel per variant, and finally call the
  scar-vs-cost angle with a sample big enough to matter.

## Flags / risks

- **Even ~180/variant is only a directional click read.** It's a real improvement
  over 22 openers, but a scar-vs-cost call from one send is still provisional.
  Judge on opens + unsubs + clicks together, not clicks alone.
- **Unsubscribe burn.** If the cost variant keeps unsubscribing warm clients at
  ~5%, that's a reason to retire it regardless of clicks. Watch unsub-per-variant
  as closely as clicks.
- **Consent / deliverability** flags from prior sends still stand for anything
  beyond this warm past-client list.
- **From-address vs display name** unresolved (see Methods). Decide before send.

## Out of scope (follow-ups)

- Cold-list send and VAI-sent emails 2-3 (separate audiences/tasks).
- Any subject-line test (deliberately held constant here to keep the angle A/B
  clean; revisit as its own test once send time is restored).
- Consent opt-in at the email gate (its own task).

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-22 — Task defined with Bri after the batch-2 (101-200) read came back.
  Key finding: batch 2 was NOT the planned A/B — it was another cost-only send,
  fired at 3pm MDT fixed instead of 5am local. Opens fell 34.83% → 22.92%
  (send-time confound), unsubs rose 0 → 5.21% (cost-framing friction), clicks
  stayed statistical noise at n≈96. Plan: restore 5am time-zone send, finally
  build the scar-vs-cost A/B, and send the remaining warm list as one powered
  batch so clicks become meaningful. Open lever: send the rest at once (~360,
  recommended) vs next 100.
- 2026-07-22 — Built the screen-by-screen HubSpot build sheet:
  [docs/hubspot-warm-batch3-build-sheet.md](../../docs/hubspot-warm-batch3-build-sheet.md).
  Copy was already written (warm scar/cost variants in the email-1 sheet); the
  build sheet is the procedure: list from contact 201+, exclude prior batches +
  unsubs + bounces, A/B email (winner = clicks), 5am recipient-local time-zone
  send, pre-send verification checklist. Corrected an earlier note: each variant
  keeps its own angle-matched subject (full-content A/B), the send-time is what
  fixes opens.
- 2026-07-22 — Decisions confirmed with Bri: scope = full remainder, contacts
  201 → end of list 9253 (~360, ~180/variant); from-name = `Verl Workman` display
  over `brianne@workmansuccess.com`, replies stay with Brianne (no Verl inbox).
  Body copy (warm scar + cost variants) sourced from the email-1 paste-ready sheet.
  Batch-1 exclusion list = `VAI Ownership Assessment — Warm Test 100 — 2026-07-20`.
  TODO at build time (not yet in repo): _Batch 2 static list name_ = **TBD** (pull
  from send email ID 217657232816); _hard-bounce addresses_ = **TBD** (batch 1 on
  domains forsalebyjeff.net + powerhouserealtypei.com, exact emails from send
  217591955970; batch 2 bounces from 217657232816, not yet logged).
- TBD (post-schedule) — Send details: variant A email ID = ____, variant B email
  ID = ____, Batch 3 static list name = ____, sent count = ____.
