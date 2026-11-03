# Meta Pixel install + conversion events + privacy link

**Status:** Done (2026-11-03), code on `main`; live after the next `vercel --prod`

## Objective

Install the Meta Pixel on the assessment app so Meta ads can measure and
optimize on real assessment leads, and link the Privacy Policy that Meta
requires on lead pages.

## Methods / background

- Phase 1 of [20260721-vai-meta-ads-cold-acquisition.md](20260721-vai-meta-ads-cold-acquisition.md),
  split into its own dev task as that doc recommended. Scope agreed with Bri in
  the "Vai Meta Ads Setup: Step by Step" doc (Step 4, Part 7).
- Pixel: **VAI Leverage Dataset, 1123386067098337** (Vai business portfolio). The
  same pixel runs on vaileverage.com through Wix's Meta Pixel & CAPI integration,
  so Meta sees one visitor across both sites. Hard-coded default in
  `src/lib/meta-pixel.ts` (a pixel ID is public); `NEXT_PUBLIC_META_PIXEL_ID`
  overrides it if ever set in Vercel.
- Guardrail kept: the pixel is a side channel. `next/script` with
  `afterInteractive`, every call wrapped so a blocked/missing pixel is a silent
  no-op, no PII in any event.
- Privacy Policy lives on the Wix site: https://www.vaileverage.com/privacy
  (published 2026-11-03, covers both sites and the Meta Pixel).

## Events

| Event | Where | When |
| --- | --- | --- |
| `PageView` | `src/components/MetaPixel.tsx` (root layout) | First load and every client route change. Not on `/admin`. |
| `CompleteRegistration` | `EmailGate.tsx` (gated) and `TrackOnce` on `results/[sessionId]/page.tsx` (email already known) | Respondent reaches results. Once per tab session per session ID. |
| `Lead` | `EmailGate.tsx` after `captureEmail`; `TeaserResult.tsx` on unlock submit | Email submitted. eventID `<sessionId>-Lead`. |

Ads optimize on `Lead`.

## Progress

- [x] `src/lib/meta-pixel.ts`: pixel ID + safe `trackMetaEvent` / `trackMetaEventOnce`.
- [x] `src/components/MetaPixel.tsx` in root layout: base code + PageView on route change, skipped on `/admin`.
- [x] Lead + CompleteRegistration wired (results gate, teaser unlock, already-has-email results).
- [x] Privacy Policy link under the start form, the results email gate, and the teaser unlock form.
- [x] `tsc --noEmit` clean. Local headless test: `init 1123386067098337` + one `PageView` on `/assessment`, privacy link present, no pixel on `/admin/login`. (`next build` can't fetch Google Fonts in the sandbox; unrelated to this change.)
- [ ] Deploy: `vercel --prod` (Bri).
- [ ] After deploy: Events Manager → VAI Leverage Dataset → Test events, run one assessment, confirm PageView, CompleteRegistration, Lead.

## Follow-ups (not in this task)

- Server-side CAPI for `Lead` (survives ad blockers / iOS). Needs a Meta access token in Vercel env.
- UTM capture + score to HubSpot. Today the sync sends contact info + admin link only ("scores stay in Supabase"), so every assessment contact shows source "Offline" in HubSpot. Needs a decision from Bri before changing that rule.
