'use client';

import { useState, useTransition } from 'react';
import { captureEmail } from './actions';

interface ScoreData {
  score: number;
  bandLabel: string | null;
  bandColor: string | undefined;
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

function ScoreCard({
  title,
  subtitle,
  score,
  bandLabel,
  bandColor,
}: {
  title: string;
  subtitle: string;
  score: number;
  bandLabel: string | null;
  bandColor: string | undefined;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-5xl font-bold text-gray-900 tabular-nums">{score.toFixed(0)}</span>
        <span className="text-gray-400 text-sm mb-1.5">/ 100</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%`, backgroundColor: bandColor ?? '#6366f1' }}
        />
      </div>
      {bandLabel && (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${bandClass(bandColor)}`}>
          {bandLabel}
        </span>
      )}
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
}: {
  sessionId: string;
  ods: ScoreData;
  drs: ScoreData;
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
    return (
      <>
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <ScoreCard
            title="Ownership Debt Score"
            subtitle="Lower is better — 0 = fully delegated, 100 = entirely owner-dependent"
            score={ods.score}
            bandLabel={ods.bandLabel}
            bandColor={ods.bandColor}
          />
          <ScoreCard
            title="Delegation Readiness Score"
            subtitle="Higher is better — your capacity and readiness to hand off ownership"
            score={drs.score}
            bandLabel={drs.bandLabel}
            bandColor={drs.bandColor}
          />
        </div>
        <BookingCTA />
      </>
    );
  }

  return (
    <>
      {/* ODS teaser — always visible */}
      <div className="mb-6">
        <ScoreCard
          title="Ownership Debt Score"
          subtitle="Lower is better — 0 = fully delegated, 100 = entirely owner-dependent"
          score={ods.score}
          bandLabel={ods.bandLabel}
          bandColor={ods.bandColor}
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

export function FullResults({ ods, drs }: { ods: ScoreData; drs: ScoreData }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <ScoreCard
          title="Ownership Debt Score"
          subtitle="Lower is better — 0 = fully delegated, 100 = entirely owner-dependent"
          score={ods.score}
          bandLabel={ods.bandLabel}
          bandColor={ods.bandColor}
        />
        <ScoreCard
          title="Delegation Readiness Score"
          subtitle="Higher is better — your capacity and readiness to hand off ownership"
          score={drs.score}
          bandLabel={drs.bandLabel}
          bandColor={drs.bandColor}
        />
      </div>
      <BookingCTA />
    </>
  );
}
