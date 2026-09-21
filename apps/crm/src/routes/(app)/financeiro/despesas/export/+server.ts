import { error, type RequestHandler } from '@sveltejs/kit';
import { opExpensesApi, type OperationalExpenseListParams } from '$lib/server/operationalExpenses';
import { buildCsv, buildPdfTable } from '$lib/server/exports';
import type { OpExpenseCategory } from '@anm/types';

const CATEGORY_LABELS: Record<OpExpenseCategory, string> = {
  RENT: 'Renda',
  BILLS: 'Contas',
  SERVICES: 'Serviços',
  OTHER: 'Outro',
};

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-PT');
}
function fmtEur(s: string): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(s));
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const params: OperationalExpenseListParams = {
    category: (sp.get('category') as OperationalExpenseListParams['category']) ?? undefined,
    dateFrom: sp.get('dateFrom') ?? undefined,
    dateTo: sp.get('dateTo') ?? undefined,
    q: sp.get('q') ?? undefined,
    pageSize: 500,
    sortBy: (sp.get('sortBy') as OperationalExpenseListParams['sortBy']) ?? 'date',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  // Fetch all pages
  let items: Awaited<ReturnType<typeof opExpensesApi.list>>['items'] = [];
  let page = 1;
  while (true) {
    const result = await opExpensesApi.list(event, { ...params, page });
    items = items.concat(result.items);
    if (page >= result.totalPages || result.totalPages === 0) break;
    page += 1;
    if (page > 50) break;
  }

  const headers = ['Categoria', 'Descrição', 'Data', 'Valor'];
  const rows = items.map((e) => [
    CATEGORY_LABELS[e.category] ?? e.category,
    e.description,
    fmtDate(e.date),
    fmtEur(e.amount),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `despesas-operacionais_${today}.${format}`;

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
    const pdf = await buildPdfTable({
      title: 'Despesas Operacionais',
      subtitle: `${items.length} registo${items.length === 1 ? '' : 's'}`,
      headers,
      rows,
      columnWidths: [110, 280, 100, 120],
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
