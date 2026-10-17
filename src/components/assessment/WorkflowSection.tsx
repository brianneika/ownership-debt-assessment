'use client';

import { ScoredRadio } from './ScoredRadio';
import { CategoricalRadio } from './CategoricalRadio';
import { FreeTextInput } from './FreeTextInput';
import { SavedIndicator } from './SavedIndicator';
import { usePendingAnswerSaves } from './usePendingAnswerSaves';
import type { Question, SavedAnswer, WorkflowKey, WorkflowMode } from '@/lib/assessment';
import { WORKFLOW_SECTION_NAMES } from '@/lib/assessment';
import { SectionHeader } from './SectionHeader';

const MODE_TAGS: Record<WorkflowMode, string> = {
  A: 'You run it',
  B: 'Team-led',
  C: 'Shared',
};

const WORKFLOW_PART: Record<WorkflowKey, number> = { C: 3, D: 4, E: 5, F: 6 };

// One intro per owner path; reflects the respondent's own answer from "Who owns what".
function workflowIntro(name: string, mode: WorkflowMode, ownerRole: string | undefined, isLast: boolean) {
  const intro =
    mode === 'A'
      ? `You told us you run ${name}. These questions look at how much of your time and attention it takes.`
      : mode === 'B'
      ? `You told us your ${ownerRole ?? 'team member'} owns ${name}. These questions look at what they handle independently and where they need your involvement.`
      : `You told us ${name} is shared, with no one clear owner. These questions look at how the work gets divided.`;
  return isLast ? `Last workflow. ${intro}` : intro;
}

interface Props {
  sessionId: string;
  workflowKey: WorkflowKey;
  mode: WorkflowMode;
  questions: Question[];
  savedAnswers: Record<string, SavedAnswer>;
  nextAction: (formData: FormData) => Promise<void>;
  nextLabel?: string;
  /** Role picked in "Who owns what" (team-led workflows only), e.g. "Transaction Coordinator". */
  ownerRole?: string;
}

export function WorkflowSection({
  sessionId,
  workflowKey,
  mode,
  questions,
  savedAnswers,
  nextAction,
  nextLabel = 'Next',
  ownerRole,
}: Props) {
  const name = WORKFLOW_SECTION_NAMES[workflowKey];
  const intro = workflowIntro(name, mode, ownerRole, workflowKey === 'F');
  const { savedAt, flushing, handleRadioChange, handleSubmit } = usePendingAnswerSaves(sessionId);

  return (
    <form action={nextAction} onSubmit={handleSubmit}>
      <SectionHeader
        part={WORKFLOW_PART[workflowKey]}
        questionCount={questions.length}
        heading={name}
        tag={MODE_TAGS[mode]}
        intro={intro}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {questions.map((q) => {
          const saved = savedAnswers[q.question_key];

          return (
            <div key={q.id} className="avai-card p-6 sm:p-7">
              {q.answer_type === 'scored_radio' && (
                <ScoredRadio
                  questionId={q.id}
                  questionText={q.question_text}
                  questionKey={q.question_key}
                  responseOptions={q.response_options}
                  savedValue={saved?.score_value ?? null}
                  onChange={(v) => handleRadioChange(q.id, 'scored_radio', v)}
                />
              )}

              {q.answer_type === 'categorical_radio' && (
                <CategoricalRadio
                  questionId={q.id}
                  questionText={q.question_text}
                  questionKey={q.question_key}
                  responseOptions={q.response_options}
                  savedValue={saved?.text_value ?? null}
                  onChange={(v) => handleRadioChange(q.id, 'categorical_radio', v)}
                />
              )}

              {q.answer_type === 'free_text' && (
                <FreeTextInput
                  questionId={q.id}
                  questionText={q.question_text}
                  questionKey={q.question_key}
                  fieldName={`ft_${q.id}`}
                  savedValue={saved?.text_value ?? ''}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky mobile CTA */}
      <div className="avai-sticky-cta mt-8 flex items-center justify-between gap-4 sm:justify-end">
        <SavedIndicator savedAt={savedAt} />
        <button
          type="submit"
          disabled={flushing}
          className="avai-btn-primary rounded-xl px-7 py-3 text-sm font-semibold disabled:opacity-70"
          style={{ borderRadius: 'var(--avai-radius-control)' }}
        >
          {flushing ? 'Saving…' : `${nextLabel} →`}
        </button>
      </div>
    </form>
  );
}
