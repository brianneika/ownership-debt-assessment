'use client';

import { useState, useEffect } from 'react';
import { CATEGORICAL_OPTIONS, getDisplayQuestionText, type ResponseOption } from '@/lib/assessment';

interface Props {
  questionId: number;
  questionText: string;
  questionKey: string;
  responseOptions: ResponseOption[] | null;
  savedValue: string | null;
  onChange: (value: string) => void;
}

export function CategoricalRadio({
  questionId,
  questionText,
  questionKey,
  responseOptions,
  savedValue,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<string | null>(savedValue);

  useEffect(() => {
    setSelected(savedValue);
  }, [savedValue]);

  const options: ResponseOption[] =
    responseOptions && responseOptions.length > 0
      ? responseOptions
      : CATEGORICAL_OPTIONS[questionKey] ?? [];

  function handleChange(value: string) {
    setSelected(value);
    onChange(value);
  }

  return (
    <div>
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

      {options.length === 0 ? (
        <p
          className="text-sm rounded-lg px-4 py-3 border"
          style={{
            color: '#92400e',
            background: '#fffbeb',
            borderColor: '#fde68a',
          }}
        >
          No options defined for{' '}
          <code className="font-mono text-xs">{questionKey}</code>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const isSelected = selected === String(opt.value);

            return (
              <label
                key={opt.value}
                className="avai-option flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none"
                data-selected={isSelected || undefined}
              >
                <input
                  type="radio"
                  name={`q_${questionId}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => handleChange(String(opt.value))}
                  className="sr-only"
                />

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
      )}
    </div>
  );
}
