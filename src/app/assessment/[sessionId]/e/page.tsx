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

export default async function WorkflowEPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await fetchSession(sessionId);
  if (!session) notFound();

  const mode = session.wf_e_mode;
  if (!mode) redirect(`/assessment/${sessionId}/b`);

  const [questions, answersMap] = await Promise.all([
    fetchQuestions('E', { mode }),
    fetchSessionAnswers(sessionId),
  ]);

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'f');

  let sectionIntro = 'Let\'s see how File Opening performs when you step back.';
  if (mode === 'B') {
    const roleSlug = answersMap.get('B003')?.text_value ?? '';
    const role = ROLE_LABELS[roleSlug] ?? 'your team member';
    sectionIntro = `You told us your ${role} owns File Opening. The next 18 questions are about how that's actually going.`;
  }

  return (
    <WorkflowSection
      sessionId={sessionId}
      workflowKey="E"
      mode={mode}
      questions={questions}
      savedAnswers={savedAnswers}
      nextAction={nextAction}
      sectionIntro={sectionIntro}
    />
  );
}
