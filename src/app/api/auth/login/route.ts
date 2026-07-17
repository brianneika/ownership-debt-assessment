import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, signToken, cookieOptions, COOKIE_NAME, SESSION_DURATION_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let email: string;
  let password: string;

  try {
    const body = await request.json();
    email = (body.email ?? '').trim();
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = await validateAdminCredentials(email, password);
  } catch (err) {
    console.error('[auth/login] credential validation error:', err);
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signToken(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, cookieOptions(SESSION_DURATION_SECONDS));
  return response;
}
