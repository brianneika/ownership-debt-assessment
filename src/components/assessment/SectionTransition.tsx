'use client';

import { usePathname } from 'next/navigation';

// Forces a remount (and replay of the avai-section-enter animation) on every
// navigation between assessment section pages. Keying on pathname is the
// reliable way to do this — the wrapping layout's Server Component instance
// is not guaranteed to re-render on sibling-page navigation, but this client
// component re-renders whenever the route changes.
export function SectionTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="avai-section-enter">
      {children}
    </div>
  );
}
