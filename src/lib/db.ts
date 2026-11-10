import mongoose from 'mongoose';

// Enforce server-only execution to prevent accidental bundling in client components
if (typeof window !== 'undefined') {
  throw new Error(
    'src/lib/db.ts is a server-side module and cannot be loaded on the client.'
  );
}

/**
 * Reads MONGODB_URI defensively.
 *
 * Dashboard env editors (Vercel, Atlas, CI) frequently end up with a value that
 * carries a trailing newline or was pasted complete with surrounding quotes.
 * Both produce confusing driver errors such as `Invalid scheme` or
 * `getaddrinfo ENOTFOUND`, so normalise the value once at module load.
 */
function readMongoUri(): string | undefined {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    return undefined;
  }

  let uri = raw.trim();

  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  return uri.length > 0 ? uri : undefined;
}

const MONGODB_URI = readMongoUri();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes and caches a connection to MongoDB Atlas using Mongoose.
 * Reuses the existing connection during Next.js hot-reloads in development.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      'Database connection error: MONGODB_URI is not defined in environment variables.'
    );
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error('Failed to establish MongoDB Atlas connection:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Helper to inspect the current MongoDB connection state.
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export function getDatabaseConnectionState(): {
  state: number;
  label: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
} {
  const state = mongoose.connection.readyState;
  const labels: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state,
    label: labels[state] || 'disconnected',
  };
}

