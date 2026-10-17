# Assessment copy C: rewrite section intros and progress copy with APPLE

**Status:** In progress (2026-10-17): draft ready for Bri <!-- Not started | In progress | Blocked | Done -->

> **2026-10-17:** combined into [the assessment v2 plan](20261017-assessment-v2-questions-and-section-copy.md). This draft ships as its Phase 1; track progress there.

## Objective

Rewrite the copy around the questions in Sections A to H (section titles, intros, transitions, progress and save messages) so respondents keep going to the end.

## Methods / background

- Depends on task A for the brief and the section review.
- Files: `src/app/assessment/[sessionId]/{a..h}/page.tsx`, `src/components/assessment/{ProgressBar,SectionTransition,SectionForm,WorkflowSection,SavedIndicator}.tsx`.
- **Out of scope:** the question text and answer options (DB-backed, scoring-sensitive; see `docs/question-bank-export.md`). Copy around the questions only.
- APPLE here is mostly Prepare (what this section covers, roughly how long) and Energize (momentum, "you're past halfway"). Acknowledge the effort; this is the stretch where people quit.
- Sections branch by mode (Section B decides which C to F questions appear); copy must stay true for every path.
- No em dashes.

## From task A's review (2026-10-16)

- Bug: `SectionForm` and `WorkflowSection` add " →" to labels that already have one, so three buttons show a double arrow ("Submit Assessment → →"). Last button should read "See my results".
- Drop internal letters ("Section A", "Workflow C") from what respondents see; use names.
- Give every workflow section its question count (3, 5 or 18 depending on who owns it).
- One intro per section (A, B and H say it twice).
- Section H: replace "kept confidential" with the truth (Bri reads these before your call); use US spelling.
- Progress bar labels should match the section headings.

## Progress

- [x] Inventory every string around the questions, per section
- [x] Draft per the brief (`vai-va-training/output/20261017-assessment-copy-c-section-draft.md`); question counts will be computed from each page's question list, not hardcoded
- [ ] Bri approves
- [ ] Implement, walk every branch on localhost
- [ ] Deploy, verify live, set Done
