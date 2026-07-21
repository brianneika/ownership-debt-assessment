'use client';

import { useState, useTransition } from 'react';
import { captureEmail } from './actions';
import {
  ScoreSpectrumCard,
  ScoreSpectrumCards,
  SynthesisBlock,
  DrsReadinessBreakdown,
  type ScoreData,
  type DrsCategoryRow,
  type Synthesis,
} from '@/components/results-visuals';

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
        <ScoreSpectrumCard
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
      <ScoreSpectrumCards ods={ods} drs={drs} />
      {synthesis && <SynthesisBlock synthesis={synthesis} />}
      <DrsReadinessBreakdown rows={drsBreakdown} weakestCategory={synthesis?.weakestCategory?.category ?? null} />
      <div className="mt-4">
        <BookingCTA />
      </div>
    </>
  );
}
