# Retire the coaching model from this repo's live docs

**Status:** Done (2026-08-13)

## Objective

Remove every place this repo still presents the coaching offer as current
(owner: "I want the coaching to die"), so the master plan and reference docs
describe the placement business the assessment now serves.

## Methods / background

- Follows [20260813-correct-stale-business-model.md](20260813-correct-stale-business-model.md),
  which corrected `docs/vai-business-model.md` the same day. A repo-wide sweep
  then found coaching still live in three places:
  1. `plans/master-plan.md` (2026-07-19): vision framed as "a client-facing
     coaching tool" used by "Workman Success coaches," with a
     coaching-client audience. Stale twice over: the coaching offer died
     2026-08-04, and nothing may imply WSS involvement in VAI.
  2. `docs/dormant-reactivation-pitch-to-wss.md` and
     `docs/wss-launch-email-campaign.md`: campaign deliverables that pitch the
     founding Done-With-You cohort and a 60/40 WSS revenue split.
  3. `vai-productivity-gap/docs/vai-executive-overview-platform-partner.md`
     (untracked, sibling repo): a third copy of the contaminated partner
     overview.
- Note: `vai-website/plans/master-plan.md` was already rewritten coaching-free
  on 2026-08-04; no change needed there. (Its $3,000 / 90-day-term copy is a
  separate staleness owned by the vai-va-training pricing task's follow-ups.)

## What changed

- **`plans/master-plan.md` rewritten** to the placement model: the assessment
  is the diagnostic spine of VAI's managed-AI-workforce placement business
  (lead gen, qualification, the VA's work plan, the day-90 proof). The
  retakes and admin-views roadmap themes survive nearly intact; only the
  coaching frame around them goes.
- **RETIRED banners** added to the two WSS campaign docs. Kept, not deleted:
  they are completed deliverables and the reactivation mechanics may be
  reusable someday for an assessment-only campaign, but nothing in them may
  be executed as written.
- **The stray productivity-gap copy** replaced with a pointer stub to the
  corrected overview (left uncommitted there; that repo has unrelated
  uncommitted work and the file was never tracked).
- Completed task docs that mention $997/coaching (20260718 campaign, 20260720
  proposal, website v1 copy task) are left as-is: they are project history,
  and their dates mark them.

## Progress

- [x] Repo-wide grep for $997 / Done-With-You / coaching across all four
      sibling repos (2026-08-13)
- [x] Rewrite `plans/master-plan.md`
- [x] Banner the two WSS campaign docs
- [x] Stub the productivity-gap stray copy
- [x] Commit and push
