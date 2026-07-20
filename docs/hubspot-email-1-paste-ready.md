# HubSpot build sheet — Email 1 (WSS's HubSpot, WSS voice)

_Paste-ready copy for building the Day-0 launch draft by hand in **WSS's** HubSpot
Marketing Email editor. Source copy:
[wss-launch-email-campaign.md](./wss-launch-email-campaign.md) (Email 1 — "The mirror").
Companion to the VAI-side sheet, [hubspot-emails-2-3-paste-ready.md](./hubspot-emails-2-3-paste-ready.md)._

**This email sends from WSS's platform, not VAI's.** It goes to WSS's own list
(the full launch segment, or the dormant-reactivation segment — same copy) under
WSS's existing consent and unsubscribe. VAI's HubSpot only ever receives
assessment gate opt-ins. Emails 2 & 3 are the ones that send from VAI's HubSpot —
build those from the companion sheet.

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
4. **Suppress on clicks, not opens** for the follow-up sends (Apple Mail Privacy
   Protection inflates opens) — set this up when you schedule email 2.

---

## Settings

| Field | Value |
| --- | --- |
| **From name** | A real WSS person — `Verl Workman`, or person-from-brand `Verl at Workman Success`. Bri/WSS confirms. |
| **From / reply-to address** | A **monitored** WSS inbox — at this scale, replies are hot leads |
| **Send** | Day 0, Tue or Wed, 9–11am recipient-local. Full segment (or frozen dormant static list). |
| **Send frequency / footer** | HubSpot auto-appends WSS's CAN-SPAM footer + unsubscribe — leave it on |
| **First-name token** | Insert HubSpot's **First name** personalization token with a **default value of `there`** so a missing name reads "Hi there," not "Hi ," |

**Personalization token:** where the copy below shows `{{ contact.firstname }}`,
use HubSpot's *Personalize → Contact → First name* with default `there`. Note
Subject **B** also uses the first-name token — same setup in the subject field.

**A/B note:** build with **Subject A** as the default; Subject B is provided for
the A/B test if WSS wants to run one.

**Formatting:** `**bold**` = bold. `*italic*` = italic. The **[Button: …]** line
is a HubSpot **Button module** (not inline text); the **Plain link** line goes
right under it as normal text, because some clients strip buttons.

---

## Email 1 — The mirror (Day 0)

| Field | Value |
| --- | --- |
| **Subject (A)** | `How much of your business still runs through you?` |
| **Subject B** (for A/B) | `{{ contact.firstname }}, could your team run a closing without you?` |
| **Preview text** | `A free 15-minute diagnostic that adapts to your business and gives you two numbers: how much it depends on you, and how ready you are to change that.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1` |

**Body:**

{{ contact.firstname }},

Here's a question most team leaders can't answer honestly: **if you disappeared for two weeks, what would actually break?**

Not "would the team survive" — what specifically would stall? Which listings wouldn't launch? Which escalations would sit unanswered? Which deals would quietly die because the one person who knows how to unstick them was gone?

We call the gap between "I have a team" and "my business runs without me" **ownership debt** — all the decisions, systems, and know-how that still live only in your head. Every team carries some. Most leaders have no idea how much.

We built a free assessment that measures it. Set aside about 15 minutes — it adapts to how your business actually runs, so the more you've delegated, the deeper it goes. Built specifically for real estate team leaders, it walks through how your listings launch, how your transactions close, and how your people escalate, then gives you two numbers:

- **Your Ownership Debt Score** — how much your business still depends on you personally, across your four core workflows (lower is better)
- **Your Delegation Readiness Score** — how prepared you and your team actually are to carry that ownership if you handed it over

Together they show you exactly where you stand today. From the results page you can book a call to turn those numbers into your single highest-leverage next move — but the scores are yours either way.

**[Button: Take the free assessment →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1`

It takes about 15 minutes, and your answers save as you go — a refresh or dropped connection won't cost you any progress.

— *[WSS sender name]*
Workman Success Systems

P.S. There's no pitch inside the assessment — you answer the questions, you get your scores. What you do with them is up to you.

---

## Dormant-segment variant (past clients)

If this email is going to the **dormant-reactivation** segment, the segment splits
into cold subscribers and past clients (see
[plans/tasks/20260720-dormant-reactivation-segment.md](../plans/tasks/20260720-dormant-reactivation-segment.md)).
The copy above is built for **cold / never-bought** contacts and needs no change.
**Past clients** should get a "welcome back" opener that acknowledges the prior
WSS relationship instead of the cold "the mirror" open — draft that variant
separately and tag its link `utm_content=reactivation-pastclient` (vs.
`-cold`) so completion rates are visible per sub-segment.
