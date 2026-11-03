// HubSpot CRM sync. Server-side only — deliberately NOT a 'use server' file, so
// this never becomes a client-invokable endpoint; it is called from the
// captureEmail / unlockFullAssessment / submitAssessment server actions.

import type { Utm } from './utm';

const HUBSPOT_UPSERT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';

// Custom contact properties for Meta ads attribution (2026-11-03, task
// 20261103-hubspot-score-and-ad-source). Created in the HubSpot portal. If any
// is ever missing, the upsert retries without these so a lead is never lost.
const OPTIONAL_PROPERTIES = new Set([
  'ownership_debt_score',
  'delegation_readiness_score',
  'assessment_utm_source',
  'assessment_utm_medium',
  'assessment_utm_campaign',
  'assessment_utm_content',
]);

/** Upsert one contact by email. Errors are logged, never thrown. */
async function upsertContact(email: string, properties: Record<string, string>): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return;

  const send = (props: Record<string, string>) =>
    fetch(HUBSPOT_UPSERT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: [{ id: email, idProperty: 'email', properties: { email, ...props } }],
      }),
    });

  try {
    let res = await send(properties);
    if (!res.ok) {
      const resBody = await res.text();
      console.error(`[hubspot] upsert failed ${res.status}:`, resBody);

      // An unknown property fails the whole upsert. Retry with only the core
      // properties so the lead itself still lands.
      const core = Object.fromEntries(
        Object.entries(properties).filter(([k]) => !OPTIONAL_PROPERTIES.has(k)),
      );
      if (
        res.status === 400 &&
        Object.keys(core).length < Object.keys(properties).length
      ) {
        res = await send(core);
        if (!res.ok) console.error(`[hubspot] core retry failed ${res.status}:`, await res.text());
      }
    }
  } catch (err) {
    console.error('[hubspot] fetch threw:', err);
  }
}

function utmProperties(utm: Utm | undefined): Record<string, string> {
  const props: Record<string, string> = {};
  if (!utm) return props;
  if (utm.source) props.assessment_utm_source = utm.source;
  if (utm.medium) props.assessment_utm_medium = utm.medium;
  if (utm.campaign) props.assessment_utm_campaign = utm.campaign;
  if (utm.content) props.assessment_utm_content = utm.content;
  return props;
}

function scoreProperties(scores: { ods?: number | null; drs?: number | null } | undefined) {
  const props: Record<string, string> = {};
  if (scores?.ods != null && Number.isFinite(scores.ods)) {
    props.ownership_debt_score = String(Math.round(scores.ods));
  }
  if (scores?.drs != null && Number.isFinite(scores.drs)) {
    props.delegation_readiness_score = String(Math.round(scores.drs));
  }
  return props;
}

/**
 * Create or update a HubSpot contact for a respondent, keyed by email.
 * Contact info, admin results link, and (when known) the two headline scores
 * and the ad's UTM tags. The full picture still lives at /admin/sessions/[id].
 *
 * No-op when HUBSPOT_ACCESS_TOKEN / APP_BASE_URL are unset (e.g. local dev).
 * Errors are logged, never thrown — CRM failures must not block the respondent.
 */
export async function upsertHubspotContact(
  sessionId: string,
  email: string,
  fullName: string | null,
  companyName: string | null,
  consentedAt: string | null,
  extra?: { utm?: Utm; scores?: { ods?: number | null; drs?: number | null } },
): Promise<void> {
  const baseUrl = process.env.APP_BASE_URL;
  if (!process.env.HUBSPOT_ACCESS_TOKEN || !baseUrl) return;

  const properties: Record<string, string> = {
    assessment_results_url: `${baseUrl.replace(/\/+$/, '')}/admin/sessions/${sessionId}`,
  };

  // Custom date property (must exist in the HubSpot portal before this ships —
  // an unknown property fails the whole upsert). Date-picker properties take
  // YYYY-MM-DD; the exact timestamp of record lives in Supabase.
  if (consentedAt) properties.email_consent_date = consentedAt.slice(0, 10);

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

  Object.assign(properties, utmProperties(extra?.utm), scoreProperties(extra?.scores));

  await upsertContact(email, properties);
}

/**
 * Send the headline scores for a respondent whose email we already have (the
 * teaser path captures email before the assessment is scored).
 */
export async function syncHubspotScores(
  email: string,
  scores: { ods?: number | null; drs?: number | null },
): Promise<void> {
  const props = scoreProperties(scores);
  if (Object.keys(props).length === 0) return;
  await upsertContact(email, props);
}
