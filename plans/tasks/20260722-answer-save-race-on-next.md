# Fix: last answer is lost when "Next" is clicked before its save lands

**Status:** In progress <!-- Not started | In progress | Blocked | Done -->

## Objective

Guarantee that every radio answer is persisted before the section advances, so a
respondent who selects an option and immediately clicks "Next" never loses it.

## Background — the incident (2026-07-22)

Tammie Slay's assessment produced no score. Root cause: her `TBx5` answer was
missing in all four Mode-A workflows (plus `TBF4`), so `calcWorkflowOds` returned
null for every workflow and scoring threw "No workflow ODS values could be
computed." (See [20260722-results-scoring-self-heal.md](20260722-results-scoring-self-heal.md)
for the spinner that failure caused, now self-healed.)

Why those specific answers: scored/categorical radios autosave via a
**fire-and-forget** call inside `startTransition` on change
([WorkflowSection.tsx](../../src/components/assessment/WorkflowSection.tsx),
[SectionForm.tsx](../../src/components/assessment/SectionForm.tsx)). The "Next"
button is a separate `<form action={serverAction}>` submit that triggers a
`redirect`. If the save request for the just-selected option hasn't completed (or
hasn't even dispatched) when navigation happens, it is abandoned. `TBx5` is the
**last** question in each workflow section, so it is the reliable casualty — and
`TBF` (the last workflow) lost both TBx4 and TBx5.

This silently corrupts Mode-A submissions and can also skew Section B (which sets
workflow modes from B001–B004 radios) via the same component.

## Fix

Shared hook `src/components/assessment/usePendingAnswerSaves.ts`:

- Dispatches the save immediately on change (not deferred in a transition) and
  tracks the in-flight promise.
- Exposes `handleSubmit` for the form's `onSubmit`: if any save is in flight it
  `preventDefault`s, awaits all pending saves, then re-submits so the server action
  runs only after every answer has landed.
- Exposes `flushing` so the Next button can show "Saving…" and disable briefly.

Wired into both `WorkflowSection` and `SectionForm` so every section is covered.

## Progress

- [x] Diagnose: fire-and-forget save raced by navigation drops the last answer.
- [x] Confirm on Tammie's real data (TBx5 missing in C/D/E, TBF4/5 missing).
- [ ] Add `usePendingAnswerSaves` hook.
- [ ] Wire into WorkflowSection + SectionForm; Next awaits pending saves.
- [ ] Build + manual verification; deploy to prod.
- [ ] Rescore Tammie once her 5 missing answers are collected (separate step).

## Follow-ups

- Consider server-side required-answer validation on advance as defense in depth.
- Product: add an "AI / systems are the owner" path — Tammie uses Claude/Manus as
  her TC and said it "wasn't an option in the prior selections."
