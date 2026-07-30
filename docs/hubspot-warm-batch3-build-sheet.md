# HubSpot build sheet — Warm batch 3: scar-vs-cost A/B, 5am send

_Screen-by-screen steps for building the next warm past-client send in **WSS's
HubSpot** (portal 6225387). This is the send that fixes what batches 1-2 got
wrong: it restores the 5am recipient-local send and finally runs the scar-vs-cost
A/B (both were cost-only before). Task:
[plans/tasks/20260722-warm-batch3-send-time-and-ab.md](../plans/tasks/20260722-warm-batch3-send-time-and-ab.md)._

**The copy is already written** — use the warm welcome-back variants A and B in
[hubspot-email-1-paste-ready.md](./hubspot-email-1-paste-ready.md) (section "Warm /
past-client version," Warm Variant A = scar, Warm Variant B = cost). Do not rewrite
the bodies. This sheet is the build procedure only.

---

## What batches 1-2 taught us (why this send is built this way)

| | Batch 1 (Test 100) | Batch 2 (101-200) |
| --- | --- | --- |
| Send time | **5am recipient-local** (time-zone send) | **3pm MDT fixed** |
| Open rate (bot-cleaned) | 34.83% | **22.92%** |
| Human clicks | 1 | 0 |
| Unsubscribes | 0 | **5 (5.21%)** |
| Angle | cost only | cost only |

Reads: the open drop tracks the **send-time change**, not the copy (same subject
both times). Clicks are noise at ~22 openers either way. The **unsub spike** is the
real copy signal and it's the cost angle. So batch 3: back to 5am, and finally A/B
the angle so we can see if scar stops the unsubscribes.

---

## Settings (applies to the whole A/B email)

| Field | Value |
| --- | --- |
| **Email type** | HubSpot **A/B email**, full content (Variant A vs B are different bodies + subjects), **50/50 split** |
| **Internal name** | `VAI — Warm Welcome-Back — A/B scar vs cost — Batch 3 (201+)` |
| **Winner metric** | **Click-through rate** (not opens). Set this before scheduling. |
| **From name** | `Verl Workman` (both variants) |
| **From / reply-to** | `brianne@workmansuccess.com` (monitored). Display name is Verl; underlying mailbox is Brianne's — see flag below. |
| **Send time** | **5:00am recipient-local time-zone send** (NOT a fixed clock time). This is the single most important setting on this send. |
| **Suppression** | Exclude batch-1 + batch-2 recipients, the 5 batch-2 unsubscribers, and any bounces. "Don't send to unengaged" **OFF**. |
| **Footer / first-name token** | HubSpot auto-appends CAN-SPAM + unsubscribe (leave on). First-name token default `there`. |

---

## Step 1 — Build the recipient list (contacts 201 onward)

1. In HubSpot go to **CRM → Lists → Create list → Static list**.
2. Name it: `VAI Ownership Assessment — Warm Batch 3 (201+) — 2026-07-22`.
3. Source: filter **"is member of list"** = **9253 "VAI — Send — Warm (Past
   Private Client)"**.
4. Sort by **Create Date ascending** (same ordering batches 1-2 used) and select
   from contact **201 onward**. **Recommended: take everyone from 201 to the end
   of the list (~360 contacts)** as one send — a bigger denominator is the only way
   clicks become meaningful. (Fallback if you want to stay conservative: take just
   201-300.)
5. **Exclude** anyone already sent in batch 1 or batch 2. Easiest: add filters
   **"is NOT member of"** the two prior static lists
   (`… Warm Test 100 …` and `… Warm Batch 2 (101-200) …`).
6. Save as a **static** list so it can't drift before send.

## Step 2 — Suppress unsubs + bounces

1. Confirm the 5 batch-2 unsubscribers are marked unsubscribed in HubSpot (they
   will be auto-suppressed, but verify).
2. Add the batch-1/2 hard bounces to the send's exclusion.
3. In the email's **Recipients** step, set the send-to list (Step 1) and add the
   exclusions. Leave **"Don't send to unengaged contacts" OFF**.

## Step 3 — Create the A/B email

1. **Marketing → Email → Create email → Regular → A/B test.**
2. Internal name: `VAI — Warm Welcome-Back — A/B scar vs cost — Batch 3 (201+)`.
3. Split **50/50**. Winner metric: **Click-through rate**. (If HubSpot asks for a
   test duration before picking a winner, you can skip auto-winner — this is a
   one-shot send to the whole list, so both halves just go.)

### Variant A = scar (Warm Variant A in the copy sheet)
- **Subject:** `Since we worked together: is it still all landing on you?`
- **Preview:** `A free 15-minute diagnostic shows you why the work keeps coming back to you, and what has to change for the next handoff to actually stick.`
- **Body:** paste "Warm Variant A — The handoff that came back (welcome-back)."
- **Button module** "Get my two scores →" + plain link right under it, both →
  `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-scar`

### Variant B = cost (Warm Variant B in the copy sheet)
- **Subject:** `It's been a while. Here's what running it all yourself still costs.`
- **Preview:** `A free 15-minute diagnostic that gives you two numbers: how much your business still runs through you, and how ready it is to change that.`
- **Body:** paste "Warm Variant B — What it's costing you (welcome-back)."
- **Button module** "Get my two scores →" + plain link right under it, both →
  `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-cost`

Both variants: from-name `Verl Workman`, body signed `Verl Workman / Workman
Success Systems`, first-name token default `there`.

## Step 4 — Set the 5am time-zone send

1. In **Send or schedule**, choose **Schedule for later**.
2. Turn ON **Send in each recipient's time zone** (time-zone send).
3. Set the local time to **5:00 AM**. Pick the date (next business morning).
4. Double-check the summary shows a **per-recipient-time-zone** send, not a single
   clock time. This is the fix for batch 2's open drop — do not skip it.

## Step 5 — Verify before scheduling

- [ ] Preview **desktop + mobile** for BOTH variants: button renders, layout clean.
- [ ] `there` first-name fallback shows (preview as a contact with no first name).
- [ ] Each variant's button + plain link resolve to assessment.vainexus.com with
      the **correct per-variant `utm_content`** (scar vs cost — do not mix them up).
- [ ] From-name reads **Verl Workman**; sign-off reads **Verl Workman**.
- [ ] Winner metric = **click-through**, split 50/50.
- [ ] Send = **5am recipient-local time-zone**, not fixed time.
- [ ] Recipient list is the static Batch 3 list, prior batches + unsubs + bounces
      excluded, "don't send to unengaged" OFF.

## Step 6 — After it sends

- Log the two variant email IDs, the list name, and the sent count in the task's
  Progress section.
- Once results land, run the read-only Chrome pull (reuse the prompt in
  [20260721-warm-batch1-analytics-review.md](../plans/tasks/20260721-warm-batch1-analytics-review.md))
  and record open / click / unsub **per variant**, then call scar-vs-cost.

---

## Flags before you send

- **From-address vs display name.** Recipients see `Verl Workman` but the mailbox
  is `brianne@workmansuccess.com` and replies land with Brianne. Fine if intended
  (Brianne monitors replies), but confirm — a warm past client hitting reply
  expects Verl. If you want it fully Verl, switch the from-address to a monitored
  Verl inbox.
- **Even ~180/variant is directional on clicks.** Judge on opens + unsubs + clicks
  together. If the cost variant keeps unsubscribing at ~5%, that's reason to retire
  it regardless of clicks.
- **Consent / deliverability** flags from prior sends still stand for anything
  beyond this warm past-client list.
