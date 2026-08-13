# VAI Business Model: Corrected Summary and Pointers

_Corrected 2026-08-13. The previous version of this doc (2026-07-20) described
VAI as a coaching business with an L1/L2/L3 ladder, $997/month founding seats,
a 60/40 WSS revenue split, and an S-corp recommendation. **All of that is
superseded** and the old text lives only in git history. This doc is now a
summary plus pointers, deliberately: the governing source of truth on what VAI
sells, what it charges, and how it is structured is the sibling repo
`vai-va-training/` (`plans/master-plan.md` and its task docs). This repo should
never again maintain a parallel financial spine, because the two drifted apart
once and the stale copy contaminated partner-facing material._

_Task: [plans/tasks/20260813-correct-stale-business-model.md](../plans/tasks/20260813-correct-stale-business-model.md)_

---

## 1. What VAI actually is (as of 2026-08-13)

**VAI sells a managed AI workforce for real estate teams.** VAI employs
trained, certified Philippine virtual assistants and places a named human VA
inside a small US real estate team (3-8 agents), where the VA manages the
client's AI "virtual employees" (off-the-shelf agents on the client's own
subscriptions) and transfers operational ownership out of the leader's head
into documented, staffed, measured systems.

**The Done-With-You coaching offer is dead** (owner decision 2026-08-04:
removed, not demoted). There is no coaching product, no L1/L2/L3 coaching
ladder, and no coach network plan. Any doc in any VAI repo that says otherwise
predates 2026-08-04 and should not be trusted on the offer.

**What the instrument is now.** The Ownership Debt Assessment (this repo's app)
is no longer "the product a coaching business wraps around." It is the
diagnostic spine of the placement offer, doing four jobs:

1. **Lead generation**: the free teaser (ODS) plus the email gate.
2. **Qualification**: the score is the pitch; a low score disqualifies a
   prospect before anything was sold, and an all-Mode-B result means the client
   needs their existing owners coached, not a placement.
3. **The work plan**: assessment output becomes the VA's ranked takeover
   backlog and picks the first workflow.
4. **The proof**: the day-90 retake delta, per workflow, is the renewal
   conversation and the marketing number nobody else in the category can
   publish.

It remains VAI's equity asset alongside the anonymized SOP library. Licensing
the instrument to brands or franchises is a long-horizon possibility, not a
current revenue layer or roadmap item.

## 2. The decided economics (summary; the models live in vai-va-training)

| Item | Decision | Decided |
| --- | --- | --- |
| Headline entry price | **$1,700/month all-in to the client** (VAI fee plus ~$200-400/mo of client-paid agent-platform tools). Provisional until the financial model run in the pricing task closes | 2026-08-13 (headline confirmed) |
| Onboarding fee | **$2,000, due up front** | 2026-08-06 |
| Term | **Hard 6-month minimum**, no day-90 off-ramp; early exit pays out the remainder. Annual option: 1.5 months credited, clawed back on early exit | 2026-08-06 |
| Upper tiers | Dedicated seats survive as upper tiers ($3,000+ up to a $5,750 Fractional Ops Lead); exact ladder open in the pricing task | 2026-08-10 |
| Anchor | MyOutDesk at $1,988/month; category label "managed AI workforce," never "real estate VA" | 2026-08-10 |
| VA employment | VAs are **employees, not contractors**; third-party EOR for heads 1-8, own PH entity around head 8+ | 2026-08-03 |
| US entity | **LLC with default taxation.** Explicitly not an S-corp election (no salary/distribution split; full SE tax; profits interests native; SAFEs unavailable, convertible notes instead) | 2026-08-03 |
| Owner pay | Tax distributions, then a stepping draw, then a 3-months-payroll reserve, then sweep to retirement | 2026-08-03 |
| Commissions | $1,500 sourced-and-closed / $500 sourced-only / $2,500 split, paid in thirds at 90 days / 6 months / 12 months; a client carries a referral fee or a full commission, never both | 2026-08-03 |
| Margin target | 50-60% per seat; multi-client (split) placements are the margin instrument | standing |

Governing files, in the sibling repo:

- `vai-va-training/plans/master-plan.md`: the master plan (§5/§12 rewrite to
  the new offer shape is in progress as of 2026-08-13; the decisions above
  govern where the text lags).
- `vai-va-training/plans/tasks/20260810-pricing-and-offer-shape.md`: the offer
  and pricing rewrite task.
- `vai-va-training/models/`: the financial model (`scenario.json` is the
  shared source of truth).
- `vai-va-training/plans/equity-and-buy-ins.md`: valuation, buy-ins, and the
  cap-table record (the 52% floor, Nicole and Kaprice terms).

## 3. The WSS relationship

Brianne is president and co-founder of Workman Success Systems. The posture
(2026-08-04): WSS may be named in her bio, but **nothing may ever imply WSS
endorses or backs VAI.** The Workman network is a warm channel worked by
Brianne personally, as VAI's founder, on personal channels; the ask is always
the assessment, never the contract. The formal VAI-WSS relationship is an open
item. The old 60/40 dormant-reactivation split belonged to the retired
coaching launch and is not a current arrangement.

## 4. What this repo still owes the business

Carried forward from the old doc because they remain true and belong here:

- **B1, the revenue ledger.** All revenue is still off-platform and manual.
  The dormant `clients` and `respondents` tables are the landing zone: link
  session to client to subscription to revenue, tagged by source. Without it,
  commissions and any future partner split are uncomputable.
- **B0, entity and money plumbing** (bank, bookkeeping) remains the
  prerequisite for anyone else being involved. Entity form is decided (LLC,
  default taxation).
- **The admin surface grows up.** The coach-facing views become the owner and
  operations surface for placements: retake generation, per-client history,
  cross-client trends. See the corrected partner overview
  ([vai-executive-overview-platform-partner.md](vai-executive-overview-platform-partner.md))
  for the full specification of the VA dashboard and owner dashboard this
  implies.
- **The three-checks honesty principle survives** in spirit: pay for work
  before profit, keep delivery costs explicit, keep the numbers legible to a
  partner or buyer. The concrete owner-pay policy is the decided one in §2.
- **B2 (coach leverage) and B3 (instrument licensing) from the old
  business-operations track are suspended** pending re-scoping against the
  placement business; do not build against them as written.
