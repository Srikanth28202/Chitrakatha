/**
 * Login-specific wrapper around the shared in-memory rate limiter.
 *
 * This intentionally avoids external storage. In a multi-instance deployment
 * it should be replaced with a shared store (e.g. Redis).
 */

import { checkRateLimit, resetRateLimit, type RateLimitResult } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export type { RateLimitResult };

export function checkLoginRateLimit(key: string): RateLimitResult {
  return checkRateLimit(key, MAX_ATTEMPTS, WINDOW_MS);
}

export function resetLoginRateLimit(key: string): void {
  resetRateLimit(key);
}
