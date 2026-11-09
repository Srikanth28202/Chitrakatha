/**
 * Secure admin initialization script.
 *
 * Usage (local):   npm run init:admin
 * Usage (CI/prod): node scripts/init-admin.mjs
 *
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (optional) and MONGODB_URI
 * from the environment, validates them with Zod, hashes the password with
 * bcrypt and upserts an admin user. It never prints the password or hash.
 */

import mongoose from 'mongoose';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

const envSchema = z.object({
  MONGODB_URI: z.string().trim().min(1, 'MONGODB_URI is required'),
  ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL must be a valid email address'),
  ADMIN_PASSWORD: z
    .string()
    .min(10, 'ADMIN_PASSWORD must be at least 10 characters long')
    .max(128, 'ADMIN_PASSWORD must be at most 128 characters long'),
  ADMIN_NAME: z.string().trim().min(2).max(120).optional(),
});

function maskEmail(email) {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return '***';
  }
  const visible = localPart.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(2, localPart.length - 1))}@${domain}`;
}

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME,
});

if (!parsed.success) {
  console.error('Admin initialization failed: missing or invalid environment variables.');
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join('.') || 'environment'}: ${issue.message}`);
  }
  console.error(
    'Ensure MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) are set.'
  );
  process.exit(1);
}

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = parsed.data;
const normalizedEmail = ADMIN_EMAIL.toLowerCase();

const AddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: Boolean,
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    preferredLanguage: {
      type: String,
      enum: ['kannada', 'english', 'bilingual'],
      default: 'bilingual',
    },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true, strict: false, collection: 'users' }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 5,
  });

  const passwordHash = await hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

  const $set = {
    passwordHash,
    role: 'admin',
  };

  const $setOnInsert = {
    preferredLanguage: 'bilingual',
    addresses: [],
  };

  if (ADMIN_NAME) {
    $set.name = ADMIN_NAME;
  } else {
    $setOnInsert.name = 'Chitrakatha Administrator';
  }

  const result = await User.updateOne(
    { email: normalizedEmail },
    { $set, $setOnInsert },
    { upsert: true, runValidators: true }
  );

  const wasCreated = typeof result.upsertedCount === 'number' && result.upsertedCount > 0;

  console.log(
    `${wasCreated ? 'Created' : 'Updated'} admin account for ${maskEmail(normalizedEmail)}.`
  );
}

main()
  .catch((error) => {
    console.error(
      'Admin initialization failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors.
    }
  });
