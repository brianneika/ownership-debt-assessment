# Email-gate consent capture

**Status:** Done (2026-07-19) — live in prod; end-to-end verified (Supabase
`consented_at` + HubSpot `email_consent_date` both recorded on a test
submission, report unlocked as before)

## Objective

Make submitting an email at the results gate grant VAILeverage permission to
email the respondent — stated plainly in disclosure text — so VAI can send its
own follow-up (30-day nurture, future sequences) to everyone captured after
this ships.

## Decisions (agreed 2026-07-18)

- **Mechanism: by-submission disclosure, no checkbox.** Submitting the email
  *is* the opt-in; the text under the field says so. Chosen over pre-checked /
  unchecked checkboxes for zero added friction and a fully emailable list.
  US-audience posture (CAN-SPAM); revisit if VAI ever markets into
  Canada/EU, where implied consent is weaker.
- **Draft copy (Bri approved the shape via mockup; final wording tweak
  welcome):**
  > By submitting, you agree that VAILeverage may email you your results and
  > occasional delegation insights. Unsubscribe anytime.
- **WSS's own campaign sends are separately covered** by WSS's list consent in
  WSS's HubSpot — this task is only about VAI's right to email.

## Methods / background

- Surfaced by the [WSS launch campaign task](20260718-wss-launch-email-campaign.md)
  (its "consent gap" flag): today's gate says the email is "used only to
  generate your report" — that promise must be **replaced** by the disclosure,
  since it contradicts marketing use.
- **Why it's in Phase 0 of the [implementation plan](../implementation-plan.md):**
  eligibility starts the day this ships. Respondents captured *before* it were
  promised report-only use and stay permanently off-limits for marketing —
  including for the 30-day nurture. Ship before campaign send day so the whole
  campaign wave lands under the new terms.
- Landing zones: `EmailGate.tsx` (disclosure text replaces the report-only
  line), `captureEmail` server action + small migration (record
  `consented_at` timestamp — the submission time — on `assessment_sessions`,
  moving to `respondents` once linking lands), and a HubSpot contact consent
  property set in the upsert so segmentation works in CRM.
- Guardrails:
  - **Respondent flow is sacred:** nothing new to click; the gate behaves
    exactly as today.
  - Store *when* consent was granted, not just that it was — the cutover date
    separates emailable from off-limits contacts.

## Implementation notes (2026-07-19)

- **The "report-only" line wasn't at the gate.** "Your answers are private and
  used only to generate your report" lives on the intake form
  (`src/app/assessment/page.tsx`), not `EmailGate.tsx` — the gate itself made
  no promise. Softened the intake line to "Your answers are private — we use
  them to build your personalized report." (keeps the privacy reassurance,
  drops the "only" claim that contradicts emailing results/insights). The
  disclosure was added under the gate's email field as planned.
- Disclosure ships with the draft copy verbatim; Bri can still tweak wording —
  it's one string in `EmailGate.tsx`.
- `captureEmail` stamps `consented_at` (server time, ISO) in the same update as
  `respondent_email`; if that update errors (e.g. deployed before migration 006
  runs), it falls back to saving the email alone — consent capture must never
  cost us the lead.
- HubSpot: new **contact date property `email_consent_date`** (YYYY-MM-DD; the
  exact timestamp of record stays in Supabase). ⚠️ The property must exist in
  the HubSpot portal *before* deploy — an unknown property fails the whole
  upsert (contact wouldn't be created at all).
- Also mirrored `respondent_email` (migration 003) into `supabase/schema.sql` —
  it had been missed there; `consented_at` is mirrored too.
- Verified locally (2026-07-19): build passes; no new lint errors; dev-server
  render shows the disclosure on a real ungated session's gate and the new
  intake copy; read-only prod check confirms `consented_at` not yet in the
  live DB (migration 006 prepared, unapplied).

## Rollout order (Bri)

1. ~~Apply migration 006 in Supabase~~ — done 2026-07-19 (verified read-only:
   column present in live DB).
2. ~~Create the HubSpot contact property~~ — done 2026-07-19 (verified via
   API: `email_consent_date`, type date, Contact information group).
3. ~~Deploy: `npx vercel --prod`~~ — done 2026-07-19; live pages confirmed
   serving the disclosure + new intake copy.
4. ~~Final verify~~ — done 2026-07-19: Bri submitted `test2@example.com` at
   session `741dca88`'s gate on prod; read-only check confirmed
   `consented_at = 2026-07-20T03:28:56Z` in Supabase and
   `email_consent_date = 2026-07-20` on the HubSpot contact; report unlocked
   as before. **Consent-eligibility cutover: gate submissions from
   2026-07-20T03:26Z (deploy time) onward are emailable; earlier ones are
   permanently off-limits.**

## Progress

- [x] Opt-in mechanism + draft copy decided with Bri (2026-07-18, see
      Decisions)
- [x] Final wording pass on the disclosure line (shipped draft copy verbatim;
      still tweakable — single string in `EmailGate.tsx`)
- [x] Migration: `consented_at` field (006 — written, not yet applied)
- [x] EmailGate disclosure text + captureEmail persistence
- [x] HubSpot consent property + include in upsert (code side; portal property
      creation is rollout step 2)
- [x] Verify: submission records the timestamp in Supabase + HubSpot; the
      report unlocks exactly as before (2026-07-19, see rollout step 4)
