# New-lead alert email to Bri (Resend)

**Status:** In progress (2026-11-04): code done; waiting on Resend key in Vercel + deploy

## Objective

Email Bri the moment a lead finishes the assessment, so she can call within 5
minutes (her follow-up rule: every new lead, 9 to 5 Mountain).

## Methods / background

- HubSpot is on the free plan, so it can't send alerts or automated emails for
  contacts created by the API. Ren360 isn't wired in yet (API gated; waiting on
  REN). Decision (Bri, 2026-11-04): leads stay in HubSpot for now, and the app
  sends the alert itself.
- Part of the Meta ads launch: [20261103-hubspot-score-and-ad-source.md](20261103-hubspot-score-and-ad-source.md),
  [20261103-meta-pixel-install.md](20261103-meta-pixel-install.md).
- Out of scope: the follow-up email to the lead (needs vaileverage.com verified
  in Resend first; Ren360 may own it later).

## How it works

- `src/lib/lead-alert.ts`: `sendLeadAlert()` posts to Resend's REST API (no
  SDK). Name, business, email, both scores, UTM source/medium/campaign/content,
  and the admin results link. No-op without `RESEND_API_KEY` / `LEAD_ALERT_TO`;
  errors logged, never thrown; 5 second timeout at each call site.
- Fires once a lead has both an email and scores:
  - Results email gate (`results/[sessionId]/actions.ts`, `captureEmail`).
  - Teaser path, at the end of the assessment (`assessment/actions.ts`,
    `submitAssessment`), since those leads gave their email up front.
- Not at the teaser unlock: that person is about to spend 15 to 20 minutes in
  the assessment, so a call then would interrupt them.
- Sender: `onboarding@resend.dev` until a domain is verified in Resend. That
  sender only delivers to the Resend account owner's email, which is fine for
  an alert to Bri.

## Vercel environment variables (Production)

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend → API Keys → Create (Sending access) |
| `LEAD_ALERT_TO` | the email Bri signed up to Resend with |
| `LEAD_ALERT_FROM` | leave unset for now |

## Progress

- [x] Code written. `tsc --noEmit` clean.
- [x] Offline test of `lead-alert.ts`: no env sends nothing; with env, correct
      sender, recipients, subject, text, escaped HTML; a network error is logged
      and swallowed.
- [ ] Bri adds the env vars in Vercel.
- [ ] Merge + deploy (Bri).
- [ ] Live test: one TEST assessment → alert arrives; delete the TEST contact.
