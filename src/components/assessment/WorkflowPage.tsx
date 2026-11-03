// Server component shared by the four workflow pages (c, d, e, f).
// v1 sessions render exactly as before; v2 sessions skip workflows marked
// "We don't do this work", use the "your agents" wording where the owner answer
// is "Each agent handles their own", and name the owner from the v2 answer.

import { notFound, redirect } from 'next/navigation';
import {
  fetchSession,
  fetchQuestions,
  fetchSessionAnswers,
  applyOwnerVariant,
  V2_OWNER_KEYS,
  type SavedAnswer,
  type WorkflowKey,
  type WorkflowMode,
} from '@/lib/assessment';
import { advanceWorkflow } from '@/app/assessment/actions';
import { WorkflowSection } from './WorkflowSection';

const V1_ROLE_LABELS: Record<string, string> = {
  tc: 'Transaction Coordinator',
  listing_coordinator: 'Listing Coordinator',
  operations_manager: 'Operations Manager',
};

const V1_B_KEYS: Record<WorkflowKey, string> = { C: 'B001', D: 'B002', E: 'B003', F: 'B004' };

const ORDER: WorkflowKey[] = ['C', 'D', 'E', 'F'];
const SLUG: Record<WorkflowKey, string> = { C: 'c', D: 'd', E: 'e', F: 'f' };

// v2 owner wording for the section intro, e.g. "your listing coordinator".
const V2_OWNER_PHRASES: Record<string, string> = {
  tc: 'your transaction coordinator',
  listing_coordinator: 'your listing coordinator',
  operations_manager: 'your operations manager',
  assistant_va: 'your assistant or VA',
  each_agent: 'your agents',
  named_owner: 'your team member',
};

function modeOf(session: { wf_c_mode: WorkflowMode | null; wf_d_mode: WorkflowMode | null; wf_e_mode: WorkflowMode | null; wf_f_mode: WorkflowMode | null }, wf: WorkflowKey) {
  return { C: session.wf_c_mode, D: session.wf_d_mode, E: session.wf_e_mode, F: session.wf_f_mode }[wf];
}

export async function WorkflowPage({ sessionId, workflowKey }: { sessionId: string; workflowKey: WorkflowKey }) {
  const session = await fetchSession(sessionId);
  if (!session) notFound();

  const idx = ORDER.indexOf(workflowKey);
  const nextKey = ORDER[idx + 1];
  const nextSlug = nextKey ? SLUG[nextKey] : 'g';

  const mode = modeOf(session, workflowKey);
  if (!mode) redirect(`/assessment/${sessionId}/b`);

  const version = session.instrument_version;

  // v2: "We don't do this work" skips the workflow entirely.
  if (mode === 'N') redirect(`/assessment/${sessionId}/${nextSlug}`);

  const [rawQuestions, answersMap] = await Promise.all([
    fetchQuestions(workflowKey, { mode, version }),
    fetchSessionAnswers(sessionId),
  ]);

  if (rawQuestions.length === 0) notFound();

  const savedAnswers: Record<string, SavedAnswer> = {};
  answersMap.forEach((v, k) => { savedAnswers[k] = v; });

  const nextAction = advanceWorkflow.bind(null, sessionId, nextSlug);

  // Is this the last workflow the respondent will see?
  const laterShown = ORDER.slice(idx + 1).some((k) => {
    const m = modeOf(session, k);
    return m !== 'N';
  });
  const isLast = !laterShown;
  const nextLabel = isLast ? 'Next: Delegation readiness' : undefined;

  if (version === 2) {
    const ownerValue = answersMap.get(V2_OWNER_KEYS[workflowKey])?.text_value ?? null;
    const role = (answersMap.get(`${V2_OWNER_KEYS[workflowKey]}_ROLE`)?.text_value ?? '').trim();
    const ownerPhrase =
      ownerValue === 'other_provider'
        ? role
          ? `your ${role.replace(/^(an?|the|my|our|your)\s+/i, '')}`
          : 'your outside provider'
        : V2_OWNER_PHRASES[ownerValue ?? ''] ?? undefined;
    const questions = applyOwnerVariant(rawQuestions, ownerValue);
    return (
      <WorkflowSection
        sessionId={sessionId}
        workflowKey={workflowKey}
        mode={mode}
        questions={questions}
        savedAnswers={savedAnswers}
        nextAction={nextAction}
        ownerPhrase={ownerPhrase}
        ownerPlural={ownerValue === 'each_agent'}
        version={2}
        isLast={isLast}
        nextLabel={nextLabel}
      />
    );
  }

  // v1: unchanged behavior.
  const ownerRole = V1_ROLE_LABELS[answersMap.get(V1_B_KEYS[workflowKey])?.text_value ?? ''];
  return (
    <WorkflowSection
      sessionId={sessionId}
      workflowKey={workflowKey}
      mode={mode}
      questions={rawQuestions}
      savedAnswers={savedAnswers}
      nextAction={nextAction}
      ownerRole={ownerRole}
      nextLabel={workflowKey === 'F' ? 'Next: Delegation readiness' : undefined}
    />
  );
}
