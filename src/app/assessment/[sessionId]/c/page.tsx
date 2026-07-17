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

export default async function WorkflowCPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await fetchSession(sessionId);
  if (!session) notFound();

  const mode = session.wf_c_mode;
  if (!mode) redirect(`/assessment/${sessionId}/b`);

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('C', { mode }),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'd');

  let sectionIntro = 'Now let\'s look at how Listing Launch runs without you.';
  if (mode === 'B') {
    const roleSlug = answersMap.get('B001')?.text_value ?? '';
    const role = ROLE_LABELS[roleSlug] ?? 'your team member';
    sectionIntro = `You told us your ${role} owns Listing Launch. The next 18 questions are about how that's actually going.`;
  }

  return (
    <WorkflowSection
      sessionId={sessionId}
      workflowKey="C"
      mode={mode}
      questions={questions}
      savedAnswers={savedAnswers}
      nextAction={nextAction}
      sectionIntro={sectionIntro}
    />
  );
}
