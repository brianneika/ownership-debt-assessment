# Admin PDF: same score-card treatment + client-voice synthesis as the results page

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Bring the client-facing results page's visual language into the admin report's
**PDF output**: replace the plain number-and-band score pills with the
marker-on-a-labeled-spectrum cards in both PDF versions, and make the **client
PDF** mirror what the client sees online (spectrum cards + the client-voice
"what your scores mean together" synthesis + the delegation-readiness breakdown),
so the printed report and the live `/results` page tell the same story.

## Why (the ask)

Bri shipped [20260720-results-interpretation-clarity](20260720-results-interpretation-clarity.md)
to the client-facing `/results/[sessionId]` page (spectrum cards, two-score
synthesis, readiness sub-breakdown, deployed 2026-07-20). She then asked for "the
same treatment on the admin dashboard, and I want to be able to see it on the PDF
Cards to see the same thing." The admin report is the coach's deliverable
([20260720-admin-report-pdf-export](20260720-admin-report-pdf-export.md)); the
client PDF should look and read like the online results, not like an older,
bare-numbers report.

## Decisions (settled with Bri, 2026-07-20)

1. **Spectrum cards: PDFs only.** The working consultant *screen* keeps the
   current compact `ScorePill` (number + band) — it's dense and good for the call.
   The spectrum cards appear only in the **printed output** (internal AND client
   PDF). So the overall-scores block renders pills on screen and spectrum cards in
   print.
