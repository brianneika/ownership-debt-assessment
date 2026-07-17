'use client';

import { useState, useTransition } from 'react';
import { ScoredRadio } from './ScoredRadio';
import { CategoricalRadio } from './CategoricalRadio';
import { FreeTextInput } from './FreeTextInput';
import { SavedIndicator } from './SavedIndicator';
import { saveRadioAnswer } from '@/app/assessment/actions';
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
  const [, startTransition] = useTransition();
  // Bumped to Date.now() after each save — remounts SavedIndicator to replay animation.
  // Optimistic: fires immediately on selection (Supabase autosave is fast in practice).
  const [savedAt, setSavedAt] = useState(0);

  function handleRadioChange(
    questionId: number,
    answerType: 'scored_radio' | 'categorical_radio',
    value: string,
  ) {
    setSavedAt(Date.now()); // optimistic saved indicator
    startTransition(async () => {
      await saveRadioAnswer(sessionId, questionId, answerType, value);
    });
  }

  return (
    <form action={nextAction}>
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
          className="avai-btn-primary rounded-xl px-7 py-3 text-sm font-semibold"
          style={{ borderRadius: 'var(--avai-radius-control)' }}
        >
          {submitLabel} →
        </button>
      </div>
    </form>
  );
}
