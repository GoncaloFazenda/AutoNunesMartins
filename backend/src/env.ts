import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5174'),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  SUPABASE_URL: z.string().url(),
  // New name: SUPABASE_SECRET_KEY (sb_secret_...). Legacy SUPABASE_SERVICE_ROLE_KEY
  // accepted as a fallback so older .env files keep working.
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('vehicle-photos'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  if (!parsed.data.SUPABASE_SECRET_KEY && !parsed.data.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase server key: set SUPABASE_SECRET_KEY (sb_secret_...) ' +
        'or SUPABASE_SERVICE_ROLE_KEY (legacy JWT) in your .env',
    );
  }
  cached = parsed.data;
  return cached;
}

/** Resolves whichever Supabase server key is configured (new name wins over legacy). */
export function getSupabaseServerKey(): string {
  const env = getEnv();
  const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('No Supabase server key set');
  return key;
}
