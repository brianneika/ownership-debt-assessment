// New-lead alert email to Bri via Resend. Server-side only — deliberately NOT a
// 'use server' file; called from captureEmail / submitAssessment once a lead
// has both an email and scores (task 20261104-new-lead-alert-email).
//
// No-op when RESEND_API_KEY / LEAD_ALERT_TO are unset (e.g. local dev).
// Errors are logged, never thrown — an alert failure must not block the respondent.

import type { Utm } from './utm';

const RESEND_URL = 'https://api.resend.com/emails';

// Resend's shared sender works without verifying a domain, but only delivers to
// the email address that owns the Resend account. Set LEAD_ALERT_FROM once
// vaileverage.com is verified in Resend.
const DEFAULT_FROM = 'VAI Leads <onboarding@resend.dev>';

export type LeadAlert = {
  sessionId: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  scores: { ods?: number | null; drs?: number | null };
  utm: Utm;
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function fmtScore(n: number | null | undefined): string {
  return typeof n === 'number' ? String(Math.round(n)) : 'not scored';
}

export async function sendLeadAlert(lead: LeadAlert): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_ALERT_TO;
  if (!key || !to) return;

  const baseUrl = (process.env.APP_BASE_URL ?? '').replace(/\/+$/, '');
  const resultsUrl = baseUrl ? `${baseUrl}/admin/sessions/${lead.sessionId}` : null;
  const name = lead.fullName?.trim() || lead.email;
  const company = lead.companyName?.trim() || 'No business name';
  const source = [lead.utm.source, lead.utm.medium].filter(Boolean).join(' / ') || 'Direct (no ad tags)';
  const ad = [lead.utm.campaign, lead.utm.content].filter(Boolean).join(' / ') || 'None';

  const rows: [string, string][] = [
    ['Name', name],
    ['Business', company],
    ['Email', lead.email],
    ['Ownership Debt Score', fmtScore(lead.scores.ods)],
    ['Delegation Readiness Score', fmtScore(lead.scores.drs)],
    ['Source', source],
    ['Campaign / ad', ad],
  ];

  const text = [
    'A new lead just finished the Ownership Debt assessment. Call within 5 minutes.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(resultsUrl ? ['', `Full results: ${resultsUrl}`] : []),
  ].join('\n');

  const html =
    '<p>A new lead just finished the Ownership Debt assessment. <strong>Call within 5 minutes.</strong></p>' +
    '<table cellpadding="4">' +
    rows.map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('') +
    '</table>' +
    (resultsUrl ? `<p><a href="${escapeHtml(resultsUrl)}">Open full results</a></p>` : '');

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: process.env.LEAD_ALERT_FROM || DEFAULT_FROM,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        subject: `New lead: ${name} (${company})`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[lead-alert] send failed ${res.status}:`, await res.text());
    }
  } catch (err) {
    console.error('[lead-alert] fetch threw:', err);
  }
}