2. **Client PDF: full parity with `/results`.** The client PDF gets the spectrum
   cards **plus** the client-voice synthesis block ("what your scores mean
   together", naming the single weakest DRS category) **plus** a client-safe
   delegation-readiness breakdown (the four categories). The existing band
   descriptions ("what your scores mean") stay.
3. **Internal view keeps its coach content.** The internal "Start Here" playbook
   (full levers) and the internal readiness breakdown (with weights) stay exactly
   as they are — richer, coach-only. The client-voice synthesis renders **only in
   client mode**; it does not replace Start Here.

### Rendering matrix (overall scores + synthesis)

| Surface | Overall score cards | Synthesis / breakdown |
| --- | --- | --- |
| Consultant screen | compact pills (as today) | coach Start Here + internal breakdown (as today) |
| Internal PDF | **spectrum cards** (new) | coach Start Here + internal breakdown (as today) |
| Client PDF | **spectrum cards** (new) | **client-voice synthesis + client-safe readiness breakdown** (new) + band descriptions (as today) |

Internal-only sections stay stripped from the client PDF via the existing
`data-audience="internal"` mechanism.

## Scope

**In:**
- Extract the shared presentational pieces so both routes use one implementation
  (no duplicate card/synthesis code):
  - `ScoreSpectrumCard` (marker on labeled gradient, direction chip, band pill)
  - `SynthesisBlock` (client-voice two-score read + weakest-category callout)
  - `DrsReadinessBreakdown` (four categories, weakest flagged)
- Admin `page.tsx`: render spectrum cards **print-only** in the overall-scores
  block (pills stay **screen-only**); add the client-voice synthesis + client-safe
  readiness breakdown as **client-print-only** sections.
- Print CSS in `globals.css`: a `print-only` (both modes) show/hide rule, hide the
  pills in print, keep the new client blocks on `.print-client-only`, and make sure
  the spectrum gradient/marker survive print color-adjust.

**Out (follow-ups, not this task):**
- Any change to the client-facing `/results` page (already shipped).
- Reworking the coach "Start Here" copy or the internal breakdown.
- True server-generated PDF (still browser print-to-PDF, per the PDF-export task).
- New score math or semantics — presentation-only, like the results task.

## Methods / background

Read the **"Coach-facing views"** roadmap item in the [master plan](../master-plan.md),
and the two tasks this builds on:
[results-interpretation-clarity](20260720-results-interpretation-clarity.md) (the
components + `buildRespondentSynthesis`) and
[admin-report-pdf-export](20260720-admin-report-pdf-export.md) (the print-mode
mechanism).

Key files:

- `src/app/results/[sessionId]/EmailGate.tsx` — currently holds `ScoreCard`
  (spectrum), `SynthesisBlock`, `DrsBreakdown`. These are **pure/presentational**
  (no hooks). Extract them into a shared, server-safe module (e.g.
  `src/components/results-visuals.tsx`, **no `'use client'`** so it renders in both
  the client route and the admin server component), then import back into
  `EmailGate.tsx`. Keep the email-gate form logic where it is.
- `src/lib/insight.ts` — reuse `buildRespondentSynthesis(...)` (added last task) for
  the client-voice synthesis; no changes expected.
- `src/app/admin/sessions/[sessionId]/page.tsx` — server component. Build the
  synthesis from `detail.ods.score` / `detail.drs.score` /
  `detail.drsCategoryBreakdown`. In the **Overall scores** block, wrap the existing
  pills as screen-only and add the spectrum cards as print-only. Add the client
  synthesis + client-safe readiness breakdown as new `.print-client-only` sections
  (they sit alongside, not replacing, the internal Start Here / internal breakdown).
- `src/app/admin/sessions/[sessionId]/PrintControls.tsx` — no change expected; it
  already sets `body.dataset.printMode`.
- `src/app/globals.css` — `@media print` block already has `.no-print`,
  `.print-client-only`, `print-color-adjust: exact`, `.report-section` rules. Add:
  - a `print-only` utility: hidden on screen, shown in print (both modes);
  - hide the compact pills in print (screen-only marker);
  - confirm the gradient track + marker render (they rely on
    `print-color-adjust: exact`; if a browser strips backgrounds the number, band
    pill, and end-labels still carry the meaning — acceptable, out of our control).

## Open questions to settle in build

- Card sizing in print: the results-page cards are a 2-col grid; confirm they fit
  the print width and don't force an ugly break. Reuse `break-inside: avoid`.
- Where the client synthesis sits in the client PDF reading order (after the score
  cards, before "what your scores mean" band text — mirror `/results`).

## Verification

- On a real session (e.g. Tina, `14288689-...`): consultant **screen** unchanged
  (compact pills, Start Here, internal breakdown all as before).
- **PDF (internal)** print preview: spectrum cards replace the pills; Start Here and
  internal breakdown still present; no client-voice synthesis.
- **PDF (client)** print preview: spectrum cards + client-voice synthesis (names the
  weakest category) + client-safe readiness breakdown + band descriptions; all
  internal sections (Start Here, workflow breakdown, red flags, internal readiness
  breakdown, Section H, recommendation bodies) stripped.
- Colors/gradient hold with "Background graphics" on; filename still
  `Ownership Report — {name}`; on-screen view resets after print/cancel.
- Zero em-dashes in any new copy; `next build` + eslint clean.

## Progress

Running log — check things off and note decisions as you go.

- [x] Interviewed Bri; decisions locked (2026-07-20): PDFs-only cards; client PDF
      full parity; keep coach content on internal.
- [x] Extract `ScoreSpectrumCard` / `ScoreSpectrumCards` / `SynthesisBlock` /
      `DrsReadinessBreakdown` into a shared server-safe module
      (`src/components/results-visuals.tsx`, no `'use client'`); refactored
      `EmailGate.tsx` to import them. Byte-identical extraction — no visual change
      to `/results`.
- [x] Admin `page.tsx`: Overall scores block now nests the compact pills as
      `.print-hidden` (screen only) and `<ScoreSpectrumCards>` as `.print-only`
      (both PDF modes). Cards only render when both ODS + DRS are scored.
- [x] Admin `page.tsx`: client-voice synthesis + client-safe readiness breakdown
      added as a `.print-client-only report-section-flow` block, placed after the
      score cards and before the "what your scores mean" band text (mirrors
      `/results` reading order). Built from `buildRespondentSynthesis(...)` +
      `detail.drsCategoryBreakdown` (heaviest-weight first).
- [x] `globals.css`: added `.print-only` utility (hidden on screen, `display:block`
      in print, both modes) + `.print-hidden` (dropped in print). Gradient/marker
      inherit the existing `main { print-color-adjust: exact }`.
- [x] `next build` + eslint clean (TypeScript passes; results route smoke-tested
      at runtime, HTTP 200, no module errors).
- [ ] Verify both PDF modes in the browser print dialog against a real session
      (needs Bri / a live admin session — Tina `14288689-...`).
- [ ] Commit + push to main; deploy via `vercel --prod` (with Bri's OK).
