'use server';

import { getSupabaseServer } from '@/lib/supabase-server';
import { calculateScores } from '@/lib/scoring';
import { sendResultsWebhook } from '@/lib/webhook';

export async function captureEmail(sessionId: string, email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const supabase = getSupabaseServer();

  await supabase
    .from('assessment_sessions')
    .update({ respondent_email: trimmed })
    .eq('id', sessionId);

  // Fire webhook now that we have a real email. Scores are already in DB from
  // submitAssessment, so we re-derive the ScoringResult from persisted rows.
  try {
    const scoring = await calculateScores(sessionId);
    await Promise.race([
      sendResultsWebhook(sessionId, scoring, trimmed),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('webhook timeout')), 5000),
      ),
    ]);
  } catch (err) {
    console.error('[captureEmail] webhook failed:', err);
  }
}
