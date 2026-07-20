# Dormant-list reactivation proposal + revenue split (ask to WSS)

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Produce the proposal Brianne (VAI) takes to Verl Workman (CEO, WSS) to run the
existing Ownership Assessment launch sequence against the **dormant, non-buying**
segment of the WSS database as a bounded 1-week test, with a fair revenue split.

## Decisions (agreed 2026-07-20, Bri)

- **Delivery:** Brianne delivers the founding cohort **solo** → justifies a
  **60/40 (VAI/WSS)** split of net revenue.
- **Split is bounded, not perpetual.** The 60/40 applies only to the
  **founding-cohort seats this campaign produces** — the "first X in," sourced
  from the WSS dormant send (attributed by UTM + booking source), up to the
  cohort cap. Once the founding cohort closes, the split ends; seats VAI fills
  from its own traffic are excluded; continuation is renegotiated at day 7.
- **Offer:** the existing **founding done-with-you cohort** (cap ~10, discounted
  founding pricing), pitched **live on the booking call** — never in the email.
  Exact seat price still TBD.
- **Framing:** a **capped 1-week test** — ~100 sends/day (~700 dormant
  contacts), review the numbers together at day 7 before any standing deal.
- **Sweeteners (make it an easy yes for Verl):** WSS keeps **100%** of any
  downstream graduation of a reactivated buyer into WSS core coaching; the WSS
  **list never leaves WSS** (VAI's HubSpot only gets assessment opt-ins).

## Methods / background

- Ladders to the master plan **funnel/prospect side** ("arrives via marketing,
  takes the assessment cold") feeding the coaching-tool vision — same intent as
  [20260718-wss-launch-email-campaign](20260718-wss-launch-email-campaign.md),
  just aimed at the dormant segment with a revenue-share attached.
- **Reuses the existing campaign asset unchanged:**
  [docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)
  (3-email sequence, single CTA, booking-call conversion, UTM scheme).
- Deliverable (the pitch itself):
  [docs/dormant-reactivation-pitch-to-wss.md](../../docs/dormant-reactivation-pitch-to-wss.md)
  — split rationale, guardrails, illustrative math, and a draft note to Verl.
- **Consent is clean here:** WSS sends from WSS's platform to WSS's own dormant
  contacts under WSS's existing consent/unsubscribe. This sidesteps the VAI
  consent gap flagged in the campaign tasks (VAI still only holds gate opt-ins).
- Assessment is live at `assessment.vainexus.com`; funnel + booking are live.

## Implementation steps

- [x] Interview Bri: delivery (solo), offer (founding cohort), framing (1-wk test).
- [x] Draft the pitch deliverable with split rationale, guardrails, draft note.
- [x] Founding-cohort seat price set: **$997/mo × 3 = $2,991/seat** (vs. $1,997/mo
  full rate); math filled in the deliverable.
- [ ] Bri sends / delivers the ask to Verl; record his answer here.
- [ ] If yes: define the dormant segment in WSS's platform, set send dates,
  confirm from-name (Verl) on email 1, wire UTMs, brief on 100/day throttle.
- [ ] Run the week; track sessions started, emails captured, calls booked,
  cohort yeses (see the campaign doc's "What to measure").
- [ ] Day-7 review with Verl: numbers + whether it becomes a standing arrangement.

## Flags / risks

- **Segment definition.** "Dormant / non-buying" must be defined in WSS's
  platform (e.g. no purchase in N months, still subscribed) — WSS owns this.
- **Deliverability on a colder segment.** The 100/day throttle + suppress-on-
  clicks + WSS's authenticated domain are the mitigations; watch bounce/spam
  rates in the first sends.
- **Recurring billing.** Seats bill $997/mo over 3 months, so the split pays out
  monthly as payments collect (and is exposed to month-2/3 churn) — settle per
  collected payment, not as one upfront lump.
- **Attribution for the split.** Need a clean way to tie a cohort sale back to
  this campaign (UTM on the session + booking source) so the 60/40 is
  calculated on the right revenue.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-20 — Scoped with Bri. Decisions: solo delivery → 60/40 VAI/WSS on net
  cohort revenue; founding-cohort offer pitched on the call; 1-week capped test
  at ~100/day; WSS keeps 100% of downstream graduations; list stays WSS's.
  Drafted the pitch in
  [docs/dormant-reactivation-pitch-to-wss.md](../../docs/dormant-reactivation-pitch-to-wss.md),
  reusing the existing campaign sequence unchanged.
- 2026-07-20 (later) — Bri: the split shouldn't be perpetual. Bounded it to the
  **founding-cohort seats this campaign produces** (first X in, WSS-sourced by
  UTM + booking); split ends when the cohort closes. Updated the deliverable +
  decisions. Remaining: Bri sets seat price, then takes the ask to Verl.
