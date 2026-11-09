import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  verifySessionToken,
  type AdminSessionPayload,
} from './token';

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from './token';

export function getSessionCookieOptions(maxAge: number = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Reads and verifies the signed admin session from the HTTP-only cookie.
 * Safe to call from server components and route handlers.
 */
export async function getSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Persists a signed session token in an HTTP-only cookie.
 * Only callable from route handlers or server actions.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
}
