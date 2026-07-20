# Dormant segment build + marketing heads-up (WSS HubSpot)

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Build the ~700-contact dormant / non-buying send list inside WSS's HubSpot so it
can't cause bounces, unsubscribes, or collide with running campaigns — and notify
the WSS marketing team of the test before it sends.

## Methods / background

- This is the execution side of
  [20260720-dormant-reactivation-proposal](20260720-dormant-reactivation-proposal.md)
  (step: "define the dormant segment in WSS's platform"). The proposal is the
  pitch to Verl; this task is how the list actually gets built and sent safely.
- Reuses the existing 3-email sequence unchanged
  ([docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)).
- **Bri has full admin access to WSS's HubSpot** — she builds and QAs the segment
  herself; no external spec hand-off needed. Admin access is also what lets her do
  the recon (active workflows, client-status property, suppression settings) that
  an outsider would have to guess at.
- Sends from WSS's platform under WSS's consent/unsubscribe — VAI's HubSpot only
  ever receives assessment gate opt-ins. The list never leaves WSS.

## The four-gate segment (build as an Active list, AND filters)

Build/QA on an **Active list**, then snapshot to a **Static list** before sending
so the segment can't drift mid-campaign.

**Gate 1 — emailable (kills bounces + legal risk):**
- Marketing contact status *is* Marketing
- Unsubscribed from all email *is* No
- Marketing email confirmation status *is not* opted out
- Email hard bounce *is* none / bounce reason unknown
- Email address *is known*

**Gate 2 — dormant + non-buying (the target):**
- [real client/customer field — confirm in recon] *is not* active client
  (Lifecycle stage *is not* Customer, or the custom coaching-status property)
- Last deal close date *more than* ~12 months ago (or no won deals)
- Last marketing email open *more than* 90 days ago (dormant)
- **AND** opened ≥1 marketing email ever / spam-report count *is* 0 — proves the
  address is live and once wanted WSS mail. **This pairing is the biggest lever
  against both bounces and unsubscribes.**

**Gate 3 — no overlap with running campaigns:**
- List membership *is not a member of* [each active campaign/workflow list]
- Last marketing email send date *more than* 30 days ago (or unknown)

**Gate 4 — size to ~700:**
- Over 700 → tighten the open window (opened within last 6–9 months) so the group
  skews to the *most* deliverable dormant contacts.
- Under 700 → loosen dormancy (90 → 120 days) *before* touching the engagement
  floor.

## Send-time rules

- Freeze to a **static list** once happy; send from that.
- Pair with the ~100/day throttle: day 1 → most-engaged 100, watch bounce rate.
  **<2% → proceed; higher → stop and diagnose** before releasing the rest.
- Confirm HubSpot auto-suppression of hard bounces + unengaged is on
  (Settings → Marketing → Email) as the safety net.

## Deliverable — marketing heads-up email

Send to WSS marketing before the run. Does two jobs: informs them so nothing's a
surprise, and pulls the two things recon needs (their active-campaign list + the
real client-status property). Draft lives in this task; adapt dates + the
Verl-approval line before sending.

> **Subject:** Heads-up: 1-week dormant-reactivation test running in HubSpot
>
> Hi team — quick heads-up on something I'm running in HubSpot this week so it's
> on your radar and we don't step on each other.
>
> **What it is:** a small, throttled reactivation test against a slice of the
> DORMANT, non-buying database — people who aren't active coaching clients and
> haven't engaged or purchased in a while. It uses our existing 3-email
> Ownership Assessment sequence, sends from our own platform/consent/unsubscribe,
> and Verl's approved it as a one-week test. [adjust if needed]
>
> **Scope + guardrails (built to protect sender reputation):** ~700 contacts,
> throttled to ~100/day over one week; marketing contacts only; hard-bounces and
> unsubscribes excluded; only dormant non-buyers who've opened WSS email before
> (live, warm-ish addresses); day-1 go/no-go on bounce rate before releasing the
> rest.
>
> **Two quick asks so I don't collide with you:**
> 1. Any active campaigns/workflows sending marketing email over
>    [start]–[end]? I'll exclude their audiences so no one gets double-emailed.
> 2. Which property flags an active coaching client/customer? I want my
>    "non-buyer" filter using the right field so it never touches a current client.
>
> Happy to walk anyone through the segment before it sends. Planning to start
> [date] — flag me if that window's bad. Thanks! — Bri

Optional preempt line if marketing is protective of the DB: *"To be clear, the
list never leaves WSS and I'm only excluding people from campaigns, never adding
load — the goal is to turn $0 dormant contacts into warm leads and revenue back
into WSS's world."*

## Flags / risks

- **Marketing-contacts billing.** Pulling non-marketing contacts *into* Marketing
  status can bump WSS's billed-contact tier — an unwanted surprise on Verl's
  invoice. Filter on *already-marketing* contacts and this is sidestepped.
- **Client-status field.** "Non-buyer" is only as good as the property it filters
  on — confirm the real field in recon before trusting the segment.
- **Active-campaign list accuracy.** Gate 3 depends on naming every live workflow;
  a missed one means double-sends. Cross-check Automation → Workflows (Active)
  against marketing's answer.
- **Deliverability on a colder segment** — throttle + engaged-only floor +
  day-1 go/no-go are the mitigations; watch bounce/spam on the first 100.

## Progress

Running log — check things off and note decisions as you go.

- [ ] Recon: list active workflows/campaigns (Automation → Workflows = Active);
      note scheduled sends in the test week; find the real client-status property;
      confirm auto-suppression settings.
- [ ] Send the marketing heads-up email; capture their campaign list + property
      answer back into Gate 2/3.
- [ ] Build the Active list (Gates 1–3); read the count.
- [ ] Trim to ~700 (Gate 4); QA a sample of contacts.
- [ ] Snapshot to a Static list for sending.
- [ ] Day-1 send to top 100; check bounce rate; go/no-go on the rest.
- 2026-07-20 — Task created from the segmentation + marketing-notice work. Bri
  confirmed full admin access to WSS HubSpot, so she builds/QAs it herself.
