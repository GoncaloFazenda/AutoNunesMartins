import { error, type RequestHandler } from '@sveltejs/kit';
import { financialApi, type ProfitByVehicleParams } from '$lib/server/financial';
import { buildCsv, buildPdfTable } from '$lib/server/exports';

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-PT');
}
function fmtEur(s: string): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(s));
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const params: ProfitByVehicleParams = {
    dateFrom: sp.get('pfFrom') ?? undefined,
    dateTo: sp.get('pfTo') ?? undefined,
    sortBy: (sp.get('pfSortBy') as ProfitByVehicleParams['sortBy']) ?? 'saleDate',
    sortDir: sp.get('pfSortDir') === 'asc' ? 'asc' : 'desc',
  };

  const result = await financialApi.profitByVehicle(event, params);

  const headers = ['Viatura', 'Cliente', 'Data', 'Compra', 'Venda', 'Despesas', 'IVA', 'Lucro', 'Margem%'];
  const rows = result.items.map((r) => [
    `${r.vehicle.brand} ${r.vehicle.model} ${r.vehicle.year}`,
    r.customer.name,
    fmtDate(r.saleDate),
    fmtEur(r.purchasePrice),
    fmtEur(r.salePrice),
    fmtEur(r.expensesTotal),
    fmtEur(r.vatAmount),
    fmtEur(r.realProfit),
    `${r.marginPct.toFixed(1)}%`,
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `lucro-por-viatura_${today}.${format}`;

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
    const subtitle = `${result.items.length} venda${result.items.length === 1 ? '' : 's'}  ·  Total: ${fmtEur(result.totals.profit)}`;
    const pdf = await buildPdfTable({
      title: 'Lucro por Viatura',
      subtitle,
      headers,
      rows,
      columnWidths: [150, 110, 60, 60, 60, 60, 60, 65, 50],
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
