'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ScoredRadio } from '@/components/assessment/ScoredRadio';
import { startTeaser } from './actions';
import type { Question, ResponseOption } from '@/lib/assessment';

// One row of the named-owner grid, in display order.
export interface GridRow {
  questionKey: string; // V2B_C to V2B_F
  name: string;        // workflow name
  detail: string;      // short scope line under the name
}

// In-room wording for the two leader questions. The database text stays as the
// full assessment (Section G) shows it; the teaser only overrides the display.
const TEASER_TEXT: Record<string, string> = {
  V2G_DECISIONS: 'When you hand something off, do they get to make the decisions, or do decisions still come back to you for approval?',
};

// Teaser-only choice on the moved-something question (audit section 11), so
// someone with no support doesn't get a "Low" tier for a staffing fact. Stored as 5.
const NO_ONE_OPTION: ResponseOption = { value: 5, label: "I don't have anyone to hand work to yet", na: true };

type GridValue = 'yes' | 'no' | 'not_done';
const GRID_CHOICES: { value: GridValue; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_done', label: "We don't do this" },
];

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
  value: GridValue | null;
  onChange: (v: GridValue) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {GRID_CHOICES.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <label
            key={opt.value}
            className="avai-option flex items-center justify-center text-center px-2 py-2.5 cursor-pointer select-none text-sm font-semibold leading-tight"
            data-selected={isSelected || undefined}
            style={{ color: isSelected ? 'var(--avai-accent-800)' : 'var(--avai-ink-muted)' }}
          >
            <input
              type="radio"
              name={`grid_${name}`}
              value={opt.value}
              checked={isSelected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
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
  const [grid, setGrid] = useState<Record<string, GridValue>>({});
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
                className="flex flex-col gap-2.5 px-4 py-3"
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
              responseOptions={
                q.question_key === 'V2G_MOVED' ? [...(q.response_options ?? []), NO_ONE_OPTION] : q.response_options
              }
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
