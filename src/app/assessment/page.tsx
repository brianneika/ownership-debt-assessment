import './assessment-theme.css';
import { createAssessmentSession } from './actions';
import { BrandWave } from '@/components/BrandWave';

const BENEFITS = [
  'See what still depends on you',
  'Understand how ready your business is for delegation',
  'Identify the gap to address first',
] as const;

const iconProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  className: 'w-6 h-6',
} as const;

const WORKFLOWS = [
  {
    label: 'Listing launch',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5" />
      </svg>
    ),
  },
  {
    label: 'Seller communication',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h6M8 13h4m-6 6 2.5-2.5H15a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v4.5A4 4 0 0 0 6 16v3Z" />
      </svg>
    ),
  },
  {
    label: 'File opening',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    label: 'Lender tracking',
    icon: (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 10 2 2 4-4" />
      </svg>
    ),
  },
] as const;

const eyebrow = 'text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]';

export default function AssessmentLandingPage() {
  return (
    <div
      className="avai-scope min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)' }}
    >
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-12">

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vai-logo.svg" alt="VAI" className="block h-10 sm:h-11 w-auto" />

        {/* Main: one column on mobile (intro, card, benefits), two on desktop */}
        <div className="mt-8 lg:mt-10 grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_400px]">

          <div className="lg:col-start-1 lg:row-start-1">
            <p className={eyebrow} style={{ color: 'var(--avai-accent-600)' }}>
              The Ownership Debt Assessment
            </p>
            <h1
              className="mt-3 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold"
              style={{
                color: 'var(--avai-ink)',
                letterSpacing: 'var(--avai-tracking-heading)',
                lineHeight: 1.08,
              }}
            >
              How much of your business still depends on you?
            </h1>
            <div
              className="mt-5 space-y-3 text-base sm:text-[17px] max-w-[34rem]"
              style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}
            >
              <p>
                You’ve handed off the work. But are you still the person everyone needs to keep
                it moving?
              </p>
              <p>
                Find out where your business depends on you, and what needs to change before
                your next handoff.
              </p>
            </div>
          </div>

          {/* Start card */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center">
            <form action={createAssessmentSession} className="avai-card p-6 sm:p-8">
              <h2
                className="text-2xl font-bold"
                style={{ color: 'var(--avai-ink)', letterSpacing: 'var(--avai-tracking-heading)' }}
              >
                Start your assessment
              </h2>
              <p className="mt-1.5 text-[15px] font-medium" style={{ color: 'var(--avai-ink-muted)' }}>
                15–20 minutes · Free
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--avai-ink-muted)' }}>
                Your progress saves as you go.
              </p>

              <div className="mt-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: 'var(--avai-ink)' }}
                  >
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jane Smith"
                    className="avai-text-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="business_name"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: 'var(--avai-ink)' }}
                  >
                    Business name
                  </label>
                  <input
                    id="business_name"
                    name="business_name"
                    type="text"
                    required
                    placeholder="Smith Real Estate Group"
                    className="avai-text-input"
                  />
                </div>

                <button
                  type="submit"
                  className="avai-btn-primary w-full py-3.5 text-[15px] font-semibold mt-1"
                  style={{ borderRadius: 'var(--avai-radius-control)' }}
                >
                  Start my assessment →
                </button>
              </div>

              <p className="text-[13px] text-center mt-4" style={{ color: 'var(--avai-ink-muted)' }}>
                You’ll enter your email at the end to view your full results.
              </p>
            </form>
          </div>

          {/* Benefits */}
          <ul className="lg:col-start-1 lg:row-start-2 space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base" style={{ color: 'var(--avai-ink)' }}>
                <span
                  className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'var(--avai-teal-mid)' }}
                  aria-hidden="true"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Workflow details */}
        <section className="mt-12 lg:mt-14 pt-8 border-t" style={{ borderColor: 'var(--avai-border-strong)' }}>
          <p className={eyebrow} style={{ color: 'var(--avai-accent-600)' }}>
            Built around real estate work you know
          </p>
          <h2
            className="mt-2 text-2xl sm:text-[1.75rem] font-bold"
            style={{ color: 'var(--avai-ink)', letterSpacing: 'var(--avai-tracking-heading)' }}
          >
            For solo agents and team leaders.
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0">
            {WORKFLOWS.map(({ label, icon }, i) => (
              <li
                key={label}
                className={`flex items-center gap-3 sm:px-5 ${i === 0 ? 'sm:pl-0' : 'sm:border-l'}`}
                style={{ borderColor: 'var(--avai-border-strong)' }}
              >
                <span
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--avai-accent-50)', color: 'var(--avai-accent-600)', border: '1px solid var(--avai-accent-100)' }}
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <span className="text-[15px] leading-snug" style={{ color: 'var(--avai-ink)' }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BrandWave fixed={false} />
    </div>
  );
}
