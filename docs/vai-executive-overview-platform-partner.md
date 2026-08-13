# VAI: Executive Overview for a Technology Partner

**Prepared:** 2026-08-13 · **Owner:** Brianne Ika · **Corrected:** 2026-08-13
(an earlier draft generated from this repo's context carried the retired
coaching model; this version merges it with the governing business docs).

**Sources:** the VAI master plan and pricing/offer tasks
(`vai-va-training/` repo, governing on the business), the 90-day playbooks, and
this repo's architecture and scoring docs (governing on the instrument). The
offer shape changed 2026-08-10 and the master plan §5/§12 rewrite is in
progress; where old and new shapes conflict, this document presents the new
shape and says so. Anything not yet decided says UNDECIDED.

**Framing in one sentence:** VAI sells a managed AI workforce for real estate
teams, delivered by placed, certified human VAs and measured by a proprietary
instrument (the Ownership Debt Assessment). The instrument is built and live in
production. The delivery method is fully documented. The operational platform
(VA dashboards, task routing, metric tracking, the SOP library) does not exist
yet. That gap is this conversation.

---

## 1. The Business in One Page

**What VAI is.** A managed AI workforce for real estate teams. VAI employs
trained, certified Philippine virtual assistants and places a named human VA
inside a small US real estate team, where that VA manages the client's AI
"virtual employees" (off-the-shelf agents on the client's own subscriptions)
and transfers operational ownership out of the leader's head into documented,
staffed, measured systems. The category label is deliberate: "managed AI
workforce," never "real estate VA." Inside the VA box this offer reads as fewer
human hours; inside the managed-workforce box it reads as a whole managed
function.

**The offer (post-2026-08-10 shape).** The client buys a named human who
manages the rest: a certified VA-manager, always-on AI agents on the client's
own accounts, AI error-catching QA, diagnosis before day 1 (the assessment),
and measured proof at day 90 (re-assessment delta, in writing). Delivered as
**The VAI Flow System**: Diagnose, Install, Flow, Prove, a repeating 90-day
cycle. The word "fractional" never appears client-facing.

**Price.** Headline entry tier: **$1,700/month all-in to the client**
(owner-confirmed as the one-pager headline 2026-08-13; provisional until the
financial model run closes). All-in means VAI's fee plus roughly $200-400/month
of agent-platform tools the client pays vendors directly. Plus a **$2,000
onboarding fee up front** and a **hard 6-month minimum term** (no day-90
off-ramp; early exit pays out the remainder). Dedicated full-time seats survive
as upper tiers ($3,000+ ladder up to a $5,750 Fractional Ops Lead). Exact tier
ladder above entry: UNDECIDED. Anchor: MyOutDesk at $1,988/month.

**First 5 clients.** Real estate teams of **3-8 agents** whose leader still
personally does ops work, one named decision-maker, on one of four supported
CRMs, Eastern/Central timezone preferred (the 5pm-2am Manila shift gives those
zones full-day coverage). Two channels: the warm Workman-network channel (two
named targets so far, Lindsey Vaughan and Sherine Duncan; list to grow to 8-10
pre-checked names) and cold email to ~1,200-1,800 pre-qualified contacts. The
Founding Four get the owner personally on every account, full price, no
discount, in exchange for a named published case study, logo use, published
before/after scores, and three reference calls. Target close: September 1.
Which five firms sign: UNDECIDED (none signed yet).

**VA-to-client ratio.** Operating rule today: **one VA, two clients maximum**,
batchable roles only (Database/CRM, Marketing), same CRM, non-competing
markets. TC roles stay dedicated permanently. 1:3 is the directional target for
batchable roles under the new shape but is not modeled, not sold, and not
mentioned to clients until a defined trigger fires (two consecutive quarters of
agents measurably absorbing at least 50% of per-client VA hours, plus four
other conditions). Per-role leverage ratios: UNDECIDED (open step in the
pricing task).

**Workman connection.** Brianne is president and co-founder of Workman Success
Systems, a national real estate coaching company. VAI is a separate business.
WSS may be named in her bio (her call, 2026-08-04), but nothing may ever imply
WSS endorses or backs VAI. Warm-channel asks come from her personally, as VAI's
founder, on personal channels. The formal VAI-WSS relationship: UNDECIDED.

---

## 2. The Assessment

Live in production at assessment.vainexus.com. Roughly 10 minutes, branching,
anonymous, no account required. It is simultaneously the lead-gen funnel and
the delivery instrument: its output becomes the VA's actual work plan.

### What it measures

Two headline scores, both 0-100, deliberately pointing in opposite directions:

| Score | Question it answers | Direction and bands |
|---|---|---|
| **Ownership Debt Score (ODS)** | How much of the business runs through the owner personally | Lower is better. 0-30 Optimized, 31-50 Developing, 51-70 Elevated, 71-100 Critical |
| **Delegation Readiness Score (DRS)** | How prepared the leader and team are to absorb ownership | Higher is better. 0-30 Not Ready, 31-50 Developing, 51-70 Emerging, 71-100 Ready |

The ODS is shown free as the teaser; the DRS unlocks behind the email gate. The
product treats 51 or above as "high" on both, and crossing the two scores at
that line sorts every respondent into one of four stories: high debt plus high
readiness means start transferring now (a systems problem, not a willingness
problem); high debt plus low readiness means build readiness first or anything
transferred bounces back; low debt plus high readiness means optimize and
scale; low debt plus low readiness means stable but fragile, document before
growth forces the issue. The leader and the team both take it; the gap between
the two reports is the most honest diagnostic we get.

### How the scores are built

- **Section A** detects the leader's profile (team vs solo), which selects the
  DRS categories measured: Willingness, Delegation Quality, Team Capacity, and
  Authority Framework for team leaders; Transfer Readiness, Hiring Readiness,
  and Systems Mindset for solo leaders.
- **Section B** asks who owns each of the four workflows, routing each one to a
  mode: **Mode A** (the leader personally owns it), **Mode B** (a team member
  owns it), **Mode C** (shared or no clear owner). The question set for each
  workflow section changes based on its mode.
- **Mode B workflows** get the full 18-question Ownership Quality Index across
  six weighted dimensions. Weights are fixed and treated as a measurement
  instrument; they never change silently, because retake comparability is the
  product:

| Dimension | Weight | What has to exist |
|---|---|---|
| Independent Execution | 0.22 | The owner acts first, without asking |
| Decision Ownership | 0.20 | Formal authority, in writing, known to the team |
| Systems & Checklists | 0.18 | SOP, templates, decision guide |
| Escalation & Coverage | 0.15 | Escalation ladder plus a trained backup |
| Outcome Accountability | 0.15 | A measurable standard in the leader's words |
| Confidence & Track Record | 0.10 | Time at standard (90 days independent) |

- **Mode A workflows** capture transfer-readiness facts instead: hours per week
  the leader spends on it (TBx1), why it has not been delegated (TBx2), the
  biggest obstacle in the leader's own words (TBx3), whether a documented
  process exists (TBx4), whether a person is ready to own it (TBx5).
- **Scoring is pure math with one write.** It runs exactly once at submit, no
  AI involved, and produces the overall ODS, a **per-workflow ODS for each of
  the four workflows**, the DRS with category breakdowns, and the OQI dimension
  breakdowns. Per-workflow scoring is the load-bearing design choice: a retake
  after working one workflow measures exactly the workflow that was worked, so
  the delta is attributable, not vague.
- **Questions live in the database, not in code**; copy and scoring metadata
  change only via numbered migrations.

### Exactly how results pick the first workflow

Mechanical, not judgment:

1. **Filter to Mode A and Mode C workflows only.** A VA is never placed into a
   Mode B workflow: someone already owns it, and inserting a VA displaces a
   real person and creates a turf conflict. If all four workflows come back
   Mode B, the client does not need a placement; they need their existing
   owners coached. That is a sales qualification rule, applied before contract.
2. **Among eligible workflows, take the most owner-dependent one**: highest
   per-workflow ODS, with the TBx1 hours confirming the reclaim is big enough
   to matter (highest hours also means the most repetitions, and a track record
   cannot be built on a workflow that runs twice a quarter).
3. **Break ties** with Section H urgency (1-5, 4 or above is hot) and the TBx3
   free-text obstacle.
4. **Write the choice into the Outcome Contract**, along with the workflow
   explicitly out of scope until day 76.

The TBx2 answer sets the VA's opening move: "no one has the skills" means lead
with capability; "I haven't documented it" means the documentation is the
product; "it keeps coming back" is an authority problem and the coach gets
involved early; "I'm not ready to let go" means extend the review ramp and let
the weekly numbers persuade; "haven't prioritized it" means convert the TBx1
hours into an annual number in the first session.

The day-90 retake is the graduation exam the client already agreed to at
baseline: the instrument's final question per workflow asks whether a named
owner has run it independently, at or above standard, for at least 90 days. The
free results page gives the diagnosis; the first move and the 90-day plan are
delivered on the call. That boundary is deliberate.

---

## 3. The 4 Core Workflows

The four workflows are **Listing Launch, Seller Communication, File Opening,
and Lender Tracking** (assessment sections C-F). One deliberate design decision
first: VAI does not impose a canonical step list on a client. During days 4-10
the VA shadows the client's real process and writes the SOP with fidelity
first, including the parts that look inefficient, because an SOP the leader
does not recognize is an SOP they will not trust. The steps below are the
pattern the instrument measures and the SOP template a VA arrives with; the
binding version is captured per client in the first two weeks.

The division of labor follows the same rules in all four: **the VA** executes
against the SOP, sends final communications (only after the authority date in
the Outcome Contract), classifies and handles escalations by tier, and logs
everything. **AI** drafts and checks; the VA verifies and owns the output (100%
verification first, relaxing to spot-checks only after the pass rate holds).
**Only the team leader** can: define the measurable standard, sign the Outcome
Contract, approve each communication template (once, then never again), set the
money and risk boundary, decide Tier 3 escalations, and send the Authority
Transfer memo to the team. **No one at VAI, human or AI, ever** touches wire
instructions, bank details, earnest money, or client funds; that line has no
exceptions, including when the request appears to come from the client.

### Listing Launch (Section C: signed agreement to live on MLS)

Steps in order: listing agreement signed and priced (**leader-only**: licensing
line); file and launch checklist created (AI creates it on the CRM trigger,
assigned to the VA); CMA and pricing inputs assembled (AI drafts, VA verifies,
**leader decides price**); photography, staging, and sign vendors scheduled
(VA); disclosures collected (VA chases; substantive document questions are
leader-only); MLS entry (VA, **only** where the market and brokerage permit a
named seat, otherwise the VA does not touch MLS); listing copy and marketing
(AI drafts, VA reviews against fair-housing training, leader approves the
template once); seller launch confirmation and marketing recap sent (VA,
approved templates); post-launch error audit (AI readiness-check skill reports
gaps in checklist order; a day-5-no-MLS alert routes to the VA, never the
leader).

**Done:** live on MLS inside the contract's stated standard (worked example: 48
hours from signed agreement, photos ordered same day, seller confirmed by end
of day), errors caught by the VA rather than surfacing on the leader's desk,
zero leader touches on a routine launch, 90 days at standard.

