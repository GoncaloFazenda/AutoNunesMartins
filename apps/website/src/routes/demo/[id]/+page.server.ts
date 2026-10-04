import { error } from '@sveltejs/kit';
import { catalogCars } from '$lib/components/stand-concepts/catalogDemo';
import type { PageServerLoad } from './$types';

// Fictional cars are isolated from the real public inventory.
// Removed studies and arbitrary slugs must return a real 404, not a 200 error screen.
export const load: PageServerLoad = ({ params }) => {
  if (!catalogCars.some(car => car.id === params.id)) {
    error(404, 'Esta página não existe.');
  }
  return {};
};
