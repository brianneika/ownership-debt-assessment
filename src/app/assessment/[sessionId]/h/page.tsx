import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers } from '@/lib/assessment';
import { submitAssessment } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import { SectionHeader } from '@/components/assessment/SectionHeader';
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
      <SectionHeader
        part={8}
        questionCount={questions.length}
        heading="Final questions"
        intro="Last step. Two quick choices and two optional notes. Bri reads your notes when she reviews your results."
      />

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={submitAction}
        submitLabel="See my results"
      />
    </div>
  );
}
