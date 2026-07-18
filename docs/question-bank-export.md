# Question Bank Export
**Source:** `supabase/seed-questions.sql` (structure/weights/dimensions) + `supabase/seed-questions-v2.sql` (final question text + response options)
**Generated:** 2026-07-16 — read-only documentation pass, no code changed

---

## Table of Contents

1. [Section A — Business Profile](#section-a--business-profile)
2. [Section B — Named Owners (mode routing)](#section-b--named-owners-mode-routing)
3. [Section C–F — Workflow Questions by Mode](#sections-cf--workflow-questions-by-mode)
   - [Mode A — Transfer Barrier (TBx1–TBx5)](#mode-a--transfer-barrier-tbx1tbx5)
   - [Mode B — Full OQI (Q001–Q072)](#mode-b--full-oqi-q001q072)
   - [Mode C — Role Clarity (RCx1–RCx3)](#mode-c--role-clarity-rcx1rcx3)
4. [Section G — Delegation Readiness Score](#section-g--delegation-readiness-score)
   - [Team Profile (Q073–Q086)](#team-profile-q073q086)
   - [Solo Profile (SDQ1–3, SHR1–4, SSM1–3)](#solo-profile-sdq13-shr14-ssm13)
5. [Section H — Final Reflections](#section-h--final-reflections)
6. [Three-Mode Branching Logic](#three-mode-branching-logic)
7. [Dual DRS Profile Logic — Team vs Solo](#dual-drs-profile-logic--team-vs-solo)
8. [Named User / Dynamic Text](#named-user--dynamic-text)
9. [Landing Page Copy & Contact Capture](#landing-page-copy--contact-capture)
10. [Scoring Formulas Reference](#scoring-formulas-reference)
11. [OQI Dimension Mismatch (Known Issue)](#oqi-dimension-mismatch-known-issue)

---

## Section A — Business Profile

**Route:** `/assessment/[sessionId]/a`
**DB section column:** `'A'`
**Mode filter:** none
**Profile filter:** none

A001 and A002 are collected on the **landing page**, not Section A. Section A renders A003–A006 only.

| Key | Order | Question Text | Input Type | Scored? | Dimension | Notes |
|-----|-------|---------------|------------|---------|-----------|-------|
| A001 | 1 | What is your name? | free_text | No | — | Collected on landing page; never shown in /a |
| A002 | 2 | What is your business or team name? | free_text | No | — | Collected on landing page; never shown in /a |
| A003 | 3 | What is your primary business model? | categorical_radio | No | — | |
| A004 | 4 | How many transactions did your team close in the last 12 months? | categorical_radio | No | — | |
| A005 | 5 | What is your primary side focus? | categorical_radio | No | — | |
| A006 | 6 | How many people are currently on your support team (TCs, LCs, coordinators, assistants)? | categorical_radio | No | — | **Routing key: drives DRS profile** |

**A006 answer-value mapping:**

| Slug | Label | DRS Profile set |
|------|-------|-----------------|
| `just_me` | Just me | `solo` |
| `2_people` | 2 people | `team` (may become `solo` if 3+ Mode A workflows) |
| `3_to_4` | 3–4 people | `team` |
| `5_to_7` | 5–7 people | `team` |
| `8_plus` | 8 or more | `team` |

**A003 options:** Solo agent / Team lead with support staff / Team lead with buyer/listing agents / Brokerage owner / Other

**A004 options:** Fewer than 25 / 25–49 / 50–99 / 100–199 / 200 or more

**A005 options:** Primarily listings (seller-side) / Primarily buyer-side / Balanced — roughly equal buyer and seller / Investment / commercial focus / Other

---

## Section B — Named Owners (mode routing)

**Route:** `/assessment/[sessionId]/b`
**DB section column:** `'B'`
**Mode filter:** none — all 4 questions always shown
**Profile filter:** none

| Key | Order | Question Text | Input Type | Scored? | Maps to |
|-----|-------|---------------|------------|---------|---------|
| B001 | 7 | Who is the named owner of the Listing Launch workflow? (From signed listing agreement to active MLS) | categorical_radio | No | `wf_c_mode` |
| B002 | 8 | Who is the named owner of the Seller Communication workflow? (Weekly updates, feedback, and price review prep) | categorical_radio | No | `wf_d_mode` |
| B003 | 9 | Who is the named owner of the File Opening workflow? (From executed contract to critical date calendar) | categorical_radio | No | `wf_e_mode` |
| B004 | 10 | Who is the named owner of the Lender Tracking workflow? (Appraisal, underwriting, CTC, and closing coordination) | categorical_radio | No | `wf_f_mode` |

**Answer-value → Mode mapping** (same options for all four questions):

| Slug | Label | Mode |
|------|-------|------|
| `team_leader` | Team Leader (me) | **A** — Transfer Barrier |
| `tc` | Transaction Coordinator (TC) | **B** — Full OQI |
| `listing_coordinator` | Listing Coordinator | **B** — Full OQI |
| `operations_manager` | Operations Manager | **B** — Full OQI |
| `shared` | Shared / No clear owner | **C** — Role Clarity |

`answerToMode()` in `src/lib/assessment.ts:129` performs this mapping.

---

## Sections C–F — Workflow Questions by Mode

Each of the four workflow sections (C = Listing Launch, D = Seller Communication, E = File Opening, F = Lender Tracking) shows a **different set of questions** depending on the mode stored on the session.

The page fetches questions with `fetchQuestions(section, { mode })`, which filters `WHERE section = $section AND mode = $mode`. Only one mode's questions are ever loaded per workflow.

---

### Mode A — Transfer Barrier (TBx1–TBx5)

**Condition:** B001–B004 answered `team_leader`
**Shown when:** The respondent still owns this workflow personally

5 questions per workflow × 4 workflows = **20 questions maximum**

| Template Key | Suffix | Input Type | Scored? | Dimension | Weight | Description |
|---|---|---|---|---|---|---|
| TBx1 | `1` | categorical_radio | No | — | 1.00 | Hours/week spent personally on this workflow |
| TBx2 | `2` | categorical_radio | No | — | 1.00 | Primary reason workflow hasn't been delegated |
| TBx3 | `3` | free_text | No | — | 1.00 | Biggest obstacle to delegating in next 90 days |
| TBx4 | `4` | scored_radio | **Yes** | ODS | **0.50** | Does a documented process exist? (0–4) |
| TBx5 | `5` | scored_radio | **Yes** | ODS | **0.50** | Is someone on the team ready to own it? (0–4) |

**TBx1 options (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| `under_1` | Less than 1 hr |
| `1_to_2` | 1–2 hrs |
| `2_to_4` | 2–4 hrs |
| `4_to_8` | 4–8 hrs |
| `over_8` | More than 8 hrs |

**TBx2 options (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| `no_skills` | No one on my team has the skills yet |
| `not_documented` | I haven't documented how it works |
| `keeps_coming_back` | I've tried to transfer it but it keeps coming back |
| `not_ready` | I'm not sure I'm ready to let go of it |
| `not_priority` | I haven't made it a priority yet |

**TBx3:** Free text — "If you had to transfer the [Workflow Name] workflow in the next 90 days, what's the biggest obstacle?" No options. Saved to `text_value`.

**TBx4 scored options (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| 0 | No documentation at all |
| 1 | Some notes but not a real SOP |
| 2 | A partial SOP exists |
| 3 | A mostly complete SOP exists |
| 4 | Yes — a full SOP exists and is current |

**TBx5 scored options (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| 0 | No — I'd need to hire someone |
| 1 | Maybe, but they're not close |
| 2 | Possibly with significant training |
| 3 | Yes, with some preparation |
| 4 | Yes — they're ready now, I just haven't transferred it |

**Mode A ODS formula:**
```
Workflow ODS (Mode A) = 100 − ((TBx4 + TBx5) / 8) × 100
```
High scores on TBx4 and TBx5 mean low debt. Located at `src/lib/scoring.ts:219`.

**Specific question keys per workflow:**

| Workflow | TBx1 | TBx2 | TBx3 | TBx4 | TBx5 |
|----------|------|------|------|------|------|
| C — Listing Launch | TBC1 | TBC2 | TBC3 | TBC4 | TBC5 |
| D — Seller Communication | TBD1 | TBD2 | TBD3 | TBD4 | TBD5 |
| E — File Opening | TBE1 | TBE2 | TBE3 | TBE4 | TBE5 |
| F — Lender Tracking | TBF1 | TBF2 | TBF3 | TBF4 | TBF5 |

---

### Mode B — Full OQI (Q001–Q072)

**Condition:** B001–B004 answered `tc`, `listing_coordinator`, or `operations_manager`
**Shown when:** A named non-owner person already owns the workflow

18 questions per workflow × 4 workflows = **72 questions maximum** (respondent sees only the 18 for workflows they qualify for).

All Mode B questions are `scored_radio`, `is_scored=true`, `applies_to_profile='both'`, `dimension=OQI`.

**The 18 questions repeat across all 4 workflows with the workflow name substituted.** Below is the full question set using "Listing Launch" (Section C) as the template.

#### OQI Dimensions and Questions

The 18 questions per workflow are grouped into 6 OQI dimensions as follows:

| OQI Dimension | DB Slug | Weight | Questions per workflow | DB Keys (Section C) |
|---|---|---|---|---|
| Financial Accountability | `FA` | 0.20 | Q001–Q003 | Q001, Q002, Q003 |
| Role Accountability | `RA` | 0.22 | Q004–Q006 | Q004, Q005, Q006 |
| Systems & Checklists | `SC` | 0.18 | Q007–Q009 | Q007, Q008, Q009 |
| Execution & Training | `ET` | 0.15 | Q010–Q012 | Q010, Q011, Q012 |
| Outcome Accountability | `OA` | 0.15 | Q013–Q015 | Q013, Q014, Q015 |
| Culture & Communication | `CC` | 0.10 | Q016–Q018 | Q016, Q017, Q018 |

> **⚠️ OQI Dimension Label Mismatch** — see [section below](#oqi-dimension-mismatch-known-issue).

#### Full Question List (Section C / Listing Launch as template)

| Key (C) | Key (D) | Key (E) | Key (F) | OQI Dim | Per-Q Weight | Question Text (workflow name in brackets) |
|---------|---------|---------|---------|---------|-------|---|
| Q001 | Q019 | Q037 | Q055 | FA | 0.07 | Does your named owner have the authority to make decisions within the [Workflow] workflow without checking with you first? |
| Q002 | Q020 | Q038 | Q056 | FA | 0.07 | Can your named owner send final communications to clients, vendors, lenders, or title on [Workflow] matters without your review or approval? |
| Q003 | Q021 | Q039 | Q057 | FA | 0.07 | If your named owner makes a mistake on a [Workflow] decision, are they responsible for resolving it — or does it come back to you? |
| Q004 | Q022 | Q040 | Q058 | RA | 0.07 | In the last 30 days, how often did your named owner make a [Workflow] decision and act on it without consulting you first? |
| Q005 | Q023 | Q041 | Q059 | RA | 0.07 | When something unexpected happens inside the [Workflow] workflow, who takes the first action? |
| Q006 | Q024 | Q042 | Q060 | RA | 0.07 | When your named owner encounters a [Workflow] problem, do they typically bring you a recommended solution or ask you what to do? |
| Q007 | Q025 | Q043 | Q061 | SC | 0.06 | Is there a current, documented SOP for the [Workflow] workflow that your named owner follows step by step? |
| Q008 | Q026 | Q044 | Q062 | SC | 0.06 | Are the routine communications inside [Workflow] — client updates, confirmations, reminders — templated so your named owner doesn't write them from scratch? |
| Q009 | Q027 | Q045 | Q063 | SC | 0.06 | If your named owner hits an unusual situation inside [Workflow], do they have documentation or a decision guide — or do they call you? |
| Q010 | Q028 | Q046 | Q064 | ET | 0.05 | Does your named owner know exactly which [Workflow] situations they should handle independently versus bring to you? |
| Q011 | Q029 | Q047 | Q065 | ET | 0.05 | In the last 60 days, did your named owner escalate a [Workflow] issue to you that they should have handled within their own authority? |
| Q012 | Q030 | Q048 | Q066 | ET | 0.05 | If your named owner were out for a full day, is there a backup person who knows the [Workflow] escalation thresholds well enough to keep it moving? |
| Q013 | Q031 | Q049 | Q067 | OA | 0.05 | When something goes wrong inside [Workflow] — a missed deadline, a client issue, a dropped step — who is accountable to you for the outcome? |
| Q014 | Q032 | Q050 | Q068 | OA | 0.05 | Does your named owner have a clear, measurable standard they're held to for [Workflow] results — not just 'did you do the steps' but 'did it go well'? |
| Q015 | Q033 | Q051 | Q069 | OA | 0.05 | If your named owner consistently underperforms on [Workflow], is there a documented structure for coaching, correction, or responsibility reassignment? |
| Q016 | Q034 | Q052 | Q070 | CC | 0.03 | How confident are you that your named owner has the skills and knowledge to run [Workflow] reliably without your involvement? |
| Q017 | Q035 | Q053 | Q071 | CC | 0.03 | Based on your named owner's behavior — not just their words — how confident do they seem in managing [Workflow] independently? |
| Q018 | Q036 | Q054 | Q072 | CC | 0.03 | Has your named owner successfully managed [Workflow] independently, with outcomes at or above your standard, for at least 90 days? |

**Shared scored option sets:**

Questions Q001/Q019/Q037/Q055 (authority):
0 = No — all decisions come to me first → 4 = Yes — full authority within the workflow

Questions Q002/Q020/Q038/Q056 (communications):
0 = No — I review all final communications → 4 = Yes — they send without my review

Questions Q003/Q021/Q039/Q057 (mistake resolution):
0 = It always comes back to me to resolve → 4 = They own the resolution fully

Questions Q004/Q022/Q040/Q058 (independent action):
0 = Never → 4 = Consistently — they act independently

Questions Q005/Q023/Q041/Q059 (first action):
0 = Always me → 4 = Always them — they own the first response

Questions Q006/Q024/Q042/Q060 (solution vs ask):
0 = They bring me the problem and ask me what to do → 4 = Always bring a solution — I just approve or adjust

Questions Q007/Q025/Q043/Q061 (SOP):
0 = No SOP exists for this workflow → 4 = A current, complete SOP is followed consistently

Questions Q008/Q026/Q044/Q062 (templates):
0 = No templates — all communications are written from scratch → 4 = All routine communications are fully templated

Questions Q009/Q027/Q045/Q063 (decision guide):
0 = They always call me when something unusual happens → 4 = Full decision guide exists — they rarely need me

Questions Q010/Q028/Q046/Q064 (clarity on scope):
0 = No — nothing is defined → 4 = Yes — fully documented and understood

Questions Q011/Q029/Q047/Q065 (over-escalation):
0 = Constantly → 4 = Never — they handle what's within their authority

Questions Q012/Q030/Q048/Q066 (backup):
0 = No backup exists at all → 4 = Backup is fully capable of maintaining continuity

Questions Q013/Q031/Q049/Q067 (accountability):
0 = I'm still accountable — it always comes back to me → 4 = Fully them — they own outcomes

Questions Q014/Q032/Q050/Q068 (measurable standard):
0 = No — no standards exist → 4 = Clear, measurable standards reviewed regularly

Questions Q015/Q033/Q051/Q069 (accountability structure):
0 = No — no accountability structure exists → 4 = Fully documented and consistently applied

Questions Q016/Q034/Q052/Q070 (your confidence in them):
0 = Not confident → 4 = Fully confident — they run it better than I would

Questions Q017/Q035/Q053/Q071 (their self-confidence):
0 = Clearly not confident — they seem uncertain or anxious → 4 = Fully confident — they own it without hesitation

Questions Q018/Q036/Q054/Q072 (track record):
0 = No — they haven't managed it independently → 4 = 90+ days consistently at or above standard

**Mode B OQI formula:**
```
Workflow OQI = Σ ( (avg(dimension_answers) / 4) × 100 × dimension_weight )
  where dimension_weights = { FA:0.20, RA:0.22, SC:0.18, ET:0.15, OA:0.15, CC:0.10 }
```
Located at `src/lib/scoring.ts:186`.

**Mode B ODS:**
```
Workflow ODS (Mode B) = 100 − OQI
```
Located at `src/lib/scoring.ts:215`.

---

### Mode C — Role Clarity (RCx1–RCx3)

**Condition:** B001–B004 answered `shared`
**Shown when:** No single named owner exists for this workflow

3 questions per workflow × 4 workflows = **12 questions maximum**

| Template Key | Input Type | Scored? | Dimension | Weight | DB `reverse_scored` | Description |
|---|---|---|---|---|---|---|
| RCx1 | categorical_radio | No | — | 1.00 | false | Why there's no single owner |
| RCx2 | scored_radio | **Yes** | ODS | 1.00 | false | Team capacity (high = less debt) |
| RCx3 | scored_radio | **Yes** | ODS | 1.00 | **true** | Fallthrough frequency (high = more debt) |

**RCx1 options (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| `between_roles` | It genuinely falls between roles |
| `never_assigned` | We've never assigned it formally |
| `tried_and_failed` | We tried but the person didn't stick |
| `not_sure` | I'm not sure who should own it |
| `whoever_has_time` | It defaults to whoever has time |

**RCx2 options — "Is anyone on your team capable of owning [Workflow] if it were formally assigned to them?" (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| 0 | No |
| 1 | Possibly with help |
| 2 | Yes, with training |
| 3 | Yes, with authority documentation |
| 4 | Yes — it just hasn't been assigned |

**RCx3 options — "How often does something fall through the cracks in the [Workflow] workflow because of unclear ownership?" (same across all 4 workflows):**

| Value | Label |
|-------|-------|
| 0 | Never |
| 1 | Rarely |
| 2 | Sometimes |
| 3 | Often |
| 4 | Constantly |

**Mode C ODS formula:**
```
Workflow ODS (Mode C) = 100 − (RCx2 / 4) × 50 [+ 12.5 if RCx3 ≥ 3]
```
High RCx2 (capable team) lowers debt. RCx3 ≥ 3 ("Often" or "Constantly") adds a 12.5 debt penalty.
Located at `src/lib/scoring.ts:228`.

**Specific question keys per workflow:**

| Workflow | RCx1 | RCx2 | RCx3 |
|----------|------|------|------|
| C — Listing Launch | RCC1 | RCC2 | RCC3 |
| D — Seller Communication | RCD1 | RCD2 | RCD3 |
| E — File Opening | RCE1 | RCE2 | RCE3 |
| F — Lender Tracking | RCF1 | RCF2 | RCF3 |

---

## Section G — Delegation Readiness Score

**Route:** `/assessment/[sessionId]/g`
**DB section column:** `'G'`
**Mode filter:** none
**Profile filter:** YES — `fetchQuestions('G', { drsProfile })` — this is where Team vs Solo branching happens

The page reads `session.drs_profile ?? 'team'` and passes it to `fetchQuestions`. The query filters:
```sql
WHERE section = 'G' AND is_active = true AND applies_to_profile IN ('both', <drsProfile>)
```

---

### Team Profile (Q073–Q086)

**Shown when:** `drs_profile = 'team'`

All team profile questions are `scored_radio`, `is_scored=true`, `dimension=DRS`.

| Key | Order | DRS Category | `applies_to_profile` | Weight | Question Text |
|-----|-------|---|---|---|---|
| Q073 | 115 | Willingness | **both** | 0.08 | Are you willing to let a team member be fully accountable for a workflow outcome — including owning the fix when something goes wrong — without stepping in yourself? |
| Q074 | 116 | Willingness | **both** | 0.08 | In the last 90 days, have you voluntarily moved any responsibility off your plate to a team member and kept it there without taking it back? |
| Q075 | 117 | Willingness | **both** | 0.08 | When a team member handles something differently than you would — but the outcome is still good — how do you typically respond? |
| Q076 | 118 | Willingness | **both** | 0.08 | How much of your reluctance to delegate is about the other person's readiness versus your own comfort with releasing control? |
| Q077 | 119 | Delegation Quality | team | 0.08 | When you hand off a responsibility, how do you typically do it? |
| Q078 | 120 | Delegation Quality | team | 0.08 | When you delegate, how often do you explicitly define what 'done' looks like — not just the task, but the standard the outcome should meet? |
| Q079 | 121 | Delegation Quality | team | 0.08 | When you delegate a responsibility, do you also transfer the authority to make decisions within that responsibility — or do decisions still need your approval? |
| Q080 | 122 | Team Capacity | team | 0.06 | Do your current support staff have the capacity — time and bandwidth — to absorb additional ownership without being overloaded? |
| Q081 | 123 | Team Capacity | team | 0.06 | On average, how many active files does your TC or primary coordinator manage at one time? |
| Q082 | 124 | Team Capacity | team | 0.06 | How long has your primary support person (TC/LC/coordinator) been in their current role? |
| Q083 | 125 | Team Capacity | team | 0.06 | Do new support staff learn your workflows primarily from documented SOPs or primarily by asking you and shadowing you? |
| Q084 | 126 | Authority Framework | team | 0.07 | Do your team members have clear, documented guardrails showing what they can decide independently versus what requires your involvement? |
| Q085 | 127 | Authority Framework | team | 0.07 | Do you have escalation thresholds documented so your staff knows exactly when to handle something and when to bring it to you? |
| Q086 | 128 | Authority Framework | team | 0.07 | How often does work stop or slow down because someone on your team needs your approval before moving forward on something they probably could have handled? |

**DRS Team formula:**
```
DRS = (avg(Willingness) / 4) × 0.30
    + (avg(Delegation Quality) / 4) × 0.25
    + (avg(Team Capacity) / 4) × 0.25
    + (avg(Authority Framework) / 4) × 0.20
```
Result × 100 = final 0–100 score. Located at `src/lib/scoring.ts:241`.

**Selected option text for key questions:**

Q073 (willingness to let team own mistakes):
0 = No — I always need to be involved when things go wrong → 4 = Yes — I let them own it fully, including the fix

Q074 (has moved responsibility and kept it there):
0 = No — nothing has moved off my plate → 4 = Yes — multiple responsibilities moved and staying moved

Q077 (handoff quality):
0 = Verbally, in the moment — 'can you handle this?' → 4 = Full documented handoff with SOP, standards, and authority transfer

Q079 (authority transfer):
0 = Decisions always still need my approval → 4 = Full authority transfer — they decide within the scope

Q081 (active files load):
0 = 30 or more — they're overloaded → 4 = Fewer than 10 — manageable load

Q086 (approval bottleneck frequency):
0 = Daily — constant bottleneck → 4 = Rarely or never — the team moves without me

---

### Solo Profile (SDQ1–3, SHR1–4, SSM1–3)

**Shown when:** `drs_profile = 'solo'`

All solo profile questions are `scored_radio`, `is_scored=true`, `dimension=DRS`.

Note: Willingness questions Q073–Q076 (`applies_to_profile='both'`) also appear for solo respondents.

| Key | Order | DRS Category | `applies_to_profile` | Weight | Question Text |
|-----|-------|---|---|---|---|
| Q073 | 115 | Willingness | **both** | 0.08 | (see Team section above — shown to solo too) |
| Q074 | 116 | Willingness | **both** | 0.08 | (see Team section above) |
| Q075 | 117 | Willingness | **both** | 0.08 | (see Team section above) |
| Q076 | 118 | Willingness | **both** | 0.08 | (see Team section above) |
| SDQ1 | 129 | Transfer Readiness | solo | 0.08 | If you had to hand off one of your workflows to someone you hired tomorrow, do you know exactly what you'd give them — their responsibilities, their authority, and what 'done well' looks like? |
| SDQ2 | 130 | Transfer Readiness | solo | 0.08 | Do you currently run your business in a way that could be handed to someone else — meaning you follow consistent processes rather than figuring it out differently each time? |
| SDQ3 | 131 | Transfer Readiness | solo | 0.08 | If you hired a TC or coordinator tomorrow, how quickly could you get them operational on your most critical workflow? |
| SHR1 | 132 | Hiring Readiness | solo | 0.06 | Do you have a clear picture of what your first support hire would own — the specific workflows, responsibilities, and authority they'd have from day one? |
| SHR2 | 133 | Hiring Readiness | solo | 0.06 | Is your current transaction volume and revenue at a level where bringing on a support person would be financially viable? |
| SHR3 | 134 | Hiring Readiness | solo | 0.06 | How much of your current workflow knowledge lives only in your head versus in documented systems? |
| SHR4 | 135 | Hiring Readiness | solo | 0.06 | Have you set a specific target — a timeline or transaction volume — for when you plan to make your first support hire? |
| SSM1 | 136 | Systems Mindset | solo | 0.07 | When you solve a recurring problem in your business, do you build a process so it stays solved — or do you solve it in the moment and move on? |
| SSM2 | 137 | Systems Mindset | solo | 0.07 | If you were unreachable for a full week right now, what would happen to your active transactions? |
| SSM3 | 138 | Systems Mindset | solo | 0.07 | Are you actively building your business to be less dependent on you — or is systematizing something you plan to focus on later? |

**DRS Solo formula:**
```
DRS = (avg(Willingness) / 4) × 0.30
    + (avg(Transfer Readiness) / 4) × 0.25
    + (avg(Hiring Readiness) / 4) × 0.25
    + (avg(Systems Mindset) / 4) × 0.20
```
Result × 100 = final 0–100 score. Located at `src/lib/scoring.ts:241` (same function, different weight map).

**Selected option text for key solo questions:**

SDQ3 (onboarding speed):
0 = Months — everything would need to be taught from scratch → 4 = Within a week — documentation exists and is current

SSM2 (what happens if unreachable a week):
0 = They would stall or fail — everything depends on me personally → 4 = Everything would run — my systems and contacts are documented

---

## Section H — Final Reflections

**Route:** `/assessment/[sessionId]/h`
**DB section column:** `'H'`
**Mode filter:** none
**Profile filter:** none — all 4 questions shown to everyone

| Key | Order | Question Text | Input Type | Scored? | Notes |
|-----|-------|---|---|---|---|
| Q087 | 139 | On a scale of 1–5, how urgent is it for you to reduce your personal involvement in day-to-day operations over the next 90 days? | scored_radio | No | Uses 1–5 scale (not 0–4); passed to webhook as context only |
| Q088 | 140 | Which of the following best describes your primary goal for this assessment? | categorical_radio | No | |
| Q089 | 141 | Is there anything specific about your business situation that you'd like your consultant to know before reviewing your results? (Optional) | free_text | No | Passed as `context.consultant_note` in webhook |
| Q090 | 142 | What does success look like for you 90 days from now? (Optional) | free_text | No | Passed as `context.success_vision` in webhook |

**Q087 options:**

| Value | Label |
|-------|-------|
| 1 | 1 — Not urgent at all |
| 2 | 2 — Somewhat low priority |
| 3 | 3 — Moderate priority |
| 4 | 4 — High priority |
| 5 | 5 — Critical — I need this now |

**Q088 options:**

| Value | Label |
|-------|-------|
| `understand_bottleneck` | Understand where I'm holding my team back |
| `identify_first_delegation` | Identify which workflow to delegate first |
| `build_case` | Build a case for hiring or restructuring |
| `prepare_growth` | Prepare for a growth phase or team expansion |
| `reduce_workload` | Reduce my personal workload and reclaim time |

Q089 and Q090 are free text, optional. They are submitted via form (not autosaved) and processed in `submitAssessment()` in `src/app/assessment/actions.ts:145`.

---

## Three-Mode Branching Logic

**Source:** `src/lib/assessment.ts:129`, `src/app/assessment/actions.ts:88`

### How modes are determined

After Section B is submitted, `advanceSectionB()` runs:

1. Reads B001–B004 answers from the DB (`fetchSessionAnswers`)
2. For each question key, calls `answerToMode(textValue)`:

```typescript
// src/lib/assessment.ts:129
function answerToMode(answerValue: string): WorkflowMode {
  switch (answerValue) {
    case 'team_leader':        return 'A'; // Transfer Barrier
    case 'tc':
    case 'listing_coordinator':
    case 'operations_manager': return 'B'; // Full OQI
    case 'shared':
    default:                   return 'C'; // Role Clarity
  }
}
```

3. Writes the four modes to `assessment_sessions.wf_c_mode / wf_d_mode / wf_e_mode / wf_f_mode`

### How modes are used

Each workflow page (c/d/e/f) reads its mode from the session and calls `fetchQuestions(section, { mode })`. The Supabase query filters:
```sql
WHERE section = $section AND mode = $mode AND is_active = true
```

No mode branching happens at the question-text level — only at the question-set level.

### Mode badge labels shown in the UI

| Mode | Badge text |
|------|-----------|
| A | Owner-Led |
| B | Team-Led |
| C | Shared / No Clear Owner |

These are displayed in `WorkflowSection.tsx:12`.

---

## Dual DRS Profile Logic — Team vs Solo

**Primary detection source:** `src/lib/assessment.ts:154`
**Secondary refinement:** `src/lib/assessment.ts:159`
**Where it routes questions:** `src/app/assessment/[sessionId]/g/page.tsx:17`
**Where it routes scoring:** `src/lib/scoring.ts:241`

### Detection sequence

**Step 1 — Immediate (end of Section A):**
`advanceSectionA()` reads the saved A006 answer and calls:

```typescript
// src/lib/assessment.ts:154
function detectDrsProfileFromA006(a006Value: string): DrsProfile {
  return a006Value === 'just_me' ? 'solo' : 'team';
}
```

Result is written to `assessment_sessions.drs_profile`.

**Step 2 — Refinement (end of Section B):**
`advanceSectionB()` reads A006 again and all workflow modes, then calls:

```typescript
// src/lib/assessment.ts:159
function refineDrsProfile(
  a006Value: string,
  modes: Record<WorkflowKey, WorkflowMode | null>,
): DrsProfile {
  if (a006Value === 'just_me') return 'solo';           // hard override
  if (a006Value === '2_people') {
    const modeACount = Object.values(modes).filter((m) => m === 'A').length;
    if (modeACount >= 3) return 'solo';                 // "small team, owner does everything"
  }
  return 'team';
}
```

This writes the refined value back to `assessment_sessions.drs_profile`, overwriting the Step 1 value.

**Step 3 — Section G page load:**

```typescript
// src/app/assessment/[sessionId]/g/page.tsx:17
const drsProfile = session.drs_profile ?? 'team';
```

The `?? 'team'` fallback activates if `drs_profile` is null in the DB.

`fetchQuestions('G', { drsProfile })` then runs:
```typescript
// src/lib/assessment.ts:256
query = query.in('applies_to_profile', ['both', opts.drsProfile]);
```

For `drsProfile = 'solo'`: `WHERE applies_to_profile IN ('both', 'solo')`
For `drsProfile = 'team'`: `WHERE applies_to_profile IN ('both', 'team')`

### What each profile sees in Section G

| Profile | Questions shown | Questions excluded |
|---------|----------------|-------------------|
| **Team** | Q073–Q086 (Willingness + Delegation Quality + Team Capacity + Authority Framework) | SDQ1–3, SHR1–4, SSM1–3 |
| **Solo** | Q073–Q076 (Willingness) + SDQ1–3, SHR1–4, SSM1–3 | Q077–Q086 (Delegation Quality, Team Capacity, Authority Framework) |

### Why solo respondents may be seeing team questions

**The filtering logic in `fetchQuestions` is correct as written.** Solo respondents routed with `drs_profile='solo'` should not receive Q077–Q086. The observed behavior (solo respondents seeing team questions) has one likely cause:

**`session.drs_profile` is null when Section G loads**, triggering the `?? 'team'` fallback at `g/page.tsx:17`. This causes team questions to be shown.

**How `drs_profile` can be null at Section G:**

1. **Race condition in Section A save:** `SectionForm.tsx` saves A006 via `startTransition(() => saveRadioAnswer(...))` — an async call that fires on radio change. If the user selects A006 and immediately clicks "Next," the form submission (`advanceSectionA`) can execute before the A006 save commits to the DB. In that case, `fetchSessionAnswers` returns no A006 answer, `detectDrsProfileFromA006('')` returns `'team'`, and `setDrsProfile(sessionId, 'team')` writes 'team' even for a `just_me` respondent.

2. **The refinement in `advanceSectionB` should fix this:** By the time the user finishes Section B, A006's save will have long since committed. `refineDrsProfile('just_me', modes)` returns `'solo'`, correcting the profile. However, if the user somehow navigates to Section G without going through Section B (direct URL, session resumption), the incorrect value from Step 1 would persist.

3. **The specific gap:** If there's any path to Section G where Step 2 (`advanceSectionB`) did not run or ran before A006 was committed, `drs_profile` may be 'team' for a solo respondent. The `?? 'team'` fallback in g/page.tsx cannot distinguish between "null because Step 2 hasn't run yet" and "null because there's an older session that predates drs_profile being set."

**The branch condition is not wrong. The profile is not being checked at the wrong point. The Solo profile does actually exclude team questions in the implementation — but only when `drs_profile` is correctly written to the DB before Section G loads.**

---

## Named User / Dynamic Text

### Where respondent-entered names appear

The respondent enters two identity fields on the landing page:
- **Name** (A001 question key, `free_text`) — their personal name
- **Business name** (A002 question key, `free_text`) — their team or brokerage name

These are saved in `createAssessmentSession()` at `src/app/assessment/actions.ts:26`.

### How they are (and are not) used

| Location | Uses A001 name? | Uses A002 business name? | How |
|----------|----------------|--------------------------|-----|
| Section A–H question text | No | No | No dynamic substitution in question text |
| Section G profile badge | No | No | Shows "Solo Owner track" or "Team Leader track" (not their name) |
| Results page | No | No | No personalization |
| HubSpot contact sync (`src/lib/hubspot.ts`) | **Yes** | **Yes** | `firstname`/`lastname` split from A001, `company` = A002 |
| Admin session detail | Not inspected | Not inspected | Data is in DB, admin may display it |

**In summary: the respondent's name and business name are captured and synced to HubSpot as contact properties (via `upsertHubspotContact`, once an email is submitted on the results page), but they are not used anywhere in the assessment UI, question wording, or results page for personalization or dynamic text substitution.**

The phrase "named owner" that appears throughout Mode B questions (Q001–Q072) refers to the person who owns each workflow — it is a generic term in the question text, not a slot populated with any name the respondent entered. No name substitution is implemented.

---

## Landing Page Copy & Contact Capture

**Route:** `/assessment` (also `/`, which redirects here)
**Source:** `src/app/assessment/page.tsx`

### Exact copy

**Page title (h1):** Ownership Assessment

**Tagline (p):** A structured diagnostic that reveals exactly where ownership debt lives in your business — and what to do about it.

**"What to expect" section:**

| Title | Description |
|-------|-------------|
| ~8–10 minutes | Complete in one sitting across 8 sections |
| Saved as you go | Answers are saved automatically as you select them |
| Your results | Your Ownership Assessment Score: a clear picture of where your business depends on you, and your single highest-leverage move to change it. |

**Form section label:** Let's get started

**Form fields:**
- "Your name" (required, text, placeholder "Jane Smith")
- "Business name" (required, text, placeholder "Smith Real Estate Group")

**Submit button:** Start Assessment →

**Privacy line:** Your answers are private and used only to generate your report.

### Email / contact capture

**There is no email field anywhere in the assessment.** The landing page collects name and business name only. No email is captured during the flow, and nothing is sent to the CRM at completion.

The only way to reach a respondent post-assessment is via the HubSpot contact created when they submit their email on the results page (`captureEmail` → `upsertHubspotContact`). If they never submit an email, no CRM record exists and there is no contact method.

---

## Scoring Formulas Reference

**Source:** `src/lib/scoring.ts`

### Overall ODS (Ownership Debt Score)

```
overallOds = average of all non-null workflow ODS values
```

Lower is better (0 = fully delegated, 100 = entirely owner-dependent).

Score bands:
- 0–30: Optimized (#22c55e green)
- 31–50: Developing (#eab308 yellow)
- 51–70: Elevated (#f97316 orange)
- 71–100: Critical (#ef4444 red)

### Per-workflow ODS

| Mode | Formula |
|------|---------|
| A (Transfer Barrier) | `100 − ((TBx4 + TBx5) / 8) × 100` |
| B (Full OQI) | `100 − OQI` |
| C (Role Clarity) | `100 − (RCx2 / 4) × 50 [+ 12.5 if RCx3 ≥ 3]` |

### OQI (Ownership Quality Index)

Only computed for Mode B workflows.

```
OQI = Σ over 6 dimensions: (avg_raw_answers / 4 × 100) × dimension_weight
  FA: 0.20 | RA: 0.22 | SC: 0.18 | ET: 0.15 | OA: 0.15 | CC: 0.10
```

Score bands (higher is better):
- 0–30: Undocumented (#ef4444 red)
- 31–50: Fragile (#f97316 orange)
- 51–70: Functional (#eab308 yellow)
- 71–100: Optimized (#22c55e green)

### DRS (Delegation Readiness Score)

Higher is better. Profile-dependent weights.

**Team profile:**
```
DRS = (avg(Willingness Q073–Q076) / 4) × 0.30
    + (avg(Delegation Quality Q077–Q079) / 4) × 0.25
    + (avg(Team Capacity Q080–Q083) / 4) × 0.25
    + (avg(Authority Framework Q084–Q086) / 4) × 0.20
Result × 100
```

**Solo profile:**
```
DRS = (avg(Willingness Q073–Q076) / 4) × 0.30
    + (avg(Transfer Readiness SDQ1–3) / 4) × 0.25
    + (avg(Hiring Readiness SHR1–4) / 4) × 0.25
    + (avg(Systems Mindset SSM1–3) / 4) × 0.20
Result × 100
```

Score bands:
- 0–30: Not Ready (#ef4444 red)
- 31–50: Developing (#f97316 orange)
- 51–70: Emerging (#eab308 yellow)
- 71–100: Ready (#22c55e green)

### Reverse scoring

`reverse_scored = true` means the raw answer is transformed before averaging: `effective_value = 4 − raw_value`. Currently applies to:
- RCC3, RCD3, RCE3, RCF3 (Mode C fallthrough frequency — high fallthrough = high debt)

---

## OQI Dimension Mismatch (Known Issue)

The DB column `oqi_dimension` was set during the original seed (`seed-questions.sql`) with placeholder labels that map the 18 Mode B questions to 6 dimensions as:

- Q001–Q003: FA (Financial Accountability)
- Q004–Q006: RA (Role Accountability)
- Q007–Q009: SC (Systems & Checklists)
- Q010–Q012: ET (Execution & Training)
- Q013–Q015: OA (Outcome Accountability)
- Q016–Q018: CC (Culture & Communication)

`seed-questions-v2.sql` subsequently replaced all question text with final copy from the live question bank, but **did not update the `oqi_dimension` column**. The actual content of the final questions does not match these labels:

| Keys | DB Dimension Label | Actual question content |
|------|-------------------|------------------------|
| Q001–Q003 | FA (Financial Accountability) | Decision authority, communication approval, mistake ownership — closer to Role Accountability |
| Q004–Q006 | RA (Role Accountability) | Recent independent action frequency, first responder role, solution vs asking — closer to Execution pattern |
| Q007–Q009 | SC (Systems & Checklists) | SOP existence, communication templates, decision guide — correctly SC |
| Q010–Q012 | ET (Execution & Training) | Escalation clarity, over-escalation frequency, backup capability — closer to Authority Framework |
| Q013–Q015 | OA (Outcome Accountability) | Outcome accountability, measurable standards, accountability structure — correctly OA |
| Q016–Q018 | CC (Culture & Communication) | Your confidence in them, their behavioral confidence, 90-day track record — closer to ET/track record |

This mismatch means OQI sub-dimension breakdown labels shown to admins (and in webhook payloads) are named incorrectly relative to the questions they reflect. The overall OQI score is unaffected (it sums all 18 questions regardless of label), but per-dimension sub-scores (stored in `score_breakdowns`) are misattributed.
