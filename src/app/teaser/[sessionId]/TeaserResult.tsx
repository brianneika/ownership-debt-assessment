'use client';

import { useFormStatus } from 'react-dom';
import { unlockFullAssessment } from '../actions';
import type { TeaserEstimate, DelegationTier } from '@/lib/teaser';

const TIER_STYLE: Record<DelegationTier, { bg: string; border: string; text: string }> = {
  low: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  developing: { bg: '#fefce8', border: '#fde68a', text: '#a16207' },
  ready: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
};

function UnlockButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="avai-btn-primary w-full py-3.5 text-sm font-semibold disabled:opacity-60"
      style={{ borderRadius: 'var(--avai-radius-control)' }}
    >
      {pending ? 'Building your full assessment…' : 'Unlock my full assessment →'}
    </button>
  );
}

export function TeaserResult({
  sessionId,
  estimate,
}: {
  sessionId: string;
  estimate: TeaserEstimate;
}) {
  const tierStyle = TIER_STYLE[estimate.tier];
  const unlock = unlockFullAssessment.bind(null, sessionId);

  return (
    <div>
      {/* The headline number */}
      <div className="avai-card p-8 text-center mb-5">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-6"
          style={{ color: 'var(--avai-accent-600)' }}
        >
          Preliminary read
        </p>

        <div
          className="font-bold tabular-nums leading-none"
          style={{
            fontSize: '4.5rem',
            color: 'var(--avai-ink)',
            letterSpacing: 'var(--avai-tracking-heading)',
          }}
        >
          ~{estimate.ownerDependencePct}%
        </div>
        <p
          className="text-[15px] font-semibold mt-3 max-w-xs mx-auto"
          style={{ color: 'var(--avai-ink)', lineHeight: 'var(--avai-leading-body)' }}
        >
          of your core business still runs through you
        </p>

        <div
          className="inline-flex items-center gap-2 mt-5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'var(--avai-accent-50)',
            border: '1px solid var(--avai-accent-100)',
            color: 'var(--avai-accent-700)',
          }}
        >
          {estimate.bandLabel}
        </div>

        <p className="text-xs mt-5" style={{ color: 'var(--avai-ink-faint)' }}>
          Estimated from your 5 answers. The full assessment sharpens this into your real
          Ownership Debt Score.
        </p>
      </div>

      {/* Delegation-readiness tier */}
      <div className="avai-card p-6 mb-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--avai-ink)' }}>
            Delegation readiness
          </p>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: tierStyle.bg,
              border: `1px solid ${tierStyle.border}`,
              color: tierStyle.text,
            }}
          >
            {estimate.tierLabel}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}>
          {estimate.tierBlurb}
        </p>
      </div>

      {/* Unlock gate — the conversion point */}
      <form action={unlock} className="avai-card p-6">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--avai-ink-faint)' }}
        >
          Get your full assessment
        </p>
        <p className="text-sm mb-5" style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}>
          Your 5 answers are already saved. Unlock the full assessment to turn this
          estimate into your real Ownership Debt and Delegation Readiness scores, plus your
          single highest-leverage next move. You will pick up right where you left off.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--avai-ink)' }}>
              Your name
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" placeholder="Jane Smith" className="avai-text-input" />
          </div>

          <div>
            <label htmlFor="business_name" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--avai-ink)' }}>
              Business name
            </label>
            <input id="business_name" name="business_name" type="text" required placeholder="Smith Real Estate Group" className="avai-text-input" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--avai-ink)' }}>
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="avai-text-input" />
          </div>

          <UnlockButton />
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--avai-ink-faint)' }}>
          By continuing, you agree that VAILeverage may email you your results and occasional
          delegation insights. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
