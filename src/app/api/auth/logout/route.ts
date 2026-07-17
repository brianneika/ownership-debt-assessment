import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // maxAge: 0 tells the browser to delete the cookie immediately
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
