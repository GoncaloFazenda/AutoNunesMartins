import type { PageServerLoad } from './$types';
import {
  salesApi,
  type SaleListParams,
  type SaleListResponse,
} from '$lib/server/sales';
import type { DeliveryStatus } from '@anm/types';

const DELIVERY_STATUSES: DeliveryStatus[] = ['PENDING', 'SCHEDULED', 'DELIVERED'];

function pickDeliveryStatus(value: string | null): DeliveryStatus | undefined {
  return value && (DELIVERY_STATUSES as string[]).includes(value)
    ? (value as DeliveryStatus)
    : undefined;
}

export type SaleListStream =
  | (SaleListResponse & { _error?: undefined })
  | {
      items: [];
      total: 0;
      page: 1;
      pageSize: 25;
      totalPages: 0;
      totals: {
        count: 0;
        revenue: '0';
        vat: '0';
        expenses: '0';
        commission: '0';
        profit: '0';
        avgMarginPct: 0;
      };
      _error: string;
    };

export const load: PageServerLoad = (event) => {
  const sp = event.url.searchParams;
  const params: SaleListParams = {
    q: sp.get('q') ?? undefined,
    deliveryStatus: pickDeliveryStatus(sp.get('deliveryStatus')),
    dateFrom: sp.get('dateFrom') ?? undefined,
    dateTo: sp.get('dateTo') ?? undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: 25,
    sortBy: (sp.get('sortBy') as SaleListParams['sortBy']) ?? 'saleDate',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  // Streamed list so the page shell + filter chrome render immediately and
  // the table flows in once the API returns.
  const listPromise: Promise<SaleListStream> = salesApi.list(event, params).catch(
    (err): SaleListStream => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      totals: {
        count: 0,
        revenue: '0',
        vat: '0',
        expenses: '0',
        commission: '0',
        profit: '0',
        avgMarginPct: 0,
      },
      _error: (err as Error).message,
    }),
  );

  return {
    filters: params,
    list: listPromise,
  };
};
