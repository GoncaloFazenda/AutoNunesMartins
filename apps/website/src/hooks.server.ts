import type { Handle } from '@sveltejs/kit';

// Public app only: deliberately no session provider, auth middleware or CRM credentials.
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
};
