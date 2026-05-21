import 'dotenv/config';
import { getEnv, getSupabaseServerKey } from '../src/env.js';

try {
  const env = getEnv();
  const present: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) continue;
    if (k.includes('SECRET') || k.includes('PASSWORD') || k.includes('SERVICE_ROLE')) {
      present[k] = `[set, ${String(v).slice(0, 12)}...]`;
    } else if (k === 'DATABASE_URL' || k === 'DIRECT_URL') {
      present[k] = `[set, hostname ok]`;
    } else {
      present[k] = String(v);
    }
  }
  // eslint-disable-next-line no-console
  console.log('Env loaded OK:');
  // eslint-disable-next-line no-console
  console.table(present);
  // eslint-disable-next-line no-console
  console.log('Supabase server key prefix:', getSupabaseServerKey().slice(0, 12) + '...');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('FAIL:', (err as Error).message);
  process.exit(1);
}
