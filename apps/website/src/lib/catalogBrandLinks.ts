import { catalogUiParams } from './catalogUiFilters';
import type { PublicCatalog, PublicStock } from './publicVehicles';

export type PublicBrandDirectory = {
  status: PublicStock['status'];
  brands: PublicCatalog['facets']['brands'];
};

/** Shared by catalogue exploration and the unfiltered public brand directory. */
export function catalogBrandLinks(brands: PublicBrandDirectory['brands'], params = new URLSearchParams()) {
  return brands.filter(brand => brand.count > 0).map(brand => ({
    name: brand.value,
    count: brand.count,
    href: `/viaturas?${catalogUiParams(params, 'marca', brand.value)}`,
    current: params.get('marca')?.toLowerCase() === brand.value.toLowerCase(),
  }));
}
