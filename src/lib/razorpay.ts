import crypto from 'node:crypto';
import Razorpay from 'razorpay';

if (typeof window !== 'undefined') {
  throw new Error('src/lib/razorpay.ts is server-only and cannot be loaded on the client.');
}

export class RazorpayConfigurationError extends Error {
  readonly code = 'PAYMENT_NOT_CONFIGURED';

  constructor(message = 'Razorpay is not configured on this server.') {
    super(message);
    this.name = 'RazorpayConfigurationError';
  }
}

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

let cachedClient: {
  keyId: string;
  keySecret: string;
  client: Razorpay;
} | null = null;

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export function getRazorpayCredentials(): RazorpayCredentials {
  const keyId = readEnv('RAZORPAY_KEY_ID');
  const keySecret = readEnv('RAZORPAY_KEY_SECRET');
  const webhookSecret = readEnv('RAZORPAY_WEBHOOK_SECRET');

  if (!keyId || !keySecret) {
    throw new RazorpayConfigurationError(
      'Razorpay key credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  return { keyId, keySecret, webhookSecret };
}

export function getRazorpayWebhookSecret(): string {
  const webhookSecret = readEnv('RAZORPAY_WEBHOOK_SECRET');

  if (!webhookSecret) {
    throw new RazorpayConfigurationError(
      'Razorpay webhook secret is missing. Set RAZORPAY_WEBHOOK_SECRET.'
    );
  }

  return webhookSecret;
}

export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (cachedClient?.keyId === keyId && cachedClient.keySecret === keySecret) {
    return cachedClient.client;
  }

  const client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  cachedClient = { keyId, keySecret, client };
  return client;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(readEnv('RAZORPAY_KEY_ID') && readEnv('RAZORPAY_KEY_SECRET'));
}

export function verifyRazorpayPaymentSignature(
  payload: { order_id: string; payment_id: string },
  signature: string
): boolean {
  const { keySecret } = getRazorpayCredentials();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${payload.order_id}|${payload.payment_id}`)
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function verifyRazorpayWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = getRazorpayWebhookSecret();
  // The SDK helper compares digests with a plain `===`, which is not
  // timing-safe. Compute the HMAC locally and compare it the same way the
  // checkout handler signature is verified.
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
