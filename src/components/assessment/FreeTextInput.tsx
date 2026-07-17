'use client';

import { useState } from 'react';
import { getDisplayQuestionText } from '@/lib/assessment';

interface Props {
  questionId: number;
  questionText: string;
  questionKey: string;
  fieldName: string;
  savedValue: string;
  placeholder?: string;
  maxLength?: number;
}

export function FreeTextInput({
  questionId,
  questionText,
  questionKey,
  fieldName,
  savedValue,
  placeholder,
  maxLength = 500,
}: Props) {
  const [value, setValue] = useState(savedValue);
  const remaining = maxLength - value.length;
  const nearLimit = remaining < 80;

  return (
    <div>
      <p
        className="mb-4 text-[15px] font-semibold"
        style={{
          color: 'var(--avai-ink)',
          lineHeight: 'var(--avai-leading-body)',
          letterSpacing: '-0.01em',
        }}
      >
        {getDisplayQuestionText(questionKey, questionText)}
      </p>

      <div className="relative">
        <textarea
          name={fieldName}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? 'Type your answer here…'}
          maxLength={maxLength}
          rows={4}
          className="avai-text-input"
          style={{
            lineHeight: 'var(--avai-leading-body)',
            resize: 'none',
            paddingBottom: '2rem', // clears the character counter
          }}
        />

        {/* Character counter — turns amber near limit */}
        <span
          className="absolute bottom-3 right-4 text-xs tabular-nums pointer-events-none"
          style={{
            color: nearLimit ? '#d97706' : 'var(--avai-ink-faint)',
            transition: `color var(--avai-duration-base) var(--avai-ease)`,
          }}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
