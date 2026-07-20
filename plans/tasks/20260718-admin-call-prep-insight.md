# Admin session page: call-prep insight

**Status:** Code complete — Slices 1–3 built 2026-07-19 ("implement this plan"
green-light). Awaiting Bri: copy approval pass, run migration 007, Slice 4
decision. Deployed to prod: **no** (deploy is CLI-only, needs Bri's OK).

## Objective

Make the admin session page a real call-prep surface — answer-level detail and
"how we can help" guidance — so the consultation (and later coaching sessions)
can actually move the client forward, not just recite scores.

## Methods / background

- Today: `src/app/admin/sessions/[sessionId]/page.tsx` + `src/lib/admin.ts`
  show scores, breakdowns (`score_breakdowns`), and answers — but per Brianne
  (2026-07-18): "I'm not getting enough information from the assessment to
  really move the client forward or make a difference in their business."
- 2026-07-19, Bri sharpened the target: "what do I need to know, what do I
  need to tell them — when their ownership debt score is high and their
  want/need to delegate is high but they just aren't sure where to start. If I
  send this out and get a client tomorrow, will I actually be able to help
  them?" → the page must answer **where to start and why**, not just scores.
- Landing zones already in the schema: `recommendation_templates` (guidance
  keyed to score bands via `score_bands`) is dormant and purpose-built for the
  "how we can help" half. Note its shape keys to a *single* `score_band_id` —
  combination guidance (ODS band × DRS band) doesn't fit it without a schema
  addition (resolved: quadrant playbook lives in code, see decisions).
- Guardrail: display/insight only — no changes to scoring semantics.

## What the assessment already captures that the page didn't show

The diagnostic gold is in the raw answers, all already in Supabase (and mostly
already fetched by `fetchSessionDetail`), just never rendered:

- **Mode A workflows** (owner-led — the highest-debt pattern): TBx1 hours/week
  the owner personally spends, TBx2 *the stated reason it hasn't been
  delegated*, TBx3 free-text "biggest obstacle to delegating in 90 days",
  TBx4 documented-process score, TBx5 someone-ready score. TBx4 vs TBx5 is the
  literal "where to start" split: process gap vs people gap.
- **Mode C workflows**: RCx1 why there's no single owner, RCx3 fallthrough
  frequency (reverse-scored red flag).
- **Mode B workflows**: which specific questions scored 0–1 (after reverse),
  grouped by OQI dimension — turns a low dimension bar into named problems.
- **Section G**: the individual low DRS answers (e.g. Q074 "took delegation
  back", Q086 approval bottleneck) that explain a weak category.
- **Section H**: urgency (Q087) is shown, but not the 1–5 raw value; goal,
  consultant note, and 90-day success vision are shown already.

## Design — four slices, shippable in order

### Slice 1 — Answer-level detail on the session page (code only) ✅

Per-workflow card gains an expandable "Answers" section rendering the
mode-appropriate diagnostics above (labels via `response_options`, free text
verbatim). Plus a session-wide **Red Flags** list: every scored answer at 0–1
after reverse-scoring, with its question text and section — the call's
talking-point list.

### Slice 2 — "Start Here" panel (computed, display-only) ✅

A panel at the top of the session page that answers Bri's exact question:

1. **Quadrant read** from overall ODS band × DRS band (high = score ≥ 51,
   i.e. Elevated/Critical ODS, Emerging/Ready DRS):
   - High ODS + High DRS → "Ready to delegate — start transferring now."
   - High ODS + Low DRS → "Build readiness first" — the weakest DRS category
     names the lever (levers for all 7 team+solo categories in code).
   - Low ODS + High DRS → "Optimize and scale."
   - Low ODS + Low DRS → "Stable but fragile — protect what works."
2. **First workflow**: highest per-workflow ODS, annotated with *why it's
   stuck* (Mode A: hours + TBx2 reason + TBx4/TBx5 split + TBx3 obstacle
   verbatim; Mode C: RCx1 + fallthrough; Mode B: two lowest OQI dimensions).
3. **First move**: derived from the gap type. Mode A decision table:
   TBx5 ≤ 1 → capacity/hiring first; TBx4 ≤ 1 (person ready) → SOP sprint
   then transfer; TBx5 = 2 → train against SOP, staged transfer; both ≥ 3 →
   schedule the handoff now. Mode C: capacity ≥ 2 → name a single owner;
   else build capacity + stop-gap (fallthrough ≥ 3 adds urgency note).
   Mode B: plays for the two weakest OQI dimensions.

   *Revised 2026-07-19 per Bri: "needs pretty clear steps to give the
   client — still seems vague."* Every first move and readiness lever now
   carries a **numbered 3–4 step action plan** (concrete artifacts and
   timeframes: one-page ownership doc, 30-day no-touch rule, week-by-week
   SOP sprint, sign-off checklist, etc.), rendered as a numbered list in
   the panel.

All thresholds/copy live in one module (`src/lib/insight.ts`) so wording can
iterate without touching scoring.

### Slice 3 — "How we can help" recommendation content ✅ (code + draft SQL)

- Quadrant playbook: **in code** (`src/lib/insight.ts`), per decision below.
- Per-band copy: `supabase/migrations/007_seed_band_guidance.sql` fills
  `score_bands.description` (all 12 bands) and seeds
  `recommendation_templates` (8 rows: 4 ODS + 4 DRS). Per Bri's 2026-07-19
  feedback the bodies are **numbered step plans** (newline-separated;
  rendered with `whitespace-pre-line`), not narrative paragraphs.
  Mirrored in `schema.sql`. **Not applied** — Bri approves copy, then runs it
  in Supabase Dashboard → SQL Editor (verify queries at the bottom of the
  file). Until then the admin "How We Can Help" section hides itself.
- Admin page renders band descriptions + template bodies once seeded.

### Slice 4 — Client-facing results guidance (**proposed separate task**)

Today the client's results page shows two numbers and a booking button — the
"high debt, wants to delegate, doesn't know where to start" respondent gets no
interpretation at all. Proposal: quadrant narrative + "your biggest
opportunity is [workflow]" teaser + band descriptions on `/results/[id]`,
reusing Slice 2's logic. Out of scope here per one-task-one-concern; needs its
own task doc if Bri confirms.

## Decisions

- **Quadrant copy location** (2026-07-19): hard-coded 4-quadrant playbook in
  `src/lib/insight.ts` — the recommended option, adopted when Bri green-lit
  implementation. `recommendation_templates` stays single-band as designed.
- **Red-flag threshold** (2026-07-19): shipped at ≤ 1 after reverse
  (`RED_FLAG_THRESHOLD` in `insight.ts` — one-line change if too noisy).
  Test sessions show counts of 19–79 on extreme all-zero answer sets; real
  sessions should be far lower. Bri to confirm after first real use.
- **"High" score cutoff** for the quadrant: ≥ 51, aligned to the existing
  band boundaries (Elevated/Emerging start at 51). In `insight.ts`.

## Open for Bri

- [ ] **Copy approval pass** on all guidance text (quadrant/lever/first-move
  copy in `src/lib/insight.ts`; band descriptions + coaching bodies in
  migration 007) before it backs a real call. All draft-marked in-file.
- [ ] **Run migration 007** in Supabase SQL Editor (after copy approval).
- [ ] **Slice 4**: green-light a separate task for client-facing results
  guidance?
- [ ] **Deploy**: `npx vercel --prod` when ready (not done).

## Progress

- [x] Interview: what does the coach need on screen during the call?
  (2026-07-19 — "where to start and why" for the high-ODS/high-DRS case)
- [x] Design the insight layout (this doc, 2026-07-19)
- [x] Slice 1: answer-level detail + red flags (2026-07-19)
- [x] Slice 2: Start Here panel (`src/lib/insight.ts` + UI) (2026-07-19)
- [x] Slice 3: recommendation content drafted; migration 007 prepared
  (2026-07-19) → **pending Bri approval + apply**
- [ ] Slice 4 decision → separate task doc if yes

## Implementation notes (2026-07-19)

- `src/lib/insight.ts` — new display-only module: `extractRedFlags`,
  `extractWorkflowDiagnostics`, `buildStartHere`, all thresholds and copy.
- `src/lib/admin.ts` — `fetchSessionDetail` now also selects `question_text`
  and `score_band_id`/`description`, builds normalized `InsightAnswer[]`,
  returns `diagnostics` per workflow, session `redFlags`, `urgencyValue`,
  and `recommendations` (band-keyed bodies; empty until 007 runs).
- `src/app/admin/sessions/[sessionId]/page.tsx` — Start Here panel, per-card
  `<details>` Answers (Mode B shows only ≤1-scored "problem answers"),
  Red Flags card, hidden-until-seeded How We Can Help card, urgency (n/5)
  with ≥4 highlighted.
- Verified locally against three real completed sessions (dev server, minted
  admin JWT): quadrant/lever/first-move render mode-appropriately (Mode A vs
  B), red-flag counts correct, missing test-data answers degrade gracefully,
  How We Can Help correctly hidden pre-seed. `tsc` and `next build` clean;
  lint errors are pre-existing (`as any` casts on HEAD).