### Seller Communication (Section D: weekly updates, feedback, price review prep)

Steps: showing feedback and activity collected (VA, AI compiles); weekly seller
update drafted (AI, Monday 7am, into the VA's review queue, in the leader's
extracted voice); VA verifies and sends; inbound seller calls fielded first by
the VA (anything touching price, terms, or substantive property questions gets
the verbatim deflection script and routes to the leader); tough moments handled
with a plan, not a problem (refreshed marketing, updated photos); price-review
packet assembled (AI drafts, VA verifies); price-reduction conversation
(**leader-only**).

**Done:** updates go straight to sellers without leader review, sellers route
to the VA first, and the standard is "the seller feels informed and confident,"
not "the update went out." 90 days at standard.

### File Opening (Section E: executed contract to critical date calendar)

Steps: executed contract received, file opened in the transaction system (VA;
the checklist is auto-created on the CRM's "agreement signed" trigger);
critical dates extracted and calendared (AI extracts and cross-checks, VA
verifies every date); intro with key dates and terms sent to title, escrow, and
the co-op agent (VA, templates); opening confirmation to the client (VA,
templates); file completeness audit (AI skill reports gaps against the document
checklist, VA resolves); nonstandard contingencies and contract interpretation
(**leader-only**).

**Done:** files open complete and on time with every date and detail correct
(the standard is "was every date correct," not "was it opened"), verified by
the audit trail, no later surprises landing on the leader.

### Lender Tracking (Section F: appraisal to underwriting to clear-to-close to closing)

Steps: appraisal ordered and tracked, parties notified (VA, templates); lender
check-in cadence run (VA; AI drafts the follow-up when a lender is silent 72
hours); underwriting conditions chased (VA gathers documents, never advises on
contents); clear-to-close confirmed to all parties (VA, templates); closing
logistics coordinated (VA brings the leader options when the closing date is
threatened; **leader picks**); renegotiating any term, extension, or
concession, or changing lenders (**leader-only**); anything wire- or
funds-adjacent (**no one, ever**).

**Done:** files close on time (the standard is "did it actually close on time,"
not "did they follow up"), no financing milestone is ever a surprise, the
leader is out of the routine notification path entirely.

**"Done" for any workflow, in the instrument's terms:** documented (SOP plus
templates plus decision guide), staffed (a named owner plus a trained backup
who has handled a live half day), measured (twelve weekly scorecards against
the contract standard), and proven (the day-90 retake shows the per-workflow
ODS moved, and a three-day dark test where the leader goes fully silent
produced no breakage that was not logged and fixed).

