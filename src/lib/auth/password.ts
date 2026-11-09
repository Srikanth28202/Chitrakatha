import { compare, hash } from 'bcryptjs';

if (typeof window !== 'undefined') {
  throw new Error('src/lib/auth/password.ts is a server-side module and cannot be loaded on the client.');
}

/**
 * bcrypt hashing helpers (bcryptjs is a pure-JavaScript implementation of the
 * bcrypt algorithm, avoiding native build issues while remaining compatible).
 */
export const BCRYPT_SALT_ROUNDS = 12;

// A valid bcrypt hash used to keep response timing consistent when an account
// does not exist. It does not correspond to any real password.
export const DUMMY_PASSWORD_HASH =
  '$2b$12$KvhqrsTQFZaOJD3oa/fcUegJD95Xk6jpVVea66/yEO.CDSbPcJKl2';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await compare(password, passwordHash);
  } catch {
    return false;
  }
}
