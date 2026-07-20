# Dormant-list reactivation — the ask to WSS

_A proposal Brianne (VAI) takes to Verl Workman (CEO, Workman Success Systems):
run the existing Ownership Assessment launch sequence against the **dormant,
non-buying** slice of the WSS database as a **bounded 1-week test**, split the
revenue it creates, and hand WSS the strategic upside for free._

**Task doc:** [plans/tasks/20260720-dormant-reactivation-proposal.md](../plans/tasks/20260720-dormant-reactivation-proposal.md)
**Campaign asset it uses (unchanged):** [docs/wss-launch-email-campaign.md](wss-launch-email-campaign.md)

---

## The one sentence

> "Let me turn the part of your database that isn't buying anything into revenue
> and warm leads — with a product that's already built, on a one-week test that
> costs you nothing to try."

## Why this is mutual, not a favor

The contacts in question are **dormant — they aren't buying coaching today.**
Their current value to WSS is effectively **$0**. That's the whole hinge:

- **For WSS:** anything this produces is **found money** on write-offs, plus the
  reactivated buyers come *back into WSS's world* — any who later graduate into
  WSS's flagship coaching are **100% WSS's**. WSS also risks nothing on brand or
  deliverability (see guardrails below).
- **For VAI:** a warm-ish audience for the founding cohort without cold-traffic
  ad spend — the instrument is built, the sequence is written, the funnel is
  live at `assessment.vainexus.com`.

## What each side brings

| WSS brings | VAI brings |
| --- | --- |
| The dormant audience (the list stays WSS's) | The built assessment instrument + live funnel |
| Brand trust — Verl's name on email 1 | The offer (founding done-with-you cohort) |
| Sending infra + existing consent/unsubscribe | **Delivery** — Brianne runs the cohort solo |

## The mechanics (nothing new to build)

- Point the **existing 3-email sequence** ([campaign doc](wss-launch-email-campaign.md))
  at the **dormant / non-buyer segment only** — WSS sends from WSS's platform,
  so WSS's existing consent covers it.
- **Throttle ~100 sends/day for one week (~700 contacts)** — this protects
  WSS's sender reputation on a colder segment and gives a clean, low-stakes test
  window.
- Single CTA: take the free assessment → teaser score → email gate → full
  results → **book the consultation call**. The founding cohort is pitched
  **live on the call**, never in the email.
- VAI only ever holds contacts who take the assessment and opt in at the gate —
  **the WSS list itself never leaves WSS.**

## The split

**60 / 40 (VAI / WSS) of net revenue — on the founding-cohort seats this
campaign produces, and only those.** Net = collected payment minus
payment-processing fees.

This is a **bounded, finite deal, not a perpetual revenue share.** It applies to
the **first cohort seats sourced from the WSS dormant send** (the "first X in" —
attributed by UTM + booking source), up to the cohort cap. Once the founding
cohort closes, the split ends. Seats VAI fills from its own traffic aren't part
of it, and any continuation is negotiated fresh at the day-7 review. Downstream
WSS graduations stay 100% WSS regardless (below).

Rationale, so it holds up: WSS contributes the **list + brand**; VAI contributes
the **built product _and_ the delivery labor** (Brianne coaches the cohort
herself). The extra 10 points over a straight 50/50 pays for that fulfillment.
Bounding it to the first cohort keeps it fair both ways — WSS is paid for the
reactivation it enabled, not for VAI's business in perpetuity.

Two things that make this an easy yes for Verl, and cost VAI nothing it was
counting on:

1. **WSS keeps 100%** of any downstream graduation from a reactivated buyer into
   WSS's core/flagship coaching. This test seeds WSS's own pipeline for free.
2. **The list stays WSS's.** VAI's HubSpot only receives assessment opt-ins —
   never a list transfer.

### The math

Founding seat = **$997/month × 3 months = $2,991 per seat** (vs. the $1,997/mo
full rate — a ~50% founding discount). Cap 10 seats. Billed monthly, so the
split pays out as each month's payment collects. The 60/40 applies to
**WSS-sourced first-cohort seats only.**

| WSS-sourced seats filled | Gross (contract value) | VAI (60%) | WSS (40%) |
| --- | --- | --- | --- |
| 5 | $14,955 | $8,973 | $5,982 |
| 8 | $23,928 | $14,357 | $9,571 |
| 10 (cap) | $29,910 | $17,946 | $11,964 |

Net (what's actually split) = collected payment minus processing fees; figures
above are gross contract value. **Plus** whatever those relationships become
inside WSS afterward — downstream graduations into WSS coaching are **100% WSS**.

## Guardrails that de-risk WSS's yes

- **Capped 1-week test**, ~100/day — a clean off-ramp, not an open-ended
  commitment.
- **Deliverability protected** — throttled volume, suppress on clicks (Apple
  Mail inflates opens), WSS's own authenticated sending domain.
- **Brand-safe** — no VAI cold-marketing to WSS contacts; WSS's platform,
  WSS's consent, WSS's unsubscribe footer (CAN-SPAM handled).
- **Measured** — sessions started (Supabase, UTM-attributed), emails captured,
  calls booked, cohort yeses. We review the numbers together at day 7 and decide
  whether it becomes a standing arrangement.

---

## Draft note to Verl (adapt in your own voice)

> Dad —
>
> Quick pitch, and it's a low-risk one.
>
> There's a big chunk of the WSS database that isn't buying coaching — dormant,
> basically worth nothing to us right now. I'd like to wake it up.
>
> I've got the Ownership Assessment fully built and live, and a 3-email sequence
> written and ready. The ask: let me run it against just the non-buyers, one
> week, throttled to about 100 sends a day (~700 people) so it never touches your
> sender reputation. It sends from your platform, your consent, your unsubscribe
> — your list never leaves your hands. All it does is drive people to take the
> free assessment and book a call. I pitch my founding done-with-you cohort on
> the call, and I deliver that coaching myself.
>
> Here's why I think it's genuinely fair both ways: these people are $0 to us
> today, so anything this makes is found money for WSS — and every buyer lands
> back inside your world. **You keep 100% of anyone who later graduates into WSS
> coaching.** On the cohort revenue itself, since I'm bringing the built product
> and doing the delivery, I'd propose **60/40 in VAI's favor** on net — and to be
> clear, that's just on the **founding-cohort seats this send brings in**, not a
> forever cut of my business. Once that first cohort fills, the split's done.
>
> It's a capped one-week test. We look at the numbers together at the end and
> decide if it's worth continuing. Can I run it starting [date]?
>
> — Bri
