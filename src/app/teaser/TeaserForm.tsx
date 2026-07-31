'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CategoricalRadio } from '@/components/assessment/CategoricalRadio';
import { startTeaser } from './actions';
import type { Question } from '@/lib/assessment';

function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!ready || pending}
      className="avai-btn-primary w-full py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ borderRadius: 'var(--avai-radius-control)' }}
    >
      {pending ? 'Revealing your number…' : 'Reveal my number →'}
    </button>
  );
}

export function TeaserForm({ questions }: { questions: Question[] }) {
  // Selections keyed by question_key — mirrored into hidden inputs the server
  // action reads. All 5 required before the reveal unlocks.
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = questions.filter((q) => answers[q.question_key]).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  return (
    <form action={startTeaser} className="avai-card p-6">
      {/* Lightweight progress */}
      <div className="flex items-center justify-between mb-5">
        <p
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--avai-ink-faint)' }}
        >
          Your 5 questions
        </p>
        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--avai-accent-700)' }}>
          {answeredCount} / {questions.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {questions.map((q) => (
          <div key={q.id}>
            <CategoricalRadio
              questionId={q.id}
              questionText={q.question_text}
              questionKey={q.question_key}
              responseOptions={q.response_options}
              savedValue={answers[q.question_key] ?? null}
              onChange={(v) =>
                setAnswers((prev) => ({ ...prev, [q.question_key]: v }))
              }
            />
            {/* The value the server action actually reads */}
            <input type="hidden" name={q.question_key} value={answers[q.question_key] ?? ''} />
          </div>
        ))}
      </div>

      <div className="mt-7">
        <SubmitButton ready={allAnswered} />
      </div>
    </form>
  );
}
