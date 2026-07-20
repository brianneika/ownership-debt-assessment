# Business Operations track (B0–B4) — entity, ledger, leverage, licensing

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Stand up the business infrastructure that lets VAI pay Brianne honestly, bring in
partners for time or money, track revenue by source/coach/client, and eventually
license the instrument to national brokerages — turning VAI from a solo coaching
job into an ownable, share-able company.

## Decisions (2026-07-20, Bri)

- **L3 licensing target: large brands / franchises (RE/MAX, KW, eXp, Compass), not
  primarily WSS.** WSS a possible licensee but not the priority; licensing outside
  WSS enlarges the opportunity and avoids family entanglement.
- **Partners are real and near-term — "build for it now."** Entity + cap table +
  revenue ledger jump ahead of being someday-nice. Both time-partners (coaches) and
  money-partners (investors) are in scope.
- **WSS posture: balanced.** WSS is launch fuel; VAI's owned pipeline builds in
  parallel so dependency falls over time without starving either.
- **Compensation model: three checks** — operator salary ($10k/mo intent), coach
  fee at market (~50% of delivered coaching revenue, paid even to Brianne), founder
  dividends from what's left. Salaries/fees are expenses paid *before* dividends.

## Methods / background

- Full rationale, math, cap-table mechanics, and the dividend waterfall live in the
  source-of-truth doc: [docs/vai-business-model.md](../../docs/vai-business-model.md).
  Read it first — this task is the execution of §6–7 there.
- Ladders to the [master plan](../master-plan.md) coaching-tool vision (the
  instrument as the measurement backbone) and to the
  [VAI website master plan](../../../vai-website/plans/master-plan.md) (owned
  funnel). This track is the *business* layer under both product roadmaps.
- **B1 is partly a product change:** the schema already provisions a dormant
  `clients` table (and `respondents`, FK columns on `assessment_sessions`) — see
  [architecture.md](../architecture.md) "Provisioned, unused by code yet." Bringing
  `clients` alive to carry subscription/revenue is a code + migration task; scope it
  as its own sub-task when picked up, honoring the score-semantics guardrails
  (revenue/client data is additive — it must never touch scoring).
- **Attribution** for the WSS split is already flagged as an open risk in
  [20260720-dormant-reactivation-proposal.md](20260720-dormant-reactivation-proposal.md);
  B1's source tagging (WSS vs. owned, by UTM + booking source) resolves it.
- Entity/tax/legal structure (LLC → S-corp, profits-interest coach pool) needs a
  CPA + attorney — the doc lays out the standard shape, not advice.

## The sub-tracks

- **B0 — Entity & money plumbing (near-term).** LLC formed, S-corp election,
  business bank account, bookkeeping set up, operator draw + coach fee defined.
- **B1 — Revenue ledger (near-term).** `clients` table alive; session → client →
  subscription → revenue, tagged by source and coach; splits/comp/dividends
  computable.
- **B2 — Coach leverage (L2).** Coach agreement template (50/50 rev-share +
  vesting track into a capped non-voting profits pool); first coach onboarded
  through the coach-facing admin views at the first capacity ceiling.
- **B3 — Enterprise licensing (L3).** Instrument packaged as a licensable product;
  pricing model (per-seat/per-coach); first brokerage/franchise conversations after
  score-movement proof exists.
- **B4 — Owned pipeline.** Website + nurture as the standalone funnel (balanced
  posture) — WSS-independence hedge and L3 credibility.

## Flags / risks

- **Don't promise a split before B0/B1 exist.** No entity/ledger = no honest way to
  pay a coach or investor. Sequence B0/B1 ahead of any partner commitment.
- **Keep revenue/client data off the scoring path.** B1 is additive; the
  measurement instrument's semantics stay untouched (master-plan guardrail).
- **Solo-mode "dividends" are wages in disguise** — pay all three checks so the
  founder profit line stays honest for diligence.
- **L3 needs proof first.** The score-movement evidence from the cohort/pilot is the
  asset that makes an enterprise license credible; B3 waits on it.
- **Legal/tax is out of scope for the repo** — B0 gates on a CPA/attorney engagement.

## Progress

Running log — check things off and note decisions as you go.

- [x] 2026-07-20 — Strategy interviewed with Bri (3 decisions above); source-of-truth
  doc written ([docs/vai-business-model.md](../../docs/vai-business-model.md)).
- [ ] B0 — form entity, bank account, bookkeeping, define operator draw + coach fee.
- [ ] B1 — revenue ledger sub-task (bring `clients` alive; source/coach tagging).
- [ ] B2 — coach agreement template + first coach onboarded.
- [ ] B3 — package the instrument for licensing; first brokerage conversations.
- [ ] B4 — owned pipeline live (coordinate with the vai-website repo).
