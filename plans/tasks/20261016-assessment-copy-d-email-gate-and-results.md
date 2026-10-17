# Assessment copy D: rewrite the email gate, results and booking invite with APPLE

**Status:** Not started <!-- Not started | In progress | Blocked | Done -->

## Objective

Rewrite the email gate, the results page and the booking invite so the promise from the intake page is kept and booking the free call feels like the obvious next step.

## Methods / background

- Depends on task A for the brief and the results review.
- Files: `src/app/results/[sessionId]/EmailGate.tsx` (gate headline, consent line, `BookingCTA`), `src/app/results/[sessionId]/page.tsx`, `src/components/results-visuals.tsx` (score cards, synthesis, readiness breakdown copy).
- Scoring logic and score bands are out of scope; copy only. Interpretation copy must match `docs/reading-assessment-results.md`.
- Ladders up to master plan job 2: a low score or already-delegated workflows should read as **fit**, not rejection.
- No em dashes.

## Decided (2026-10-16)

- The booking call is **free**; say so.
- Name who they'll talk to (Bri), replacing "your VAI consultant".
- Keep results, then booking invite as the flow.
- Call is **30 minutes**. Don't promise a 90-day plan. Don't add a "not a pitch" line. What the call covers comes from Bri's calendar invite (task A deliverable, section 7); promise line: "You'll leave knowing the one or two things costing you the most time, whether we work together or not."
- Consent line: "Vai Holdings, LLC (VAI)"; nothing emails results, so don't promise it.
- Remove "Your consultant will review these scores with you" and "your consultant" in the scoring error state.
- Fix "Readiness is the average of these four" (it's weighted 30/25/25/20).
- Tell them to bookmark the results page; it's their only copy.

## Known issues from the quick review

- Consent line promises "VAILeverage may email you your results"; nothing in code appears to send them (confirm in A). Fix the promise or flag a send as a follow-up task.
- Booking copy promises "build your 90-day plan"; confirm that's what the call delivers.
- Their contact lands in HubSpot; say plainly that Bri may follow up.

## Progress

- [ ] Draft gate, results and booking copy per the brief
- [ ] Bri approves
- [ ] Implement, check gate and results on localhost with a test session
- [ ] Deploy, verify live, set Done
