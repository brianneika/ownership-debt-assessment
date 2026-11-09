'use server';

// Blueprint PDF request (plans/tasks/20261109-blueprint-landing-page.md).
// Saves the lead (best-effort), alerts Bri, then sends the visitor to the
// download page. Nothing here may block the redirect except invalid input.

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { sendBlueprintAlert } from '@/lib/lead-alert';
import { readUtmCookie } from '@/lib/utm';

export type BlueprintFormState = { error: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestBlueprint(
  _prev: BlueprintFormState,
  formData: FormData,
): Promise<BlueprintFormState> {
  const firstName = ((formData.get('first_name') as string) ?? '').trim().slice(0, 100);
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase().slice(0, 200);
  const phone = ((formData.get('phone') as string) ?? '').trim().slice(0, 40);
  const metaEventId = ((formData.get('meta_event_id') as string) ?? '').trim().slice(0, 100) || null;

  if (!firstName) return { error: 'Please add your first name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Please check your email address.' };
  if (phone.replace(/\D/g, '').length < 10) return { error: 'Please add a phone number with area code.' };

  const utm = await readUtmCookie();

  try {
    const { error } = await getSupabaseServer().from('blueprint_leads').insert({
      first_name: firstName,
      email,
      phone,
      utm_source: utm.source ?? null,
      utm_medium: utm.medium ?? null,
      utm_campaign: utm.campaign ?? null,
      utm_content: utm.content ?? null,
      meta_event_id: metaEventId,
    });
    if (error) console.error('[blueprint] lead insert failed:', error.message);
  } catch (err) {
    console.error('[blueprint] lead insert threw:', err);
  }

  await sendBlueprintAlert({ firstName, email, phone, utm });

  redirect('/blueprint/thanks');
}
