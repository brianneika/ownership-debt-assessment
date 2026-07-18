// HubSpot CRM sync. Server-side only — deliberately NOT a 'use server' file, so
// this never becomes a client-invokable endpoint; it is called from the
// captureEmail server action.

const HUBSPOT_UPSERT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';

/**
 * Create or update a HubSpot contact for a respondent, keyed by email.
 * Contact info + admin results link only — scores stay in Supabase.
 *
 * No-op when HUBSPOT_ACCESS_TOKEN / APP_BASE_URL are unset (e.g. local dev).
 * Errors are logged, never thrown — CRM failures must not block the respondent.
 */
export async function upsertHubspotContact(
  sessionId: string,
  email: string,
  fullName: string | null,
  companyName: string | null,
): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const baseUrl = process.env.APP_BASE_URL;
  if (!token || !baseUrl) return;

  const properties: Record<string, string> = {
    email,
    assessment_results_url: `${baseUrl.replace(/\/+$/, '')}/admin/sessions/${sessionId}`,
  };

  // Split full name into first/last on the first space. Only send properties we
  // actually have — an empty string would wipe existing values on upsert.
  const name = fullName?.trim() ?? '';
  if (name) {
    const spaceIdx = name.indexOf(' ');
    properties.firstname = spaceIdx === -1 ? name : name.slice(0, spaceIdx);
    if (spaceIdx !== -1) properties.lastname = name.slice(spaceIdx + 1).trim();
  }
  const company = companyName?.trim() ?? '';
  if (company) properties.company = company;

  try {
    const res = await fetch(HUBSPOT_UPSERT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: [{ id: email, idProperty: 'email', properties }],
      }),
    });
    if (!res.ok) {
      const resBody = await res.text();
      console.error(`[hubspot] upsert failed ${res.status}:`, resBody);
    }
  } catch (err) {
    console.error('[hubspot] fetch threw:', err);
  }
}
