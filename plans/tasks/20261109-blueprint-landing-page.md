# Blueprint landing page: two ways to start

**Status:** Done 2026-11-09 (follow-up emails are a separate task)

## Objective

Give Meta ad visitors two ways to start at `/blueprint`: take the Ownership Debt assessment now, or download the 90-Day Leverage Blueprint PDF to work through on their own time.

## Methods / background

- Why: about $20 of Meta spend produced zero assessment starts (2026-11-09). The ads keep their current creative ("free Ownership Debt score"), so the page has to deliver the score. It also offers the Blueprint for people who won't spend 15 minutes right now.
- All 5 ads point here: `/blueprint?utm_source=meta&utm_medium=paid&utm_campaign=…&utm_content=…`. `UtmCapture` already stores the tags.
- Path A (assessment): button links to `/assessment`. That flow already fires Lead at the email gate.
- Path B (Blueprint): form with first name, email and phone, all required. On submit:
  1. Fire Meta `Lead` (browser; eventID = lead id).
  2. Save the lead to Supabase (new `blueprint_leads` table) so nothing depends on the email arriving.
  3. Send Brianne a Resend alert: "New Blueprint download: call within 5 minutes," with name, phone, email and the ad source.
  4. Go to `/blueprint/thanks`, which has the instant PDF download.
- PDF: `public/vai-90-day-leverage-blueprint.pdf`, from Brianne's fixed export of 2026-11-09 (~7.5 MB; compress it if quality holds).
- Ren360: no API yet (key requested 2026-11-09), and no Zapier. Brianne adds each lead by hand with the tag "Blueprint Lead". The Call Bridge then calls them, which she wants.
- The PDF isn't emailed to the lead. Resend's shared sender only delivers to the account owner until vaileverage.com is verified. The download on the thanks page is the delivery.
- Follow-up emails (brochure on day 2, assessment invite on day 5) are a separate task, probably a Ren360 Smart Campaign keyed on the tag.
- Booking link: https://cal.com/brianne-ika-zgbp6r/vai-call (matches the PDF).

## Copy (draft for approval)

### `/blueprint`

**Eyebrow:** For real estate team leaders
**H1:** How much of your business still runs through you?
**Sub:** Most team leaders know they're buried. Few know by how much. There are two ways to find out. Pick the one that fits your week.

**Card A**
- Label: The Ownership Debt Assessment
- Heading: Want your score now?
- Body: Answer questions about how your team runs today. You'll see your Ownership Debt score, how ready your business is to delegate, and the area to fix first.
- Meta: About 15 minutes · Free · Results on screen
- Button: Get my score →

**Card B**
- Label: The 90-Day Leverage Blueprint
- Heading: Rather work through it on your own time?
- Body: An 8-page worksheet you fill in with a pen, tonight, this weekend, or between showings. You'll finish with:
  - Your number: the hours a week that still run through you or your admin
  - Every recurring task sorted into Keep, Hand Off, or Automate
  - The first three workflows to hand to a VA
- Meta: Free PDF · About 30 minutes
- Fields: First name · Email · Phone
- Phone helper: Brianne calls everyone who downloads it to hear what you found.
- Button: Get the Blueprint →
- Fine print: Your download starts on the next page. Privacy Policy

**Strip below the cards (one line):** Both are free. Neither one asks for a credit card.

### `/blueprint/thanks`

**H1:** Your Blueprint is ready.
**Button:** Download the Blueprint (PDF)
**Body:** Print it, grab a pen, and start with the Hours Audit on page 2. A guess is fine. A rough number beats no number.

**What happens next**
Brianne will call you soon to hear what you're working on. Rather pick the time?
**Button:** Book your Blueprint Review → (cal.com)
Small: A 15-minute call. Bring whatever you filled in, even one page.

**Secondary card:** Want a number before you start? Take the Ownership Debt assessment. About 15 minutes. → Get my score

### Alert email to Brianne

Subject: `New Blueprint download: {name}`
Body: A new lead just downloaded the Blueprint. Call within 5 minutes. Name, Phone (tap to call), Email, Source, Campaign / ad. Reminder: add them in Ren360 with the tag "Blueprint Lead."

## Progress

- [x] Brianne approves the copy (2026-11-09)
- [x] Supabase `blueprint_leads` migration (Bri ran 009 in SQL Editor, 2026-11-09)
- [x] `/blueprint` page and server action
- [x] `/blueprint/thanks` page and PDF in `public/`
- [x] Blueprint alert email
- [x] Test end to end: Bri's live phone test 2026-11-09. Thanks page, PDF download, alert email with tap-to-call, and a blueprint_leads row with cold1/video2 all worked.
- [x] Deployed with `npx vercel deploy --prod` (a push to main does not auto-deploy). Ads point at /blueprint.
- Follow-up: day-2 brochure and day-5 assessment emails (Ren360 Smart Campaign on the "Blueprint Lead" tag); Ren360 API sync once REN sends the key.
