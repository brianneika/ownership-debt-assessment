# HubSpot build sheet — Emails 2 & 3 (VAI's HubSpot, WSS voice)

_Paste-ready copy for building the two launch drafts by hand in VAI's HubSpot
Marketing Email editor. Source copy: [wss-launch-email-campaign.md](./wss-launch-email-campaign.md).
Task: [plans/tasks/20260718-hubspot-email-drafts.md](../plans/tasks/20260718-hubspot-email-drafts.md)._

**Email 1 is NOT here** — it sends from WSS's own platform (see the campaign
doc). Only emails 2 and 3 live in VAI's HubSpot.

---

## Do this before you send (drafts are fine now)

These are **drafts only**. Two gates from the task doc must clear before either
one actually sends:

1. **Consent** — assessment respondents opted in only to receive their report.
   Emails 2/3 are marketing; they wait on the consent-capture opt-in.
2. **Audience** — segments ("didn't click," "didn't complete") live in WSS's
   platform, not VAI's HubSpot. Resolve who VAI can legitimately mail before
   scheduling.
3. **Deliverability** — confirm SPF/DKIM/DMARC are set for VAI's sending domain
   before any real send.

---

## Settings that apply to both emails

| Field | Value |
| --- | --- |
| **From name** | A real WSS person (e.g. `Verl at Workman Success`) — not a bare brand name |
| **From / reply-to address** | A **monitored** WSS inbox — at this scale, replies are hot leads |
| **Send frequency / footer** | HubSpot auto-appends VAI's CAN-SPAM footer + unsubscribe — leave it on |
| **First-name token** | Insert HubSpot's **First name** personalization token with a **default value of `there`** so a missing name reads "Hi there," not "Hi ," |

**Personalization token:** where the copy below shows `{{ contact.firstname }}`,
use HubSpot's *Personalize → Contact → First name* and set the default to `there`.

**A/B note (out of scope for these drafts):** build each with **Subject A**.
Subject B is listed for whoever configures the A/B test later.

**Formatting:** `**bold**` = bold. `*italic*` = italic. The **[Button: …]** line
is a HubSpot **Button module** (not inline text); the **Plain link** line goes
right under it as normal text, because some clients strip buttons.

---

## Email 2 — The symptoms

| Field | Value |
| --- | --- |
| **Subject (A)** | `3 signs your team can't run without you` |
| **Subject B** (for later A/B) | `The vacation test (most team leaders fail it)` |
| **Preview text** | `If any of these sound familiar, it's worth 15 minutes to find out how deep it goes.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email2` |

**Body:**

{{ contact.firstname }},

Three signs a team still runs through its leader:

**1. The vacation test.** Your last real vacation — did you check your phone like it was a listing appointment? If stepping away for a week means deals stall, you don't own a business yet. You own a job with staff.

**2. Every escalation lands on you.** Your agents and TCs are capable people, but when something goes sideways, the next step is always the same: call you. Not because they can't decide — because the authority to decide was never actually handed over.

**3. The systems live in your head.** Your listing launch works — when you run it. Ask anyone on your team to run it start-to-finish without you and watch what happens.

None of these mean you've built something bad. They mean you've built something that *depends on you* — and there's a real number for how much.

Our free Ownership Assessment measures it in about 15 minutes and gives you two numbers: your **Ownership Debt Score** — how much still runs through you — and your **Delegation Readiness Score** — how ready your team is to take it off your plate.

**[Button: Get your scores →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email2`

— *[WSS sender name]*
Workman Success Systems

---

## Email 3 — The cohort

| Field | Value |
| --- | --- |
| **Subject (A)** | `We're taking 10 team leaders through this with us` |
| **Subject B** (for later A/B) | `Last call — and an offer for the first 10` |
| **Preview text** | `Take the assessment, then work through your results with us directly — founding cohort, capped at 10.` |
| **Button URL & Plain link** | `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email3` |

**Body:**

{{ contact.firstname }},

One last note about the Ownership Assessment, because there's now a reason to do it this week instead of someday.

We're forming a **founding cohort: 10 team leaders** who won't just get their scores — they'll work through their results with us directly, step by step, until the highest-leverage pieces of their business actually run without them.

Because it's the founding group, two things are true:

- **You get it at founding-member pricing** — meaningfully below what this program will cost when it opens up.
- **You shape it.** We'll be asking what's working and what's not as we go. Your feedback becomes the program.

Getting in is simple: take the assessment, and book the results call you'll be offered at the end. We'll walk through your score together and see whether the cohort is a fit. No fit, no pitch — the score and your breakdown are yours either way.

**[Button: Take the assessment (15 minutes) →]**

Plain link: `https://assessment.vainexus.com?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email3`

When the 10 spots are taken, they're taken.

— *[WSS sender name]*
Workman Success Systems
