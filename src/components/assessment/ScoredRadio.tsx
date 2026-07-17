'use client';

import { useState, useEffect } from 'react';
import { LIKERT_OPTIONS, URGENCY_OPTIONS, getDisplayQuestionText, type ResponseOption } from '@/lib/assessment';

interface Props {
  questionId: number;
  questionText: string;
  questionKey: string;
  responseOptions: ResponseOption[] | null;
  savedValue: number | null;
  onChange: (value: string) => void;
}

export function ScoredRadio({
  questionId,
  questionText,
  questionKey,
  responseOptions,
  savedValue,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<number | null>(savedValue);

  useEffect(() => {
    setSelected(savedValue);
  }, [savedValue]);

  const options: ResponseOption[] =
    responseOptions && responseOptions.length > 0
      ? responseOptions
      : questionKey === 'Q087'
      ? [...URGENCY_OPTIONS]
      : [...LIKERT_OPTIONS];

  function handleChange(value: number) {
    setSelected(value);
    onChange(String(value));
  }

  return (
    <div>
      {/* Question text — confident weight, generous line-height */}
      <p
        className="mb-4 text-[15px] font-semibold leading-snug"
        style={{
          color: 'var(--avai-ink)',
          lineHeight: 'var(--avai-leading-body)',
          letterSpacing: '-0.01em',
        }}
      >
        {getDisplayQuestionText(questionKey, questionText)}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = selected === Number(opt.value);

          return (
            <label
              key={opt.value}
              // avai-option handles: min-height 44px, border, radius, hover, selected state,
              // and the snap transition — all driven by CSS with no className toggling.
              className="avai-option flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none"
              data-selected={isSelected || undefined}
            >
              <input
                type="radio"
                name={`q_${questionId}`}
                value={opt.value}
                checked={isSelected}
                onChange={() => handleChange(Number(opt.value))}
                className="sr-only"
              />

              {/* Custom radio indicator */}
              <span
                className="flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? 'var(--avai-accent-600)' : 'var(--avai-border-strong)',
                  transition: `border-color var(--avai-duration-fast) var(--avai-ease)`,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: 'var(--avai-accent-600)',
                    // avai-ease-snap gives a slight overshoot — feels snappy not jarring
                    transform: isSelected ? 'scale(1)' : 'scale(0)',
                    opacity: isSelected ? 1 : 0,
                    transition: `transform var(--avai-duration-fast) var(--avai-ease-snap),
                                 opacity var(--avai-duration-fast) var(--avai-ease)`,
                  }}
                />
              </span>

              <span
                className="text-sm leading-snug"
                style={{ color: isSelected ? 'var(--avai-accent-800)' : 'var(--avai-ink-muted)' }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
