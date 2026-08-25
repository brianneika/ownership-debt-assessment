# Brand alignment: make the assessment look and feel like the landing page

**Status:** Done (2026-08-25)
**Created:** 2026-08-25

## Objective

Every prospect-facing surface of the assessment app (assessment flow, teaser,
results, email gate) reads as the same brand as vaileverage.com: VAI logo, navy
and teal palette, Poppins and Inter type, light gray backgrounds, and the wave
motif, replacing today's placeholder indigo and Geist.

## Methods / background

Bri's ask, 2026-08-25: "make the assessment look and feel more like the landing
page. Logo, colors, branding, wave. etc."

**Brand source of truth:** `vai-va-training/vai-branding/palette.md` v2.0
(2026-08-05). Navy `#244397` primary (~35% of a layout), teal `#209B9D` accent
(~5%, sparingly), black text, light gray `#F3F5F7` backgrounds. Headings
Poppins, body Inter. Full navy and teal scales with contrast ratings are in
that file, plus JSON design tokens. Logos: `vai-branding/logo/VAI_LOGO_clr.svg`
(light backgrounds), `_rev.svg` (dark), `_blk.svg`; icon set in
`vai-branding/icon/`. Verified 2026-08-25: the live Wix landing page uses
`#244397` and `#209B9D`, so matching the palette file matches the site.

**Current state of this app (audited 2026-08-25):**

- `src/app/assessment/assessment-theme.css` is the assessment flow's entire
  design system, and it was built for exactly this moment: all brand values
  live in `:root` with a comment saying "placeholder indigo, swap here only,"
  and it even anticipates re-skinning the progress connector as a river. The
  flow screens and the teaser both consume these tokens. Most of the rebrand
  is a token swap in this one file.
- `src/app/results/[sessionId]/page.tsx` and `EmailGate.tsx` hardcode indigo
  values instead of using the theme tokens. These need a manual re-skin (and
  ideally a move onto the shared tokens so this never happens again).
- `src/app/layout.tsx` loads Geist and Geist Mono; brand type is Poppins
  (headings) and Inter (body), both on Google Fonts, loadable the same way via
  `next/font/google`.
- No VAI logo appears anywhere; `public/` still holds the create-next-app SVGs
  (next.svg, vercel.svg, etc.) and the favicon is the default.
- Root metadata title is "Ownership Assessment" with no VAI naming.
- The wave: no wave asset exists in this repo or in `vai-branding/`. The
  landing page's wave will need to be exported (from the Wix media library or
  the Canva brand kit) or recreated as an inline SVG divider in brand colors.
  VAI's name is part water, so the wave is identity, not decoration.

**Accessibility guardrails (from palette.md, keep these):**

- Teal `#209B9D` FAILS contrast on white; teal-colored text on light
  backgrounds must use Teal 900 `#135C5D`. Teal core is fine as a fill with
  black or white-on-dark pairings per the palette's combo table.
- Navy `#244397` is AAA on white (9.03:1); it is the safe workhorse for
  buttons, headers, and links.
- The assessment currently passes WCAG on its indigo scheme; the swap must not
  regress any pairing. Use the palette file's rated scales rather than
  inventing shades.

**Proposed color mapping (recommendation, Bri confirms):**

| Theme token today | Becomes | Why |
|---|---|---|
| `--avai-accent-500/600` (buttons, links, active) | Navy scale (`#4A69BE` / `#244397`) | Navy is the primary at ~35% share; AAA on white |
| `--avai-accent-50..300` (washes, highlights) | Navy 50 to 300 tints | Direct scale-for-scale swap |
| Progress connector, checkmarks, small accents | Teal (`#209B9D` fills, `#135C5D` text) | Teal stays sparing and meaningful, per the guide |
| `--avai-canvas` `#f7f8fa` | Light Gray `#F3F5F7` | Brand neutral background |
| `--avai-ink` `#0f1115` | Black `#000000` | Brand neutral text |

## Scope

**In:**
- Token swap in `assessment-theme.css` per the mapping table (flow + teaser
  inherit automatically).
