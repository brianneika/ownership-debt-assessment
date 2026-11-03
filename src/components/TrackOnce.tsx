'use client';

// Fires a Meta event once per browser tab session from a server-rendered page.
// Renders nothing.

import { useEffect } from 'react';
import { trackMetaEventOnce } from '@/lib/meta-pixel';

export function TrackOnce({ event, sessionKey }: { event: string; sessionKey: string }) {
  useEffect(() => {
    trackMetaEventOnce(event, sessionKey);
  }, [event, sessionKey]);
  return null;
}
