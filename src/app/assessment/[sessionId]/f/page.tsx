import { notFound, redirect } from 'next/navigation';
import { fetchSession, fetchQuestions, fetchSessionAnswers } from '@/lib/assessment';
import { advanceWorkflow } from '@/app/assessment/actions';
import { WorkflowSection } from '@/components/assessment/WorkflowSection';
import type { SavedAnswer } from '@/lib/assessment';

const ROLE_LABELS: Record<string, string> = {
  tc: 'Transaction Coordinator',
  listing_coordinator: 'Listing Coordinator',
  operations_manager: 'Operations Manager',
};

export default async function WorkflowFPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await fetchSession(sessionId);
  if (!session) notFound();

  const mode = session.wf_f_mode;
  if (!mode) redirect(`/assessment/${sessionId}/b`);

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('F', { mode }),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'g');

  let sectionIntro = 'Last workflow — how does Lender Tracking hold up on its own?';
  if (mode === 'B') {
    const roleSlug = answersMap.get('B004')?.text_value ?? '';
    const role = ROLE_LABELS[roleSlug] ?? 'your team member';
    sectionIntro = `You told us your ${role} owns Lender Tracking. The next 18 questions are about how that's actually going.`;
  }

  return (
    <WorkflowSection
      sessionId={sessionId}
      workflowKey="F"
      mode={mode}
      questions={questions}
      savedAnswers={savedAnswers}
      nextAction={nextAction}
      sectionIntro={sectionIntro}
      nextLabel="Next → Delegation Readiness"
    />
  );
}
