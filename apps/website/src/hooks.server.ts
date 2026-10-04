import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Public app only: deliberately no session provider, auth middleware or CRM credentials.
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Production pages can be prepared locally without indexing a Vercel preview.
  // Other staging hosts can opt into the same protection with SITE_NOINDEX=true.
  if (env.VERCEL_ENV === 'preview' || env.SITE_NOINDEX === 'true') {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }
  return response;
};
