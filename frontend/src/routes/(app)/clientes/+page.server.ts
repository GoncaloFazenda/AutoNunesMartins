import type { PageServerLoad } from './$types';
import {
  customersApi,
  type CustomerListParams,
  type CustomerListResponse,
} from '$lib/server/customers';

export type CustomerListStream =
  | (CustomerListResponse & { _error?: undefined })
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
  const params: CustomerListParams = {
    q: sp.get('q') ?? undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: 25,
    sortBy: (sp.get('sortBy') as CustomerListParams['sortBy']) ?? 'createdAt',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  const listPromise: Promise<CustomerListStream> = customersApi.list(event, params).catch(
    (err): CustomerListStream => ({
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
