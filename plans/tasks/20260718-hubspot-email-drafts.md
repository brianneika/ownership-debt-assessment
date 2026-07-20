# Create the launch emails as drafts in VAI's HubSpot

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Get the launch-campaign emails from
[docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)
into HubSpot as reviewable drafts via the Marketing Email API — emails 2 and 3
in VAI's HubSpot (email 1 stays a hand-off doc for WSS's own platform).

## Decisions (agreed 2026-07-18)

- **Sender split:** email 1 is sent by **WSS from their platform** to their
  list; emails 2 and 3 are sent from **VAI's HubSpot**. (This supersedes the
  original plan in [20260718-wss-launch-email-campaign](20260718-wss-launch-email-campaign.md),
  which had WSS sending all three.)
- **Build method:** create the drafts programmatically via the HubSpot
  Marketing Email API — no hand-building in the UI. Drafts are reviewed and
  scheduled by a human in HubSpot afterward.
- **Scope: email drafts only.** No A/B test configuration, no lists/segments,
  no scheduling/workflows in this task. Drafts use subject line **A** from the
  campaign doc; the B variant is noted for whoever configures the A/B test
  later.

## Methods / background

- Copy source: [docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)
  (emails 2 and 3, preview text, UTM scheme). Keep: one CTA, button **plus**
  plain-text link, short mobile-first paragraphs.
- Existing HubSpot integration: [src/lib/hubspot.ts](../../src/lib/hubspot.ts)
  uses a private-app token (`HUBSPOT_ACCESS_TOKEN` in `.env.local` / Vercel)
  scoped to **CRM contacts only**. Creating marketing emails needs the
  marketing-email (`content`) scope — Bri must add it to the private app in
  HubSpot (Settings → Integrations → Private Apps) or mint a second token.
  Also verify the Marketing Hub tier includes the marketing emails API.
- API: `POST https://api.hubapi.com/marketing/v3/emails` creates an email in
  `DRAFT` state with subject, preview text (`previewText`), from/reply-to, and
  body content. If the v3 create route fights us on body content, fall back to
  cloning a UI-created shell email and updating its content via the API.
- Build a small idempotent script (e.g. `scripts/create-hubspot-emails.ts`,
  run with `npx tsx`, reading `.env.local`) so the drafts can be recreated or
  updated after copy edits. Never commit the token.

## Implementation steps

- [ ] Bri: add the marketing-email scope to the HubSpot private app (or create
  a dedicated token) and confirm Marketing Hub tier supports the emails API.
- [ ] Adapt emails 2 + 3 copy for a VAI sender: from-name, signature (currently
  signed "Workman Success Systems"), and any co-branding language — Bri
  decides the from-name/framing. HubSpot appends VAI's CAN-SPAM footer +
  unsubscribe automatically.
- [ ] Write `scripts/create-hubspot-emails.ts`: creates emails 2 and 3 as
  drafts (subject A, preview text, mobile-first HTML body, CTA button + plain
  text link, UTM-tagged URLs `utm_content=email2|email3`).
- [ ] Run it; verify both drafts render correctly in HubSpot's preview
  (desktop + mobile) and personalization tokens resolve.
- [ ] Bri reviews drafts in HubSpot; iterate copy via the script if needed.
- [ ] Hand off email 1 (unchanged, WSS-sent) — already fully specified in the
  campaign doc.

## Flags / risks

- **Audience gap (must be resolved before *sending*, not before drafting).**
  The campaign doc targets email 2 at "didn't click email 1" and email 3 at
  "didn't complete the assessment" — both segments live in **WSS's** platform.
  VAI's HubSpot only contains people who took the assessment and submitted an
  email at the gate. So as things stand, VAI cannot reach email 1's
  non-clickers at all. Either (a) WSS shares list + engagement data with VAI —
  a consent transfer that needs explicit legal/consent review — or (b) the
  segments are redefined to what VAI legitimately holds (e.g. captured emails
  who haven't booked a call), with WSS continuing to send to its own
  non-clickers. Decide with WSS before scheduling anything.
- **Consent gap (existing, now sharper).** Assessment respondents consented
  only to receiving their report. Emails from VAI that go beyond
  report/booking follow-up are marketing without consent — the consent-capture
  follow-up task (opt-in at the email gate) is effectively a **prerequisite to
  VAI sending email 2/3** to gate-captured contacts. Drafting is fine;
  sending waits.
- **Deliverability.** VAI's HubSpot has (presumably) never sent marketing
  email: check domain authentication (SPF/DKIM/DMARC for the sending domain)
  before any real send.

## Out of scope (follow-ups)

- A/B subject test setup, lists/suppression segments, scheduling/workflows.
- Consent opt-in checkboxes at the email gate + HubSpot consent properties
  (already flagged in the campaign task).
- Any changes to email 1 or WSS's platform.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-18 — Task defined with Bri: sender split (WSS sends email 1, VAI's
  HubSpot sends emails 2–3), drafts created via API, emails-only scope.
  Flagged the audience/consent gaps that must be resolved before sending.
- 2026-07-20 — Build method changed: instead of the Marketing Email API script,
  Bri is hand-building the drafts in HubSpot's UI (assisted by Claude in
  Chrome). Produced a paste-ready build sheet:
  [docs/hubspot-emails-2-3-paste-ready.md](../../docs/hubspot-emails-2-3-paste-ready.md).
  Sender framing decided: **WSS coach voice** — from-name a real WSS person,
  body signed "Workman Success Systems"; VAI's HubSpot is just the sending tool.
  Tokens converted to HubSpot syntax (`{{ contact.firstname }}` w/ default),
  full UTM strings inlined. The API-script steps above are superseded by the UI
  build; audience/consent/deliverability flags still stand before any send.
