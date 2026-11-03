// Ad attribution (UTM tags) for HubSpot.
//
// The visitor's landing URL carries utm_* tags (e.g. from a Meta ad). The
// client-side <UtmCapture /> stores them in a first-party cookie so they survive
// the 15-20 minute assessment; the server actions read the cookie when the
// visitor gives their email and send the tags to HubSpot.
//
// Server-side only helpers here; the cookie writer lives in UtmCapture.tsx.

import { cookies } from 'next/headers';

export const UTM_COOKIE = 'vai_utm';
export const UTM_KEYS = ['source', 'medium', 'campaign', 'content'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

/** Read the stored UTM tags. Never throws; returns {} when absent or invalid. */
export async function readUtmCookie(): Promise<Utm> {
  try {
    const raw = (await cookies()).get(UTM_COOKIE)?.value;
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const utm: Utm = {};
    for (const key of UTM_KEYS) {
      const v = parsed[key];
      if (typeof v === 'string' && v.trim()) utm[key] = v.trim().slice(0, 200);
    }
    return utm;
  } catch {
    return {};
  }
}
