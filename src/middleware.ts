import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/token';

/**
 * Edge-safe gatekeeper for all admin surfaces.
 *
 * - `/admin/login` and the auth endpoints (login/logout) are public.
 * - Every other `/admin/*` page requires a valid admin session.
 * - Every other `/api/admin/*` endpoint returns 401 JSON without a session.
 *
 * Deeper, database-backed role verification happens again inside route
 * handlers and server components via `requireAdmin()`.
 */

const PUBLIC_ADMIN_API_PATHS = new Set([
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
]);

const LOGIN_PATH = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (pathname.startsWith('/api/admin')) {
    if (PUBLIC_ADMIN_API_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  if (pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`) {
    return NextResponse.next();
  }

  if (!session || session.role !== 'admin') {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== LOGIN_PATH) {
      loginUrl.searchParams.set('next', pathname);
    }

    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
};
