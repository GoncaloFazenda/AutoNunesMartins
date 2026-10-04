import { publicRequest } from './publicVehicles';
import { publicBrandFacetsSchema } from '../publicVehicles';
import type { PublicBrandDirectory } from '../catalogBrandLinks';

/** All available public stock, excluding reserved vehicles; refreshed on every load. */
export async function loadPublicBrands(): Promise<PublicBrandDirectory> {
  try {
    const response = await publicRequest('/brands');
    if (!response.ok) return { status: 'unavailable', brands: [] };
    return { status: 'ready', brands: publicBrandFacetsSchema.parse(await response.json()) };
  } catch {
    return { status: 'unavailable', brands: [] };
  }
}
