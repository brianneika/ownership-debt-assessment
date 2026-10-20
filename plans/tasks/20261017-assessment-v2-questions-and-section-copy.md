# Assessment v2: honest answers, healthy ownership, and section copy

**Status:** In progress (2026-10-19): Phase 1 shipped 2026-10-18; Phases 2 and 3 approved by Bri 2026-10-19; Phase 4 built on branch `assessment-v2-build` (PR open, not merged), waiting on Bri's migration run; Phase 5 next <!-- Not started | In progress | Blocked | Done -->

## Objective

Revise the Ownership Debt Assessment so every respondent can answer honestly, so "ownership" is measured precisely (routine work handled with the right decisions escalated, not the leader never involved), so its length is a deliberate decision, and so the results repay the effort of finishing; keep the section copy (task C) in step, and ship it as a new, labeled version of the instrument.

## Why

A full test walk on 2026-10-17 (every team-owned workflow, an owner-run branch, a shared branch, both readiness tracks and the completion screen, using a session labeled "Assessment review TEST" with synthetic answers) found problems deeper than readability:

- Some answer choices force an inaccurate answer.
- Some questions imply that good delegation means the leader is never involved.
- Some scales mix two measurements, or overlap at the edges.
- The readiness section reads like a character test in places.
- The solo track asks people with no staff about their staff.

The experience should leave someone thinking "That helped me see my business clearly." Today it risks "I can see which answer you want." If the assessment misunderstands their business in the first few screens, they have less reason to trust its conclusion.

Ladders up to the master plan: job 2 (qualification reads as fit) and job 4 (the day-90 retake proves the delta). A retake is only proof if the instrument measures the right thing and old and new scores are never silently compared across versions.

**This reverses one decision.** Task A's approved brief (2026-10-16) put question wording and answer options out of scope because changing them changes what scores mean. This task brings them in scope on purpose, and handles the "changes what scores mean" problem with versioning (part 7 below). With only a couple of real respondents so far, now is the cheapest time to do it.

## How this combines with task C (section intros)

Bri asked for one plan covering both. The section intros are already drafted and close to approval (`vai-va-training/output/20261017-assessment-copy-c-section-draft.md`), so they ship first, on today's questions, as **Phase 1**. The draft computes question counts from each page's question list, so the counts stay true when v2 changes them. Phase 6 then revises only the intro lines that v2 changes (owner tags, the "shared" intro, the solo track, Part 1). Task C's file points here and stays as the record of the approved copy.

## Priority order

1. Fix answer fit and scales.
2. Correct the definition of healthy ownership, and keep the reason for a gap separate from its consequence.
3. Decide the length on purpose: remove questions that don't change a recommendation, and sharpen wording.
4. Results that explain the finding, show what it's based on, name a practical priority and say what's missing.

Kept from the first draft of this plan, unchanged: the answer-fit fixes, the neutral wording and the versioning.

---

## What changes

### 1. Places where an honest answer doesn't fit (must fix)

| Where | Problem today | Change |
|---|---|---|
| About you: support team size | Choices are "Just me", "2 people", then larger groups. Someone with one assistant has no answer. | Say "Not including you" and offer None, 1, 2, 3 to 4, 5 to 7, 8 or more. |
| About you: business model | "Team lead with support staff" and "Team lead with buyer/listing agents" overlap; many clients have both. | Separate business structure (solo agent, team lead, brokerage owner, other) from staffing (support people, and agents producing under you) as their own questions. |
| Who owns what: owner choices | Roles leave out assistants, VAs, other agents and outside coordinators. | Add "Another person or provider" with a short role field (for example "outsourced TC", "VA"). |
| Who owns what: shared | "Shared / No clear owner" treats two different things as one. Work can be shared while accountability is clear. | Ask who is accountable for keeping the whole workflow moving, even when several people contribute. "No one is accountable" becomes its own answer. |
| Owner-run workflow: why you still do it | Reasons leave out "I don't have support", budget, and a deliberate business decision. | Add those three. Don't force everyone into a skills, documentation or control problem. |
| Questions that depend on an event happening | "Never" on a hard seller conversation could mean none happened. | Add "This didn't come up" wherever the question depends on an event. Score it as not applicable, never as a low score. |
| Workflow relevance | Buyer-focused or cash-heavy businesses still get graded on seller and lender work. | Give each workflow a "We don't do this work" route in Who owns what. That workflow is skipped and left out of the overall score. |

