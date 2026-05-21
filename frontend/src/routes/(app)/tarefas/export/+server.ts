import { error, type RequestHandler } from '@sveltejs/kit';
import { tasksApi, type TaskListParams } from '$lib/server/tasks';
import { buildCsv, buildPdfTable } from '$lib/server/exports';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Curso',
  DONE: 'Concluído',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const RECURRENCE_LABELS: Record<string, string> = {
  NONE: '—',
  MONTHLY: 'Mensal',
  ANNUAL: 'Anual',
};

function fmtDate(s: string | null): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('pt-PT');
}

export const GET: RequestHandler = async (event) => {
  const sp = event.url.searchParams;
  const format = sp.get('format') === 'pdf' ? 'pdf' : 'csv';

  const params: TaskListParams = {
    status: (sp.get('status') as TaskListParams['status']) ?? undefined,
    priority: (sp.get('priority') as TaskListParams['priority']) ?? undefined,
    assigneeId: sp.get('assigneeId') ?? undefined,
    q: sp.get('q') ?? undefined,
  };

  const result = await tasksApi.list(event, params);
  const items = result.items;

  const headers = ['Título', 'Estado', 'Prioridade', 'Responsável', 'Prazo', 'Recorrência'];
  const rows = items.map((t) => [
    t.title,
    STATUS_LABELS[t.status] ?? t.status,
    PRIORITY_LABELS[t.priority] ?? t.priority,
    t.assignee?.name ?? '',
    fmtDate(t.dueDate),
    RECURRENCE_LABELS[t.recurrence] ?? t.recurrence,
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `tarefas_${today}.${format}`;

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
      title: 'Tarefas',
      subtitle: `${items.length} resultado${items.length === 1 ? '' : 's'}`,
      headers,
      rows,
      columnWidths: [250, 80, 80, 130, 80, 80],
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
