import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { DUMMY_PASSWORD_HASH, verifyPassword } from './password';
import { getSessionFromCookies } from './session';
import type { AdminSessionPayload } from './token';

if (typeof window !== 'undefined') {
  throw new Error('src/lib/auth/guards.ts is a server-side module and cannot be loaded on the client.');
}

export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface LeanAdminUser {
  _id: unknown;
  email: string;
  name?: string;
  role?: string;
  passwordHash?: string;
}

function toIdentity(user: LeanAdminUser): AdminIdentity {
  return {
    id: String(user._id),
    email: String(user.email).toLowerCase(),
    name: user.name ?? '',
    role: 'admin',
  };
}

/**
 * Fast, token-only session read (no database round trip).
 * Useful for lightweight checks such as rendering decisions.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const session = await getSessionFromCookies();
  return session && session.role === 'admin' ? session : null;
}

/**
 * Strict guard for protected server code: verifies the signed cookie AND
 * re-confirms against the database that the user still exists and holds the
 * admin role. Fails closed on any error.
 */
export async function requireAdmin(): Promise<AdminIdentity | null> {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'admin') {
    return null;
  }

  try {
    await connectToDatabase();
    const user = await User.findById(session.userId)
      .select('_id email role name')
      .lean<LeanAdminUser | null>();

    if (!user || user.role !== 'admin') {
      return null;
    }

    if (String(user.email).toLowerCase() !== session.email.toLowerCase()) {
      return null;
    }

    return toIdentity(user);
  } catch (error) {
    console.error(
      'Admin authorization check failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Validates admin credentials against the database.
 * Returns null for unknown users, non-admin users or invalid passwords.
 * Only ever returns a sanitized identity, never the password hash.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminIdentity | null> {
  await connectToDatabase();

  const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' })
    .select('+passwordHash')
    .lean<LeanAdminUser | null>();

  const passwordHash = user?.passwordHash;

  // Always perform a bcrypt comparison to reduce timing-based user enumeration.
  const isPasswordValid = await verifyPassword(
    password,
    passwordHash ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !passwordHash || !isPasswordValid) {
    return null;
  }

  return toIdentity(user);
}
