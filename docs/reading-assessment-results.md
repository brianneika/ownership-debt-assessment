# Reading a Respondent's Results — What the Data Tells You

_A coach's guide to interpreting one person's Ownership Assessment: what story
the two scores tell, what to do next, and how to read the detail without
over-reading it. Everything here maps to what the admin session page already
computes (`src/lib/insight.ts` + `src/lib/scoring.ts`) — this doc is the human
version of that logic so you can work a call from it._

**Where you read this:** the admin session page —
`assessment.vainexus.com/admin/sessions/[sessionId]`. The **Start Here** panel at
the top already does the quadrant read and the "first move" for you; this guide
explains *why* it says what it says so you can defend it on the call.

---

## 1. The two numbers (and which way is "good")

Every respondent gets exactly two headline scores, both on a 0–100 scale. **They
point in opposite directions — that's the whole design, and the #1 thing to keep
straight:**

| Score | What it measures | Direction | Plain-English question it answers |
| --- | --- | --- | --- |
| **Ownership Debt Score (ODS)** | How much of the business runs through the owner personally | **Lower is better** (0 = fully delegated, 100 = everything depends on them) | "How stuck am I in the day-to-day?" |
| **Delegation Readiness Score (DRS)** | How prepared the leader + team are to *absorb* ownership | **Higher is better** (0 = delegation would fail today, 100 = ready now) | "If I handed it off, would it stick?" |

The ODS is the **teaser** (shown before the email gate). The DRS is what
**unlocks after** they give their email. Never describe these as "one assessment
score" — the tension *between* them is where the insight lives.

### The bands (exact — this is the language on their results page)

**ODS — lower is better:**

| Range | Band | What it means |
| --- | --- | --- |
| 0–30 | **Optimized** | Little depends on the owner. Time goes to growth, not operations. |
| 31–50 | **Developing** | Some workflows still route through the owner; a few handoffs are incomplete. |
| 51–70 | **Elevated** | A meaningful share of daily ops depends on the owner. Growth is capped by their capacity. |
| 71–100 | **Critical** | The business runs through the owner. Stepping away isn't currently possible. |

**DRS — higher is better:**

| Range | Band | What it means |
| --- | --- | --- |
| 0–30 | **Not Ready** | Delegation would likely fail today. Readiness must be built first. |
| 31–50 | **Developing** | Some foundations exist, but handoffs are informal and authority stays with the leader. |
| 51–70 | **Emerging** | Most readiness pieces are in place. With clearer standards, delegation can start now. |
| 71–100 | **Ready** | Leader and team can absorb ownership. What's left is habit, not necessity. |

**The 51 line matters.** The product treats a score **≥ 51 as "high"** for both
scores. That single cutoff is what sorts every respondent into one of the four
stories below.

---

## 2. What story does the data tell? — Read the two scores *together*

One number is a fact; two numbers are a diagnosis. Cross **ODS (high/low debt)**
with **DRS (high/low readiness)** and every respondent lands in one of four
quadrants. This is the **Start Here** panel's headline — memorize these, because
this is the one-sentence story you open the call with:

|  | **DRS ≥ 51 (Ready-ish)** | **DRS ≤ 50 (Not ready)** |
| --- | --- | --- |
| **ODS ≥ 51 (High debt)** | 🟢 **Ready to delegate — start transferring now.** They *want* out and the pieces exist. This is a **systems** problem, not a willingness problem. Nothing about the leader has to change first — go build SOPs and name owners. | 🟠 **Build readiness first.** High debt, low readiness → anything you transfer today bounces straight back. The fastest path is the **weakest DRS category** (the page names it). Fix that lever, *then* transfer. |
| **ODS ≤ 50 (Low debt)** | 🔵 **Optimize and scale.** Debt is under control, readiness is strong. The conversation is about the *next* layer — deepen docs, raise standards, prepare for growth. | ⚪ **Stable but fragile — protect what works.** Low debt today, but it holds only because nothing has changed. Document what works and build readiness *before* growth or turnover forces the issue. |

**The classic cohort target is the 🟠 top-right → 🟢 top-left leaders**: high
ownership debt, and they know they want to delegate but aren't sure where to
start. The quadrant tells you whether "where to start" is **readiness** (🟠 —
work on the leader/team first) or **systems** (🟢 — go straight to documenting
and handing off).

---

## 3. What is next? — From story to the one move

Under the quadrant, the page derives a concrete **first workflow** and **first
move**. Here's the logic so you can read it out loud with conviction:

