// proxy.ts (renamed from middleware.ts in Next.js 16)
// Runs on the Edge Runtime — only `jose` and Web APIs are available here.
// Do NOT import anything that uses Node APIs (bcryptjs, next/headers).
//
// Responsibilities:
//   1. Allow /admin/login through unconditionally
//   2. For all other /admin/* routes: read admin_session cookie, verify JWT
//   3. Valid session → reissue cookie (sliding 60-min expiry), continue
//   4. Missing or invalid session → redirect to /admin/login

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken, COOKIE_NAME, SESSION_DURATION_SECONDS, cookieOptions } from '@/lib/auth';

export const config = {
  matcher: '/admin/:path*',
};

// Must be named `proxy` in Next.js 16 (was `middleware` in earlier versions)
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const session = await verifyToken(token);

  if (!session) {
    const response = redirectToLogin(request);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Reissue a fresh token to slide the 60-min inactivity window
  const freshToken = await signToken(session.email);
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, freshToken, cookieOptions(SESSION_DURATION_SECONDS));

  return response;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