### 2. Measure ownership precisely, not total independence

The most consequential change. Today the strongest answers include "Full authority within the workflow", "They own the resolution fully", "Without your involvement" and "They run it better than I would". Those measure different things. Someone can fully own a workflow and still correctly bring specific decisions to the leader; the escalation questions already recognize that, and the strongest-answer wording works against it.

**"Within agreed boundaries" is not enough on its own.** Many respondents won't have agreed boundaries yet, and that is something the assessment should find, not assume. Swapping "without your involvement" for "within agreed boundaries" would hide the difference between three situations that need different fixes:

| What's happening | What it means | What it points to |
|---|---|---|
| They handle the routine work and bring you the decisions that should come to you. | Healthy ownership. Your involvement is by design. | Strongest answer. Protect it. |
| They wait for your approval because no one has said what they can decide. | Authority is unclear. The person may be capable; the boundaries don't exist yet. | Define decision rights. Not a people problem. |
| You routinely check, correct or rescue the work. | The work hasn't really transferred. | Capability, process or trust gap, found by the questions that follow. |

The ownership questions (and the readiness questions on decision boundaries) ask which of these is true, in the respondent's own terms, before asking how well it works. Answer lists use these three situations, not a single "how independent" scale.

| Today | Direction |
|---|---|
| "How confident are you ... without you checking in?" | "How confident are you that they can keep listing launches moving, bringing you only the decisions that need you?" Paired with a question on whether those decisions have been spelled out. |
| Top confidence answer: "They run it better than I would." | "Fully confident." Being better than the leader is a separate claim. |
| "Who's accountable ... if a seller relationship sours?" | "Who takes responsibility for following through when a seller communication issue needs fixing?" |
| Lender: "Did the file actually close on time?" | Ask about tracking milestones, spotting delays and coordinating next steps. Closing on time also depends on other parties. |

Apply the same test to every top answer in the team-owned workflows: the best answer must describe routine ownership with the right escalation, never the leader being absent. The leader should not have to give up appropriate oversight to earn a better score.

### 2a. Keep the reason separate from the consequence (scoring safeguard)

- **No support is a staffing condition, not poor leadership readiness.** Someone with no team can't score low on readiness for not having one. Staffing is recorded as context; readiness questions for them are framed as future scenarios (part 5) and scored on those.
- **Keeping a workflow on purpose is not a failure to delegate.** A leader who runs listing launches by choice gets that recorded as a choice.
- **Measure the operational consequence on its own:** hours it takes, what slips, what waits on the leader. The debt score reflects the consequence. The reason (no support, budget, a deliberate choice, skills, documentation, trust) is reported alongside it as the "why", never added to the score as a penalty.
- Results say this in words: "You run this yourself by choice. It takes about 4 to 8 hours a week" reads differently from "You haven't delegated this."

### 3. One measurement per answer scale

- "Do they send the weekly update straight to the seller, or does it come across your desk for review first?" answered with "Rarely / Sometimes / Usually" (usually which?). Becomes: "How often do they send routine seller updates without your review?", Never to Always.
- "Once or twice / Sometimes / Often / Consistently" mixes counts with frequency. Two independent file openings could be every file that month.
- "Several times a week / A few times a week / Once or twice a week" overlaps.
- Owner-run hours overlap at 2 and 4. Becomes: Less than 1 hour, 1 to under 2, 2 to under 4, 4 to under 8, 8 or more.
- "30 to 60 days / 60 to 90 days / 90+ days" overlaps at the edges and mixes duration with quality.

Rule: one measurement per scale, no overlapping bands. Where how often something comes up varies, ask how often it happened *when it was needed*, not how many times.

### 4. Remove wording that makes this feel like a character test (readiness)

- Replace "How much of your reluctance to delegate is about the other person's readiness versus your own comfort with releasing control?" It assumes reluctance and forces two causes. New: "What most often keeps you involved in work you'd like someone else to own?" Choices: their capability, their capacity, unclear expectations, unclear decision boundaries, my own comfort letting go, nothing right now. This is a **diagnostic** question, not a low-to-high scale, so it is not scored that way (see open question 4).
- "I celebrate it" as the top answer when someone succeeds differently: accepting a different approach is enough. Celebration measures personality.
- "30 or more, they're overloaded" and "Fewer than 10, manageable load": file count alone doesn't show load. Ask about load directly, or ask files and other responsibilities together.
- Drop "honestly", "actually", "real standard" and "under their watch" wherever they imply doubt or blame without adding precision.