- Fonts: replace Geist with Poppins (headings) and Inter (body) in
  `layout.tsx`; wire `--vai-font-heading` / `--vai-font-body` per palette.md.
- VAI logo: copy `VAI_LOGO_clr.svg` (and icon) into `public/`, place the
  wordmark on the assessment landing page, teaser, and results header.
- Favicon and app icon from `vai-branding/icon/`; metadata title updated to
  carry VAI naming.
- Wave motif: one reusable SVG wave divider component in brand colors, used on
  the assessment landing page hero and the results page header (matching where
  the landing page uses it).
- Re-skin `results/[sessionId]/page.tsx` and `EmailGate.tsx` onto the shared
  theme tokens (kills the hardcoded indigo).
- Delete the create-next-app SVGs from `public/`.
- Verify: preview deploy, click through teaser, full flow, results, email gate;
  spot-check contrast pairs against palette.md ratings; mobile widths.

**Out (follow-ups):**
- Admin area re-skin (internal tooling; separate task if wanted).
- Any copy changes (branding only; words stay as they are).
- Email templates (the app sends no email yet; brand them when the retake task
  picks an email provider).
- Recolored AI/EPS vector masters for print (known issue in palette.md, not an
  app concern).

## Open decisions (resolved 2026-08-25)

1. **Primary CTA color:** navy buttons, teal reserved for progress and small
   accents ("perfect" per Bri).
2. **Wave asset source:** recreate as a clean SVG in brand colors (Bri's call).

## Steps

- [x] Bri confirms the two open decisions.
- [x] Read `node_modules/next/dist/docs/` font-loading guide (repo rule).
- [x] Fonts swapped in `layout.tsx`; heading/body variables wired.
- [x] `assessment-theme.css` token swap per mapping.
- [x] Logo + icon into `public/` and `src/app/icon.svg`; wordmark placed on
      assessment landing, teaser, results; metadata title "Ownership Debt
      Assessment | VAI".
- [x] Wave component (`src/components/BrandWave.tsx`) built and placed on
      assessment landing, teaser, results.
- [x] Results + EmailGate + results-visuals moved onto brand tokens (via
      `vai-` utilities in globals.css); zero prospect-facing indigo remains.
- [x] Boilerplate SVGs + default favicon deleted.
- [x] Preview deploy builds clean (ownership-assessment-citv8fbdp-vai4).
- [x] Visual click-through: Bri reviewed the preview; two iterations on the
      wave (true brand colors instead of tints, then faster/wider motion).
- [x] Production deploy: shipped on Bri's "ship it"; assessment.vainexus.com
      serves the rebrand (logo, brand hexes, animated wave, VAI title
      verified in the live HTML).

## Decisions & deviations

- 2026-08-25: task drafted from a code audit; no code touched yet.
- 2026-08-25: brand tokens exposed two ways deliberately: the assessment flow
  keeps its `--avai-*` system (single-file rebrand preserved), while
  `globals.css` gains app-wide `vai-*` Tailwind utilities for surfaces outside
  the flow (results, email gate). Same hex values in both.
- 2026-08-25: dark-mode background flip removed from globals.css; the brand
  is light-only and the flip was create-next-app residue.
- 2026-08-25: success/checkmark color moved from stock green to brand teal
  (`#135C5D` on `#EFF8F8`), keeping teal "sparing and meaningful."
- 2026-08-25: local `next build` hangs on this machine (same slow-IO issue
  the productivity-gap session hit), so compile verification came from the
  Vercel preview build, which succeeded. Visual verification is stuck: the
  preview URL sits behind Vercel SSO the AI can't pass, copying Supabase envs
  from .env.local to the Preview environment was blocked by the permission
  classifier, and browser navigation was blocked mid-attempt. Bri verifies in
  her own browser instead. Note: teaser and results pages will error on ANY
  preview deploy until Supabase envs exist in the Preview environment
  (they're Production-only today); `/assessment` renders without them.

## Follow-ups

- Admin area re-skin.
- Branded email templates once an email provider exists (see
  `20260718-retake-push-and-linking.md`).
