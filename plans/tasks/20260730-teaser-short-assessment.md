# Teaser short assessment — 5-question front-of-funnel hook that converts into the full assessment

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Build a 5-question "teaser" that instantly shows a visitor a directional preview
of their two scores — led by the visceral **"X% of your core business still runs
through you"** number — then converts them into the full assessment with those 5
answers already carried onto the board, so the full flow feels like a continuation,
not a cold restart.

## Why (ladders up to the master plan)

The warm-email funnel keeps stalling at open→click and the full assessment's
15-minute ask is a big first commitment (see
[20260721-warm-batch1-analytics-review.md](20260721-warm-batch1-analytics-review.md)
and [20260722-warm-batch3-send-time-and-ab.md](20260722-warm-batch3-send-time-and-ab.md)).
The teaser is the "front-load less, earn the click, then earn the 15 minutes"
lever: a short, branded, low-friction hook whose payoff is a real number that
makes finishing the full assessment the obvious next step. Read the funnel /
reactivation sections of the [master plan](../master-plan.md) first.

## Decisions (agreed 2026-07-30 — confirm the ⚠️ items)

1. **Build it in the app we already have (CONFIRMED).** A new route in THIS Next
   app (e.g. `/teaser`) on the domain it already runs on
   (**assessment.vainexus.com**), reusing the question bank, scoring, sessions, and
   admin. No new site, no DNS/rewrite work. This is what makes the two hard
   requirements below (admin short-vs-full visibility, continue-with-saved-answers)
   possible at all — they need one shared backend. Optionally branding the URL as
   `workmansuccess.com` later is a nice-to-have, explicitly **out of the critical
   path**.
2. **Preview both scores, led by owner-dependence.** Headline = **"X% of your core
   business still runs through you"** (owner-dependence, i.e. the ODS). Secondary =
   a directional **delegation-readiness tier** (low / developing / ready). Both
   shown as an honest **estimate band**, explicitly labeled preliminary — never
   false precision from 5 questions.
3. **Show the number first; gate the FULL assessment, not the teaser.** No email
   required to see the teaser preview. Email (+ consent) is captured at the
   "unlock my full assessment" step — the real conversion point. See
   [20260718-email-gate-consent-capture.md](20260718-email-gate-consent-capture.md).
4. **The 5 questions (CONFIRMED) — exact live wording from
   [supabase/seed-questions-v2.sql](../../supabase/seed-questions-v2.sql):**
   - **Q1 = A006** → "How many people are currently on your support team (TCs, LCs,
     coordinators, assistants)?" — Just me · 2 people · 3–4 · 5–7 · 8+. Sets
     `drs_profile` (solo vs team).
   - **Q2–Q5 = B001–B004**, "Who is the named owner of the **[workflow]**
     workflow?" — Team Leader (me) · TC · Listing Coordinator · Operations
     Manager · Shared / No clear owner. Sets each `wf_*_mode`.
     - B001 Listing Launch · B002 Seller Communication · B003 File Opening ·
       B004 Lender Tracking.
   These are the exact inputs `detectDrsProfileFromA006` / `refineDrsProfile` /
   `answerToMode` already consume ([src/lib/assessment.ts](../../src/lib/assessment.ts)).
   The "Team Leader (me)" answers on B001–B004 are what drive the owner-dependence %.
5. **Teaser answers persist to a real session and pre-fill the full assessment.**
   Because the 5 answers are Section A-profile + Section B routing, the visitor
   enters the full assessment with the profile set and all four workflow paths
   already routed — Sections A/B effectively pre-filled on the board.

## The teaser scoring (estimate band — NOT the real ODS/DRS)

- **Owner-dependence % (headline):** of the 4 workflows (B001–B004), the share the
  owner still runs themselves — i.e. answers that map to **Mode A** via
  `answerToMode` ("team_leader"). 4/4 → "100% still runs through you"; 1/4 → 25%.
  A006 = "just me" nudges toward the high end. This is a directional proxy for the
  ODS, not the ODS itself.
- **Delegation-readiness tier (secondary):** from the same 4 answers — count of
  workflows with a **named owner (Mode B)** vs **shared (Mode C)** vs **you
  (Mode A)**. Mostly named-owner → "ready"; mostly you → "low"; mixed →
  "developing". Shown as a tier, never a number.
