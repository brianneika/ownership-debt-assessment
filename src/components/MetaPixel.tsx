'use client';

// Loads the Meta Pixel after hydration (never on the critical render path) and
// fires PageView on the first load and on every client-side route change.
// Admin pages are never tracked.

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { META_PIXEL_ID, trackMetaEvent } from '@/lib/meta-pixel';

const BASE_CODE = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');
`;

function isTrackedPath(pathname: string | null): boolean {
  return !!pathname && !pathname.startsWith('/admin');
}

export function MetaPixel() {
  const pathname = usePathname();
  const tracked = isTrackedPath(pathname);

  useEffect(() => {
    // The fbq stub queues calls made before fbevents.js finishes loading.
    if (tracked) trackMetaEvent('PageView');
  }, [pathname, tracked]);

  if (!tracked) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {BASE_CODE}
    </Script>
  );
}
