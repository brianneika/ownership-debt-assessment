'use client';

// Shows a brief "Saved ✓" confirmation after an answer is recorded.
// Keyed on `savedAt` — bumping the value remounts the element and
// replays the avai-saved-pop CSS animation without any JS timers.
// When savedAt is 0 (initial state, never saved), renders nothing.
export function SavedIndicator({ savedAt }: { savedAt: number }) {
  if (savedAt === 0) return null;
  return (
    <span
      key={savedAt}
      className="avai-saved-pop inline-flex items-center gap-1 text-xs font-medium"
      style={{ color: 'var(--avai-success)' }}
      aria-live="polite"
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Saved
    </span>
  );
}
