# WSS Launch Email Campaign — Ownership Assessment

_Deliverable for Workman Success Systems' marketing team. Sent from WSS's email
platform to WSS's list. Goal: drive real estate team leaders to take the free
Ownership Assessment; the done-with-you cohort is pitched on the resulting
consultation call, not in the email._

**Task doc:** [plans/tasks/20260718-wss-launch-email-campaign.md](../plans/tasks/20260718-wss-launch-email-campaign.md)

---

## Campaign at a glance

| | |
| --- | --- |
| Audience | WSS list — real estate team leaders / team owners |
| Sequence | 3 emails over ~9 days |
| Single CTA (all emails) | Take the free Ownership Assessment (~8 minutes) |
| Conversion path | Email → assessment → teaser score → email gate → full results → book consultation call → cohort pitch on the call |
| Goal | 5–10 founding done-with-you cohort members |

**Assessment URL:** **`https://assessment.vainexus.com`** — this is
`{{ASSESSMENT_URL}}` in all links below (live and verified 2026-07-18). Do not
use the raw `ownership-assessment-delta.vercel.app` URL in emails; it depresses
clicks and can hurt spam scoring.

## Send plan

| Email | When | Send to | Angle |
| --- | --- | --- | --- |
| 1 — The mirror | Day 0 (Tue or Wed, 9–11am local) | Full segment | Name the pain, introduce "ownership debt," offer the diagnostic |
| 2 — The symptoms | Day 3–4 | Everyone who didn't **click** email 1 | Concrete self-recognition checklist |
| 3 — The cohort | Day 8–9 | Everyone who hasn't completed the assessment | Honest scarcity: 10 founding spots, hands-on |

Notes:
- Suppress on **clicks**, not opens — Apple Mail Privacy Protection inflates
  opens; clicks are the trustworthy signal.
- **From name:** a real person at WSS ("Verl Workman" or the relevant coach),
  not a bare brand name. Person-from-brand ("Verl at Workman Success") also
  works. Reply-to should be monitored — replies are hot leads at this scale.
- Each email: one CTA, button **plus** a plain text link (some clients strip
  buttons), short paragraphs, mobile-first (most agents read on phones).
- WSS's platform handles unsubscribe link + physical address (CAN-SPAM).

## Link tracking (UTMs)

Tag every link so sessions can be attributed:

```
{{ASSESSMENT_URL}}?utm_source=wss&utm_medium=email&utm_campaign=ownership-assessment-launch&utm_content=email1
```

(`email2` / `email3` for the later sends.)

---

## Email 1 — The mirror (Day 0)

**Subject A/B test:**
- A: `How much of your business still runs through you?`
- B: `{{first_name}}, could your team run a closing without you?`

**Preview text:** `A free 8-minute diagnostic shows you exactly where — and the one move that changes it.`

> {{first_name}},
>
> Here's a question most team leaders can't answer honestly: **if you disappeared
> for two weeks, what would actually break?**
>
> Not "would the team survive" — what specifically would stall? Which listings
> wouldn't launch? Which escalations would sit unanswered? Which deals would
> quietly die because the one person who knows how to unstick them was gone?
>
> We call the gap between "I have a team" and "my business runs without me"
> **ownership debt** — all the decisions, systems, and know-how that still live
> only in your head. Every team carries some. Most leaders have no idea how much.
>
> We built a free assessment that measures it. Ten minutes, eight sections,
> built specifically for real estate team leaders — it walks through how your
> listings launch, how your transactions close, and how your people escalate,
> then shows you:
>
> - **Your Ownership Assessment Score** — a clear picture of exactly where your
>   business depends on you
> - **Your single highest-leverage move** — the one place to start paying the
>   debt down
>
> **[Take the free assessment →]({{ASSESSMENT_URL}}?utm_content=email1)**
>
> It takes about 8 minutes, and your answers save as you go.
>
> — {{sender_name}}
> Workman Success Systems
>
> P.S. There's no pitch inside the assessment — you answer questions, you get
> your score and your breakdown. What you do with it is up to you.

---

## Email 2 — The symptoms (Day 3–4, to non-clickers)

**Subject A/B test:**
- A: `3 signs your team can't run without you`
- B: `The vacation test (most team leaders fail it)`

