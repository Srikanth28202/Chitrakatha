import { z } from 'zod';

/**
 * Server-only environment validation.
 *
 * Validation is intentionally lazy (called at request time) so that
 * `next build` can complete without production secrets being present.
 * Error messages never include the offending values.
 */

const sessionEnvSchema = z.object({
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long'),
});

const adminInitEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z
    .string()
    .min(10, 'ADMIN_PASSWORD must be at least 10 characters long')
    .max(128, 'ADMIN_PASSWORD must be at most 128 characters long'),
  ADMIN_NAME: z.string().trim().min(2).max(120).optional(),
});

export interface AdminInitEnv {
  MONGODB_URI: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_NAME?: string;
}

export function getSessionSecret(): string {
  const parsed = sessionEnvSchema.safeParse({
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      'Authentication is not configured. Set a SESSION_SECRET of at least 32 characters.'
    );
  }

  return parsed.data.SESSION_SECRET;
}

export function getAdminInitEnv(): AdminInitEnv {
  const parsed = adminInitEnvSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME,
  });

  if (!parsed.success) {
    const fields = Array.from(
      new Set(parsed.error.issues.map((issue) => issue.path.join('.') || 'environment'))
    );
    throw new Error(
      `Missing or invalid environment variables for admin initialization: ${fields.join(', ')}`
    );
  }

  return parsed.data;
}
