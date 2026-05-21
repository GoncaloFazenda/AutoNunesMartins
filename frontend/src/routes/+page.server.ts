import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  const { userId } = locals.auth();
  if (userId) {
    throw redirect(302, '/dashboard');
  }
  return {};
};