- **Framing copy:** "Preliminary read — the full assessment sharpens both scores."
  Follow the concrete-steps / no-em-dash copy rules. The full assessment's Section
  G is what produces the real DRS; the teaser must not pretend to.

## Admin: tell short vs full apart clearly (hard requirement)

- **Data model:** add a way to distinguish a teaser session from a full one and to
  know which stage it reached. Proposed: a `variant` / origin marker on
  `assessment_sessions` (e.g. `entry = 'teaser' | 'full'`) plus a
  `teaser_completed_at` timestamp, reusing the existing `completed_at` for full
  completion. (New migration `008_*`, following 001–007 in
  [supabase/migrations/](../../supabase/migrations/).)
- **Admin dashboard** ([src/app/admin/page.tsx](../../src/app/admin/page.tsx),
  data via `fetchCompletedSessions` in [src/lib/admin.ts](../../src/lib/admin.ts)):
  add a **Version** column/badge (Teaser / Full) so the ODS/DRS table clearly shows
  who took which. Ideally a filter or a small funnel counter at top: teaser starts →
  unlocked → full completions.
- **Known consequence to accept/flag:** because email is gated *after* the teaser
  number, teaser-only visitors are **anonymous** (no PII until they unlock). Admin
  can count them and show the funnel, but individual teaser-only rows have no name.
  That's correct for top-of-funnel; just be explicit about it in the UI.

## User experience (the flow)

1. Visitor lands on the WSS-branded teaser URL (from an email CTA, social, etc.).
2. Answers 5 quick questions (A006 + B001–B004), progress visible.
3. Instantly sees the preview: big **owner-dependence %** + delegation-readiness
   tier, framed as preliminary, with a single strong CTA: "Unlock my full
   assessment →".
4. CTA → email + consent gate → full assessment, opening with Sections A/B already
   answered on the board (continuation, not restart).
5. Everything is one `assessment_sessions` row from step 2 onward, marked as a
   teaser-origin session, flipping to a full completion when they finish.

## Methods / background

- Shared types/helpers and the exact A006 / B001–B004 semantics:
  [src/lib/assessment.ts](../../src/lib/assessment.ts) (`answerToMode`,
  `detectDrsProfileFromA006`, `refineDrsProfile`, `B_QUESTION_TO_WORKFLOW`,
  `createSession`, `saveAnswer`).
- Scoring reference (so the teaser proxy stays consistent with the real ODS/DRS
  direction): [src/lib/scoring.ts](../../src/lib/scoring.ts).
- Full assessment section flow to hand off into:
  [src/app/assessment/[sessionId]/](../../src/app/assessment/) (sections a–h) and
  [plans/application-flow.md](../application-flow.md).
- Admin surface to extend: [src/app/admin/page.tsx](../../src/app/admin/page.tsx),
  [src/lib/admin.ts](../../src/lib/admin.ts).
- Email/consent gate this reuses: the email gate at unlock — see
  [20260718-email-gate-consent-capture.md](20260718-email-gate-consent-capture.md)
  and migration `006_add_consented_at.sql`.
- Deploy is CLI-only (`vercel --prod`); prod DB writes go through Bri via prepared
  SQL (session pooler aws-1-us-east-2) — the migration is a prepared script, not an
  agent write.

## Implementation steps (draft — refine once decisions confirmed)

- [x] Bri confirmed (2026-07-30): build in the existing app on
  assessment.vainexus.com; 5 questions = A006 + B001–B004; anonymous teaser-only
  leads are an accepted trade.
- [x] Migration `008`: add `entry` ('full'|'teaser') marker + `teaser_completed_at`
  to `assessment_sessions` — [supabase/migrations/008_add_teaser_entry.sql](../../supabase/migrations/008_add_teaser_entry.sql),
  mirrored in [supabase/schema.sql](../../supabase/schema.sql). **Prepared SQL — Bri
  runs it on the session pooler before deploy.**
- [x] Build the `/teaser` route: 5-question form reusing `CategoricalRadio`
  ([src/app/teaser/page.tsx](../../src/app/teaser/page.tsx),
  [TeaserForm.tsx](../../src/app/teaser/TeaserForm.tsx),
  [actions.ts](../../src/app/teaser/actions.ts)). `startTeaser` creates a
  teaser-origin session, saves the 5 answers, and pre-routes drs_profile + workflow
  modes (same logic as advanceSectionB) so the handoff opens pre-branched.
  `createSession` gained an optional `entry` arg; new `setTeaserCompleted` helper.
