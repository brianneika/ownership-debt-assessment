'use client';

import { ScoredRadio } from './ScoredRadio';
import { CategoricalRadio } from './CategoricalRadio';
import { FreeTextInput } from './FreeTextInput';
import { SavedIndicator } from './SavedIndicator';
import { usePendingAnswerSaves } from './usePendingAnswerSaves';
import type { Question, SavedAnswer, WorkflowKey, WorkflowMode } from '@/lib/assessment';
import { WORKFLOW_NAMES } from '@/lib/assessment';

const MODE_BADGES: Record<WorkflowMode, string> = {
  A: 'Owner-Led',
  B: 'Team-Led',
  C: 'Shared / No Clear Owner',
};

interface Props {
  sessionId: string;
  workflowKey: WorkflowKey;
  mode: WorkflowMode;
  questions: Question[];
  savedAnswers: Record<string, SavedAnswer>;
  nextAction: (formData: FormData) => Promise<void>;
  nextLabel?: string;
  sectionIntro?: string;
}

export function WorkflowSection({
  sessionId,
  workflowKey,
  mode,
  questions,
  savedAnswers,
  nextAction,
  nextLabel = 'Next',
  sectionIntro,
}: Props) {
  const { savedAt, flushing, handleRadioChange, handleSubmit } = usePendingAnswerSaves(sessionId);

  return (
    <form action={nextAction} onSubmit={handleSubmit}>
      {/* Workflow header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--avai-accent-600)' }}
          >
            Workflow {workflowKey}
          </span>
          <span style={{ color: 'var(--avai-border-strong)' }}>·</span>
          <span
            className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border"
            style={{
              color: 'var(--avai-ink-muted)',
              borderColor: 'var(--avai-border)',
              background: 'var(--avai-canvas)',
            }}
          >
            {MODE_BADGES[mode]}
          </span>
        </div>

        <h2
          className="text-2xl font-bold mb-1"
          style={{
            color: 'var(--avai-ink)',
            letterSpacing: 'var(--avai-tracking-heading)',
            lineHeight: 'var(--avai-leading-heading)',
          }}
        >
          {WORKFLOW_NAMES[workflowKey]}
        </h2>

        {sectionIntro && (
          <p className="text-sm mt-1" style={{ color: 'var(--avai-ink-muted)' }}>
            {sectionIntro}
          </p>
        )}
      </div>

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
