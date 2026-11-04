'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { upsertHubspotContact } from '@/lib/hubspot';
import { sendLeadAlert } from '@/lib/lead-alert';
import { readUtmCookie } from '@/lib/utm';

export async function captureEmail(sessionId: string, email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  // Submitting the gate IS the consent (by-submission disclosure shown under
  // the field) — the submission time is the consent timestamp.
  const consentedAt = new Date().toISOString();
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from('assessment_sessions')
    .update({ respondent_email: trimmed, consented_at: consentedAt })
    .eq('id', sessionId);
  if (error) {
    console.error('[captureEmail] session update failed:', error);
    // Never lose the email itself (e.g. deployed before migration 006 ran).
    await supabase
      .from('assessment_sessions')
      .update({ respondent_email: trimmed })
      .eq('id', sessionId);
  }

  // Sync the lead to HubSpot now that we have a real email: contact info, the
  // two headline scores, and the ad's UTM tags. The full picture still lives at
  // /admin/sessions/[id].
  try {
    const [utm, { data: overall }] = await Promise.all([
      readUtmCookie(),
      supabase
        .from('dimension_scores')
        .select('normalized_score, dimensions!inner(slug)')
        .eq('session_id', sessionId)
        .is('workflow_key', null)
        .in('dimensions.slug', ['ods', 'drs']),
    ]);
    const scores: { ods?: number | null; drs?: number | null } = {};
    for (const row of (overall ?? []) as { normalized_score: number; dimensions: { slug: string } | { slug: string }[] }[]) {
      const d = Array.isArray(row.dimensions) ? row.dimensions[0] : row.dimensions;
      if (d?.slug === 'ods') scores.ods = row.normalized_score;
      if (d?.slug === 'drs') scores.drs = row.normalized_score;
    }

    const { data: answers } = await supabase
      .from('answers')
      .select('text_value, questions!inner(question_key)')
      .eq('session_id', sessionId)
      .in('questions.question_key', ['A001', 'A002']);

    let fullName: string | null = null;
    let companyName: string | null = null;
    for (const row of (answers ?? []) as any[]) {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
      if (q?.question_key === 'A001') fullName = row.text_value ?? null;
      if (q?.question_key === 'A002') companyName = row.text_value ?? null;
    }

    // HubSpot sync and Bri's new-lead alert run side by side; one failing
    // never stops the other.
    const [hubspot, alert] = await Promise.allSettled([
      Promise.race([
        upsertHubspotContact(sessionId, trimmed, fullName, companyName, consentedAt, { utm, scores }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('hubspot timeout')), 5000),
        ),
      ]),
      Promise.race([
        sendLeadAlert({ sessionId, email: trimmed, fullName, companyName, scores, utm }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('lead alert timeout')), 5000),
        ),
      ]),
    ]);
    if (hubspot.status === 'rejected') console.error('[captureEmail] hubspot sync failed:', hubspot.reason);
    if (alert.status === 'rejected') console.error('[captureEmail] lead alert failed:', alert.reason);
  } catch (err) {
    console.error('[captureEmail] hubspot sync failed:', err);
  }
}
