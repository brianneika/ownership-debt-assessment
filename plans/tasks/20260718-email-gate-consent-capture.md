# Email-gate consent capture

**Status:** Not started

## Objective

Capture explicit, optional marketing-contact consent at the results email gate
so VAI can legally send its own follow-up email (30-day nurture, future
sequences) to respondents who opt in.

## Methods / background

- Surfaced by the [WSS launch campaign task](20260718-wss-launch-email-campaign.md)
  (its "consent gap" flag): today's gate says the email is "used only to
  generate your report" — respondents grant **no** marketing/SMS/call consent
  to VAI. WSS's list consent covers only WSS's own sends.
- **Why it's in Phase 0 of the [implementation plan](../implementation-plan.md):**
  nurture eligibility starts the day this ships. Every respondent who arrives
  before it — including the entire campaign wave, the biggest pool the funnel
  will see for a while — is permanently ineligible. Ship before send day.
- Landing zones: `EmailGate.tsx` (checkbox UI), `captureEmail` server action
  (persist), a small migration (consent boolean + timestamp on
  `assessment_sessions` — or `respondents` once 2a lands), and a HubSpot
  contact consent property so segmentation works in CRM.
- Guardrails:
  - **Respondent flow is sacred:** the checkbox is optional and unchecked by
    default; declining still unlocks the full report exactly as today.
  - Store *when* consent was given, not just that it was.
  - Checkbox copy needs Bri's (legal-lite) review before ship.

## Progress

- [ ] Bri approves checkbox copy
- [ ] Migration: consent fields
- [ ] EmailGate checkbox + captureEmail persistence
- [ ] HubSpot consent property + include in upsert
- [ ] Verify: opt-in and opt-out paths both unlock the report; consent lands in
      Supabase + HubSpot
