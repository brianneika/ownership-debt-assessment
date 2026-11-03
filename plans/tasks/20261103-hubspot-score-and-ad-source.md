# HubSpot: send headline scores + ad source (UTMs) with each lead

**Status:** In progress (2026-11-03): code done; waiting on HubSpot properties + `vercel --prod`

## Objective

Every assessment lead lands in HubSpot with its Ownership Debt Score,
Delegation Readiness Score, and the UTM tags of the ad that brought it, so Bri
can see which Meta ad produces leads and calls.

## Methods / background

- Follow-up to [20261103-meta-pixel-install.md](20261103-meta-pixel-install.md)
  and Phase 4 of [20260721-vai-meta-ads-cold-acquisition.md](20260721-vai-meta-ads-cold-acquisition.md)
  ("cross-check Meta's numbers against our own (UTMs → HubSpot)").
- **Decision change (Bri, 2026-11-03):** the old rule "contact info only, scores
  stay in Supabase" is lifted for the two headline scores. Category breakdowns
  and answers still stay in Supabase / admin.
- Before this, all 7 assessment contacts showed Original Traffic Source
  "Offline" in HubSpot (API-created contacts), so ad attribution was impossible.

## How it works

- `src/components/UtmCapture.tsx` (root layout): if the landing URL has
  `utm_source/medium/campaign/content`, store them in the first-party cookie
  `vai_utm` (30 days). Pages without UTMs leave it alone, so the original ad's
  tags survive the 15-20 minute assessment.
- `src/lib/utm.ts`: `readUtmCookie()` for server actions.
- `src/lib/hubspot.ts`: `upsertHubspotContact(..., { utm, scores })` and
  `syncHubspotScores(email, scores)`. If HubSpot rejects the upsert (e.g. one of
  the new properties is missing), it retries with only the core properties so
  the lead is never lost.
- Results email gate (`results/[sessionId]/actions.ts`): sends UTMs + both
  overall scores (from `dimension_scores`, `workflow_key IS NULL`).
- Teaser unlock (`teaser/actions.ts`): sends UTMs (no scores exist yet).
- `submitAssessment` (`assessment/actions.ts`): after scoring, if the session
  already has an email (teaser path), sends the scores.

## HubSpot contact properties (must exist before deploy)

| Internal name | Label | Type |
| --- | --- | --- |
| `ownership_debt_score` | Ownership Debt Score | Number |
| `delegation_readiness_score` | Delegation Readiness Score | Number |
| `assessment_utm_source` | Assessment UTM Source | Single-line text |
| `assessment_utm_medium` | Assessment UTM Medium | Single-line text |
| `assessment_utm_campaign` | Assessment UTM Campaign | Single-line text |
| `assessment_utm_content` | Assessment UTM Content | Single-line text |

Group: "Ownership Assessment" if it exists, otherwise Contact information.

## Progress

- [x] Code written (files above). `tsc --noEmit` clean.
- [x] Mock test of `hubspot.ts`: full payload carries UTMs + rounded scores; on a
      400 the retry sends only core properties; scores-only sync sends just scores.
- [x] Headless test: `/assessment?utm_source=meta&...` sets `vai_utm`; a later
      plain visit keeps it.
- [ ] Create the 6 HubSpot properties.
- [ ] Merge + `vercel --prod`.
- [ ] Verify with one real lead from a UTM link.
