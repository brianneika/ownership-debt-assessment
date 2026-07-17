// lib/auth.ts
// JWT signing, verification, and session helpers.
// Uses `jose` throughout — compatible with both Edge Runtime (middleware)
// and Node Runtime (route handlers). Do NOT import `jsonwebtoken` here;
// it relies on Node crypto APIs unavailable in the edge.
//
// Credentials come from env vars for MVP.
// The admin_users DB table exists for named multi-admin support later.

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

// ─── Constants ────────────────────────────────────────────────────────────────

export const COOKIE_NAME = 'admin_session';
export const SESSION_DURATION_SECONDS = 60 * 60; // 60 minutes

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminSession extends JWTPayload {
  email: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env var is not set.');
  return new TextEncoder().encode(secret);
}

// ─── signToken ────────────────────────────────────────────────────────────────
// Creates a signed JWT with a 60-minute expiry from now.
// Call this on login AND on every authenticated request (sliding window).

export async function signToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

// ─── verifyToken ──────────────────────────────────────────────────────────────
// Verifies signature and expiry. Returns the payload or null.
// Never throws — callers treat null as "not authenticated".

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as AdminSession;
  } catch {
    return null;
  }
}

// ─── getSession ───────────────────────────────────────────────────────────────
// Reads admin_session cookie from the Next.js cookie store (server components
// and route handlers only — not edge middleware, which uses NextRequest directly).
// Returns the verified session payload or null.

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── cookieOptions ────────────────────────────────────────────────────────────
// Shared cookie config used by login, logout, and middleware reissue.

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

// ─── Credential validation ───────────────────────────────────────────────────
// Validates submitted credentials against env vars using bcrypt.
// Only call this from Node Runtime route handlers (bcryptjs uses Node APIs).

export async function validateAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD env vars are not set.');
  }

  if (email !== expectedEmail) return false;

  // Dynamic import keeps bcryptjs out of the edge bundle
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, expectedPassword);
}
