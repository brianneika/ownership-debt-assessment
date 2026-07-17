import { notFound } from 'next/navigation';
import { fetchQuestions, fetchSessionAnswers } from '@/lib/assessment';
import { advanceSectionA } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
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
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--avai-accent-600)" }}>Section A</p>
        <h1 className="text-[1.75rem] font-bold" style={{ color: "var(--avai-ink)", letterSpacing: "var(--avai-tracking-heading)", lineHeight: "var(--avai-leading-heading)" }}>About You</h1>
        <p className="text-sm mt-2" style={{ color: "var(--avai-ink-muted)", lineHeight: "var(--avai-leading-body)" }}>
          Tell us a bit about your business so we can tailor your results.
        </p>
      </div>

      <SectionForm
        sessionId={sessionId}
        questions={pageQuestions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
        sectionIntro="Let's start with a quick snapshot of your business."
      />
    </div>
  );
}
