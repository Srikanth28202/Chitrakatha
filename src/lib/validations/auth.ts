import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Email is required')
    .max(254, 'Email is too long')
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(200, 'Password is too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Prevents open redirects: only same-site admin paths are accepted.
 */
export function sanitizeAdminRedirect(value: unknown): string {
  if (typeof value !== 'string') {
    return '/admin';
  }

  if (value.startsWith('//') || value.includes('\\')) {
    return '/admin';
  }

  if (!/^\/admin(?:\/|\?|$)/.test(value)) {
    return '/admin';
  }

  return value;
}
