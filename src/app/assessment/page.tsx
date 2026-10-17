import './assessment-theme.css';
import { createAssessmentSession } from './actions';
import { BrandWave } from '@/components/BrandWave';

const EXPECT_ITEMS = [
  {
    title: '15 to 20 minutes to look at how your business runs.',
    desc: 'Answer eight short sections about the work you handle and what you’ve handed off. We ask more about the responsibilities you’ve already delegated, so the length varies.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Built around real estate work you know.',
    desc: 'For solo agents and team leaders. You’ll look at four familiar workflows: listing launch, seller communication, file opening, and lender tracking.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    title: 'Two scores and a clearer place to focus.',
    desc: 'Your Ownership Debt Score shows how much still depends on you. Your Delegation Readiness Score shows how prepared your business is to keep work moving after you hand it off. Your results highlight the gap to address first.',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
] as const;

export default function AssessmentLandingPage() {
  return (
    <div
      className="avai-scope min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)' }}
    >
      <BrandWave />
      <div className="w-full max-w-lg relative z-10">

        {/* Logotype / wordmark area */}
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vai-logo.svg"
            alt="VAI"
            className="inline-block h-12 w-auto mb-6"
          />

          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--avai-accent-600)' }}
          >
            The Ownership Debt Assessment
          </p>
          <h1
            className="text-[2rem] font-bold mb-3"
            style={{
              color: 'var(--avai-ink)',
              letterSpacing: 'var(--avai-tracking-heading)',
              lineHeight: 'var(--avai-leading-heading)',
            }}
          >
            How much of your business still depends on you?
          </h1>
          <p
            className="text-[15px] max-w-sm mx-auto"
            style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}
          >
            You can hand off the work and still be the person everyone needs to keep it
            moving. The decisions, follow-ups, and know-how that stay with you are ownership
            debt. Find out where your business still relies on you and what could keep your
            next handoff from sticking.
          </p>
        </div>

        {/* What to expect */}
        <div className="avai-card p-6 mb-5">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-5"
            style={{ color: 'var(--avai-ink-faint)' }}
          >
            What to expect
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {EXPECT_ITEMS.map(({ title, desc, icon }) => (
              <li key={title} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--avai-accent-50)',
                    color: 'var(--avai-accent-600)',
                    border: '1px solid var(--avai-accent-100)',
                  }}
                >
                  {icon}
                </span>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--avai-ink)' }}
                  >
                    {title}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--avai-ink-muted)' }}>
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Intake form */}
        <form action={createAssessmentSession} className="avai-card p-6">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-5"
            style={{ color: 'var(--avai-ink-faint)' }}
          >
            Let's get started
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
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
              className="avai-btn-primary w-full py-3.5 text-sm font-semibold mt-1"
              style={{ borderRadius: 'var(--avai-radius-control)' }}
            >
              Start my assessment →
            </button>
          </div>

          <p
            className="text-xs text-center mt-4"
            style={{ color: 'var(--avai-ink-faint)' }}
          >
            Free. Your answers save as you go. At the end, enter your email to view your
            full results on screen.
          </p>
        </form>

      </div>
    </div>
  );
}