**Preview text:** `If any of these sound familiar, it's worth 8 minutes to find out how deep it goes.`

> {{first_name}},
>
> Three signs a team still runs through its leader:
>
> **1. The vacation test.** Your last real vacation — did you check your phone
> like it was a listing appointment? If stepping away for a week means deals
> stall, you don't own a business yet. You own a job with staff.
>
> **2. Every escalation lands on you.** Your agents and TCs are capable people,
> but when something goes sideways, the next step is always the same: call you.
> Not because they can't decide — because the authority to decide was never
> actually handed over.
>
> **3. The systems live in your head.** Your listing launch works — when you run
> it. Ask anyone on your team to run it start-to-finish without you and watch
> what happens.
>
> None of these mean you've built something bad. They mean you've built something
> that *depends on you* — and there's a real number for how much.
>
> Our free Ownership Assessment measures it in about 8 minutes and hands you the
> single highest-leverage move to start fixing it.
>
> **[Get your score →]({{ASSESSMENT_URL}}?utm_content=email2)**
>
> — {{sender_name}}
> Workman Success Systems

---

## Email 3 — The cohort (Day 8–9, to non-completers)

**Subject A/B test:**
- A: `We're taking 10 team leaders through this with us`
- B: `Last call — and an offer for the first 10`

**Preview text:** `Take the assessment, then work through your results with us directly — founding cohort, capped at 10.`

> {{first_name}},
>
> One last note about the Ownership Assessment, because there's now a reason to
> do it this week instead of someday.
>
> We're forming a **founding cohort: 10 team leaders** who won't just get their
> score — they'll work through their results with us directly, step by step,
> until the highest-leverage pieces of their business actually run without them.
>
> Because it's the founding group, two things are true:
>
> - **You get it at founding-member pricing** — meaningfully below what this
>   program will cost when it opens up.
> - **You shape it.** We'll be asking what's working and what's not as we go.
>   Your feedback becomes the program.
>
> Getting in is simple: take the assessment, and book the results call you'll be
> offered at the end. We'll walk through your score together and see whether the
> cohort is a fit. No fit, no pitch — the score and your breakdown are yours
> either way.
>
> **[Take the assessment (8 minutes) →]({{ASSESSMENT_URL}}?utm_content=email3)**
>
> When the 10 spots are taken, they're taken.
>
> — {{sender_name}}
> Workman Success Systems

---

## The cohort pitch (for the results call — not for email)

Recommended framing, per best practice for a first cohort:

- **Charge something.** Free pilot participants flake — they skip the work, and
  their feedback is worth less because they have nothing at stake. A meaningful
  but clearly discounted price (e.g. ~50% of the intended full rate) filters for
  commitment while staying an obvious deal.
- **Sell it as a founding cohort, honestly.** "You're in the first group; the
  program is being refined with you" is a *benefit* to the right buyer — more
  access, more influence — and it sets expectations so rough edges build trust
  instead of eroding it.
- **Make the feedback loop explicit.** Part of the deal: they tell you which
  questions/homework land and which don't. That's the whole point of the
  5–10-person cohort — validating the question bank and the workload.
- **Lock in their rate.** Founding members keep founding pricing on anything
  that follows. Costs nothing now; makes the earliest believers permanent.
- **Cap it visibly.** 10 means 10. Real scarcity is the only kind worth using.

## What to measure

| Stage | Where | Healthy signal |
| --- | --- | --- |
| Delivered → clicked | WSS platform | 2–5% click rate on a warm list |
| Clicked → started | Supabase sessions (UTM in referrer) | >50% of clickers start |
| Started → email captured | Supabase / VAI HubSpot contacts | The funnel's key rate |
| Captured → call booked | Google Calendar | The sales signal |
| Call → cohort yes | Manual | 5–10 total yeses = campaign success |

## Compliance notes

- WSS's list, WSS's platform → WSS's existing consent + unsubscribe covers
  these three sends.
- Respondents who submit their email into the assessment have (today) consented
  only to receiving their report — **not** to VAI marketing, texts, or calls.
  Booking-related emails are fine; anything beyond that waits for the
  consent-capture follow-up task.
