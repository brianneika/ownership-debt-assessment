'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ScoredRadio } from '@/components/assessment/ScoredRadio';
import { startTeaser } from './actions';
import type { Question } from '@/lib/assessment';

// One row of the named-owner grid, in display order.
export interface GridRow {
  questionKey: string; // B001 to B004
  name: string;        // workflow name
  detail: string;      // short scope line under the name
}

// In-room wording for the two leader questions. The database text stays as the
// full assessment (Section G) shows it; the teaser only overrides the display.
const TEASER_TEXT: Record<string, string> = {
  Q079: 'When you hand something off, do they get to make the decisions, or do decisions still come back to you for approval?',
  Q074: 'In the last 90 days, have you moved something off your plate and kept it there without taking it back?',
};

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

function YesNo({
  name,
  value,
  onChange,
}: {
  name: string;
  value: 'yes' | 'no' | null;
  onChange: (v: 'yes' | 'no') => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 flex-shrink-0" style={{ width: '9.5rem' }}>
      {(['yes', 'no'] as const).map((opt) => {
        const isSelected = value === opt;
        return (
          <label
            key={opt}
            className="avai-option flex items-center justify-center px-3 py-2.5 cursor-pointer select-none text-sm font-semibold"
            data-selected={isSelected || undefined}
            style={{ color: isSelected ? 'var(--avai-accent-800)' : 'var(--avai-ink-muted)' }}
          >
            <input
              type="radio"
              name={`grid_${name}`}
              value={opt}
              checked={isSelected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt === 'yes' ? 'Yes' : 'No'}
          </label>
        );
      })}
    </div>
  );
}

export function TeaserForm({
  gridRows,
  authority,
  takeBack,
}: {
  gridRows: GridRow[];
  authority: Question;
  takeBack: Question;
}) {
  // Selections keyed by question_key, mirrored into hidden inputs the server
  // action reads. Every row and both scored questions are required.
  const [grid, setGrid] = useState<Record<string, 'yes' | 'no'>>({});
  const [scores, setScores] = useState<Record<string, string>>({});

  const gridDone = gridRows.filter((r) => grid[r.questionKey]).length;
  const scoresDone = [authority, takeBack].filter((q) => scores[q.question_key]).length;
  const totalSteps = 3;
  const stepsDone = (gridDone === gridRows.length && gridRows.length > 0 ? 1 : 0) + scoresDone;
  const allAnswered = stepsDone === totalSteps;

  return (
    <form action={startTeaser} className="avai-card p-6">
      {/* Lightweight progress */}
      <div className="flex items-center justify-between mb-5">
        <p
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--avai-ink-faint)' }}
        >
          Your 3 questions
        </p>
        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--avai-accent-700)' }}>
          {stepsDone} / {totalSteps}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Question 1: the named-owner grid */}
        <div>
          <p
            className="mb-4 text-[15px] font-semibold leading-snug"
            style={{
              color: 'var(--avai-ink)',
              lineHeight: 'var(--avai-leading-body)',
              letterSpacing: '-0.01em',
            }}
          >
            Is there one named person, other than you, who owns each of these?
          </p>
          <div className="flex flex-col gap-2.5">
            {gridRows.map((row) => (
              <div
                key={row.questionKey}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={{
                  background: 'var(--avai-surface)',
                  border: '1px solid var(--avai-border)',
                  borderRadius: 'var(--avai-radius-control)',
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--avai-ink)' }}>
                    {row.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--avai-ink-faint)' }}>
                    {row.detail}
                  </div>
                </div>
                <YesNo
                  name={row.questionKey}
                  value={grid[row.questionKey] ?? null}
                  onChange={(v) => setGrid((prev) => ({ ...prev, [row.questionKey]: v }))}
                />
                <input type="hidden" name={row.questionKey} value={grid[row.questionKey] ?? ''} />
              </div>
            ))}
          </div>
        </div>

        {/* Questions 2 and 3: authority, then take-it-back */}
        {[authority, takeBack].map((q) => (
          <div key={q.id}>
            <ScoredRadio
              questionId={q.id}
              questionText={TEASER_TEXT[q.question_key] ?? q.question_text}
              questionKey={q.question_key}
              responseOptions={q.response_options}
              savedValue={scores[q.question_key] !== undefined ? Number(scores[q.question_key]) : null}
              onChange={(v) => setScores((prev) => ({ ...prev, [q.question_key]: v }))}
            />
            <input type="hidden" name={q.question_key} value={scores[q.question_key] ?? ''} />
          </div>
        ))}
      </div>

      <div className="mt-7">
        <SubmitButton ready={allAnswered} />
      </div>
    </form>
  );
}