### Step 1 — Which workflow first
The **highest per-workflow ODS** wins. Each of the four workflows (Listing
Launch, Transaction Management, Lead/Client, Ops/Admin) is scored separately;
the most owner-dependent one is where the leverage is. The panel annotates *why
it's stuck* from their own answers — don't skip this, it's their words, not
yours.

### Step 2 — What the "stuck" reason tells you (by workflow type)
How a workflow was scored depends on how they set it up:

- **Mode A — owner-led (highest-debt pattern).** The debt read is literally two
  answers: **is there a documented process** (TBx4) and **is there a person
  ready to own it** (TBx5). Those two split "where to start":

  | Person ready? | Process documented? | First move |
  | --- | --- | --- |
  | No (≤1) | — | **Capacity first** — no one to hand to. Name a candidate or scope a hire before anything else. |
  | Yes | No (≤1) | **SOP sprint, then transfer** — the only blocker is the process living in their head. |
  | Partly (=2) | Yes | **Train against the SOP, transfer in stages** — a workable process exists; the owner needs structured reps. |
  | Yes (≥3) | Yes (≥3) | **Schedule the handoff now** — it's stuck by *habit*, not a gap. Put a date on the calendar. |

- **Mode C — no single owner.** The read is capacity (RCx2) + whether work
  falls through the cracks (RCx3). Capacity exists → **name one owner** (the gap
  is assignment, not talent). No capacity → **build capacity + add a stop-gap**
  so it stops being ownerless today. High fallthrough = urgency.

- **Mode B — has an owner, but the workflow itself is weak.** Debt comes from
  *how it runs*, not *who runs it*. The two weakest OQI dimensions (Decision
  Ownership, Independent Execution, Systems & Checklists, Escalation & Coverage,
  Outcome Accountability, Confidence & Track Record) name the fix.

### Step 3 — If the quadrant was 🟠 "Build readiness first"
Before *any* workflow transfer, the page surfaces the **weakest DRS category**
and its lever (Willingness, Delegation Quality, Team Capacity, Authority
Framework — or for solo leaders: Transfer Readiness, Hiring Readiness, Systems
Mindset). That lever comes with a numbered 3–4 step action plan. That's your
"start here" for a leader who wants to delegate but would sabotage a transfer
today.

**Remember the product boundary:** the free results page gives the client the
*diagnosis* (two scores + bands). The **move and the 90-day plan are the
call** — that's what you're delivering with the logic above. Don't give it away
in the email or the free results.

---

## 4. How to read the admin page, in order

A repeatable 5-minute pre-call read:

1. **Start Here panel** → say the quadrant sentence to yourself. That's the story.
2. **First workflow + why it's stuck** → this is your opening: *"The thing most
   tying you down is [workflow], and here's what your own answers say about why."*
3. **First move (numbered steps)** → this is your recommendation. It's concrete
   on purpose — read the steps, don't paraphrase into vagueness.
4. **Red Flags list** → every scored answer that came back at 0–1 (after
   reverse-scoring), sorted worst-first. These are your talking points — each one
   is a specific, self-recognized pain. Great for "you told us X — say more about
   that."
5. **Section H (urgency, goal, 90-day vision, consultant note)** → their stated
   urgency (n/5, ≥4 is hot) and their *own words* on what success looks like.
   Anchor the pitch to their vision, not your framework.

---

## 5. How NOT to misread it

- **Don't read the two scores as one.** A high ODS is not "bad" and a high DRS is
  not "good" on their own — the *combination* is the diagnosis. High ODS + high
  DRS is the **best** cohort candidate (motivated + coachable), not the worst.
- **Don't over-index on the overall ODS.** It's an average of four workflows. A
  moderate overall can hide one Critical workflow — always look at the per-
  workflow breakdown for where the real leverage is.
- **A high DRS with high debt is not a contradiction.** It's the healthiest
  possible "stuck" — they've built readiness and just haven't pulled the trigger.
  That leader can move *fast*; treat it as urgency, not skepticism.
- **Red-flag count is relative.** Test/extreme sessions can show 19–79 flags; a
  real respondent should be far lower. Read the *content* of the top few, not the
  raw count.
- **Bands are guides, not verdicts.** A 50 vs 51 is one point but crosses a band
  and flips the quadrant. When someone's near a boundary, read the underlying
  answers before committing to the story.

---

## 6. One-line cheat sheet

> **ODS = how stuck. DRS = how ready. Cross them at the 51 line to get the story;
> the highest-debt workflow tells you where; its Mode (A/B/C) tells you the
> move.**

_See also: `plans/tasks/20260718-admin-call-prep-insight.md` (the shipped
feature this reads), `docs/wss-launch-email-campaign.md` (how respondents arrive
and the diagnosis-vs-prescription framing)._
