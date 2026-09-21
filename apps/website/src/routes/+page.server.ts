import { redirect } from '@sveltejs/kit';

// Preserve all existing concept URLs; the public app has no CRM sign-in page.
export const load = () => redirect(307, '/stand-orbit');
