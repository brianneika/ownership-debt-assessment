import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers } from '@/lib/assessment';
import { advanceSectionA } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import { SectionHeader } from '@/components/assessment/SectionHeader';
import type { SavedAnswer } from '@/lib/assessment';

export default async function SectionAPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('A'),
    fetchSessionAnswers(sessionId),
  ]);

  // Section A page shows A003–A006 (A001/A002 were collected on the landing page)
  const pageQuestions = questions.filter((q) => !['A001', 'A002'].includes(q.question_key));

  if (pageQuestions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceSectionA.bind(null, sessionId);

  return (
    <div>
      <SectionHeader
        part={1}
        questionCount={pageQuestions.length}
        heading="About you"
        intro="A quick snapshot of your business, so your results fit how you actually work."
      />

      <SectionForm
        sessionId={sessionId}
        questions={pageQuestions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
      />
    </div>
  );
}
