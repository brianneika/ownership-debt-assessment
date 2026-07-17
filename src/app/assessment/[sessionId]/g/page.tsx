import { notFound } from 'next/navigation';
import {
  fetchSession,
  fetchQuestions,
  fetchSessionAnswers,
  refineDrsProfile,
} from '@/lib/assessment';
import { advanceWorkflow } from '@/app/assessment/actions';
import { SectionForm } from '@/components/assessment/SectionForm';
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

  const a006Value = answersMap.get('A006')?.text_value ?? '';
  const modes: Record<'C' | 'D' | 'E' | 'F', WorkflowMode | null> = {
    C: session.wf_c_mode,
    D: session.wf_d_mode,
    E: session.wf_e_mode,
    F: session.wf_f_mode,
  };
  const drsProfile = refineDrsProfile(a006Value, modes);

  const questions = await fetchQuestions('G', { drsProfile });

  if (questions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, 'h');

  const profileLabel = drsProfile === 'solo' ? 'Solo Owner' : 'Team Leader';

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--avai-accent-600)" }}>Section G</p>
        <h1 className="text-[1.75rem] font-bold" style={{ color: "var(--avai-ink)", letterSpacing: "var(--avai-tracking-heading)", lineHeight: "var(--avai-leading-heading)" }}>Delegation Readiness</h1>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--avai-accent-50)',
              color: 'var(--avai-accent-700)',
              border: '1px solid var(--avai-accent-200)',
            }}
          >
            {profileLabel} track
          </span>
        </div>
      </div>

      <SectionForm
        sessionId={sessionId}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
        sectionIntro="This section measures how ready you are to hand off ownership."
        submitLabel="Next → Final Questions"
      />
    </div>
  );
}
