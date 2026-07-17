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

export default async function WorkflowDPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await fetchSession(sessionId);
  if (!session) notFound();

  const mode = session.wf_d_mode;
  if (!mode) redirect(`/assessment/${sessionId}/b`);

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('D', { mode }),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'e');

  let sectionIntro = 'How well does Seller Communication run when you\'re not in the room?';
  if (mode === 'B') {
    const roleSlug = answersMap.get('B002')?.text_value ?? '';
    const role = ROLE_LABELS[roleSlug] ?? 'your team member';
    sectionIntro = `You told us your ${role} owns Seller Communication. The next 18 questions are about how that's actually going.`;
  }

  return (
    <WorkflowSection
      sessionId={sessionId}
      workflowKey="D"
      mode={mode}
      questions={questions}
      savedAnswers={savedAnswers}
      nextAction={nextAction}
      sectionIntro={sectionIntro}
    />
  );
}
