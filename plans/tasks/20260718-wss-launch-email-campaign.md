# WSS launch email campaign for the Ownership Assessment

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Write the email campaign (copy + sequence + send plan) that Workman Success
Systems sends from **their** email system to **their** list, driving real estate
team leaders to take the assessment — with the goal of landing **5–10 founding
"done-with-you" cohort participants** via the existing results-page booking call.

## Decisions (agreed 2026-07-18)

- **Scope: campaign content only.** No app code changes in this task. Consent
  opt-ins, HubSpot follow-up automation, and the pilot-offer page are explicitly
  out of scope (see follow-ups).
- **Sender:** WSS sends to their own list from their own platform. Their list has
  WSS's consent; unsubscribe/CAN-SPAM footer is handled by their system. Contacts
  only enter the VAI HubSpot after they take the assessment and submit an email.
- **Conversion moment:** the existing results-page booking CTA (Google Calendar
  consultation). The done-with-you pilot is pitched **live on the call**, not
  sold in the email. Emails sell one thing: take the free assessment.
- **Pilot framing:** discounted **founding cohort** beta — cap at ~10, charge a
  meaningful-but-reduced price (free pilots flake; payment = commitment), in
  exchange for explicit feedback on the questions and workload. Framed honestly
  as "you're shaping the program." Pitch guidance lives in the deliverable doc.

## Methods / background

- Deliverable: [docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)
  — hand this doc to WSS's marketing person as-is.
