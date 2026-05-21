import type { PageServerLoad } from './$types';
import { vehiclesApi, type VehicleListParams, type VehicleListResponse } from '$lib/server/vehicles';
import type { Fuel, VehicleStatus } from '@anm/types';

const FUELS: Fuel[] = ['GASOLINE', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC', 'LPG'];
const STATUSES: VehicleStatus[] = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'DELIVERED',
  'DOCS_PENDING',
];

function pickFuel(value: string | null): Fuel | undefined {
  return value && (FUELS as string[]).includes(value) ? (value as Fuel) : undefined;
}
function pickStatus(value: string | null): VehicleStatus | undefined {
  return value && (STATUSES as string[]).includes(value)
    ? (value as VehicleStatus)
    : undefined;
}

export type VehicleListStream =
  | (VehicleListResponse & { _error?: undefined })
  | {
      items: [];
      total: 0;
      page: 1;
      pageSize: 25;
      totalPages: 0;
      _error: string;
    };

export const load: PageServerLoad = (event) => {
  const sp = event.url.searchParams;
  const params: VehicleListParams = {
    brand: sp.get('brand') ?? undefined,
    model: sp.get('model') ?? undefined,
    fuel: pickFuel(sp.get('fuel')),
    status: pickStatus(sp.get('status')),
    yearMin: sp.get('yearMin') ? Number(sp.get('yearMin')) : undefined,
    yearMax: sp.get('yearMax') ? Number(sp.get('yearMax')) : undefined,
    mileageMin: sp.get('mileageMin') ? Number(sp.get('mileageMin')) : undefined,
    mileageMax: sp.get('mileageMax') ? Number(sp.get('mileageMax')) : undefined,
    q: sp.get('q') ?? undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: 25,
    sortBy: (sp.get('sortBy') as VehicleListParams['sortBy']) ?? 'createdAt',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  // Streamed: returning a promise (not awaiting) lets SvelteKit render the page
  // shell + skeleton immediately, then stream the data into the {#await}.
  const listPromise: Promise<VehicleListStream> = vehiclesApi.list(event, params).catch(
    (err): VehicleListStream => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      _error: (err as Error).message,
    }),
  );

  return {
    filters: params,
    list: listPromise,
  };
};
