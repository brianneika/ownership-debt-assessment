import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers } from '@/lib/assessment';
import { submitAssessment } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import type { SavedAnswer } from '@/lib/assessment';

export default async function SectionHPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('H'),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  // submitAssessment receives (sessionId, formData) — bind sessionId
  const submitAction = submitAssessment.bind(null, sessionId);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--avai-accent-600)" }}>Section H</p>
        <h1 className="text-[1.75rem] font-bold" style={{ color: "var(--avai-ink)", letterSpacing: "var(--avai-tracking-heading)", lineHeight: "var(--avai-leading-heading)" }}>Final Reflections</h1>
        <p className="text-sm mt-2" style={{ color: "var(--avai-ink-muted)", lineHeight: "var(--avai-leading-body)" }}>
          A few last questions to help us personalise your results and recommendations.
          Your written answers are kept confidential.
        </p>
      </div>

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={submitAction}
        sectionIntro="A few final questions — these help us personalize your results."
        submitLabel="Submit Assessment →"
      />
    </div>
  );
}
