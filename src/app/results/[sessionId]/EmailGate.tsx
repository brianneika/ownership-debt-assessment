'use client';

import { useState, useTransition } from 'react';
import { captureEmail } from './actions';

interface ScoreData {
  score: number;
  bandLabel: string | null;
  bandColor: string | undefined;
}

export interface DrsCategoryRow {
  category: string;
  score: number;
  weight: number;
}

export interface Synthesis {
  quadrant: string;
  headline: string;
  body: string;
  weakestCategory: { category: string; score: number; descriptor: string } | null;
}

const BAND_CLASSES: Record<string, string> = {
  '#22c55e': 'bg-green-50 border-green-200 text-green-800',
  '#eab308': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  '#f97316': 'bg-orange-50 border-orange-200 text-orange-800',
  '#ef4444': 'bg-red-50 border-red-200 text-red-800',
};

function bandClass(hex: string | undefined) {
  return BAND_CLASSES[hex ?? ''] ?? 'bg-gray-50 border-gray-200 text-gray-700';
}

// Card shows a marker on a labeled gradient spectrum rather than a fill bar, so
// there is no "more = better" ambiguity: green is the good end on both cards.
function ScoreCard({
  title,
  subtitle,
  score,
  bandLabel,
  bandColor,
  goodDirection,
  lowLabel,
  highLabel,
}: {
  title: string;
  subtitle: string;
  score: number;
  bandLabel: string | null;
  bandColor: string | undefined;
  goodDirection: 'low' | 'high';
  lowLabel: string;
  highLabel: string;
}) {
  const pos = Math.min(Math.max(score, 0), 100);
  // Gradient always runs bad → good in the direction the "you" marker moves as
  // things improve: green sits at the good end on both cards.
  const gradient =
    goodDirection === 'low'
      ? 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)'
      : 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
          {goodDirection === 'low' ? '↓ Lower is better' : '↑ Higher is better'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>

      <div className="flex items-end gap-3 mb-5">
        <span className="text-5xl font-bold text-gray-900 tabular-nums">{score.toFixed(0)}</span>
        <span className="text-gray-400 text-sm mb-1.5">/ 100</span>
        {bandLabel && (
          <span className={`ml-auto inline-block px-3 py-1 rounded-full text-xs font-semibold border ${bandClass(bandColor)}`}>
            {bandLabel}
          </span>
        )}
      </div>

      <div className="relative h-2.5 rounded-full mb-2" style={{ background: gradient }}>
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-sm -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${pos}%` }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function ScoreCards({ ods, drs }: { ods: ScoreData; drs: ScoreData }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5 mb-6">
      <ScoreCard
        title="Ownership Debt Score"
        subtitle="How much of the business still runs through you"
        score={ods.score}
        bandLabel={ods.bandLabel}
        bandColor={ods.bandColor}
        goodDirection="low"
        lowLabel="Fully delegated"
        highLabel="Owner-dependent"
      />
      <ScoreCard
        title="Delegation Readiness Score"
        subtitle="How ready your team is to take work on"
        score={drs.score}
        bandLabel={drs.bandLabel}
        bandColor={drs.bandColor}
        goodDirection="high"
        lowLabel="Not yet ready"
        highLabel="Ready to hand off"
      />
    </div>
  );
}

// The two-score synthesis: what the pair means together, plus the single
// readiness category dragging the score down. Names the problem; the plan is
// the consultant call's job.
function SynthesisBlock({ synthesis }: { synthesis: Synthesis }) {
  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-7 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">
        What your scores mean together
      </p>
      <h2 className="text-lg font-bold text-gray-900">{synthesis.headline}</h2>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{synthesis.body}</p>

      {synthesis.weakestCategory && (
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            The biggest thing holding your readiness back is{' '}
            <span className="font-semibold">{synthesis.weakestCategory.category}</span>{' '}
            ({synthesis.weakestCategory.score.toFixed(0)}): {synthesis.weakestCategory.descriptor}.
          </p>
        </div>
      )}
    </div>
  );
}

// DRS sub-breakdown so the driving low sub-score is no longer invisible. Bars
// read higher = better (more readiness), matching the DRS card direction.
function DrsBreakdown({
  rows,
  weakestCategory,
}: {
  rows: DrsCategoryRow[];
  weakestCategory: string | null;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        Your delegation readiness, broken down
      </p>
      <p className="text-xs text-gray-400 mb-5">
        Readiness is the average of these four. Higher is better on each.
      </p>
      <div className="space-y-4">
        {rows.map((cat) => {
          const isWeakest = cat.category === weakestCategory;
          return (
            <div key={cat.category}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-sm ${isWeakest ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {cat.category}
                  {isWeakest && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                      driving your score down
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">
                  <span className="font-semibold text-gray-700">{cat.score.toFixed(0)}</span> / 100
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isWeakest ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                  style={{ width: `${Math.min(Math.max(cat.score, 0), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingCTA() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 mb-4">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to talk through your results?</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Book a strategy session with your VAI consultant to walk through your scores,
        identify your highest-leverage opportunities, and build your 90-day plan.
      </p>
      <a
        href="https://calendar.app.google/bDAMHaZiUnb68a4v7"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo-600 text-white text-sm font-semibold px-7 py-3 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
      >
        Book a Session
      </a>
    </div>
  );
}

export function EmailGate({
  sessionId,
  ods,
  drs,
  synthesis,
  drsBreakdown,
}: {
  sessionId: string;
  ods: ScoreData;
  drs: ScoreData;
  synthesis: Synthesis | null;
  drsBreakdown: DrsCategoryRow[];
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    startTransition(async () => {
      await captureEmail(sessionId, trimmed);
      setUnlocked(true);
    });
  }

  if (unlocked) {
    return <FullResults ods={ods} drs={drs} synthesis={synthesis} drsBreakdown={drsBreakdown} />;
  }

  return (
    <>
      {/* ODS teaser — always visible */}
      <div className="mb-6">
        <ScoreCard
          title="Ownership Debt Score"
          subtitle="How much of the business still runs through you"
          score={ods.score}
          bandLabel={ods.bandLabel}
          bandColor={ods.bandColor}
          goodDirection="low"
          lowLabel="Fully delegated"
          highLabel="Owner-dependent"
        />
      </div>

      {/* Email gate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 shrink-0">
            <svg className="w-4.5 h-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Your Delegation Readiness Score is ready
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Enter your email to see your full breakdown.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="email-gate" className="sr-only">Email</label>
            <input
              id="email-gate"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={pending}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            {pending ? 'Unlocking…' : 'See my full results →'}
          </button>
        </form>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <p className="mt-3 text-xs text-gray-400">
          By submitting, you agree that VAILeverage may email you your results and
          occasional delegation insights. Unsubscribe anytime.
        </p>
      </div>
    </>
  );
}

export function FullResults({
  ods,
  drs,
  synthesis,
  drsBreakdown,
}: {
  ods: ScoreData;
  drs: ScoreData;
  synthesis: Synthesis | null;
  drsBreakdown: DrsCategoryRow[];
}) {
  return (
    <>
      <ScoreCards ods={ods} drs={drs} />
      {synthesis && <SynthesisBlock synthesis={synthesis} />}
      <DrsBreakdown rows={drsBreakdown} weakestCategory={synthesis?.weakestCategory?.category ?? null} />
      <div className="mt-4">
        <BookingCTA />
      </div>
    </>
  );
}