You can confront a leadership problem without wording questions as if you've already decided the leader is the problem.

### 5. Solo track assumptions

- The solo readiness track opens by asking about current team members, including work handed over in the last 90 days. Someone with no staff can't answer that.
- "Solo agent" and "no support" are different. A solo producer can have an assistant or an outsourced TC.
- Route on whether support exists (support team size above zero, including outside providers), not on business model. Where they have experience, ask about past behavior. Where they don't, ask clearly framed future scenarios ("If you brought on support for this...").
- Today's rule that turns a two-person team into the solo track when the leader runs three or more workflows gets revisited with the new size choices.

### 6. Repetition that has to earn its place

The team-owned path is 98 questions, 72 of them across the four workflows. Don't cut by half on principle. Every repeated question must produce a distinct, useful finding. Start with:

- Decision boundaries versus escalation thresholds in readiness: they ask nearly the same thing. Merge or sharpen until they differ.
- The leader's confidence versus the leader's guess at the team member's self-confidence: the second asks the leader to read someone else's mind. Remove it.
- Questions that bundle several things. The written-process scale mixes whether documentation exists, whether it's current and whether it's followed; complete documentation nobody uses has no honest answer. Split or rescale.

Keep repetition that finds a real operational gap; remove repetition that only confirms the same impression.

### 6a. Length is a decision, made after the audit

Don't halve 98 questions on principle, and don't keep 98 just because each one is defensible on its own.

