# VAI Meta (Facebook/Instagram) cold-acquisition channel — batch 1

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Stand up VAI's Meta advertising channel from zero and run a small cold-traffic
test that drives real-estate team leaders to the Ownership Debt Assessment — using
interest targeting (Brian Buffini / Tom Ferry / real-estate-coaching audiences) as
the batch-1 lever, while installing the pixel so lookalike audiences become possible
in batch 2.

## Why this ladders up to the master plan

This is the top of the **prospect** funnel in the master plan: "arrives via
marketing, takes the assessment cold, gets a teaser score, trades an email for the
full breakdown, and books a consultation." Today's only cold/warm motion is the
HubSpot email batches to existing/dormant WSS contacts. Those reuse an audience VAI
already owns. Meta is the first channel that brings *net-new strangers* into the
funnel — the growth engine the warm email lists can't be.

## The reality check that shapes this plan

Bri's original idea was "a lookalike audience of Brian Buffini, Tom Ferry, and WSS
clients." Two corrections drive the phasing:

1. **You cannot build a lookalike of someone else's audience.** Meta lookalikes are
   built only from *your own* seed data — a customer list you upload, or your pixel
   traffic/engagers. There is no way to clone Buffini's or Ferry's followers. To
   reach *their* people you use **interest / detailed targeting** (follow/engage
   with those coaches and adjacent real-estate-coaching brands).
2. **VAI is starting from nothing** — no Facebook Page, no Business/ad account, no
   pixel, no uploadable client list yet. So a lookalike is weeks away by definition:
   it needs seed data that only exists *after* the pixel is live and traffic
   accumulates (or after a WSS list is cleared for upload). Batch 1 therefore =
   interest targeting; lookalikes are Phase 2.

Codebase check (2026-07-21): the app has **no pixel and no analytics of any kind**
today (`src/app/layout.tsx` has neither `fbq` nor `gtag`). This is greenfield.

## Guardrail (non-negotiable, from the master plan)

**"The respondent's flow is sacred."** The pixel and any conversion tracking are a
side channel: they load async/non-blocking, and a tracking failure must never delay
or break the assessment or results screens. No pixel call on the critical render
path.

---

## Phase 0 — Foundation (must exist before a single ad runs)

Ops/dashboard work, mostly outside the codebase. Ordering matters because the pixel
ID comes from the ad account.

- [ ] **Facebook Page for VAI (VaiNexus).** Business page, not a personal profile.
      Logo, cover, one-line description, link to assessment.vainexus.com. Decide the
      public brand name/handle (coordinate with `../vai-website` brand story — see
      the sibling-repo memory).
- [ ] **Instagram business account** (optional but cheap to add; Meta serves ads on
      both from one campaign). Can connect later.
- [ ] **Meta Business Manager** (business.facebook.com) — creates the business
      entity that owns the page, ad account, and pixel. Set up billing here.
- [ ] **Ad account** inside Business Manager. Set currency/timezone (US, correct
      TZ) — these are locked after creation.
- [ ] **Payment method** on the ad account.
- [ ] **Meta Pixel (dataset)** — create it in Events Manager; it emits a **Pixel ID**.
      This ID is the dependency the app-code work below needs.

## Phase 1 — Instrument the app (dev task; deploy is CLI-only)

This is real code and probably deserves its own linked task doc when we get here
(pixel install + conversion events is a discrete, testable change). Outline:

- [ ] Add the Meta Pixel base snippet to `src/app/layout.tsx`, loaded via Next's
      `next/script` with `strategy="afterInteractive"` so it never blocks render.
      Pixel ID from an env var (`NEXT_PUBLIC_META_PIXEL_ID`), not hard-coded — set it
      in Vercel env, remember prod deploys are **CLI-only** (`vercel --prod`).
- [ ] Fire standard events at the funnel's real stages so Meta can optimize:
      - `ViewContent` — landing/assessment start
      - `Lead` — email gate submitted (the meaningful conversion)
      - `CompleteRegistration` (or a custom `AssessmentCompleted`) — results reached
      Confirm these against the real flow in `plans/application-flow.md` before wiring.
