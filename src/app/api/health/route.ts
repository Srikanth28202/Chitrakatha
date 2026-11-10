import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabaseConnectionState } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Strips any credentials that might appear inside a driver error message
 * before it is returned to the caller.
 */
function sanitizeErrorMessage(message: string): string {
  return message.replace(
    /mongodb(\+srv)?:\/\/[^@\s]*@/gi,
    (_match, srv: string | undefined) => `mongodb${srv ?? ''}://***@`
  );
}

export async function GET() {
  let dbStatus = 'disconnected';
  let dbError: string | null = null;

  try {
    await connectToDatabase();
    const { label } = getDatabaseConnectionState();
    dbStatus = label;
  } catch (error) {
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
  }

  const isHealthy = dbStatus === 'connected';
  const mongoConfigured = Boolean(process.env.MONGODB_URI);
  const sessionSecret = process.env.SESSION_SECRET;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      // Presence flags only — never the values. Makes deployment
      // misconfiguration obvious without exposing secrets.
      config: {
        mongoUriConfigured: mongoConfigured,
        sessionSecretConfigured:
          typeof sessionSecret === 'string' && sessionSecret.length >= 32,
      },
      database: {
        status: dbStatus,
        connected: isHealthy,
        ...(dbError && { message: sanitizeErrorMessage(dbError) }),
      },
    },
    {
      status: isHealthy ? 200 : 503,
    }
  );
}
