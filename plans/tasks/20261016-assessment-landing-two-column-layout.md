# Assessment landing page: two-column layout from Bri's mockup

**Status:** In progress (2026-10-16) <!-- Not started | In progress | Blocked | Done -->

## Objective

Rebuild the `/assessment` landing page layout from Bri's mockup so it scans faster and desktop visitors see the start form without scrolling.

## Methods / background

- Bri's spec and mockup, 2026-10-16 (in chat). Follows task B (`20261016-assessment-copy-b-intake-page.md`, Done), which set the copy; this task changes layout and some copy again per the mockup.
- Master plan job 1 (lead generation): the start form is the first conversion point for cold traffic.
- File: `src/app/assessment/page.tsx`. `src/components/BrandWave.tsx` gets an opt-in non-fixed mode so the waves sit at the real bottom of this page; teaser and results keep the fixed wave.
- Keep: brand colors and font (`assessment-theme.css` tokens), real logo `/vai-logo.svg`, name and business-name fields, `createAssessmentSession` action. No new dependencies.

## Spec (from Bri)

- Centered container about 1,100px; logo top left.
- Desktop: two columns, left-aligned messaging on the left, white start card on the right.
- Mobile order: headline, introduction, start card, benefits, workflow details.
- Left: label "THE OWNERSHIP DEBT ASSESSMENT"; H1 "How much of your business still depends on you?"; "You’ve handed off the work. But are you still the person everyone needs to keep it moving?"; "Find out where your business depends on you, and what needs to change before your next handoff." (Bri's text had an em dash; swapped for a comma per the no-em-dash rule.) Three benefits with teal checks: See what still depends on you / Understand how ready your business is for delegation / Identify the gap to address first.
- Card: "Start your assessment", "15–20 minutes · Free", "Your progress saves as you go.", existing fields, button "Start my assessment →", then "You’ll enter your email at the end to view your full results." in readable contrast.
- Below: "BUILT AROUND REAL ESTATE WORK YOU KNOW", "For solo agents and team leaders.", four icons with labels: Listing launch, Seller communication, File opening, Lender tracking.
- Waves at the actual page bottom, not fixed behind scrolling content.

## Progress

- [x] Task doc
- [x] Build the layout and the wave mode (`page.tsx` rewritten; `BrandWave` gains `fixed={false}`, teaser and results unchanged)
- [x] Verified 2026-10-17 on localhost from `~/Code Folder 2.0`: at 1,280 × 720 the start button sits at about y 470, above the fold; at 390 px wide scrollWidth equals viewport width (no overflow) and the mobile order is intro, card, benefits, workflows; waves render at the page bottom. The form still posts to `createAssessmentSession` with `name` and `business_name` required. Not submitted, because local shares the production database. ESLint and `tsc --noEmit` pass.
- [x] Screenshots to Bri (2026-10-17)
- [x] Commit and push (2026-10-17)
- [ ] Deploy (Bri runs `vercel --prod`; Claude's CLI gets "Not authorized"), verify live, set Done

## Status at end of 2026-10-16

- Code written but uncommitted: `src/app/assessment/page.tsx`, `src/components/BrandWave.tsx`.
- Not yet viewed: `next dev` takes many minutes to start because the Desktop syncs to iCloud (164k cloud-only files, about 0.7 s per cold read). Bri is copying both code folders to `~/Code Folder` and `~/Code Folder 2.0` (rsync, skipping node_modules/.next) overnight.
- Next session: confirm the copy finished, `npm install` in the new ownership-assessment folder, run dev there, screenshot 1,280 × 720 and mobile, then commit, push, deploy.

- 2026-10-17: Bri removed "Your progress saves as you go." from the start card.
