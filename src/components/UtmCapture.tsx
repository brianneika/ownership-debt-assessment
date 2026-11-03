'use client';

// Saves utm_* tags from the landing URL into a first-party cookie (30 days) so
// the server can attribute the lead in HubSpot when the email is captured.
// Only overwrites when the current URL actually carries UTM tags, so moving
// between pages inside the assessment keeps the original ad's tags.
// Renders nothing; a failure here never affects the respondent.

import { useEffect } from 'react';

const COOKIE = 'vai_utm';
const KEYS = ['source', 'medium', 'campaign', 'content'] as const;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const key of KEYS) {
        const v = params.get(`utm_${key}`);
        if (v && v.trim()) utm[key] = v.trim().slice(0, 200);
      }
      if (Object.keys(utm).length === 0) return;
      const value = encodeURIComponent(JSON.stringify(utm));
      document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax; Secure`;
    } catch {
      // Attribution is best-effort.
    }
  }, []);
  return null;
}
