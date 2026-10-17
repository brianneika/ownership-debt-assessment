// Shared header for every assessment section: "Part N of 8 · X questions",
// the section name, an optional tag (owner or track), and one intro line.
// The question count comes from the questions this person actually sees.

export const TOTAL_PARTS = 8;

interface Props {
  part: number;
  questionCount: number;
  heading: string;
  tag?: string;
  intro?: string;
}

export function SectionHeader({ part, questionCount, heading, tag, intro }: Props) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-2.5 mb-2">
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--avai-accent-600)' }}
        >
          Part {part} of {TOTAL_PARTS} · {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
        {tag && (
          <span
            className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border"
            style={{
              color: 'var(--avai-accent-700)',
              borderColor: 'var(--avai-accent-200)',
              background: 'var(--avai-accent-50)',
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <h1
        className="text-[1.75rem] font-bold"
        style={{ color: 'var(--avai-ink)', letterSpacing: 'var(--avai-tracking-heading)', lineHeight: 'var(--avai-leading-heading)' }}
      >
        {heading}
      </h1>
      {intro && (
        <p className="text-sm mt-2" style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}>
          {intro}
        </p>
      )}
    </div>
  );
}