- [x] Compute + render the estimate band — pure proxy in
  [src/lib/teaser.ts](../../src/lib/teaser.ts) (owner-dependence % = share of the 4
  workflows still run by "me", nudged for solo; delegation tier from Mode A/B/C
  tallies). Rendered led by the visceral "~X% still runs through you", rounded to 5s,
  labeled preliminary ([TeaserResult.tsx](../../src/app/teaser/[sessionId]/TeaserResult.tsx)).
- [x] Wire the unlock CTA → name+business+email/consent gate → full assessment.
  `unlockFullAssessment` saves A001/A002, records email + `consented_at` (same
  by-submission mechanism as the results gate, migration 006), fires the HubSpot
  sync as a timeout-guarded side channel, then redirects to
  `/assessment/[sessionId]/a` with A006 + B001–B004 already on the board.
- [x] Admin: `Version` badge (Teaser/Full) on the completed-sessions table + a
  3-step teaser funnel strip (previews → unlocked → full completions) at the top;
  anonymous teaser-only visitors surface as counts, never named rows
  ([src/lib/admin.ts](../../src/lib/admin.ts) `fetchTeaserFunnel`,
  [src/app/admin/page.tsx](../../src/app/admin/page.tsx)).
- [x] Migration `008` run on prod (Bri, 2026-07-30, "Success, no rows returned")
  and `vercel --prod` deployed (aliased to assessment.vainexus.com, deployment
  `dpl_FsTNgjTMrErAycpny1B6wZUnRSzn`). Server-side smoke checks green: `/teaser`
  renders the 5 questions (HTTP 200), `/admin` still 307s to login (new `entry`/
  funnel queries didn't break it), `/assessment` full flow still 200.
- [ ] **Final human click-through (Bri):** on the live site, take the teaser →
  unlock → confirm the full assessment opens with Section A/B pre-filled → finish →
  confirm `/admin` shows the row badged **Teaser** and the funnel strip counted it.

## Scope

**In:** the 5-question teaser, its estimate-band preview, unlock→full continuity on
a shared session, the admin short-vs-full distinction, WSS-branded URL fronting.

**Out (follow-ups):** genuinely shortening the *real* 15-min assessment (separate
trade-off task); social/paid distribution of the teaser; A/B of teaser copy or
question set; any change to the real ODS/DRS scoring math.

## Flags / risks

- **Estimate honesty.** 5 questions cannot produce the real DRS; over-claiming
  precision erodes trust and the full assessment's value. Keep it a labeled band.
- **Anonymous teaser-only leads.** Gating email after the number means teaser-only
  visitors aren't identifiable — accepted trade (Bri confirmed 2026-07-30); surface
  as a funnel count, not named rows.
- **Consent** at the unlock gate must match the existing consent cutover
  (2026-07-20) — reuse, don't reinvent.

## Progress

Running log — check things off and note decisions as you go.

- 2026-07-30 — Task drafted with Bri. Decided: preview both scores led by the
  owner-dependence % ("X% still runs through you"); show number first, gate the
  full assessment; 5 questions = A006 + B001–B004 (also sets the full flow's
  profile + workflow routing).
- 2026-07-30 — Built the full feature (all code steps done, `tsc` + `next build`
  green). Route map: `/teaser` (5-Q hook) → `/teaser/[sessionId]` (preview + unlock
  gate) → `/assessment/[sessionId]/a` (full flow, pre-routed). Design notes:
  teaser answers persist to one real session flagged `entry='teaser'`; the same row
  flips to a full completion when they finish, and `entry` stays 'teaser' forever as
  the origin marker. Owner-dependence % divides Mode-A workflows by the full 4 (a
  missing B answer reads as "not yet owner-run"), rounds to the nearest 5, and nudges
  +15 (capped at 100) when A006='just me'. Kept `createSession('full')` byte-identical
  so the existing flow can't break if code deploys ahead of the migration. Remaining:
  Bri runs migration 008 + `vercel --prod`, then live verify.
- 2026-07-30 — All open confirms resolved with Bri: (1) build it in the app we
  already have, on assessment.vainexus.com — no separate site, WSS-branded URL is
  an optional later nice-to-have; (2) exact 5 questions locked with their live
  wording (A006 support-team size + B001–B004 workflow named-owner); (3) anonymous
  teaser-only leads accepted. Task is ready to build.
