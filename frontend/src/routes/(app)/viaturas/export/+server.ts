import { error, type RequestHandler } from '@sveltejs/kit';
import { vehiclesApi, type VehicleListParams } from '$lib/server/vehicles';
import { buildCsv, buildPdfTable } from '$lib/server/exports';
import type { Fuel, VehicleStatus } from '@anm/types';

const FUEL_LABELS: Record<Fuel, string> = {
  GASOLINE: 'Gasolina',
  DIESEL: 'Gasóleo',
  HYBRID: 'Híbrido',
  PLUGIN_HYBRID: 'Híbrido Plug-in',
  ELECTRIC: 'Elétrico',
  LPG: 'GPL',
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  DELIVERED: 'Entregue',
  DOCS_PENDING: 'Docs Pendentes',
  DRAFT: 'Rascunho',
};

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-PT');
}

function fmtEur(s: string | null): string {
  if (!s) return '';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(s));
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const params: VehicleListParams = {
    brand: sp.get('brand') ?? undefined,
    model: sp.get('model') ?? undefined,
    fuel: (sp.get('fuel') as Fuel) ?? undefined,
    status: (sp.get('status') as VehicleStatus) ?? undefined,
    yearMin: sp.get('yearMin') ? Number(sp.get('yearMin')) : undefined,
    yearMax: sp.get('yearMax') ? Number(sp.get('yearMax')) : undefined,
    mileageMin: sp.get('mileageMin') ? Number(sp.get('mileageMin')) : undefined,
    mileageMax: sp.get('mileageMax') ? Number(sp.get('mileageMax')) : undefined,
    q: sp.get('q') ?? undefined,
    page: 1,
    pageSize: 100,
    sortBy: (sp.get('sortBy') as VehicleListParams['sortBy']) ?? 'createdAt',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  // Page through everything
  let items: Awaited<ReturnType<typeof vehiclesApi.list>>['items'] = [];
  let page = 1;
  while (true) {
    const result = await vehiclesApi.list(event, { ...params, page, pageSize: 100 });
    items = items.concat(result.items);
    if (page >= result.totalPages) break;
    page += 1;
    if (page > 100) break; // safety cap
  }

  const headers = ['Marca', 'Modelo', 'Ano', 'VIN', 'Km', 'Combustível', 'Aquisição', 'PVP', 'Estado'];
  const rows = items.map((v) => [
    v.brand,
    v.model,
    String(v.year),
    v.vin,
    String(v.mileage),
    FUEL_LABELS[v.fuel],
    fmtDate(v.acquisitionDate),
    v.salePrice ? fmtEur(v.salePrice) : '',
    STATUS_LABELS[v.status],
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `viaturas_${today}.${format}`;

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
      title: 'Viaturas · Inventário',
      subtitle: `${items.length} resultado${items.length === 1 ? '' : 's'}`,
      headers,
      rows,
      columnWidths: [90, 110, 40, 130, 50, 70, 65, 70, 70],
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
