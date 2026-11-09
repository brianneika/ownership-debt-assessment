import type { Metadata } from 'next';
import Link from 'next/link';
import '../assessment/assessment-theme.css';
import { BrandWave } from '@/components/BrandWave';
import { BlueprintForm } from './BlueprintForm';

// Meta ad landing page: two ways to start (plans/tasks/20261109-blueprint-landing-page.md).

export const metadata: Metadata = {
  title: 'The 90-Day Leverage Blueprint | Vai',
  description:
    'Find out how much of your business still runs through you. Get your Ownership Debt score now, or download the free 90-Day Leverage Blueprint.',
};

const BLUEPRINT_OUTCOMES = [
  'Your number: the hours a week that still run through you or your admin',
  'Every recurring task sorted into Keep, Hand Off, or Automate',
  'The first three workflows to hand to a VA',
] as const;

const eyebrow = 'text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]';
const headingStyle = { color: 'var(--avai-ink)', letterSpacing: 'var(--avai-tracking-heading)' } as const;
const bodyStyle = { color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' } as const;

function Check() {
  return (
    <span
      className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
      style={{ background: 'var(--avai-teal-mid)' }}
      aria-hidden="true"
    >
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function BlueprintLandingPage() {
  return (
    <div
      className="avai-scope min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)' }}
    >
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vai-logo.svg" alt="Vai" className="block h-10 sm:h-11 w-auto" />

        <div className="mt-8 lg:mt-10 max-w-[44rem]">
          <p className={eyebrow} style={{ color: 'var(--avai-accent-600)' }}>
            For real estate team leaders
          </p>
          <h1
            className="mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold"
            style={{ ...headingStyle, lineHeight: 1.08 }}
          >
            How much of your business still runs through you?
          </h1>
          <p className="mt-5 text-base sm:text-[17px]" style={bodyStyle}>
            Most team leaders know they&rsquo;re buried. Few know by how much. There are two ways to
            find out. Pick the one that fits your week.
          </p>
        </div>

        <div className="mt-8 lg:mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* Card A: assessment */}
          <section className="avai-card p-6 sm:p-8" aria-labelledby="card-score">
            <p className={eyebrow} style={{ color: 'var(--avai-teal-deep)' }}>
              The Ownership Debt Assessment
            </p>
            <h2 id="card-score" className="mt-2 text-2xl sm:text-[1.75rem] font-bold" style={headingStyle}>
              Want your score now?
            </h2>
            <p className="mt-3 text-[15px] sm:text-base" style={bodyStyle}>
              Answer questions about how your team runs today. You&rsquo;ll see your Ownership Debt
              score, how ready your business is to delegate, and the area to fix first.
            </p>
            <p className="mt-4 text-[15px] font-medium" style={{ color: 'var(--avai-ink)' }}>
              About 15 minutes · Free · Results on screen
            </p>
            <Link
              href="/assessment"
              className="avai-btn-primary mt-6 flex w-full items-center justify-center py-3.5 text-[15px] font-semibold"
              style={{ borderRadius: 'var(--avai-radius-control)' }}
            >
              Get my score →
            </Link>
          </section>

          {/* Card B: Blueprint */}
          <section className="avai-card p-6 sm:p-8" aria-labelledby="card-blueprint">
            <p className={eyebrow} style={{ color: 'var(--avai-teal-deep)' }}>
              The 90-Day Leverage Blueprint
            </p>
            <h2 id="card-blueprint" className="mt-2 text-2xl sm:text-[1.75rem] font-bold" style={headingStyle}>
              Rather work through it on your own time?
            </h2>
            <p className="mt-3 text-[15px] sm:text-base" style={bodyStyle}>
              An 8-page worksheet you fill in with a pen, tonight, this weekend, or between
              showings. You&rsquo;ll finish with:
            </p>
            <ul className="mt-4 space-y-2.5">
              {BLUEPRINT_OUTCOMES.map((o) => (
                <li key={o} className="flex items-start gap-3 text-[15px]" style={{ color: 'var(--avai-ink)' }}>
                  <Check />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] font-medium" style={{ color: 'var(--avai-ink)' }}>
              Free PDF · About 30 minutes
            </p>
            <BlueprintForm />
          </section>
        </div>

        <p className="mt-8 text-center text-[15px]" style={{ color: 'var(--avai-ink-muted)' }}>
          Both are free. Neither one asks for a credit card.
        </p>
      </div>

      <BrandWave fixed={false} />
    </div>
  );
}
