'use server';

import { createHmac, randomUUID } from 'crypto';
import { getSupabaseServer } from './supabase-server';
import { WORKFLOW_NAMES, type WorkflowKey } from './assessment';
import type { ScoringResult } from './scoring';

const WORKFLOW_KEYS: WorkflowKey[] = ['C', 'D', 'E', 'F'];

export async function sendResultsWebhook(
  sessionId: string,
  scoring: ScoringResult,
  respondentEmail: string | null = null,
): Promise<void> {
  const url = process.env.LOVABLE_INGEST_URL;
  const signingSecret = process.env.VAI_SIGNING_SECRET;
  if (!url || !signingSecret) return;

  const supabase = getSupabaseServer();

  const [{ data: session }, { data: answers }, { data: dimScores }, { data: wfScoresRaw }] =
    await Promise.all([
      supabase
        .from('assessment_sessions')
        .select('wf_c_mode, wf_d_mode, wf_e_mode, wf_f_mode, completed_at')
        .eq('id', sessionId)
        .single(),
      supabase
        .from('answers')
        .select('text_value, questions!inner(question_key)')
        .eq('session_id', sessionId)
        .in('questions.question_key', ['A001', 'A002', 'B001', 'B002', 'B003', 'B004', 'Q089', 'Q090']),
      supabase
        .from('dimension_scores')
        .select('workflow_key, normalized_score, dimensions(slug), score_bands(label)')
        .eq('session_id', sessionId)
        .is('workflow_key', null),
      supabase
        .from('dimension_scores')
        .select('workflow_key, normalized_score, dimensions(slug), score_bands(label)')
        .eq('session_id', sessionId)
        .not('workflow_key', 'is', null),
    ]);

  // Build answer lookup by question_key
  const byKey = new Map<string, string | null>();
  for (const row of (answers ?? []) as any[]) {
    const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    if (q?.question_key) byKey.set(q.question_key, row.text_value ?? null);
  }

  // Overall band labels
  const overallBySlug = new Map<string, { score: number; band: string | null }>();
  for (const row of (dimScores ?? []) as any[]) {
    const slug = (Array.isArray(row.dimensions) ? row.dimensions[0] : row.dimensions)?.slug;
    const band = (Array.isArray(row.score_bands) ? row.score_bands[0] : row.score_bands)?.label ?? null;
    if (slug) overallBySlug.set(slug, { score: row.normalized_score, band });
  }

  // Per-workflow band labels
  const wfData: Record<string, { ods?: { score: number; band: string | null }; oqi?: { score: number; band: string | null } }> = {};
  for (const row of (wfScoresRaw ?? []) as any[]) {
    const slug = (Array.isArray(row.dimensions) ? row.dimensions[0] : row.dimensions)?.slug;
    const band = (Array.isArray(row.score_bands) ? row.score_bands[0] : row.score_bands)?.label ?? null;
    const wf = row.workflow_key;
    if (!wf || !slug) continue;
    wfData[wf] ??= {};
    if (slug === 'ods') wfData[wf].ods = { score: row.normalized_score, band };
    if (slug === 'oqi') wfData[wf].oqi = { score: row.normalized_score, band };
  }

  const wfModes: Record<WorkflowKey, string | null> = {
    C: session?.wf_c_mode ?? null,
    D: session?.wf_d_mode ?? null,
    E: session?.wf_e_mode ?? null,
    F: session?.wf_f_mode ?? null,
  };

  const B_OWNER_KEYS: Record<WorkflowKey, string> = { C: 'B001', D: 'B002', E: 'B003', F: 'B004' };

  // Build dimensions array in Lovable's schema
  const dimensions = [
    {
      key: 'ods',
      label: 'Ownership Debt Score',
      score: overallBySlug.get('ods')?.score ?? scoring.overallOds,
      max_score: 100,
      band: overallBySlug.get('ods')?.band ?? null,
      subdimensions: WORKFLOW_KEYS.filter((wf) => scoring.workflowOds[wf] !== null).map((wf) => ({
        key: `ods_wf_${wf.toLowerCase()}`,
        label: `${WORKFLOW_NAMES[wf]} ODS`,
        score: wfData[wf]?.ods?.score ?? scoring.workflowOds[wf],
        max_score: 100,
        band: wfData[wf]?.ods?.band ?? null,
        parent_key: 'ods',
        weight: null,
      })),
    },
    {
      key: 'drs',
      label: 'Delegation Readiness Score',
      score: overallBySlug.get('drs')?.score ?? scoring.drs,
      max_score: 100,
      band: overallBySlug.get('drs')?.band ?? null,
      subdimensions: WORKFLOW_KEYS.filter((wf) => scoring.workflowOqi[wf] !== null).map((wf) => ({
        key: `oqi_wf_${wf.toLowerCase()}`,
        label: `${WORKFLOW_NAMES[wf]} OQI`,
        score: wfData[wf]?.oqi?.score ?? scoring.workflowOqi[wf],
        max_score: 100,
        band: wfData[wf]?.oqi?.band ?? null,
        parent_key: 'drs',
        weight: null,
      })),
    },
  ];

  const eventId = randomUUID();
  const occurredAt = session?.completed_at ?? new Date().toISOString();

  const payload = {
    event_id: eventId,
    event_type: 'result.completed' as const,
    occurred_at: occurredAt,
    assessment: {
      external_id: 'ownership-assessment-v1',
      key: 'ownership-assessment',
      name: 'VAI Ownership Debt Assessment',
      version: '1.0',
    },
    respondent: {
      external_id: sessionId,
      email: respondentEmail,
      full_name: byKey.get('A001') ?? null,
      company_name: byKey.get('A002') ?? null,
    },
    result: {
      external_result_id: sessionId,
      status: 'completed' as const,
      completed_at: occurredAt,
      overall_score: overallBySlug.get('ods')?.score ?? scoring.overallOds,
      overall_band: overallBySlug.get('ods')?.band ?? null,
      max_score: 100,
      scale: '0-100',
      dimensions,
    },
    raw: {
      session_id: sessionId,
      drs_profile: scoring.drsProfile,
      workflows: WORKFLOW_KEYS.map((key) => ({
        workflow_key: key,
        name: WORKFLOW_NAMES[key],
        mode: wfModes[key],
        owner: byKey.get(B_OWNER_KEYS[key]) ?? null,
      })),
      context: {
        consultant_note: byKey.get('Q089') ?? null,
        success_vision: byKey.get('Q090') ?? null,
      },
    },
  };

  const bodyStr = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac('sha256', signingSecret)
    .update(`${timestamp}.${bodyStr}`)
    .digest('hex');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-vai-source': 'ownership-assessment',
    'x-vai-timestamp': timestamp,
    'x-vai-signature': sig,
    'x-vai-event-id': eventId,
  };

  try {
    const res = await fetch(url, { method: 'POST', headers, body: bodyStr });
    const resBody = await res.text();
    if (!res.ok) {
      console.error(`[webhook] failed ${res.status}:`, resBody);
    }
  } catch (err) {
    console.error('[webhook] fetch threw:', err);
  }
}
