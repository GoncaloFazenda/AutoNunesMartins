import { fail } from '@sveltejs/kit';
import {
  OpExpenseCategoryEnum,
  operationalExpenseCreateSchema,
  operationalExpenseUpdateSchema,
} from '@anm/types';
import {
  opExpensesApi,
  type OperationalExpenseListParams,
} from '$lib/server/operationalExpenses';
import {
  financialApi,
  type ProfitByVehicleParams,
} from '$lib/server/financial';
import { ApiError } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
  const sp = event.url.searchParams;
  const tab = sp.get('tab') === 'lucro' ? 'lucro' : 'despesas';

  const expensesParams: OperationalExpenseListParams = {
    category: (sp.get('category') as OperationalExpenseListParams['category']) ?? undefined,
    dateFrom: sp.get('dateFrom') ?? undefined,
    dateTo: sp.get('dateTo') ?? undefined,
    q: sp.get('q') ?? undefined,
    sortBy: (sp.get('sortBy') as OperationalExpenseListParams['sortBy']) ?? 'date',
    sortDir: sp.get('sortDir') === 'asc' ? 'asc' : 'desc',
  };

  const profitParams: ProfitByVehicleParams = {
    dateFrom: sp.get('pfFrom') ?? undefined,
    dateTo: sp.get('pfTo') ?? undefined,
    sortBy: (sp.get('pfSortBy') as ProfitByVehicleParams['sortBy']) ?? 'saleDate',
    sortDir: sp.get('pfSortDir') === 'asc' ? 'asc' : 'desc',
  };

  // Streamed: each tab loads independently
  const expenses = opExpensesApi.list(event, expensesParams).catch((err) => ({
    items: [] as never[],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
    totalSum: '0',
    _error: (err as Error).message,
  }));

  const profit = financialApi.profitByVehicle(event, profitParams).catch((err) => ({
    items: [] as never[],
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
  }));

  return {
    tab,
    expensesFilters: expensesParams,
    profitFilters: profitParams,
    expenses,
    profit,
  };
};

function parseExpenseForm(fd: FormData) {
  const get = (k: string) => (fd.get(k) ?? '').toString().trim();
  return {
    id: get('expenseId') || undefined,
    category: get('category'),
    description: get('description'),
    amount: get('amount'),
    date: get('date'),
  };
}

export const actions: Actions = {
  addExpense: async (event) => {
    const fd = await event.request.formData();
    const raw = parseExpenseForm(fd);
    const parsed = operationalExpenseCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      });
    }
    try {
      await opExpensesApi.create(event, parsed.data);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
  updateExpense: async (event) => {
    const fd = await event.request.formData();
    const raw = parseExpenseForm(fd);
    if (!raw.id) return fail(400, { error: 'expenseId em falta' });
    const parsed = operationalExpenseUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
        expenseId: raw.id,
      });
    }
    const { id: _id, ...patch } = parsed.data;
    try {
      await opExpensesApi.update(event, raw.id, patch);
      return { ok: true, expenseId: raw.id };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
          expenseId: raw.id,
        });
      }
      throw err;
    }
  },
  deleteExpense: async (event) => {
    const fd = await event.request.formData();
    const id = (fd.get('expenseId') ?? '').toString();
    if (!id) return fail(400, { error: 'expenseId em falta' });
    try {
      await opExpensesApi.delete(event, id);
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, {
          error: (err.body as { error?: string } | null)?.error ?? 'Falha.',
        });
      }
      throw err;
    }
  },
};

// Defensive: keep the category enum reference so TS doesn't drop the import.
void OpExpenseCategoryEnum;
