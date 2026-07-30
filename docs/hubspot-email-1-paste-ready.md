# HubSpot build sheet — Email 1 A/B test (WSS's HubSpot, WSS voice)

_Paste-ready copy for building the Day-0 launch email as an **A/B test** by hand in
**WSS's** HubSpot Marketing Email editor. This is a full-content A/B (two different
angles, not just a subject swap). Companion to the VAI-side sheet,
[hubspot-emails-2-3-paste-ready.md](./hubspot-emails-2-3-paste-ready.md)._

**This email sends from WSS's platform, not VAI's.** It goes to WSS's own list
(the full launch segment, or the dormant-reactivation segment) under WSS's existing
consent and unsubscribe. VAI's HubSpot only ever receives assessment gate opt-ins.
Emails 2 & 3 are the ones that send from VAI's HubSpot — build those from the
companion sheet.

**Supersedes the old "the mirror" open** from
[wss-launch-email-campaign.md](./wss-launch-email-campaign.md). That single-body,
subject-only draft is retired. The test below is the launch Email 1.

---

## The test

One email, two variants, testing which emotional angle pulls team leaders into the
assessment:

- **Variant A — "The handoff that came back."** Names a scar they've already lived:
  they hired help and ended up doing it themselves anyway. Reframes it as ownership
  debt / readiness, not a hiring failure.
- **Variant B — "What it's costing you."** Names the ongoing physical and emotional
  price of being the only one who can do the work, then reframes it as measurable.

Split 50/50, pick the winner on **assessment starts (link clicks), not opens**
(Apple Mail Privacy Protection inflates opens). Links are tagged per variant
(`utm_content=email1-scar` vs `email1-cost`) so downstream completion is visible per
angle too.

---

## Do this before you send (drafting is fine now)

Because this is WSS→WSS, the VAI consent gap does **not** apply here. What must be
true before the real send:

1. **Audience is defined in WSS's HubSpot.** Either the full launch segment or the
   dormant-reactivation segment (Gates 1–4 in
   [plans/tasks/20260720-dormant-segment-build.md](../plans/tasks/20260720-dormant-segment-build.md)).
   For the dormant send, freeze to a **static list** before sending so it can't drift.
2. **From-name confirmed with WSS** — a real person (Verl), not a bare brand.
3. **Deliverability** — WSS's sending domain is already authenticated
   (SPF/DKIM/DMARC); confirm HubSpot auto-suppression of hard bounces / unengaged
   is on (Settings → Marketing → Email). On the colder dormant segment, honor the
   ~100/day throttle + day-1 bounce-rate go/no-go from the segment-build task.
4. **Winner metric = clicks, not opens.** Set the A/B winner criteria to click-through
   in HubSpot before you schedule.

---

## Settings

| Field | Value |
| --- | --- |
| **Test type** | HubSpot A/B email, **full content** (Variant A vs Variant B below), 50/50 split |
| **Winner metric** | Click-through rate (not open rate) |
| **From name** | A real WSS person — `Verl Workman`, or person-from-brand `Verl at Workman Success`. Bri/WSS confirms. Same for both variants. |
| **From / reply-to address** | A **monitored** WSS inbox — at this scale, replies are hot leads |
| **Send** | Day 0, Tue or Wed, 9–11am recipient-local. Full segment (or frozen dormant static list). |
| **Send frequency / footer** | HubSpot auto-appends WSS's CAN-SPAM footer + unsubscribe — leave it on |
| **First-name token** | Insert HubSpot's **First name** personalization token with a **default value of `there`** so a missing name reads "Hi there," not "Hi ," (used in both bodies) |

**Personalization token:** where the copy shows `{{ contact.firstname }}`, use
HubSpot's *Personalize → Contact → First name* with default `there`. Neither
subject line uses the token, so the subject fields are plain text.

**Formatting:** `**bold**` = bold. `*italic*` = italic. The **[Button: …]** line is
a HubSpot **Button module** (not inline text); the **Plain link** line goes right
under it as normal text, because some clients strip buttons.

---

