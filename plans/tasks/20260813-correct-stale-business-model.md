# Correct the stale business-model doc (coaching model is dead)

**Status:** Done (2026-08-13)

## Objective

Rewrite `docs/vai-business-model.md` so it describes the business VAI actually
runs (managed AI workforce placement), and replace the stale
`docs/vai-executive-overview-platform-partner.md` with the corrected version, so
this repo stops contaminating partner and investor material with the retired
coaching model.

## Methods / background

- `docs/vai-business-model.md` (last updated 2026-07-20) defines VAI as "a
  coaching business wrapped around a proprietary measurement instrument," with
  an L1/L2/L3 coaching ladder, $997/mo founding seats (cap 10, standard
  $1,997/mo), a 60/40 WSS dormant-reactivation split, and an LLC-taxed-as-S-corp
  recommendation. All of that is superseded:
  - 2026-08-04 (owner): the Done-With-You coaching offer is removed, not
    demoted. VAI sells the VA placement program only.
  - 2026-08-10 (owner): the offer shape is a named human VA managing the
    client's AI virtual employees ("managed AI workforce"), priced near the
    MyOutDesk anchor; $1,700/mo entry all-in confirmed as the headline
    2026-08-13 (provisional until the model run closes).
  - 2026-08-03 (owner, vai-va-training master plan §15): the US entity is an
    **LLC with default taxation**, explicitly not an S-corp election.
- The governing sources live in the sibling repo `vai-va-training/`
  (`plans/master-plan.md`, `plans/tasks/20260810-pricing-and-offer-shape.md`,
  `models/`). This repo should point there, not maintain a parallel financial
  spine, because the two already drifted apart once, expensively: the stale doc
  feeds entity paperwork and investor conversations, and on 2026-08-13 it
  contaminated a partner-facing executive overview generated from this repo's
  context.
- `docs/vai-executive-overview-platform-partner.md` (untracked, generated
  2026-08-13) carries the same stale claims; a corrected merged version was
  produced in the vai-va-training session on 2026-08-13 and replaces it
  wholesale.
- What survives from the old business-model doc: the instrument-as-equity-asset
  framing (now as the diagnostic spine of the placement offer), the B0/B1
  business-operations needs (entity plumbing, revenue ledger on the dormant
  `clients` table), and the three-checks honesty principle. The old text stays
  available in git history.

## Progress

- [x] Task doc created (2026-08-13)
- [x] Rewrite `docs/vai-business-model.md` to the current model, pointing at
      the governing vai-va-training sources
- [x] Replace `docs/vai-executive-overview-platform-partner.md` with the
      corrected merged version
- [x] Commit both with this task doc
- Decisions:
  - The doc becomes a corrected summary plus pointers, not a parallel financial
    spine; `vai-va-training` is the single source of truth on offer, pricing,
    and entity questions.
  - The L1/L2/L3 ladder, $997/$1,997 pricing, 60/40 WSS split, and S-corp
    recommendation are recorded as superseded rather than silently deleted.
- Follow-ups:
  - `vai-website/plans/master-plan.md` (2026-07-19) still sells coaching in
    funnel rungs 4-5; needs the same correction in its own repo.
  - `plans/tasks/20260720-business-operations-track.md` (B0-B4) references the
    coaching model; re-scope B2 (coach leverage) and B3 (enterprise licensing)
    against the placement business when that track resumes. B0 and B1 stand.
