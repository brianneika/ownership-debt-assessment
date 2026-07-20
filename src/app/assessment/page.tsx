import './assessment-theme.css';
import { createAssessmentSession } from './actions';

const EXPECT_ITEMS = [
  {
    title: '~8–10 minutes',
    desc: 'Complete in one sitting across 8 sections',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Saved as you go',
    desc: 'Answers are saved automatically as you select them',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    title: 'Your results',
    desc: 'Your Ownership Assessment Score: a clear picture of where your business depends on you, and your single highest-leverage move to change it.',
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
      <div className="w-full max-w-lg">

        {/* Logotype / wordmark area */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 mb-6"
            style={{
              background: 'linear-gradient(180deg, var(--avai-accent-500), var(--avai-accent-700))',
              borderRadius: 'var(--avai-radius-control)',
              boxShadow: 'var(--avai-shadow-button)',
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>

          <h1
            className="text-[2rem] font-bold mb-3"
            style={{
              color: 'var(--avai-ink)',
              letterSpacing: 'var(--avai-tracking-heading)',
              lineHeight: 'var(--avai-leading-heading)',
            }}
          >
            Ownership Assessment
          </h1>
          <p
            className="text-[15px] max-w-sm mx-auto"
            style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}
          >
            A structured diagnostic that reveals exactly where ownership debt lives
            in your business — and what to do about it.
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
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--avai-ink)' }}
                  >
                    {title}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--avai-ink-muted)' }}>
                    {' '}— {desc}
                  </span>
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
              Start Assessment →
            </button>
          </div>

          <p
            className="text-xs text-center mt-4"
            style={{ color: 'var(--avai-ink-faint)' }}
          >
            Your answers are private — we use them to build your personalized report.
          </p>
        </form>

      </div>
    </div>
  );
}
