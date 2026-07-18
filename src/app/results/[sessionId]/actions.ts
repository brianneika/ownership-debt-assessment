'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { upsertHubspotContact } from '@/lib/hubspot';

export async function captureEmail(sessionId: string, email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const supabase = getSupabaseServer();

  await supabase
    .from('assessment_sessions')
    .update({ respondent_email: trimmed })
    .eq('id', sessionId);

  // Sync the lead to HubSpot now that we have a real email. Contact info only —
  // scores stay in Supabase; the full picture lives at /admin/sessions/[id].
  try {
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

    await Promise.race([
      upsertHubspotContact(sessionId, trimmed, fullName, companyName),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('hubspot timeout')), 5000),
      ),
    ]);
  } catch (err) {
    console.error('[captureEmail] hubspot sync failed:', err);
  }
}
