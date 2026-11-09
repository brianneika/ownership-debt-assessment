import type { Metadata } from 'next';
import Link from 'next/link';
import '../../assessment/assessment-theme.css';
import { BrandWave } from '@/components/BrandWave';

export const metadata: Metadata = {
  title: 'Your Blueprint is ready | Vai',
  robots: { index: false },
};

const PDF_HREF = '/vai-90-day-leverage-blueprint.pdf';
const BOOKING_URL = 'https://cal.com/brianne-ika-zgbp6r/vai-call';

const headingStyle = { color: 'var(--avai-ink)', letterSpacing: 'var(--avai-tracking-heading)' } as const;
const bodyStyle = { color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' } as const;
const buttonClass = 'flex w-full sm:w-auto items-center justify-center px-6 py-3.5 text-[15px] font-semibold';

export default function BlueprintThanksPage() {
  return (
    <div
      className="avai-scope min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)' }}
    >
      <div className="flex-1 w-full max-w-[720px] mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vai-logo.svg" alt="Vai" className="block h-10 sm:h-11 w-auto" />

        <section className="avai-card mt-8 p-6 sm:p-8">
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold" style={{ ...headingStyle, lineHeight: 1.1 }}>
            Your Blueprint is ready.
          </h1>
          <a
            href={PDF_HREF}
            download="The 90-Day Leverage Blueprint (Vai).pdf"
            className={`avai-btn-primary mt-6 ${buttonClass}`}
            style={{ borderRadius: 'var(--avai-radius-control)' }}
          >
            Download the Blueprint (PDF)
          </a>
          <p className="mt-5 text-base" style={bodyStyle}>
            Print it, grab a pen, and start with the Hours Audit on page 2. A guess is fine. A rough
            number beats no number.
          </p>
        </section>

        <section className="avai-card mt-6 p-6 sm:p-8" aria-labelledby="next">
          <h2 id="next" className="text-xl sm:text-2xl font-bold" style={headingStyle}>
            What happens next
          </h2>
          <p className="mt-3 text-base" style={bodyStyle}>
            Brianne will call you soon to hear what you&rsquo;re working on. Rather pick the time?
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`avai-btn-primary mt-5 ${buttonClass}`}
            style={{ borderRadius: 'var(--avai-radius-control)' }}
          >
            Book your Blueprint Review →
          </a>
          <p className="mt-3 text-[14px]" style={bodyStyle}>
            A 15-minute call. Bring whatever you filled in, even one page.
          </p>
        </section>

        <section
          className="mt-6 p-6 sm:p-8 rounded-2xl"
          style={{ background: 'var(--avai-teal-wash)', border: '1px solid var(--avai-teal-tint)' }}
          aria-labelledby="score"
        >
          <h2 id="score" className="text-lg sm:text-xl font-bold" style={headingStyle}>
            Want a number before you start?
          </h2>
          <p className="mt-2 text-base" style={bodyStyle}>
            Take the Ownership Debt assessment. About 15 minutes.
          </p>
          <Link
            href="/assessment"
            className="mt-4 inline-block text-[15px] font-semibold underline underline-offset-4"
            style={{ color: 'var(--avai-accent-600)' }}
          >
            Get my score →
          </Link>
        </section>
      </div>

      <BrandWave fixed={false} />
    </div>
  );
}
