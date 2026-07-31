import '../assessment/assessment-theme.css';
import { fetchQuestions } from '@/lib/assessment';
import { TeaserForm } from './TeaserForm';
import type { Question } from '@/lib/assessment';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'How much still runs through you? — 2-minute check',
  description:
    'Answer 5 quick questions and see how much of your core business still runs through you. Free preview, no email required.',
};

export default async function TeaserLandingPage() {
  const [aQuestions, bQuestions] = await Promise.all([
    fetchQuestions('A'),
    fetchQuestions('B'),
  ]);

  const a006 = aQuestions.find((q) => q.question_key === 'A006');
  const bTeaser = bQuestions.filter((q) =>
    ['B001', 'B002', 'B003', 'B004'].includes(q.question_key),
  );

  // A006 first, then B001–B004 (already in question_order).
  const questions: Question[] = [a006, ...bTeaser].filter(Boolean) as Question[];

  return (
    <div
      className="avai-scope min-h-screen flex items-center justify-center px-4 py-12 sm:py-16"
      style={{
        background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 mb-6"
            style={{
              background: 'linear-gradient(180deg, var(--avai-accent-500), var(--avai-accent-700))',
              borderRadius: 'var(--avai-radius-control)',
              boxShadow: 'var(--avai-shadow-button)',
            }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
            How much still runs through you?
          </h1>
          <p
            className="text-[15px] max-w-sm mx-auto"
            style={{ color: 'var(--avai-ink-muted)', lineHeight: 'var(--avai-leading-body)' }}
          >
            Five quick questions about your core workflows. You will see a preview of how
            owner-dependent your business is right now. No email needed to see your number.
          </p>
        </div>

        <TeaserForm questions={questions} />

        <p className="text-xs text-center mt-5" style={{ color: 'var(--avai-ink-faint)' }}>
          This is a preliminary read. The full assessment sharpens both of your scores.
        </p>
      </div>
    </div>
  );
}
