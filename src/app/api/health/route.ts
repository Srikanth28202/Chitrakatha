import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabaseConnectionState } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        connected: isHealthy,
        ...(dbError && { message: dbError }),
      },
    },
    {
      status: isHealthy ? 200 : 503,
    }
  );
}
