import { NextResponse } from 'next/server';
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json(
    { success: true, data: { signedOut: true }, message: 'Signed out successfully' },
    { status: 200 }
  );

  response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
