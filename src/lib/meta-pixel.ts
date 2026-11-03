// Meta Pixel helpers (client-side only).
//
// The pixel is a side channel: every call here is a silent no-op when the
// pixel is blocked, still loading, or missing. Nothing in the respondent's flow
// may wait on it or break because of it ("the respondent's flow is sacred").
//
// No PII is ever sent: events carry no name, email, or answers.

// Public Meta Pixel / dataset ID ("VAI Leverage Dataset", owned by the Vai
// business portfolio). The same pixel runs on vaileverage.com via Wix, so Meta
// sees one visitor across both sites. NEXT_PUBLIC_META_PIXEL_ID overrides it.
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1123386067098337';

type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | null {
  if (typeof window === 'undefined') return null;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fbq === 'function' ? fbq : null;
}

/** Fire a standard Meta event. eventID lets Meta de-duplicate it. */
export function trackMetaEvent(event: string, eventId?: string): void {
  try {
    const fbq = getFbq();
    if (!fbq) return;
    if (eventId) fbq('track', event, {}, { eventID: eventId });
    else fbq('track', event);
  } catch {
    // Tracking must never surface an error to the respondent.
  }
}

/**
 * Fire an event at most once per browser tab session for a given key, so a
 * refresh of the results page doesn't count the same completion twice.
 */
export function trackMetaEventOnce(event: string, key: string): void {
  const storageKey = `meta:${event}:${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // Storage unavailable (private mode etc.): fall through and fire anyway.
  }
  trackMetaEvent(event, `${key}-${event}`);
}