- Ladder to master plan: this is the funnel/prospect side ("arrives via
  marketing, takes the assessment cold") feeding the coaching-tool vision — the
  5–10 cohort members become the first real coaching clients and validate the
  question bank and workload.
- Voice source: the assessment landing page (`src/app/assessment/page.tsx`) —
  "ownership debt", "a clear picture of where your business depends on you",
  "your single highest-leverage move." ~15 minutes to complete (adaptive — the
  more delegated the respondent, the longer their version; see the timing note
  in the deliverable).
- Prod URL today: `https://ownership-assessment-delta.vercel.app`; campaign
  will use `https://assessment.vainexus.com` — see the custom-domain flag below.

## Implementation steps

- [x] Interview Bri on scope, sender, conversion, pilot shape (2026-07-18).
- [x] Draft campaign: 3-email sequence, A/B subject lines, send plan, UTM
  scheme, deliverability checklist, cohort pitch notes.
- [ ] Bri reviews/edits copy; confirm from-name and send dates with WSS.
- [x] Corrected time estimate "~8 min" → **"~15 minutes"** across all copy
  (2026-07-20). The assessment is adaptive: fixed sections (A/B/G/H) + workflow
  sections C–F that expand by detected mode (Mode A=5 Q, Mode B=18 Q, Mode C=3 Q
  each). Realistic range ~12–22 min; a fully-delegated team leader (all Mode B)
  answers ~100 questions (~20 min) — the *target buyer gets the longest version*.
  Old "8–10 min" was under-promising and an abandonment risk. No empirical data
  (only quick test sessions exist). Reframed length as a feature ("adapts to your
  business, the more delegated the deeper it goes") + paired with "saved as you
  go." Updated: deliverable emails 1–3 + timing rule, landing page
  `src/app/assessment/page.tsx`, `docs/question-bank-export.md`.
  **Landing-page copy change needs a `vercel --prod` deploy to go live** (Bri's OK).
- [x] Custom domain `assessment.vainexus.com` — live (2026-07-18):
  - [x] Attached to the Vercel project (`vercel domains add`).
  - [x] Bri added the CNAME at GoDaddy (`assessment` →
    `6dda82184fa93192.vercel-dns-017.com`); domain verified.
  - [x] `APP_BASE_URL` → `https://assessment.vainexus.com` (Production +
    Preview) and redeployed (`vercel --prod`). Smoke-tested: new domain serves
    the assessment (200), old `vercel.app` URL still works.
- [ ] WSS loads + sends emails 1–3 per the send plan.
- [ ] Track: sessions started (Supabase), emails captured, calls booked,
  cohort yeses. Target: 5–10 cohort members.

## Flags / risks

- **Custom domain before sending.** `ownership-assessment-delta.vercel.app` in
  a marketing email looks untrustworthy and hurts click-through (and some
  filters score bare `vercel.app` links down). Decided 2026-07-18: use Bri's
  `vainexus.com` → **`assessment.vainexus.com`** (setup steps above). The old
  `vercel.app` URL keeps working, so existing HubSpot results links don't break.
- **Consent gap (deliberate, needs a follow-up).** The email gate today says
  "used only to generate your report" — respondents give **no** marketing/SMS/
  call consent to VAI. Until a consent-capture task ships, VAI can send the
  report/transactional follow-up but should not cold-market, text, or call
  beyond the booking flow they initiate. WSS's own consent covers WSS's sends
  only.

## Out of scope (follow-ups)

- Consent opt-in checkboxes at the email gate + HubSpot consent properties
  (marketing / SMS / calls) — required before VAI runs its own nurture.
- VAI HubSpot follow-up automation (lists, workflows, no-booking nudges).
- Dedicated pilot application page (booking call suffices at this scale).
- 30-day nurture retake (already queued:
  [20260718-30-day-nurture-retake](20260718-30-day-nurture-retake.md)).

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-18 — Scoped with Bri (campaign copy only; WSS sends from their
  system; convert via existing booking call; discounted founding-cohort
  framing). Drafted the full campaign in
  [docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md).
  Awaiting Bri's copy review + WSS coordination.
- 2026-07-18 (later) — Domain decided: `assessment.vainexus.com`. Attached to
  the Vercel project via CLI; DNS verify fails until the CNAME is added at
  GoDaddy (record in the steps above). After DNS resolves: flip `APP_BASE_URL`
  and redeploy.
- 2026-07-18 (later still) — **Domain is live.** Bri added the GoDaddy CNAME;
  `vercel domains verify` passed. Replaced `APP_BASE_URL` for Production +
  Preview (note: the old var spanned both environments, so removing the
  Production scope cleared it entirely — re-added per environment) and
  deployed (`dpl_42SecrCaqm71i7KSR48WaNRV1n3B`). Verified:
  `https://assessment.vainexus.com` → 307 → `/assessment` → 200; old
  `ownership-assessment-delta.vercel.app` still 200 (existing HubSpot links
  intact). New HubSpot `assessment_results_url` values now use the new domain.
  Remaining: copy review + WSS send coordination.
- 2026-07-20 — **Copy rewrite pass to match deployed assessment.** Reconciled all
  three emails against the live results page (`src/app/results/[sessionId]`).
  Fixed the core mismatch: emails promised one "Ownership Assessment Score" + a
  "single highest-leverage move" in the free results, but the deployed product
  delivers **two** scores (Ownership Debt Score teaser → email gate → Delegation
  Readiness Score) and **no** written move/breakdown — the move + 90-day plan
  live on the consultation call. Reframed to diagnosis (free scores) vs.
  prescription (call), corrected score names/plurals in emails 1–3, updated the
  conversion-path row, and added a "What respondents actually get" reference
  block to keep future copy honest. Email 1's angle (the mirror) stands as the
  Day-0 opener. Still awaiting Bri's final copy sign-off + WSS send coordination.
- 2026-07-18 (later) — **Sender split decided:** WSS sends email 1 from their
  platform; emails 2–3 will be sent from **VAI's HubSpot** instead of WSS's
  system (supersedes the "WSS sends all three" decision above). Building those
  drafts via the HubSpot API is a new task:
  [20260718-hubspot-email-drafts](20260718-hubspot-email-drafts.md) — see its
  flags for the audience/consent gaps this split creates.
