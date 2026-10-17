import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers, WORKFLOW_SECTION_NAMES } from '@/lib/assessment';
import { advanceSectionB } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import { SectionHeader } from '@/components/assessment/SectionHeader';
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
      <SectionHeader
        part={2}
        questionCount={questions.length}
        heading="Who owns what"
        intro="For each of the four workflows below, tell us who owns it today. Your answers shape the rest of the assessment: more questions where you've handed the work off, fewer where you run it yourself."
      />

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
            <div className="text-xs font-semibold" style={{ color: 'var(--avai-ink)' }}>
              {WORKFLOW_SECTION_NAMES[wf]}
            </div>
          </div>
        ))}
      </div>

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
      />
    </div>
  );
}
