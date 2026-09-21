import { error, type RequestHandler } from '@sveltejs/kit';
import type { DeliveryStatus } from '@anm/types';
import { salesApi, type SaleListParams } from '$lib/server/sales';
import { buildCsv, buildPdfTable } from '$lib/server/exports';

const DELIVERY_STATUSES: DeliveryStatus[] = ['PENDING', 'SCHEDULED', 'DELIVERED'];

function pickDeliveryStatus(value: string | null): DeliveryStatus | undefined {
  return value && (DELIVERY_STATUSES as string[]).includes(value)
    ? (value as DeliveryStatus)
    : undefined;
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-PT');
}
function fmtEur(s: string): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(s));
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  // Mirror the filters honoured by the list page. pageSize is bumped so a
  // single export call walks the entire filtered set — backend caps at 100,
  // so we ask for the max.
  const params: SaleListParams = {
    q: sp.get('q') ?? undefined,
    deliveryStatus: pickDeliveryStatus(sp.get('deliveryStatus')),
    dateFrom: sp.get('dateFrom') ?? undefined,
    dateTo: sp.get('dateTo') ?? undefined,
    page: 1,
    pageSize: 10000,
    sortBy: (sp.get('sortBy') as SaleListParams['sortBy']) ?? 'saleDate',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  const result = await salesApi.list(event, params);

  const headers = [
    'Viatura', 'Cliente', 'Data', 'Compra', 'Venda', 'Despesas', 'IVA', 'Comissão', 'Lucro', 'Margem%',
  ];
  const rows = result.items.map((s) => [
    `${s.vehicle.brand} ${s.vehicle.model} ${s.vehicle.year}`,
    s.customer.name,
    fmtDate(s.saleDate),
    fmtEur(s.purchasePrice),
    fmtEur(s.salePrice),
    fmtEur(s.expensesTotal),
    fmtEur(s.vatAmount),
    fmtEur(s.commission),
    fmtEur(s.realProfit),
    `${s.marginPct.toFixed(1)}%`,
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `vendas_${today}.${format}`;

  if (format === 'csv') {
    const csv = buildCsv(headers, rows);
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  try {
    const commissionTotal = Number(result.totals.commission);
    const commissionPart =
      commissionTotal > 0 ? `  ·  incl. ${fmtEur(result.totals.commission)} comissões` : '';
    const subtitle = `${result.totals.count} venda${result.totals.count === 1 ? '' : 's'}  ·  Total: ${fmtEur(result.totals.profit)}${commissionPart}`;
    const pdf = await buildPdfTable({
      title: 'Vendas',
      subtitle,
      headers,
      rows,
      columnWidths: [140, 100, 55, 55, 55, 55, 55, 60, 65, 50],
    });
    return new Response(new Blob([pdf as BlobPart], { type: 'application/pdf' }), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('PDF export failed:', err);
    throw error(500, 'Falha ao gerar PDF');
  }
};
