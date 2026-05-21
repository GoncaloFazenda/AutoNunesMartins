import { error, type RequestHandler } from '@sveltejs/kit';
import { customersApi, type CustomerListParams } from '$lib/server/customers';
import { buildCsv, buildPdfTable } from '$lib/server/exports';

function fmtDate(s: string | null): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('pt-PT');
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const params: CustomerListParams = {
    q: sp.get('q') ?? undefined,
    sortBy: (sp.get('sortBy') as CustomerListParams['sortBy']) ?? 'createdAt',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  let items: Awaited<ReturnType<typeof customersApi.list>>['items'] = [];
  let page = 1;
  while (true) {
    const result = await customersApi.list(event, { ...params, page, pageSize: 100 });
    items = items.concat(result.items);
    if (page >= result.totalPages) break;
    page += 1;
    if (page > 100) break;
  }

  const headers = ['Nome', 'NIF', 'Telefone', 'Email', 'Morada', 'Compras', 'Último contacto'];
  const rows = items.map((c) => [
    c.name,
    c.nif,
    c.phone,
    c.email ?? '',
    c.address ?? '',
    String(c._count.sales),
    fmtDate(c.lastContactDate),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `clientes_${today}.${format}`;

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
      title: 'Clientes',
      subtitle: `${items.length} resultado${items.length === 1 ? '' : 's'}`,
      headers,
      rows,
      columnWidths: [140, 75, 90, 130, 160, 50, 90],
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
