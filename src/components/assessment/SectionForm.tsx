'use client';

import { useState } from 'react';
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
}

export function SectionForm({
  sessionId,
  questions,
  savedAnswers,
  nextAction,
  submitLabel = 'Next',
}: Props) {
  // Radios autosave on selection; handleSubmit holds "Next" until any in-flight
  // save lands so the last answer in the section is never lost to navigation.
  const { savedAt, flushing, handleRadioChange, handleSubmit } = usePendingAnswerSaves(sessionId);

  // v2: categorical picks on this page, so a follow-up question (show_if) can
  // appear as soon as its trigger answer is chosen.
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const q of questions) {
      const v = savedAnswers[q.question_key]?.text_value;
      if (q.answer_type === 'categorical_radio' && v) init[q.question_key] = v;
    }
    return init;
  });

  return (
    <form action={nextAction} onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {questions.map((q) => {
          if (q.show_if && picked[q.show_if.key] !== q.show_if.equals) return null;
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
                  onChange={(v) => {
                    setPicked((prev) => ({ ...prev, [q.question_key]: v }));
                    handleRadioChange(q.id, 'categorical_radio', v);
                  }}
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