## Variant A — The handoff that came back

| Field | Value |
| --- | --- |
| **Subject** | `Hired an admin and ended up doing it yourself anyway?` |
| **Preview text** | `It probably wasn't a hiring problem. A free 15-minute diagnostic shows you the real reason the work keeps coming back to you.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1-scar` |

**Body:**

{{ contact.firstname }},

Be honest: have you ever hired someone to take work off your plate, an admin, an assistant, a transaction coordinator, and six months later you were doing most of it yourself again?

Maybe they handed it back one task at a time. Maybe you took it back because explaining it took longer than just doing it. Either way you landed in the same place: *I guess it has to be me.*

Here's what almost nobody tells you. That wasn't a hiring problem. You can't hand off what only lives in your head. The systems, the judgment calls, the "just-know-how-I-like-it," if that never left your brain, no hire on earth was going to carry it.

That gap has a name. We call it **ownership debt**, all the decisions and know-how your business still needs you personally for. And there's a second thing that decides whether your next hire actually sticks: how ready the work is to be owned by someone other than you.

We built a free assessment that measures both. Set aside about 15 minutes. It adapts to how your business actually runs, so the more you've delegated, the deeper it goes. It walks through how your listings launch, how your transactions close, and how your people escalate, then gives you two numbers:

- **Your Ownership Debt Score:** how much your business still depends on you personally across your four core workflows (lower is better)
- **Your Delegation Readiness Score:** how prepared you and your team actually are to carry that ownership if you handed it over

Together they show you why the last handoff came back, and exactly what has to be true for the next one to stick.

