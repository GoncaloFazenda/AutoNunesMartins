import { redirect } from '@sveltejs/kit';

// Orbit is the official website; discarded concepts live in the independent design archive.
export const load = () => redirect(307, '/stand-orbit');
