# Email-gate consent capture

**Status:** Not started

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

## Progress

- [x] Opt-in mechanism + draft copy decided with Bri (2026-07-18, see
      Decisions)
- [ ] Final wording pass on the disclosure line
- [ ] Migration: `consented_at` field
- [ ] EmailGate disclosure text + captureEmail persistence
- [ ] HubSpot consent property + include in upsert
- [ ] Verify: submission records the timestamp in Supabase + HubSpot; the
      report unlocks exactly as before
