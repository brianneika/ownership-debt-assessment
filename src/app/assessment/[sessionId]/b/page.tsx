import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers, WORKFLOW_NAMES } from '@/lib/assessment';
import { advanceSectionB } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import type { SavedAnswer } from '@/lib/assessment';

export default async function SectionBPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('B'),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceSectionB.bind(null, sessionId);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--avai-accent-600)" }}>Section B</p>
        <h1 className="text-[1.75rem] font-bold" style={{ color: "var(--avai-ink)", letterSpacing: "var(--avai-tracking-heading)", lineHeight: "var(--avai-leading-heading)" }}>Your Workflows</h1>
        <p className="text-sm mt-2" style={{ color: "var(--avai-ink-muted)", lineHeight: "var(--avai-leading-body)" }}>
          For each of the four core workflows in your business, tell us who currently owns it.
          This determines how we assess each one.
        </p>
      </div>

      {/* Workflow name reference */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['C', 'D', 'E', 'F'] as const).map((wf) => (
          <div
            key={wf}
            className="p-3 text-center"
            style={{
              background: 'var(--avai-surface)',
              border: '1px solid var(--avai-border)',
              borderRadius: 'var(--avai-radius-control)',
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: 'var(--avai-accent-600)' }}
            >
              {wf}
            </div>
            <div className="text-xs font-semibold" style={{ color: 'var(--avai-ink)' }}>
              {WORKFLOW_NAMES[wf]}
            </div>
          </div>
        ))}
      </div>

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
        sectionIntro="For each workflow, tell us who currently owns it — this determines how we assess each one."
      />
    </div>
  );
}
