import '../assessment/assessment-theme.css';
import { notFound } from 'next/navigation';
import { fetchQuestions, WORKFLOW_NAMES, B_QUESTION_TO_WORKFLOW } from '@/lib/assessment';
import { TeaserForm, type GridRow } from './TeaserForm';
import { BrandWave } from '@/components/BrandWave';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'How much still runs through you? — 2-minute check',
  description:
    'Three quick questions and you see how much of your core business still runs through you. Free preview, no email required.',
};

// Short scope line for each grid row, keyed by workflow.
const WORKFLOW_DETAIL: Record<string, string> = {
  C: 'Signed listing agreement to live on MLS',
  D: 'Weekly updates, feedback, price review prep',
  E: 'Executed contract to critical date calendar',
  F: 'Appraisal, underwriting, clear to close, closing',
};

export default async function TeaserLandingPage() {
  const [bQuestions, gQuestions] = await Promise.all([
    fetchQuestions('B'),
    fetchQuestions('G'),
  ]);

  const gridRows: GridRow[] = (['B001', 'B002', 'B003', 'B004'] as const)
    .filter((key) => bQuestions.some((q) => q.question_key === key))
    .map((key) => {
      const wf = B_QUESTION_TO_WORKFLOW[key];
      return { questionKey: key, name: WORKFLOW_NAMES[wf], detail: WORKFLOW_DETAIL[wf] };
    });

  const authority = gQuestions.find((q) => q.question_key === 'Q079');
  const takeBack = gQuestions.find((q) => q.question_key === 'Q074');

  if (gridRows.length !== 4 || !authority || !takeBack) notFound();

  return (
    <div
      className="avai-scope min-h-screen flex items-center justify-center px-4 py-12 sm:py-16"
      style={{
        background: 'linear-gradient(145deg, var(--avai-canvas) 0%, var(--avai-accent-50) 100%)',
      }}
    >
      <BrandWave />
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vai-logo.svg"
            alt="VAI"
            className="inline-block h-12 w-auto mb-6"
          />

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
            Three quick questions about your core workflows. You will see a preview of how
            owner-dependent your business is right now. No email needed to see your number.
          </p>
        </div>

        <TeaserForm gridRows={gridRows} authority={authority} takeBack={takeBack} />

        <p className="text-xs text-center mt-5" style={{ color: 'var(--avai-ink-faint)' }}>
          This is a preliminary read. The full assessment sharpens both of your scores.
        </p>
      </div>
    </div>
  );
}