---

## 4. People & Permissions

**Brianne (owner, and for now the coach, trainer, supervisor, QA, and
salesperson).** Sees everything: the admin surface at
assessment.vainexus.com/admin (all sessions, scores, answer-level red flags,
the Start Here call-prep panel), the HubSpot pipeline, every engagement's
scorecards and ledgers. Does: sells and runs the consultation from the admin
session page, generates the day-90 retake link, escalates to a client's leader
when the contract session slips twice (always the coach's move, never the VA's;
a VA pressuring a team leader is a power mismatch the VA will lose), attends or
reviews the recording of every new VA's first three contract sessions, runs the
supervisor review gate that admits anything into the shared SOP library, and
can fire a client via the escalation ladder. Only she can: add admin users,
change scoring or question semantics (via migration, never silently), and set
commercial terms.

**Team leaders (the client's named owner).** See: their own results pages, the
handoff ledger, weekly pre-reads and Friday scorecards, and everything in their
own Google Drive, which holds the entire deliverable pack from day 1 because
the pack is the client's property. Do: sign the Outcome Contract, define the
measurable standard in their own words, approve each template exactly once,
decide Tier 3 escalations, send the Authority Transfer memo to the whole team,
take the day-90 retake. Must do (contract terms, graded): the weekly 1:1,
response-latency norms, the delegation bootcamp before day 1. Structurally
removed from: routine notifications; Phase 4 physically unsubscribes the leader
from workflow-stage CRM alerts, email threads, and vendor portal notifications,
verified by opening their inbox and settings rather than by asking, because a
leader who still receives the alert still acts on the alert.

**VAs.** See: one client's systems at a time, under a client-domain email and
client-issued named seats (CRM, calendar, transaction management, shared drive,
vendor portals), the client's full assessment results including free text, and
VAI's shared playbook and skill library. Credentials via vault sharing only,
never chat; MFA everywhere. Do: run the 90-day transfer (shadow, document,
execute, absorb authority), send final client communications from the date in
contract field 6, handle Tier 1 decisions alone, decide-and-inform on Tier 2,
propose the next takeover weekly (never ask "what else do you need?"), log
every takeback and escalation, produce the Friday scorecard, operate and QA the
AI agents. Never without approval: send anything in the leader's voice before
that template is approved; act above the money/risk boundary (automatic Tier
3); start work in a Mode B workflow; migrate a client's CRM in the first 90
days; store deliverables anywhere but the client's Drive. Never at all
(termination conversation): wires, funds, shared MLS credentials, new-lead
outreach or cold calls, discussing price or terms, negotiating, answering
substantive property questions, or putting client PII, lender lists, commission
splits, scripts, or vendor pricing into any AI tool.

**AI agents.** See: one client's data only, on that client's own platform
subscriptions and business-tier zero-retention AI seat, so isolation is
structural and access dies at offboarding. Connections are added in strict risk
order, and only after Gate 2 (day 30, SOP complete): read-only CRM first, then
calendar, then the shared inbox, then document storage, then CRM write access
last. No AI touches an engagement before the workflow is documented; automating
an undocumented process makes the mess faster and hands the leader a black box
exactly when they are deciding whether to trust the VA. Do: transcribe sessions
into SOP and contract drafts, extract the leader's voice from their own sent
mail into templates, order the daily question batch with proposed answers
attached, run the named skills (escalation classifier, readiness checks, file
audits, scorecard assembly), and draft communications into the VA's review
queue.

**The communication rule: AI drafts client communication; it never sends it. A
human sends.** The single narrow exception, already defined: an unmodified,
leader-approved template fired by a deterministic trigger may go out through an
automation, and every such automation must have a named human owner and a
visible log. Anything free-form, anything in the leader's voice that is not the
approved template, and anything to a seller, lender, title, or vendor that
involves judgment is drafted only, reviewed and sent by the VA.
Fair-housing-sensitive copy (listing descriptions, marketing) has no exception
at all: AI may draft it, AI never publishes it, human review is a permanent
step. AI never appears on the org chart, and every line that binds a VA binds
an agent: an agent is not a loophole.

---

## 5. One VA, Multiple Clients

The isolation model is decided; the scheduling model largely is not.

**The rule today:** two clients per VA, maximum, batchable roles only
(Database/CRM & Client Care, Marketing & Listing Launch); TC work is
dedicated-only because someone must own files end to end in real time.
Preconditions: both clients on the same CRM, in verifiably **non-competing
markets** (same state fine, same MLS never; a VA seeing two competing pipelines
is a confidentiality breach waiting to happen), VA at level II or above with a
split pay differential. A third client is a closed door until the
agent-absorption trigger fires (section 1). Sales language: "your VA comes with
a team of agents behind them," never "your VA is shared."

**How separation works, per client:**

- A separate email identity on each client's own domain. The VA never emails
  client A's sellers from anything connected to client B.
- Separate client-issued named seats for each client's CRM, transaction system,
  and vendor portals. VAI holds no pooled credentials.
- All work product in that client's own Google Drive, not the VA's and not
  VAI's. This is both the honest arrangement and what makes VA turnover
  survivable: a replacement VA is productive in days because the SOP,
  templates, and skills are still there.
- A separate AI workspace per client (provisional recommendation: one Claude
  Project per client) loaded with only that client's contract, SOP, approved
  templates, and voice guide. Client A's context is never loaded when drafting
  for client B.
- Agent-platform subscriptions under each client's own account, separate agent
  instances, no shared context. Client isolation is a written design
  requirement for every agent template.

**How a day across 2-3 clients is structured:** each client gets a fixed
15-minute huddle (daily in weeks 1-2 of their engagement, three times a week in
weeks 3-6, weekly after), one batched question list asked once a day at a fixed
time with proposed answers attached, a daily end-of-shift report (shipped /
tomorrow / waiting-on), and the weekly VA-run 25-minute 1:1 with pre-read and
recap. Beyond that fixed cadence, the block scheduling of the VA's day and the
attention SLA caps (response times, meetings per month) that make multi-client
attention honest: UNDECIDED (the pricing task owns the SLA numbers; unbounded
meeting presence is flagged as the single biggest margin leak in a leveraged
model).

**What must never leak between clients:** templates and anything in a leader's
voice (extracted from that leader's own sent mail), transaction and seller
data, lender lists, commission splits, scripts, vendor pricing, contract terms
and standards, and decision-guide entries (they contain real client
situations). **What is supposed to transfer:** the anonymized method, and only
through the supervisor review gate: the VA submits, a supervisor strips
identifiers and generalizes, the library publishes. The Listing Launch SOP
structure built for client A is roughly 80% of client B's starting draft; by
placement ten a VA arrives on day 1 with a draft SOP, a template library, and
five working skills needing client-specific correction rather than invention.
That compounding is deliberately the asset.

---

## 6. Systems We Plug Into

### VAI's own stack (live today)

| System | We read | We write | API | Status |
|---|---|---|---|---|
| **Supabase Postgres** | Everything: sessions, answers, all scores | Everything; the system of record for the instrument | Yes (service-role, server-side only; the browser never touches it) | Live in production |
| **HubSpot** (VAI's own CRM) | Pipeline and contact state | Contact upsert by email at the moment a respondent gives their email: name, company, and a link to the admin results page. Deliberately no scores; scores stay in Supabase behind admin login. Fire-and-forget with a 5-second timeout, so an outage never blocks the respondent | Yes (private app token) | Live in production |
| **Google Calendar** | Nothing | Nothing; a booking link the prospect clicks, conversion happens on the call | Not integrated | Live |
| **Vercel** (Next.js 16 app) | Hosting for the assessment | n/a | Yes | Live |

### Client-side systems (the delivery layer)

The system of record is always the CRM the client already has, and a client's
CRM is never migrated during the first 90 days. Four CRMs are supported deeply;
anything else disqualifies the client. Priority order (Follow Up Boss first:
expected deepest connector maturity and the recommended target for agent
template #1):

| # | CRM | We read | We write | API | First-5 usage |
|---|---|---|---|---|---|
| 1 | **Follow Up Boss** | Contacts, tags, smart lists, deal/transaction records, activity, reports | Tags, activity logs, action plans, tasks; agent-drafted follow-ups (existing relationships only) | Yes; open API, mature ecosystem; B.Claw covers it natively | UNDECIDED |
| 2 | **Sierra Interactive** | Same categories | Same categories | Needs verification; B.Claw coverage unknown (open task step) | UNDECIDED |
| 3 | **Lofty** | Same categories | Same categories | Needs verification; native AI add-on (~$39/mo) the VA operates | UNDECIDED |
| 4 | **BoldTrail** (ex-kvCORE) | Same categories | Same categories | Needs verification; B.Claw covers it; native AI in some tiers | UNDECIDED |

Read/write depth per CRM is deliberately "mapped, not promised": the per-CRM
connector map is the designated Phase-0 technology-advisor deliverable and does
not exist yet. **Which CRMs the first five clients actually run: UNDECIDED,
because none has signed**; the two warm targets' CRM cells are unfilled, and
the cold list is built by detecting Sierra/Lofty/BoldTrail in team-website page
source (FUB is backend-only and undetectable that way). The intended pattern
everywhere: read-only access first, CRM-native automation before any general
automation tool, write access last.

Around the CRM: **Claude or Gemini business tier** with zero-retention
settings, purchased under the client's own account (a contract term and
qualification gate, ~$25-30/user/mo); **agent platforms** (B.Claw and/or Lindy,
under the client's account, client-paid); **Google Workspace** (client-domain
email, calendar, the client's Drive as the document home from day 1);
**transaction management** (Dotloop, SkySlope, DocuSign Rooms, or
brokerage-mandated, taken as found); **MLS** (named seat only where permitted,
otherwise untouched, never an integration surface); **showings** (ShowingTime
and similar); **email marketing** (human fair-housing review always);
**phone/SMS** (inside the TCPA line only); **portals** (Zillow, realtor.com,
read-only reporting). **Accounting (QuickBooks etc.): out of scope entirely**;
nothing money-adjacent.

---

## 7. What a VA Must Know Per Client, vs VAI-Wide

**Client-specific, required on day one** (the day-1 access checklist and
read-back exist precisely to capture this; the bench policy means the
destination client is known during onboarding, so week 4 aims at them):

- The client's **full assessment results end to end**, including free text:
  which workflow, its mode, TBx1 hours, the TBx2 blocker, the TBx3 obstacle in
  the leader's own words. The VA's opening move is scripted from these ("you
  said the biggest obstacle is X and you spend 4-8 hours a week on it; here is
  what I think that means; correct me"). Day-1 deliverable: a one-page
  read-back.
- **Team roster and routing:** the named owner, agents, TC, lender contacts,
  title reps, vendors, and who currently emails the leader about what.
- **Access:** CRM at the right permission level, client-domain email, calendar,
  phone/dialer, transaction system, shared drive, vendor portals.
- **The leader's voice and standard:** templates extracted from their last
  twenty real sent emails; the measurable standard, three unacceptable
  failures, money/risk boundary, and mistake protocol from the Outcome
  Contract.
- **Market and state specifics:** the state's unlicensed-assistant rules
  (verified per market, trained in onboarding week 4), MLS access rules,
  timezone and therefore which roles are even sellable. The format of a
  standing per-client market-knowledge artifact: UNDECIDED.

**VAI-wide, shared across every placement** (the 30-day pre-placement
certification, 100% pass bar on compliance):

- The four reference CRMs at orientation level; real estate fundamentals
  (lifecycle, parties, vocabulary); Google Workspace, Sheets, Zoom/Loom, Canva
  basics, e-sign concepts; credential hygiene.
- The compliance non-negotiables as scenario-drilled reflexes with verbatim
  deflection scripts, including trap scenarios.
- The 90-day playbook: phase gates, the six-dimension transfer sequence
  (Outcome Accountability, then Systems & Checklists, then Escalation &
  Coverage, then Independent Execution and Decision Ownership together, then
  Confidence & Track Record) and the rule that the dimensions cannot be built
  out of order.
- The Outcome Contract format (six fields plus the mistake protocol) and the
  facilitation mechanics: arrive with a draft and ask for reactions rather than
  creation, one 90-minute meeting ever, the two-week question, batched daily
  questions with proposed answers, fixed huddle agendas, visible takeback
  logging.
- The metric definitions and Friday scorecard format; the extraction loop and
  draft-verify-own pattern; what never enters a prompt.
- The skill library formats and the SOP-equals-skill principle: a properly
  written SOP is the AI skill's instruction set, so documentation quality
  compounds instead of rotting.
- The anonymized SOP template library, so no client starts from a blank page.

The knowledge split mirrors the IP split exactly: everything specific stays in
the client's systems as their property; only the anonymized shape flows back,
through the supervisor gate.

---

## 8. The VA's Screen

Honest status first: **this surface does not exist today.** The VA's current
tooling would be the client's own CRM, the client's Drive, and manually
maintained logs and scorecards. What follows is the specification the playbooks
already imply, which is exactly the surface a platform partner would build.

One dashboard, opened each morning, one lane per client (2-3):

- **Today's tasks**, from two sources: the client's CRM (files at each stage,
  deadlines) and the SOP checklists (the file-opening checklist auto-created on
  "agreement signed," the Monday seller updates, the 72-hour lender
  follow-ups). "Due today" is defined by the SOP's stated standards, which
  carry deadlines by design: "live on MLS within 48 hours" generates a
  countdown, not a vague task.
- **The review queue:** everything AI drafted overnight (seller updates, lender
  follow-ups, decision-guide entries) waiting for the VA to verify, edit, and
  send. Handing a task to AI means invoking a named skill (draft seller weekly
  update, listing launch readiness check, escalation classifier, file
  completeness audit) against that client's own workspace; output lands back in
  this queue, never goes directly out. The running verification pass rate shows
  here; a falling rate triggers rollback to 100% review.
- **The daily question batch** per client, each question with the VA's proposed
  answer, ready at that client's fixed time.
- **The engagement position:** current phase, next gate, days remaining, the
  handoff ledger (one row per workflow, stage 0-4, KPI, last exception), and
  this week's Tier 1 metrics with entry fields (Leader Touch Count, takebacks,
  rework), because the VA tracks them.
- **The end-of-shift report composer** (shipped / tomorrow / waiting-on) and
  Friday's scorecard builder.

**Proof of done** is the audit trail the playbook already requires: the sent
communication logged in the client's CRM, the checklist item checked with a
timestamp, the automation's visible log, the leader-ratified hours-returned
claim, and the weekly scorecard that rolls it up every Friday whether or not
the huddle happened. Done is never self-asserted; it is standard adherence
measured against the contract.

Tool choice for this surface, including whether it extends the existing
Next.js/Supabase app or lives on the partner's platform: **UNDECIDED**. That is
the open conversation.

---

## 9. The Owner's Screen

**What exists today:** the admin surface on the assessment app. Session list;
per session, the Start Here panel (quadrant read, first workflow, first move),
red flags sorted worst-first, Section H urgency and the leader's own words, and
tokenized retake-link generation (built in the coaching pilot). Admin auth is
deliberately MVP: one env-credentialed admin, JWT cookie, with an `admin_users`
table provisioned for named multi-admin later. This is a per-prospect call-prep
surface, not an operations dashboard. The cross-VA, cross-client view does not
exist; several schema landing zones for it (`clients`, `respondents`,
`reports`, `recommendation_templates`) are provisioned but deliberately
dormant.

**The specification, one row per active engagement:** client, VA, target
workflow, current phase, next gate and days remaining; **Leader Touch Count
trend** (the headline; if it is not falling by week 6 the engagement is off
track no matter how good it feels); takeback count, rework rate, unplanned-work
share; ledger stage distribution; AI verification pass rate; contract status;
the client-side grades feeding the escalation ladder (1:1 attendance, response
latency, approval rate); next retake date; weekly scorecard sent yes/no.

**Exception flags, straight from the documented failure modes:** contract
unsigned at day 10 (hard stop, coach escalation); SOP coverage flat past day 30
with unplanned work above 30% (the VA is becoming a task-taker); any takeback
after day 45 (mistake-protocol conversation); every VA-side metric excellent
while Leader Touch Count stays flat (a routing problem, every time: the team
still emails the leader); any AI automation appearing before Gate 2; two
consecutive missed 1:1s; three straight weeks with no new takeover approved.

**Company layer:** VA attrition (the metric that kills staffing companies),
gross margin per seat, retention at 6 and 12 months, time-to-fill, client NPS,
SOP library growth, and the headline that ties everything together: **average
Ownership Debt Score reduction across the client base**, the number nobody else
in the category can publish. Alongside it, the funnel: completions, email
captures, booked calls, and (once the revenue ledger exists) revenue per client
by source. Whether this lives in the existing admin app or the partner
platform: **UNDECIDED**.

---

## 10. What We've Already Tried

**On VAI's own stack:**

- **Lovable** (app builder with a CRM-style lead-ingest webhook): the original
  destination for captured leads, ripped out completely in July 2026 in favor
  of HubSpot. The structural gap: a webhook endpoint, not a real CRM with a
  pipeline a salesperson works.
- **HubSpot:** adopted and live as VAI's sales CRM. Clean upsert API.
  Deliberate boundary rather than gap: no score data goes into it (scores stay
  in Supabase behind admin login), and it is a sales CRM, not a delivery
  platform, so it covers none of sections 8-9.
- **The build-vs-buy call already made once:** the assessment was custom-built
  (Next.js on Vercel, Supabase) because the instrument is the equity asset.
  Owned scoring semantics, per-workflow scores, and migration-controlled retake
  comparability are the moat; no off-the-shelf assessment tool provides that as
  owned IP.

**On the agent-platform layer** (2026-08-06 evaluation; owner direction "build
within off-the-shelf, don't build the architecture." Verdicts are recommended
and **awaiting formal owner confirmation plus the vendor data-terms review,
which is a kill criterion**):

| Tool | Does well | The gap that kept us looking |
|---|---|---|
| **B.Claw (Bounti.ai)**, primary | Real-estate-native; inbox triage with draft-for-approval (exactly our guardrail posture); covers Follow Up Boss and BoldTrail; $99-599/mo | Only 2 of 4 CRMs confirmed; Sierra coverage unknown; real action-volume pricing unverified; zero-retention terms not yet in writing |
| **Lindy.ai**, complement | Horizontal AI EA; hundreds of connectors; voice-matched drafts; ~$50-60/mo | Not real-estate-native; no depth on our CRM stack |
| **Relevance AI**, deferred | No-code multi-agent builder for anything the other two can't express | More build surface than needed now; escalation path only |
| **Lofty AI / BoldTrail native AI** | AI already inside two reference CRMs, cheap | Not a platform to build within; a VA competency to operate as found |
| **Ylopo AI² / Structurely** | AI inside-sales to new leads | **Excluded outright: new-lead outreach is over our TCPA line** |
| **Moveworks / Leena AI** | Enterprise internal support | Wrong size entirely |

Custom agent architecture was rejected on cost ($4,000-7,500/mo build path vs
~$150-160/mo sandbox seats); the technology hire shrank to a bounded
verification engagement, with the custom-build trigger being a needed template
the bought platforms provably cannot express. The custom Next.js marketing site
was superseded by Wix. **On VA delivery platforms specifically** (VA task
management, client portals, existing VA-agency tooling): no formal evaluations
documented; UNDECIDED and honestly unevaluated. The firmest stack positions so
far: never replace the client's CRM in the first 90 days, the client's Drive is
the document home, CRM-native automation before added tools, Claude Projects as
the provisionally recommended AI layer (flagged, not decided), and the SOP
library needs versioning, search, and templating from day one, because "if it
starts as a folder of Google Docs it will never become IP." That library
platform is unbuilt and unchosen, and together with sections 8-9 it is probably
the center of the partner conversation.

---

## 11. First 90 Days: What "Win" Means for Each Party

**Prerequisites that must be true first** (all currently open): counsel
sign-off on the compliance non-negotiables and the EOR structure (two
jurisdictions), the vendor data-terms review on the agent platforms, the final
entry price out of the model run, and the master plan §5/§12 rewrite closed so
every downstream doc says the same thing.

**The first paying client wins if** (every item is already contractual language
in the method): the Outcome Contract is signed by day 10; the Day 30 Systems
Audit lands as a real document; one workflow is fully transferred by day 90
(documented, templated, authority handed over in writing to the whole team,
trained backup with a live half-day proof, leader physically removed from
routine notifications); leader hours on that workflow measurably down, plotted
weekly from a week-1 baseline (their own TBx1 answer, so nobody takes it on
faith); the retake shows the per-workflow ODS down with five of six dimensions
moved (Confidence & Track Record lags by construction, predicted in writing at
day 0 so it reads as precision, not a miss); a clean three-day dark test; the
deliverable pack in their own Drive plus a signed contract for workflow 2.
Explicitly not promised, in writing at day 0: a big move in overall ODS,
Confidence & Track Record movement at day 90, or all four workflows.

**The first VA wins if** (noting the first VA hire is internal to VAI, building
training material and seeding the library before any placement): they complete
the 30-day certification including the 100%-bar compliance exam before seeing a
client; they reach independent operation around day 60 and hold it (zero
takebacks from day 55, rework under 5% by day 75, unnecessary escalations under
10%, unplanned work under 10% after month 1); their first three contract
sessions pass coach review; and they exit day 90 with reusable assets (a proven
SOP structure, a template library, working skills) that make placement two
faster, on the ladder toward VA II and the pay increase certification carries.

**Brianne wins if:** the Founding Four are signed at full price (target
September 1) with signed case-study agreements; at least one Eastern/Central TC
placement is in the set so the reference base includes contract-to-close; the
playbook is validated end to end with all five gates passed on schedule,
proving the method is a product and not a person; her own load is bounded to
the coach lane (contract-session reviews and gate escalations, not day-to-day
delivery); the first publishable before/after ODS delta exists; the
agent-absorption measurement is running from day one (the data the whole
leverage bet depends on); the library gained its first templates through the
review gate; and the unit economics held at the new price point, which is the
model run this quarter still owes her.

---

## The Open Decisions in One Place

1. Final entry price ($1,700 confirmed as headline, provisional until the
   model run) and the full tier ladder above it.
2. Attention SLA numbers (response time, meetings per month): the concrete
   caps that make the leveraged model honest.
3. Per-role, per-tier VA-to-client leverage ratios; 1:3 stays gated behind the
   absorption trigger.
4. Agent-platform verdicts (B.Claw/Lindy) pending owner confirmation and the
   vendor data-terms review (kill criterion); B.Claw's Sierra coverage and
   real pricing.
5. The per-CRM connector map (Phase-0 tech-advisor deliverable, not yet done).
6. The first five clients' actual CRMs and stacks (no signatures yet).
7. Where the VA dashboard, the owner dashboard, and the SOP library live:
   extend the existing Next.js/Supabase app or build on the partner's
   platform. VA delivery platforms are so far unevaluated.
8. The AI layer (Claude Projects provisionally recommended, not decided);
   per-client vs standardized automation layer (current lean: decide per
   client for three placements, then standardize).
9. Second shift band for Mountain/Pacific; EA roles for Mountain/Pacific
   leaders; night-differential rate.
10. Insurance limits and cyber coverage; trademark clearance; the formal
    VAI-WSS relationship.
11. Master plan §5/§12 rewrite (the governing offer-shape decision is made;
    the document rewrite is in progress).