**[Button: Take the free assessment →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1-scar`

It takes about 15 minutes, and your answers save as you go, so a refresh or dropped connection won't cost you any progress.

*Verl Workman*
Workman Success Systems

P.S. There's no pitch inside the assessment. You answer the questions, you get your scores. What you do with them is up to you.

---

## Variant B — What it's costing you

| Field | Value |
| --- | --- |
| **Subject** | `You can keep doing it all yourself. Here's what that costs.` |
| **Preview text** | `A free 15-minute diagnostic that gives you two numbers: how much your business still runs through you, and how ready it is to change that.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1-cost` |

**Body:**

{{ contact.firstname }},

You can keep running everything yourself. Plenty of team leaders do. The business still closes, the checks still come, the machine still works.

But you already know what it costs, because you pay it every day.

It's the vacation where you're answering escalations from the pool. The deal that would have quietly died if you'd been unreachable for one afternoon. The 9pm inbox, because you're the only one who can unstick the thing. The quiet math that your business can only ever grow as big as you can personally carry.

That cost isn't just in the P&L. It's in your body, and it's at your dinner table.

Here's the part worth sitting with: this doesn't have to be the price of having a team. The reason it all still runs through you usually isn't effort or talent. It's two things you can actually measure. How much of the business still depends on you personally, and how ready your people are to own the parts you'd hand off.

We built a free assessment that measures both. Set aside about 15 minutes. It adapts to how your business actually runs and walks through how your listings launch, how your transactions close, and how your people escalate, then gives you two numbers:

- **Your Ownership Debt Score:** how much your business still depends on you personally across your four core workflows (lower is better)
- **Your Delegation Readiness Score:** how prepared you and your team actually are to carry that ownership if you handed it over

Together they show you exactly what staying the same is costing you, and the highest-leverage place to start changing it.

**[Button: See what it's costing you →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1-cost`

It takes about 15 minutes, and your answers save as you go, so a refresh or dropped connection won't cost you any progress.

*Verl Workman*
Workman Success Systems

P.S. There's no pitch inside the assessment. You answer the questions, you get your scores. What you do with them is up to you.

---

## Warm / past-client version — welcome-back A/B (560 contacts, list 9253)

The dormant-reactivation segment splits into **cold subscribers** (~192) and **warm
past clients** (~560, list 9253) — see
[plans/tasks/20260720-dormant-reactivation-segment.md](../plans/tasks/20260720-dormant-reactivation-segment.md).

- **Cold (~192):** send **Variants A and B above** unchanged. This is a small list,
  so treat its A/B result as **directional only** — 96/variant is too few to call a
  real winner.
- **Warm past clients (~560):** send the **welcome-back A/B below** — the same
  scar-vs-cost angles, but each opens by acknowledging the prior WSS coaching
  relationship before landing on the identical two-score payoff. This is the larger
  list (280/variant), so it's the better-powered read on the scar-vs-cost question.
  Let it be the tiebreaker if the cold and warm reads disagree.

Links are tagged `utm_content=reactivation-pastclient-scar` vs.
`reactivation-pastclient-cost` so warm completion stays visible separately from the
cold `email1-scar` / `email1-cost` sends.

**This is its own HubSpot A/B email** (separate from the cold Email 1 above), sent to
the frozen static past-client list. Same settings table as above (full-content A/B,
50/50, winner by click-through, from `Verl Workman`, first-name token default
`there`).

> **v2 — shortened for batch 2 (2026-07-21).** Batch 1 (warm cost, single send to
> 92) delivered well (97.78%) and opened well (~30% bot-cleaned, 26 openers) but got
> **0 clicks** — the failure was entirely open→click, with the button buried ~9 blocks
> down a ~280-word body. Both warm variants below are rewritten to **~150 words,
> emotion first, button in the upper half.** Two build settings that go with this:
> **(1) From-name = `Verl Workman`** (batch 1 sent from Brianne but signed Verl — a
> recognition/trust gap; the bodies sign Verl, so match the sender). **(2) CTA label
> standardized to "Get my two scores →" in both variants**, so the A/B tests only the
> emotional angle (scar vs cost), not the button copy. Subjects/preview/5am send left
> unchanged — opens were healthy, so don't touch what's working.

### Warm Variant A — The handoff that came back (welcome-back)

| Field | Value |
| --- | --- |
| **Subject** | `Since we worked together: is it still all landing on you?` |
| **Preview text** | `A free 15-minute diagnostic shows you why the work keeps coming back to you, and what has to change for the next handoff to actually stick.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-scar` |

**Body:**

{{ contact.firstname }},

It's been a while since we worked together at Workman Success, so let me ask you the honest version.

Since then, did the work ever actually leave your plate? Or did it come back? You hired the admin, the assistant, the coordinator, and somehow six months later you were doing most of it yourself again.

And you landed right back in the place you've been circling for years: *I guess it has to be me.*

Here's what I want you to know: that wasn't a hiring failure. You can't hand off what only lives in your head. It comes down to two things you can actually measure.

We built a free assessment that shows you both. About 15 minutes, two numbers:

- **Ownership Debt:** how much of the business still depends on you
- **Delegation Readiness:** how ready your team is to carry it

**[Button: Get my two scores →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-scar`

No pitch inside. You answer, you get your scores.

*Verl Workman*
Workman Success Systems

### Warm Variant B — What it's costing you (welcome-back)

| Field | Value |
| --- | --- |
| **Subject** | `It's been a while. Here's what running it all yourself still costs.` |
| **Preview text** | `A free 15-minute diagnostic that gives you two numbers: how much your business still runs through you, and how ready it is to change that.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-cost` |

**Body:**

{{ contact.firstname }},

It's been a while since we worked together at Workman Success, so let me be straight with you.

You built this business to give you freedom. Lately it feels like it owns you instead.

You're the one answering escalations from the pool on the vacation you swore you'd unplug on. The one still up at 9pm because you're the only one who can unstick the thing. And underneath it, the quiet worry that it'll always be this way, because it only holds together when *you* hold it together.

It doesn't have to stay that way. The reason it all runs through you isn't effort, and it isn't talent. It's two things you can actually measure.

We built a free assessment that shows you both. About 15 minutes, two numbers:

- **Ownership Debt:** how much of the business still depends on you
- **Delegation Readiness:** how ready your team is to carry it

**[Button: Get my two scores →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=reactivation-pastclient-cost`

No pitch inside. You answer, you get your scores.

*Verl Workman*
Workman Success Systems
