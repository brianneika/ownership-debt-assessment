# Narrative Source of Truth — the story under the assessment

**Status:** In progress <!-- plan drafted 2026-07-20; defining the spine with Bri before writing the full narrative doc -->

## Objective

Write the single narrative/messaging **source-of-truth doc** that articulates the
emotional story, the core reframe (*the problem is the leader, not the hire*), the
four things a leader must do, and the concrete pain + cost of each of the four
workflows — the spine the WSS emails, the VAI website, and the consultation call
all draw from so the whole funnel tells one consistent story.

## Methods / background

- **Ladders up to** [master-plan](../master-plan.md): this repo is the
  *instrument*; the VAI website is *the reason people pick it up*. The narrative
  is the connective tissue — it's what makes a team leader recognize themselves
  and reach for the assessment, and what the coach reinforces on the call.
- **Deliverable:** `docs/narrative-source-of-truth.md`. It's reference copy /
  messaging, not app code — no migration, no scoring change.
- **Must stay consistent with** (these are already true in the product; the
  narrative cannot contradict them):
  - [docs/wss-launch-email-campaign.md](../../docs/wss-launch-email-campaign.md)
    — diagnosis (free scores) vs. prescription (the call); ODS lower-is-better /
    DRS higher-is-better; "about 15 minutes."
  - [docs/reading-assessment-results.md](../../docs/reading-assessment-results.md)
    — the quadrant read and per-workflow logic.
  - `src/lib/insight.ts` / `src/lib/scoring.ts` — the readiness levers and the
    four DRS categories the "4 things" must map to.
- **Product truths that anchor the copy:**
  - The four workflows are **Listing Launch, Seller Communication, File Opening,
    Lender Tracking** (`WORKFLOW_NAMES`, `src/lib/assessment.ts`) — the exact ones
    Bri named. Per-workflow pain is written against these.
  - The team-leader DRS is built from **four** categories: Willingness (0.30),
    Delegation Quality (0.25), Team Capacity (0.25), Authority Framework (0.20).
    The "4 things" below map onto these so the narrative and the score agree.
