# Teaser v2: named-owner grid plus two leader questions, so a TC on paper stops scoring as delegation

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Replace the teaser's five "who is the named owner" questions with a Yes/No grid
plus two leader-behavior questions, so the headline number reflects who actually
decides, not who holds the title. Same URL (`/teaser`), same session model, same
unlock gate.

## Why

The live teaser scores a workflow as "runs through you" only when the answer is
"Team Leader (me)". A leader who names their TC on all four workflows reads 0%,
"Largely delegated", tier Ready, even when every decision and every seller email
crosses their desk first. Bri flagged this on 2026-09-11 ahead of the Fathom talk
on 2026-09-17, where the teaser is the in-room CTA. The full assessment catches
this in Sections C to F; the teaser never asked.

## The three questions (6 taps)

1. **Named-owner grid.** "Is there one named person, other than you, who owns each
   of these?" Four rows, Yes or No: Listing Launch, Seller Communication, File
   Opening, Lender Tracking. Stored on B001 to B004 as `named_owner` (Yes) or
   `team_leader` (No), so the full assessment still pre-routes per workflow.
2. **Authority, Q079 (already in the bank, Section G).** Teaser wording: "When you
   hand something off, do they get to make the decisions, or do decisions still
   come back to you for approval?" DB options 0 to 4 unchanged.
3. **Take-it-back, Q074 (already in the bank, Section G).** Teaser wording: "In the
   last 90 days, have you moved something off your plate and kept it there without
   taking it back?" DB options 0 to 4 unchanged.

Both scored answers save exactly as Section G would, so they arrive pre-filled.

## Scoring (estimate band, still not the real ODS/DRS)

Owner-dependence per workflow, averaged over the four and rounded to 5s:

| Grid row | Counts as "runs through you" |
|---|---|
| No (`team_leader`) | 100% |
| Yes (`named_owner` or any role) | 100% at Q079=0, 75% at 1, 50% at 2, 25% at 3, 0% at 4 |
| Shared (legacy value, full flow only) | 75% |

Tier from Q074: 0 or 1 Low, 2 Developing, 3 or 4 Ready. Never Ready while the
headline is 50% or higher.

Worked check: TC named on all four, "most decisions still come to me" (Q079=1)
reads 75%, Heavily owner-run. Before: 0%, Ready.

## Decisions

- No database migration. Yes/No reuse B001 to B004 with a new `named_owner` value
  that `answerToMode` maps to Mode B; section intros fall back to "your team
  member" when no role slug is present. Q074 and Q079 are existing rows.
- A006 (team size) drops out of the teaser. Section A asks it on unlock. A solo
  agent answers No four times and lands at 100%, which is the honest answer.
- Section B in the full flow still shows the four role questions. Yes rows appear
  unselected (the `named_owner` value matches no role option) so the leader can
  name the role; if they skip, `named_owner` still routes Mode B.
- URL unchanged per Bri (2026-09-11).
- Fourth question (client communication crossing the leader's desk) held for v3.
  It needs new question text and therefore a migration.

## Files

- `src/lib/teaser.ts` proxy math and tier
- `src/app/teaser/page.tsx`, `TeaserForm.tsx`, `actions.ts` form and save
- `src/app/teaser/[sessionId]/page.tsx`, `TeaserResult.tsx` result copy
- `src/lib/assessment.ts` `answerToMode` gains `named_owner`
- `src/lib/admin.ts` label fallback for `named_owner`

## Progress

- [x] 2026-09-11 Task drafted from the design agreed with Bri in chat.
- [x] 2026-09-11 Code written: grid form, scored questions, new proxy, copy updates.
- [x] 2026-09-11 `tsc` and `next build` green (constants un-exported from the server-action file)
- [x] 2026-09-11 Phone-width render checked locally (grid, two scored questions, reveal button); committed and pushed to main
- [x] 2026-09-11 `vercel --prod` deployed (ownership-assessment-eoz7ema7v-vai4, Ready); live /teaser serves "Three quick questions", HTTP 200
- [ ] Bri click-through on the live `/teaser`: grid, two questions, number, unlock,
      Section B shows the four roles, Section G shows Q074/Q079 pre-filled, admin
      badge Teaser
- [ ] Follow-up in vai-va-training: talk script and slide spec say "five
      questions"; change to "three questions" once this is live
