/**
 * Minimal in-memory rate limiter shared by public API routes.
 *
 * Deliberately dependency-free and per-process. In a multi-instance
 * deployment this should be replaced with a shared store (e.g. Redis).
 */

import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

function pruneExpired(now: number): void {
  if (buckets.size < 1000) return;

  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Extracts the best-effort client IP from standard proxy headers.
 */
export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Enforce a per-IP rate limit inside a route handler.
 *
 * Returns a ready-to-send 429 response when the caller is over the limit,
 * or null when the request may proceed.
 */
export function enforceRateLimit(
  request: Request,
  options: {
    /** Logical bucket, e.g. "orders" or "quote". Combined with the client IP. */
    bucket: string;
    limit: number;
    windowMs: number;
  }
): NextResponse | null {
  const result = checkRateLimit(
    `${options.bucket}:${clientIpFromRequest(request)}`,
    options.limit,
    options.windowMs
  );

  if (result.allowed) return null;

  const response = apiError(
    'Too many requests. Please slow down and try again shortly.',
    429,
    undefined,
    'RATE_LIMITED'
  );
  response.headers.set('Retry-After', String(result.retryAfterSeconds));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
