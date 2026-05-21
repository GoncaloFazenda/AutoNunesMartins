import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv, getSupabaseServerKey } from '../../env.js';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const env = getEnv();
  cached = createClient(env.SUPABASE_URL, getSupabaseServerKey(), {
    auth: { persistSession: false },
  });
  return cached;
}

export function getBucketName(): string {
  return getEnv().SUPABASE_STORAGE_BUCKET;
}

export async function createSignedUploadUrl(path: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(getBucketName())
    .createSignedUploadUrl(path);
  if (error) throw error;
  return data;
}

// ───────── Signed-URL cache ─────────
// Supabase signed URLs are stateless tokens valid for `expiresInSeconds` (we
// always pass 3600). We cache them for 40 min so subsequent reads of the same
// path inside a single backend process skip the Supabase API entirely.
// This is the dominant cost for the Viaturas list (one storage call per page
// load), the vehicle detail gallery, and the dashboard stock-aged thumbnails.

const SIGNED_URL_TTL_MS = 40 * 60 * 1000;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

function cacheGet(path: string): string | undefined {
  const hit = signedUrlCache.get(path);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    signedUrlCache.delete(path);
    return undefined;
  }
  return hit.url;
}

function cacheSet(path: string, url: string): void {
  signedUrlCache.set(path, { url, expiresAt: Date.now() + SIGNED_URL_TTL_MS });
}

/** Bust the cached URL for a single path (call after deleting the underlying object). */
export function invalidateSignedReadUrl(path: string): void {
  signedUrlCache.delete(path);
}

export async function createSignedReadUrl(path: string, _expiresInSeconds = 3600): Promise<string> {
  const hit = cacheGet(path);
  if (hit) return hit;
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(getBucketName())
    .createSignedUrl(path, 3600);
  if (error) throw error;
  cacheSet(path, data.signedUrl);
  return data.signedUrl;
}

/**
 * Batch-sign multiple read URLs in a single Supabase call. Paths already in
 * cache are served from memory; the rest are batched into one storage call.
 */
export async function createSignedReadUrls(
  paths: string[],
  _expiresInSeconds = 3600,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (paths.length === 0) return out;

  const toSign: string[] = [];
  for (const p of paths) {
    const cached = cacheGet(p);
    if (cached) out.set(p, cached);
    else toSign.push(p);
  }

  if (toSign.length === 0) return out;

  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(getBucketName())
    .createSignedUrls(toSign, 3600);
  if (error) throw error;
  for (const entry of data) {
    if (entry.signedUrl && entry.path) {
      out.set(entry.path, entry.signedUrl);
      cacheSet(entry.path, entry.signedUrl);
    }
  }
  return out;
}

export async function deleteObjects(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(getBucketName()).remove(paths);
  if (error) throw error;
  // Drop cached URLs for deleted objects so we don't serve dead links.
  for (const p of paths) invalidateSignedReadUrl(p);
}