- [ ] (Recommended, phase-1b) **Conversions API (CAPI)** server-side event for the
      email-gate `Lead`, so tracking survives iOS/ad-blockers. Can follow after the
      browser pixel is verified.
- [ ] Verify with Meta's **Test Events** tool + Pixel Helper that events fire once,
      with no PII leakage in params, and that a blocked pixel doesn't affect the UX.

## Phase 2 — Audiences

- [ ] **Batch-1 targeting = interest / detailed targeting** (no seed data yet):
      - Real-estate + coaching interests: Brian Buffini, Tom Ferry, Ninja Selling,
        Keller Williams, Gary Keller / "The Millionaire Real Estate Agent", eXp,
        Inman, real-estate coaching. (Some named coaches may not be selectable as
        interests — use adjacent brands + behaviors.)
      - Layer: job titles / roles = real estate team leader, broker/owner, team
        owner; US; sensible age band.
      - Consider one broad "advantage" ad set letting Meta find buyers off the
        pixel signal as it warms up.
- [ ] **Seed-data prerequisites for lookalikes (Phase 2b / later):**
      - Let the pixel accumulate (Meta wants ~100+ seed events, ideally
        conversions, before a quality lookalike).
      - **WSS client list** — confirm we have a list *and* a legal basis/consent to
        upload it as a Custom Audience (this was "neither yet"). If cleared, a
        1–3% US lookalike off the client list is likely the single strongest
        audience VAI can build. Treat data-permission as a blocker to resolve, not
        an assumption.

## Phase 3 — Creative & campaign

- [ ] **Objective:** since the pixel is brand-new with no conversion history, batch 1
      realistically optimizes for **Traffic/landing-page views or Leads** and treats
      itself as a *learning* campaign — the goal is to find the winning
      audience+hook, not to scale. Move to conversion optimization once the pixel has
      enough `Lead`/completion events.
- [ ] **Creative:** 2–3 hooks tied to the assessment's promise (the "what it's
      costing you" / ownership-debt angle already tested in the HubSpot emails).
      Static image + one short video if possible. Copy must obey the house style:
      **no em-dashes**, concrete not vague.
- [ ] **Landing:** ads point straight to the assessment start on
      assessment.vainexus.com with UTMs (mirror the email convention, e.g.
      `utm_source=meta&utm_medium=cpc&utm_campaign=cold-batch1&utm_content=<hook>`),
      so results are attributable alongside the email batches.
- [ ] **Budget:** small test, **$5–20/day** (Bri's call). Run 2–3 ad sets
      (interest clusters) against the same creative, or one ad set with 2–3
      creatives — pick one variable to learn per round. Give it ~7 days before
      judging; don't kill ad sets before they leave learning phase.

## Phase 4 — Measure & decide

- [ ] Read results the same way as the warm-email review
      (`20260721-warm-batch1-analytics-review.md`): funnel as numbers (impressions →
      clicks → assessment starts → email leads → completions), CPC, cost-per-lead,
      and which *audience* and which *hook* won.
- [ ] Cross-check Meta's numbers against our own (UTMs → HubSpot / assessment data),
      because Meta over-attributes.
- [ ] Decide batch 2: scale the winning interest audience, and/or graduate to a
      lookalike now that the pixel has seed data.

## Open questions / decisions to lock with Bri

- **Public brand & page name** for VAI on Meta (ties to the vai-website brand work).
- **Who runs the Meta dashboard** day-to-day — Bri, or is there an ads person? (I
  can produce paste-ready screen-by-screen setup steps either way.)
- **WSS client-list permission** — is there a list, and are those contacts under
  terms that allow uploading them to Meta as a Custom Audience?
- **Split the pixel-install into its own dev task?** Recommended — Phase 1 is a
  discrete, deployable code change; the rest is ops/marketing.

## Progress

- [ ] 2026-07-21 — Task drafted after scoping call. Established: greenfield (no page,
      no ad account, no pixel, no uploadable list). Reframed "lookalike of Buffini/
      Ferry" as interest targeting for batch 1, lookalikes deferred to batch 2.
