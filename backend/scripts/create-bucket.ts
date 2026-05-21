import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getEnv, getSupabaseServerKey } from '../src/env.js';

const env = getEnv();
const bucket = env.SUPABASE_STORAGE_BUCKET;

const supabase = createClient(env.SUPABASE_URL, getSupabaseServerKey(), {
  auth: { persistSession: false },
});

async function main() {
  // eslint-disable-next-line no-console
  console.log(`Ensuring private bucket "${bucket}" exists at ${env.SUPABASE_URL}…`);

  const { data: existing, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Failed to list buckets:', listErr.message);
    process.exit(1);
  }

  const found = existing.find((b) => b.name === bucket);
  if (found) {
    // eslint-disable-next-line no-console
    console.log(`Bucket "${bucket}" already exists (public=${found.public}).`);
    if (found.public) {
      console.warn('  ⚠ It is currently public — flipping to private…');
      const { error: updErr } = await supabase.storage.updateBucket(bucket, {
        public: false,
      });
      if (updErr) {
        console.error('Failed to make bucket private:', updErr.message);
        process.exit(1);
      }
      // eslint-disable-next-line no-console
      console.log('  ✓ Bucket is now private.');
    }
    return;
  }

  const { error: createErr } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB per file
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });

  if (createErr) {
    console.error('Failed to create bucket:', createErr.message);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(
    `✓ Created private bucket "${bucket}" with 5MB/file limit, JPEG/PNG/WEBP only.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