- **The test for every question:** "What recommendation would change because of this answer?" If the answer is none, the question needs a stronger reason to stay (for example, it's needed to show the basis of a finding, or the retake depends on it), written down in the audit.
- The audit ends with a **length decision** for Bri: questions per path before and after, which were cut and why, and the estimated time per path.
- **Timed walkthroughs** of the revised assessment on the main paths (all team-owned, mostly owner-run, solo with no support). The walks don't drive cuts (Bri, 2026-10-17): if a path runs past the "15 to 20 minutes" the intake page promises, the promise changes to the real time.
- The completion-time query from task A's brief gets run once v2 has real respondents, to check the timed walks against real behavior.

### 6b. Results that repay the effort

Fixing every question can still end in a discouraging or unconvincing conclusion. So the results page is an acceptance requirement for v2, not a band-label check. For every path, the results must:

1. **Explain the finding** in plain words: what the two scores mean together for this business.
2. **Show its basis:** which workflows and answers drove it, so the respondent can see why ("Lender tracking and file opening still wait on you").
3. **Name a practical priority:** the one gap holding them back, stated as something they could act on, consistent with the brief (the plan itself is for the free call with Bri).
4. **Acknowledge missing evidence:** workflows they don't do, questions marked "This didn't come up", or a solo respondent with no staff to judge yet. Say what the score does and doesn't cover instead of scoring around it silently.
5. **Respect the reason:** a workflow kept by choice, or no support yet, is described as such (part 2a), not as a failure.
6. **Read as fit, not judgment:** no result that would leave a respondent feeling they failed a test.

Each Phase 5 test path is checked against this list, and Bri reads the results screen for at least the three main paths before ship.

### 7. Versioning (so old and new scores never get mixed)

- Today's instrument becomes **v1**; every existing session is labeled v1. The revised one is **v2**.
- v1 questions stay in the database, marked inactive, so v1 answers and results still read correctly. v2 questions are new rows, not edits to v1 rows.
- Scoring picks its rules by the session's version. v1 results never get rescored with v2 rules.
- Admin shows the version on every session. Any before-and-after comparison (the day-90 retake) across versions is flagged as not directly comparable.
- The teaser uses the support-team question and the four owner picks, so it moves to v2 at the same time, and its preview score is checked against the v2 rules.

### 8. APPLE across the journey

Not five framework beats inside every question. The right beat at each moment:

| Moment | What the respondent needs | Change that delivers it |
|---|---|---|
| Beginning | "You understand how my business works." | Accurate business and staffing choices (part 1). |
| Who owns what | "I know what you mean by ownership." | Define accountability separately from doing every task, in the section intro and the question. |
| Workflow questions | "I can answer this without guessing." | Clear scales, relevant examples, "This didn't come up" (parts 1 and 3). |
| Readiness | "I can admit a gap without being judged." | Neutral questions about behavior, resources and boundaries (part 4). |
| Finish | "My effort leads somewhere useful." | Keep the 90-day success question; say how results lead into the free call with Bri. |
| Results | "That helped me see my business clearly." | Finding, basis, a practical priority, and what's missing (part 6b). |

Acknowledge comes from reflecting their situation accurately. Prepare and Let them know come from clear instructions and answer choices. Project is the link from each section to the results. Energize comes from manageable progress and a useful payoff, not motivational messages between questions.

---

## Phases

### Phase 1: Ship the approved section intros on today's questions (was task C)
- [x] Bri approves the section draft (`vai-va-training/output/20261017-assessment-copy-c-section-draft.md`), 2026-10-17, with two intro changes: owner-run reads "These questions look at how much of your time and attention it takes." (no assumption it should be handed off; "still" dropped there and in Part 2); team-owned reads "These questions look at what they handle independently and where they need your involvement."
- [x] Implement: names instead of letters, computed question counts, one intro per section, fix the double arrows, "See my results" (shared `SectionHeader`; workflow intros live in `WorkflowSection`)
- [x] Walk every branch on localhost, 2026-10-17: one "Assessment review TEST" session covered all eight parts, team-owned (18), owner-run (5), shared (3), "Last workflow." on Lender tracking, team and solo readiness tags, every button with one arrow. Typecheck clean; lint shows the same 7 pre-existing problems as before. One answer save hit a network "fetch failed" during fast clicking (save code untouched)
- [x] Delete the TEST session (`43d14d75-d65c-4e79-9df9-1600a0539992`) and its answers (Bri, Supabase SQL Editor, 2026-10-18; count check returns 0). The live database has four tables linked to sessions, all deleting with the session: answers, dimension_scores, reports, score_breakdowns. The repo's migrations only show answers
- [x] Deploy (Bri, from her Terminal), 2026-10-18 19:50 MT from `~/Code Folder 2.0`, aliased to assessment.vainexus.com, site responds. In-session pages not clicked through live, to avoid creating another test session

### Phase 2: Full question audit (deliverable for Bri's approval)
- [x] Inventory every question and answer list on every path (about you, who owns what, all three workflow paths, both readiness tracks, final questions, teaser), from the live database, not the July export. Read-only pull 2026-10-19: 142 active questions; teaser wording overrides read from `src/app/teaser/TeaserForm.tsx`
- [x] For each one record: what finding it produces, **what recommendation would change because of the answer**, which problems above it has (fit, ownership definition, scale, character-test wording, solo assumption, repetition), the proposed v2 wording and answers, and the scoring effect
- [x] Ownership questions rewritten around the three situations in part 2 (new "How it runs" question opens each team-owned workflow)
- [x] Length decision: longest path 98 to 74 questions; table of five paths, cuts and estimated minutes in section 12 of the audit
- [x] Deliverable: `vai-va-training/output/20261019-assessment-v2-question-audit.md` (in `~/Code Folder/vai-va-training`), plain names only; code map below for the build
- [x] Bri approves wording, the length decision and the eight decisions in section 13 of the audit: all eight approved as recommended, 2026-10-19 (walked one at a time with before and after wording; log under Progress)

### Phase 3: Scoring rules for v2
- [x] "This didn't come up": left out of the average. Changed with Bri's approval: no group can empty out, so a workflow with 3 or 4 of its 4 "didn't come up" answers is scored and labeled "based on limited answers" instead of left unscored
- [x] "We don't do this work": workflow skipped, left out of the overall score, named on the results page
- [x] New owner choices mapped to paths ("Another person or provider", accountable-but-shared, no one accountable)
- [x] Diagnostic readiness question handled outside the scored scale; readiness weights written down (team track unchanged 30/25/25/20; no-support track folds Transfer readiness into Systems mindset, 30/35/35)
- [x] Solo routing rule rewritten around whether support exists
- [x] Safeguard (part 2a): no support and keeping a workflow by choice never lower a score by themselves; the score carries the operational consequence, the reason is reported beside it
- [x] Results design (part 6b): finding, basis, practical priority, missing evidence, reason respected; written as example results for the three main paths, alongside the four plain-language reads and band labels
- [x] Bri approves the rules and the example results: all nine decisions approved as recommended, 2026-10-19. Deliverable: `vai-va-training/output/20261019-assessment-v2-scoring-rules.md` (the build spec for Phase 4)

### Phase 4: Build v2 with versioning
- [x] Migration `supabase/migrations/009_instrument_v2.sql` (2026-10-19, written, NOT yet run): `instrument_version` on sessions and questions (default 1, so every existing row is v1), 123 v2 question rows with new `V2...` keys inserted **inactive** so today's code can't see them, `show_if` and `variants` columns, workflow mode `N` for "We don't do this work". Safe to run before the deploy; re-runnable. Rows are generated from `scripts/v2-questions.mjs` (edit wording there, then `node scripts/v2-questions.mjs`)
- [x] v1 rows inactive: moved to an optional **post-deploy** file, `010_instrument_v2_post_deploy.sql`, because today's code loads questions by `is_active`. The v2 code picks questions by version (v2: `instrument_version = 2`; v1: keys without the `V2` prefix), never by `is_active`, so 010 is a label only and in-progress v1 sessions keep working either way
- [x] Scoring dispatches by version (`src/lib/scoring.ts` → `src/lib/scoring-v2.ts`). The three worked examples reproduce exactly: `node scripts/verify-v2-scoring.mjs` (30/58/58/79, 56, 48; 88/58/29/58, 58, 32; 88/75/46 + lender excluded, 69, 43; first workflow, first move and spell-out pick also match)
- [x] v1 sessions score exactly as before: read-only check on all 15 completed sessions, main's scoring vs the branch's, 0 differences (every workflow score, overall, readiness, readiness areas and quality index). One session (`a71a9198`) has a stored readiness of 50 that both old and new code compute as 15; that predates this change
- [x] Admin: "Instrument v1/v2" label on the list and the session page (separate from the teaser/full "Version" column); sessions sharing an email across versions flagged "not directly comparable"
- [x] Teaser moved to v2: "We don't do this" per row (left out of the preview), "I don't have anyone to hand work to yet" (tier "Getting started", never "Low"). Preview math checked in the verify script. Finding for Bri: the preview is still a proxy and reads much higher than the v2 debt score for owner-run workflows (worked example 2: preview ~95%, v2 debt 58), because v2 scores owner-run work on hours and what slips, which the teaser doesn't ask
- [x] Results page: "What this is based on", "Where to start", "What this doesn't cover", the no-support read, and a "not scored" state when every workflow is "We don't do this work". Draft wording from the scoring spec section 8, filled out for every case; final wording in Phase 6
- [x] Call screen (admin): v2 red flags (bottom two on five-answer scales, bottom one on shorter), first-workflow pick skipping kept-on-purpose with the tie rule, "Spell out what they can decide without you" when two or more team-owned workflows wait on decisions (or the first one does), "Kept by choice: take the routine parts off"
- [x] Typecheck clean; `next build` passes; lint 15 problems on the branch vs 17 on `main` (none new)
- [ ] Bri runs 009 in the Supabase SQL Editor, then the PR is merged and deployed, then (optional) 010

Build decisions recorded (2026-10-19):
- Name and business name (A001, A002) stay shared by both versions; they're identity, not part of the scored instrument.
- v2 team-owned groups reuse the six `oqi_dimension` slugs (the database check allows only these). Names and weights come from the session's version, so v1 and v2 group scores never mix. Coverage (EC) now holds only the backup question.
- Readiness areas with no answers are left out and the weights renormalized (v1 counted an empty area as 0). Same result as the spec whenever every area has an answer.
- Scoring reads the readiness track from the support answer when present (v2 routes on support alone), falling back to the session column.
- "Where to start" for an owner-run workflow says "someone on your team" where example 2 said "your assistant": one support person's role isn't asked.

### Phase 5: Test walk on localhost
- [ ] Synthetic "Assessment review TEST" sessions for: all four workflows team-owned, owner-run, shared with an accountable person, no one accountable, a workflow they don't do, outside provider as owner, solo with no support, solo with an assistant, team readiness, completion screen
- [ ] Each path: every question answerable honestly, counts in intros correct, scores computed
- [ ] Each path's results pass the six checks in part 6b
- [ ] Timed walkthroughs of the three main paths (all team-owned, mostly owner-run, solo with no support); if any runs past 20 minutes, update the time on the intake page (and anywhere else it's promised) to the real range
- [ ] Delete the TEST sessions and their answers afterward

### Phase 6: Section copy updated for v2
- [ ] Owner tag and intro for the shared path (today's draft says "shared, with no one clear owner", which v2 separates)
- [ ] Who owns what intro defines ownership as accountability within agreed boundaries
- [ ] Solo track and About you intros match the new routing
- [ ] Final section says how results lead into the call with Bri
- [ ] Bri approves the changed lines

### Phase 7: Ship
- [ ] Bri reads the live results screen on the three main paths
- [ ] Deploy, verify live on every path, set Done with the date
- [ ] Once real v2 respondents exist, run the completion-time query and compare with the timed walks
- [ ] Update `docs/question-bank-export.md` and `docs/reading-assessment-results.md` for v2

## Open questions for Bri

All decided by Bri, 2026-10-17.

1. **One task or two?** **One.** Intros ship first as Phase 1, then get a small touch-up in Phase 6.
2. **Shared work with one accountable person: which path?** **The full set of ownership questions about that person.** "No one is accountable" goes to the shorter role-clarity questions.
3. **An outside provider as owner (outsourced TC, VA company)?** **Full team-owned questions,** with "they" wording that fits a person or a provider.
4. **The new "what keeps you involved" question: score it?** **No.** Shown in admin and used on the call. Readiness weights get rebalanced in Phase 3 for Bri's approval.
5. **Invite the two existing respondents to retake v2?** **No.** Their results stay as they are, labeled v1.
6. **If a timed walk runs past 20 minutes, cut or change the promise?** **Decided (Bri, 2026-10-17): don't cut to hit the time.** Questions stay or go on the "what recommendation would change" test alone; if the timed walks run longer, the time promise on the intake page changes to match.
7. **Where the respondent hasn't defined what their person can decide, should results say so directly?** **Decided (Bri, 2026-10-17): yes,** as the practical priority when it's the main gap ("Spell out what they can decide without you").

## Build notes (for whoever implements)

- Question data is in the database (`questions` table; `answers.question_id` references it with delete restricted, so v1 rows must stay). Seeds: `supabase/seed-questions.sql`, `supabase/seed-questions-v2.sql`; text rewrites in later migrations.
- Routing: `src/lib/assessment.ts` (owner answer to path mapping, solo/team detection and refinement), `src/app/assessment/[sessionId]/{a..h}/page.tsx`.
- Scoring: `src/lib/scoring.ts`. Results reads: `src/lib/insight.ts`.
- Teaser: `src/lib/teaser.ts`, `src/app/teaser/` (uses the support-team question and the four owner picks).
- Admin: `src/lib/admin.ts` (there is already a "Version" badge for teaser vs full origin; name the instrument version so the two don't get confused).
- Migration 005 rule: any change to team-owned question text must re-check each question's dimension label.
- No em dashes in any respondent-facing text.

### Audit code map (plain names in the 2026-10-19 audit → v1 keys)

Workflow keys use C/D/E/F for Listing launch, Seller communication, File opening, Lender tracking; team-owned keys below are Listing launch (add 18 per workflow).

- About you: Business model A003 · Transactions A004 · Primary side focus A005 (cut) · Support team size A006
- Who owns what: B001 to B004
- Team-owned (Q001 to Q018 for Listing launch): How it runs = new, replaces Q001 · Decision rights spelled out Q010 · Brings you the right decisions Q011 · Sends routine updates without review Q002 · Who follows through on fixes Q003 + Q013 · First response Q005 · Brings a plan Q006 · How often they move forward Q004 (cut) · Written process Q007 · Templates Q008 · Something to reference Q009 (cut) · Backup Q012 · How you know it went well Q014 + Q015 · Your confidence Q016 · How confident they seem Q017 (cut) · How long it's run this way Q018
- Owner-run: Hours TBx1 · When you're tied up = new · Why you still run it TBx2 · Biggest obstacle TBx3 · Documented process TBx4 · Someone who could take it TBx5
- No one accountable: Why no owner RCx1 · Could someone own it RCx2 · How often things fall through RCx3
- Willingness: When handed-off work goes wrong Q073 · Moved something and kept it moved Q074 · Different approach, good outcome Q075 · What keeps you involved Q076 (unscored diagnostic)
- Team track: How you hand work off Q077 · Define done Q078 · Decisions go with the work Q079 · Room to take on more Q080 · Active files Q081 (cut) · Support person tenure Q082 (cut) · How new people learn Q083 · What your team can decide Q084 + Q085 · Work waiting on approval Q086
- No-support track: Speed to get a hire working SDQ3 · Know what you'd hand off SDQ1 (cut) · Same way each time SDQ2 (cut) · First hire would own SHR1 · Afford a hire SHR2 · Knowledge in your head SHR3 (cut) · Target for first hire SHR4 · Solve it once SSM1 · Unreachable for a week SSM2 · Now or later SSM3
- Final: Urgency Q087 · Goal Q088 · Anything for Bri Q089 · Success in 90 days Q090
- Found in the audit: the `questions.weight` column is not read by scoring (`OQI_WEIGHTS` and the DRS weight maps in `src/lib/scoring.ts` are the real weights). Don't rely on it for v2.

## Progress

Running log: check things off and note decisions as you go.

- [x] 2026-10-19: Karen's review of PR 1 applied on the branch: call screen "Hours a week" line; "Some of it is written down" for partly written; owner-run line built from the tied-up answer when hours is missing; no third "we don't do any" mention when all four are not done; teaser shows a message instead of ~0% when all four rows are "We don't do this"; reads and descriptor rewording ("handing off ownership", "clear picture of what done well looks like", "isn't leaning hard on you", kept-by-choice line); "your consultant" replaced with Bri and "your free call" on the results page (button "Book your free call"); lender updates question reworded and 009 regenerated; em dashes removed from lines added in this PR and the client PDF legend. Verify script, typecheck and lint rerun: all checks pass, lint 15 (none new). Still going to Bri as decisions: backup time windows, "someone on your team", the teaser preview
- [x] 2026-10-19: Phase 4 built on branch `assessment-v2-build` (PR open, not merged). Migration 009 written, not run. Verified: typecheck, build, lint (no new problems), the three worked examples, and v1 parity on all 15 completed sessions (read-only). No test sessions created; the localhost walk is Phase 5, after 009 runs

- [x] 2026-10-17: plan written from the test-walk review and task C's draft; task C points here
- [x] 2026-10-17: second review folded in: results as an acceptance requirement (6b), length as a required decision with timed walks (6a), three-situation ownership definition (2), and the reason-versus-consequence scoring safeguard (2a)
- [x] 2026-10-17: Bri decided Q6 (no cutting to hit the time; change the promise if needed) and Q7 (yes, name undefined decision rights as the priority). Q1 to Q5 decided the same day, all as recommended
- [x] 2026-10-19: Phase 2 audit written, waiting on Bri. Two scoring findings for Phase 3: owner-run debt score uses only process + ready person (the reason) and never hours (the consequence); shared debt score is half capability (a reason). Also: "their readiness vs my comfort" scores backwards today (blaming your own comfort earns top willingness)
- [x] 2026-10-19: Bri approved all eight audit decisions, as recommended: (1) team-owned set 18 to 13; (2) owner-run set 5 to 6 with "When you're tied up" added and the obstacle box optional; (3) "Each agent handles their own" as an owner answer, team-owned questions with "your agents"; (4) cut primary side focus, no agent-count question; (5) readiness routing on support only, 2-person override dropped; (6) "your consultant" becomes "Bri" in the final optional question; (7) 74 questions as the longest-path ceiling, time promise unchanged until the Phase 5 timed walks; (8) owner-run and no-one-accountable debt scores built from the consequence (hours, tied-up, fall-through), process/person/capability reported as the "why"; exact math comes back to Bri in Phase 3. Audit section 13 marked approved
- [x] 2026-10-19: Phase 3 scoring rules written (checked by Karen, two examples corrected) and approved by Bri, all nine as recommended: (1) team-owned group weights Decisions 25, Running the work 20, Systems 18, Standards 15, Coverage 12, Track record 10; (2) owner-run debt = hours (half) + "when you're tied up" (half); (3) no-one-accountable debt = 25 + fall-through in the last 60 days; (4) no-support readiness in three areas, 30/35/35; (5) "can the business afford a hire" stays scored, the one named exception to budget-as-reason; (6) bands and the 51 line unchanged until 15 to 20 real v2 respondents; (7) results page adds "what this is based on", "where to start", "what this doesn't cover" and a no-support read, wording in Phase 6; (8) kept on purpose: counts in the score, never the first workflow, new call-screen move "Kept by choice: take the routine parts off"; (9) thin workflows scored and labeled, not left unscored. Answer scales spread evenly over 0 to 4; red flags are the bottom two on five-answer scales, bottom one on three- and four-answer scales
