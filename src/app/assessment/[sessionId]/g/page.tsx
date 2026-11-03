import { notFound } from 'next/navigation';
import {
  fetchSession,
  fetchQuestions,
  fetchSessionAnswers,
  refineDrsProfile,
  drsProfileFromSupportV2,
} from '@/lib/assessment';
import { advanceWorkflow } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
import { SectionHeader } from '@/components/assessment/SectionHeader';
import type { SavedAnswer, WorkflowMode } from '@/lib/assessment';

export default async function SectionGPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  // Fetch session + all answers in parallel. Both are needed to compute the
  // DRS profile live, bypassing the cached session column which can be stale
  // due to an async-save race between A006's radio onChange and advanceSectionA.
  const [session, answersMap] = await Promise.all([
    fetchSession(sessionId),
    fetchSessionAnswers(sessionId),
  ]);

  if (!session) notFound();

  const version = session.instrument_version;
  const a006Value = answersMap.get('A006')?.text_value ?? '';
  const modes: Record<'C' | 'D' | 'E' | 'F', WorkflowMode | null> = {
    C: session.wf_c_mode,
    D: session.wf_d_mode,
    E: session.wf_e_mode,
    F: session.wf_f_mode,
  };
  // v2: the track depends only on whether support exists (decision 5).
  const drsProfile =
    version === 2
      ? drsProfileFromSupportV2(answersMap.get('V2A_SUPPORT')?.text_value)
      : refineDrsProfile(a006Value, modes);

  const questions = await fetchQuestions('G', { drsProfile, version });

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'h');

  const profileLabel =
    version === 2
      ? drsProfile === 'solo' ? 'No support yet' : 'Team track'
      : drsProfile === 'solo' ? 'Solo owner track' : 'Team leader track';

  return (
    <div>
      <SectionHeader
        part={7}
        questionCount={questions.length}
        heading="Delegation readiness"
        tag={profileLabel}
        intro="Almost there. These questions measure how ready you and your business are to hand off work and have it stay handed off. They make up your Delegation Readiness Score."
      />

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
        submitLabel="Next: Final questions"
      />
    </div>
  );
}
