import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { verifyAdminCredentials } from '@/lib/auth/guards';
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
} from '@/lib/auth/rate-limit';
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';
import { createSessionToken } from '@/lib/auth/token';
import { loginSchema } from '@/lib/validations/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  const rateLimitKey = `admin-login:${getClientIp(request)}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    const response = apiError(
      'Too many sign-in attempts. Please try again later.',
      429,
      undefined,
      'RATE_LIMITED'
    );
    response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const response = apiError(
      'Invalid email or password',
      400,
      undefined,
      'INVALID_CREDENTIALS'
    );
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const response = apiError(
      'Invalid email or password',
      400,
      undefined,
      'INVALID_CREDENTIALS'
    );
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  try {
    const admin = await verifyAdminCredentials(
      parsed.data.email,
      parsed.data.password
    );

    if (!admin) {
      const response = apiError(
        'Invalid email or password',
        401,
        undefined,
        'INVALID_CREDENTIALS'
      );
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    const token = await createSessionToken({
      userId: admin.id,
      email: admin.email,
      ...(admin.name ? { name: admin.name } : {}),
    });

    resetLoginRateLimit(rateLimitKey);

    const response = apiSuccess({ admin }, 'Signed in successfully');
    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions()
    );
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin login failed:', message);

    // Surface deployment configuration problems as distinguishable codes so an
    // operator can tell "wrong password" (401) from "missing env var" (503)
    // without reading server logs.
    let failure: NextResponse;
    if (message.includes('Authentication is not configured')) {
      failure = apiError(
        'Admin authentication is not configured on this deployment.',
        503,
        undefined,
        'AUTH_NOT_CONFIGURED'
      );
    } else if (
      /mongodb|mongoose|server selection|connection|ECONNREFUSED|ETIMEDOUT|authentication failed/i.test(
        message
      )
    ) {
      failure = apiError(
        'The database is currently unreachable. Please try again shortly.',
        503,
        undefined,
        'DATABASE_UNAVAILABLE'
      );
    } else {
      failure = apiError(
        'Unable to sign in right now',
        500,
        undefined,
        'INTERNAL_SERVER_ERROR'
      );
    }

    failure.headers.set('Cache-Control', 'no-store');
    return failure;
  }
}
