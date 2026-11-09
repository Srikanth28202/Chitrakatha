import { getSessionSecret } from '@/lib/env';

/**
 * Stateless, signed admin session tokens.
 *
 * This module uses only the Web Crypto API so it can run in both the Node.js
 * runtime (route handlers / server components) and the Edge runtime
 * (middleware). Tokens are HMAC-SHA256 signed, base64url encoded and carry an
 * expiry. They are always delivered inside an HTTP-only cookie.
 */

export const SESSION_COOKIE_NAME = 'chitrakatha_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface AdminSessionPayload {
  userId: string;
  email: string;
  name?: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export interface SessionTokenInput {
  userId: string;
  email: string;
  name?: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodePayload(payload: AdminSessionPayload): string {
  return bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
}

function decodePayload(value: string): AdminSessionPayload {
  return JSON.parse(decoder.decode(base64UrlToBytes(value))) as AdminSessionPayload;
}

async function importSigningKey(): Promise<CryptoKey> {
  const secret = getSessionSecret();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a signed admin session token. Throws when the signing secret is
 * missing so callers fail closed.
 */
export async function createSessionToken(input: SessionTokenInput): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    userId: input.userId,
    email: input.email,
    ...(input.name ? { name: input.name } : {}),
    role: 'admin',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const body = encodePayload(payload);
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));

  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/**
 * Verifies signature, structure and expiry. Returns null on any failure.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) {
      return null;
    }

    const key = await importSigningKey();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      encoder.encode(body)
    );

    if (!isValid) {
      return null;
    }

    const payload = decodePayload(body);
    const now = Math.floor(Date.now() / 1000);

    if (
      !payload ||
      payload.role !== 'admin' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now ||
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
