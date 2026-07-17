'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { slug: 'a', title: 'About You' },
  { slug: 'b', title: 'Workflows' },
  { slug: 'c', title: 'Listing Launch' },
  { slug: 'd', title: 'Seller Communication' },
  { slug: 'e', title: 'File Opening' },
  { slug: 'f', title: 'Lender Tracking' },
  { slug: 'g', title: 'Delegation' },
  { slug: 'h', title: 'Final' },
];

export function ProgressBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const current = segments[segments.length - 1];
  const currentIdx = Math.max(STEPS.findIndex((s) => s.slug === current), 0);

  // Fill percentage: progress to the *center* of the current step's segment,
  // so the connector visually "arrives" at the current marker.
  const segmentWidth = 100 / (STEPS.length - 1);
  const fillPercent = currentIdx * segmentWidth;

  return (
    <div className="w-full bg-avai-surface border-b border-avai-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">

        {/* Desktop / tablet: full milestone bar */}
        <div className="hidden sm:block">
          <div className="relative">
            {/* Connector track — single continuous element, river-ready */}
            <div
              className="avai-progress-track absolute left-0 right-0 top-4 h-1"
              style={{ marginInline: `${50 / STEPS.length}%` }}
            />
            <div
              className="avai-progress-fill absolute left-0 top-4 h-1"
              style={{
                width: `calc(${fillPercent}% * ${(STEPS.length - 1) / STEPS.length})`,
                marginInlineStart: `${50 / STEPS.length}%`,
              }}
            />

            {/* Step markers */}
            <div className="relative flex justify-between">
              {STEPS.map((step, idx) => {
                const isComplete = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.slug} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div
                      className={[
                        'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200',
                        isComplete
                          ? 'bg-avai-accent-600 text-white'
                          : isCurrent
                          ? 'bg-avai-accent-600 text-white ring-4 ring-avai-accent-100 scale-110'
                          : 'bg-avai-surface border-2 border-avai-border text-avai-ink-faint',
                      ].join(' ')}
                    >
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={[
                        'text-[11px] font-medium text-center leading-tight px-1 truncate w-full',
                        isCurrent ? 'text-avai-accent-700 font-semibold' : isComplete ? 'text-avai-ink-muted' : 'text-avai-ink-faint',
                      ].join(' ')}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: condensed bar + current step name */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-avai-accent-700">
              {STEPS[currentIdx]?.title}
            </span>
            <span className="text-xs text-avai-ink-faint tabular-nums">
              {currentIdx + 1} / {STEPS.length}
            </span>
          </div>
          <div className="avai-progress-track h-1.5 w-full relative overflow-hidden">
            <div
              className="avai-progress-fill h-full"
              style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