- **Stats approach (decided 2026-07-20):** self-recognition first ("how many
  admins have you cycled through?"), cite a real benchmark only where defensible.
  No invented turnover percentages — the funnel's honesty is the asset.

---

## The narrative spine (working draft — this is what we're defining together)

Each of Bri's questions maps to a section below, with the proposed answer so she
can react. The full prose gets written into the deliverable once the spine — and
especially **the 4 things** — is confirmed.

### A. What are the patterns? Where do they see themselves?
Self-recognition scenes, written so the reader thinks *that's me*:
- Checks the phone on "vacation" like it's a listing appointment.
- Every escalation ends with "just ask me" — capable people, but the authority to
  decide was never handed over.
- The listing launch works **when they run it**; hand it to anyone else and it
  wobbles.
- Has hired help before and quietly concluded *it's faster to just do it myself.*
- Can't name what would break if they disappeared for two weeks — only that
  something would.

### B. Where is it emotional?
The gap between the business they *thought* they were building (freedom, a team
that runs) and the one they have (a job with staff that can't run without them).
The guilt of not trusting good people. The fear that the thing they built only
works because they never stop. The quiet grief of missing the family moment
*again* for something an owned workflow should have handled.

### C. Why is it frustrating?
They did the "right" thing — they hired. And it didn't fix it. So the lesson they
wrongly learn is *delegation doesn't work for me / good help is impossible to
find* — when the real problem was never the hire.

### D. The false fix — and why it fails (the reframe)
They think the answer is to **hand the workflows to an admin (or now, to AI)**.
But the same issues come back, because **the processes live in their head and
their heart** — undocumented, and never truly released. *The problem isn't the
people they hired. The problem is the leader.* Swapping in a new admin (or a
tool) without changing the leader just re-runs the same failure with a new name
on it.

### E. The 4 things (PROPOSED — Bri to refine wording)
*If they don't do these four, the same issues happen no matter who — or what —
they hire.* Mapped to the DRS categories so the story and the score agree; the
first two are literally Bri's "head and heart":

1. **Get it out of your head.** The process is undocumented — it lives in your
   head, so only you can run it. Until it's a written SOP/checklist, every hire
   is guessing. *(→ Delegation Quality / Systems Mindset)*
2. **Get it out of your heart.** You have to actually be willing to let go —
   release the *outcome*, not just the task, and not snatch it back the first
   time it comes back at 90%. *(→ Willingness)*
3. **Give away the authority, not just the task.** Hand over the right to *decide*
   within clear guardrails. Delegation without authority is errand-running that
   still routes every real call back to you. *(→ Authority Framework)*
4. **Put it in hands that can catch it.** The person needs the capacity and
   readiness to absorb it. Dump ownership on an overloaded or unready hire and the
   bounce-back is guaranteed. *(→ Team Capacity)*

Miss any one → the work bounces back to the leader → "see, delegation doesn't
work." This is exactly what the Delegation Readiness Score measures, which is why
the assessment can *predict* the bounce-back before they waste another hire.

### F. Per-workflow pain + cost (what actually breaks, and what it costs)
Written against the four real workflows. Proposed articulation:

| Workflow | If it's loose, what breaks | Who/what you lose | The real cost |
| --- | --- | --- | --- |
| **Listing Launch** | Photos, MLS, and marketing slip; the launch misses the critical first week | **Sellers** — the listing sits, drifts to price cuts, and the seller's confidence in you | The first week carries most of a listing's showing traffic; a launch that slips days burns the peak, ages the listing, and costs you the **relist + their referrals** |
| **Seller Communication** | Sellers go dark between updates; they hear from you only when it's bad news | **Sellers' trust** — they micromanage, cancel, or fire you | Poor communication (not price) is the #1 reason sellers leave agents — lost listing, lost referral, and a review that costs *future* sellers |
| **File Opening** | Disclosures, compliance, and contingency dates slip through the cracks | **The deal itself — and your license** | Missed deadlines mean earnest-money fights, deals that die in the option period, and E&O / compliance liability. This is the one that becomes a lawsuit, not just a lost commission |
| **Lender Tracking** | You learn the loan is in trouble at the closing table, not weeks out | **Buyers, the chain, and the closing** | Blown or delayed closings, collapsed chains, an 11th-hour dead deal — plus the reputational hit with the co-op agent that dries up future deals |

### G. The cost of the workflows not being tight (aggregate)
Four layers, so it's not just "you lose deals":
1. **Time** — the leader's hours are the ODS itself; every loose workflow is hours
   that should be someone else's.
2. **Revenue** — lost listings, dead deals, and the referrals that never come.
3. **Growth ceiling** — you can only take as many listings/closings as the leader
   can personally shepherd; the business is capped at the size of one person.
4. **The personal cost** — no real time off, burnout, and the business that was
   supposed to give freedom quietly owning the owner.

---

## Open for Bri

- [ ] **Confirm / refine the 4 things** (section E) — names and wording. Everything
  downstream keys off these, so this is the gate before the full draft.
- [ ] Any per-workflow pain in section F to sharpen with a real client story?
- [ ] Is there a WSS stat or a real benchmark you'd stand behind for the "hired and
  failed" moment, or keep it purely self-recognition?

## Progress

- [x] Interview: deliverable = narrative source-of-truth doc; 4-things = define
  together; stats = self-recognition-first (2026-07-20).
- [x] Draft the spine with proposed answers (this doc, 2026-07-20).
- [ ] Confirm the 4 things.
- [ ] Write `docs/narrative-source-of-truth.md` from the confirmed spine.
- [ ] Cross-check consistency with the email campaign + reading-results docs.
- [ ] Commit (task doc + narrative doc together).
