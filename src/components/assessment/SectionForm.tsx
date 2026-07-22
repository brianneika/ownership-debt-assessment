'use client';

import { ScoredRadio } from './ScoredRadio';
import { CategoricalRadio } from './CategoricalRadio';
import { FreeTextInput } from './FreeTextInput';
import { SavedIndicator } from './SavedIndicator';
import { usePendingAnswerSaves } from './usePendingAnswerSaves';
import type { Question, SavedAnswer } from '@/lib/assessment';

interface Props {
  sessionId: string;
  questions: Question[];
  savedAnswers: Record<string, SavedAnswer>;
  nextAction: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  sectionIntro?: string;
}

export function SectionForm({
  sessionId,
  questions,
  savedAnswers,
  nextAction,
  submitLabel = 'Next',
  sectionIntro,
}: Props) {
  // Radios autosave on selection; handleSubmit holds "Next" until any in-flight
  // save lands so the last answer in the section is never lost to navigation.
  const { savedAt, flushing, handleRadioChange, handleSubmit } = usePendingAnswerSaves(sessionId);

  return (
    <form action={nextAction} onSubmit={handleSubmit}>
      {/* One-line section context message */}
      {sectionIntro && (
        <p
          className="mb-7 text-sm font-medium"
          style={{ color: 'var(--avai-ink-muted)' }}
        >
          {sectionIntro}
        </p>
      )}

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

      {/* Action row — sticky on mobile via avai-sticky-cta, right-aligned on desktop */}
      <div className="avai-sticky-cta mt-8 flex items-center justify-between gap-4 sm:justify-end">
        <SavedIndicator savedAt={savedAt} />
        <button
          type="submit"
          disabled={flushing}
          className="avai-btn-primary rounded-xl px-7 py-3 text-sm font-semibold disabled:opacity-70"
          style={{ borderRadius: 'var(--avai-radius-control)' }}
        >
          {flushing ? 'Saving…' : `${submitLabel} →`}
        </button>
      </div>
    </form>
  );
}
