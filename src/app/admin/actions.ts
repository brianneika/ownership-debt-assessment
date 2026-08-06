'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function deleteAssessmentSession(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const rawSessionId = formData.get('sessionId');
  const sessionId = String(rawSessionId ?? '').trim();

  if (!sessionId) {
    throw new Error('A valid session id is required.');
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('assessment_sessions').delete().eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to delete assessment session: ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function deleteAdminUser(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const rawUserId = formData.get('userId');
  const userId = Number.parseInt(String(rawUserId ?? ''), 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('A valid admin user id is required.');
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from('admin_users').delete().eq('id', userId);

  if (error) {
    throw new Error(`Failed to delete admin user: ${error.message}`);
  }

  revalidatePath('/admin');
}
