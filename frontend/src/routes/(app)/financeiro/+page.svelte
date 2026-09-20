<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Check,
    Pencil,
    Plus,
    Trash2,
    Wallet,
    X,
  } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import ExportMenu from '$lib/components/common/ExportMenu.svelte';
  import Skeleton from '$lib/components/common/Skeleton.svelte';
  import { formatDate, formatDateLong, formatEUR } from '$lib/utils/format';
  import type { OpExpenseCategory } from '@anm/types';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const today = new Date();

  let showAdd = $state(false);
  let editingId = $state<string | null>(null);
  let submitting = $state(false);
  let savingId = $state<string | null>(null);

  const CATEGORIES: { value: OpExpenseCategory; label: string }[] = [
    { value: 'RENT', label: 'Renda' },
    { value: 'BILLS', label: 'Contas' },
    { value: 'SERVICES', label: 'Serviços' },
    { value: 'OTHER', label: 'Outro' },
  ];

  function categoryLabel(c: OpExpenseCategory): string {
    return CATEGORIES.find((x) => x.value === c)?.label ?? c;
  }

  function setParam(name: string, value: string | undefined) {
    const usp = new URLSearchParams($page.url.searchParams);
    if (value === undefined || value === '') usp.delete(name);
    else usp.set(name, value);
    const qs = usp.toString();
    goto(qs ? `?${qs}` : '?', { keepFocus: true, noScroll: true });
  }

  function startEdit(id: string) {
    editingId = id;
    showAdd = false;
  }

  function cancelEdit() {
    editingId = null;
  }

  const todayISO = today.toISOString().slice(0, 10);
</script>

<svelte:head>
  <title>Financeiro · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Page header -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
    <div class="min-w-0">
      <ItalicHero text="Financeiro" size="lg" />
      <div
        class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        {formatDateLong(today)}
      </div>
    </div>
    <!-- Export is desktop-only. Menu (sem default) — utilizador escolhe formato. -->
    <div class="hidden md:flex items-center gap-2">
      <ExportMenu baseHref="/financeiro/despesas/export" extraQuery={$page.url.search} />
    </div>
  </div>

  <!-- Per-vehicle profit analysis used to live here as a second tab; it now
       sits inside /vendas (single source of truth). This page is dedicated to
       operational expenses (rent, bills, services). -->
    <Panel>
      <PanelHeader icon={Wallet} title="Filtros" />
      <div class="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <label class="flex flex-col">
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
            Pesquisar
          </span>
          <input
            type="search"
            placeholder="descrição…"
            value={data.expensesFilters.q ?? ''}
            oninput={(e) => setParam('q', e.currentTarget.value || undefined)}
            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          />
        </label>
        <label class="flex flex-col">
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
            Categoria
          </span>
          <select
            value={data.expensesFilters.category ?? ''}
            onchange={(e) => setParam('category', e.currentTarget.value || undefined)}
            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          >
            <option value="">— Todas —</option>
            {#each CATEGORIES as c (c.value)}
              <option value={c.value}>{c.label}</option>
            {/each}
          </select>
        </label>
        <label class="flex flex-col">
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
            De
          </span>
          <input
            type="date"
            value={data.expensesFilters.dateFrom ?? ''}
            onchange={(e) => setParam('dateFrom', e.currentTarget.value || undefined)}
            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          />
        </label>
        <label class="flex flex-col">
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
            Até
          </span>
          <input
            type="date"
            value={data.expensesFilters.dateTo ?? ''}
            onchange={(e) => setParam('dateTo', e.currentTarget.value || undefined)}
            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          />
        </label>
        <div class="flex justify-end">
          <Button variant="primary" size="md" onclick={() => (showAdd = true)}>
            <Plus class="h-4 w-4" />
            Nova despesa
          </Button>
        </div>
      </div>
    </Panel>

    <Panel>
      <PanelHeader icon={Wallet} title="Despesas operacionais" meta="" />

      {#if showAdd}
        <form
          method="POST"
          action="?/addExpense"
          use:enhance={() => {
            submitting = true;
            return async ({ result }) => {
              submitting = false;
              if (result.type === 'success') {
                toast.success('Despesa adicionada.');
                showAdd = false;
                await invalidateAll();
              } else if (result.type === 'failure') {
                toast.error((result.data as { error?: string } | undefined)?.error ?? 'Falha.');
              }
            };
          }}
          class="border-b border-[var(--color-border)] p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        >
          <label class="flex flex-col">
            <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
              Categoria
            </span>
            <select
              name="category"
              required
              class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
              style="border-radius: var(--radius-btn);"
            >
              {#each CATEGORIES as c (c.value)}
                <option value={c.value}>{c.label}</option>
              {/each}
            </select>
          </label>
          <label class="flex flex-col md:col-span-2">
            <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
              Descrição
            </span>
            <input
              name="description"
              type="text"
              required
              placeholder="Renda do stand · Abril"
              class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
              style="border-radius: var(--radius-btn);"
            />
          </label>
          <label class="flex flex-col">
            <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
              Valor (€)
            </span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="650.00"
              class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)]"
              style="border-radius: var(--radius-btn);"
            />
          </label>
          <label class="flex flex-col">
            <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
              Data
            </span>
            <input
              name="date"
              type="date"
              required
              value={todayISO}
              class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
              style="border-radius: var(--radius-btn);"
            />
          </label>
          <div class="md:col-span-5 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onclick={() => (showAdd = false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Adicionar
            </Button>
          </div>
        </form>
      {/if}

      {#await data.expenses}
        <div class="p-4 space-y-2">
          {#each Array(5) as _, i (i)}
            <Skeleton width="100%" height="34px" />
          {/each}
        </div>
      {:then exp}
        {#if '_error' in exp && exp._error}
          <div class="p-4 text-[13px] text-[var(--color-red)]">{exp._error}</div>
        {:else if exp.items.length === 0}
          <div
            class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Sem despesas registadas
          </div>
        {:else}
          <div class="overflow-x-auto">
          <table class="w-full text-[13px] min-w-[640px]">
            <thead>
              <tr class="border-b border-[var(--color-border)]">
                <th class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                  Categoria
                </th>
                <th class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                  Descrição
                </th>
                <th class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                  Data
                </th>
                <th class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
                  Valor
                </th>
                <th class="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {#each exp.items as e (e.id)}
                {@const isEditing = editingId === e.id}
                {@const isSaving = savingId === e.id}
                <tr class="border-b border-[var(--color-border)] hover:bg-white/[0.02]">
                  {#if isEditing}
                    <td colspan="5" class="p-3 bg-[var(--color-bg-2)]">
                      <form
                        method="POST"
                        action="?/updateExpense"
                        use:enhance={() => {
                          savingId = e.id;
                          return async ({ result }) => {
                            savingId = null;
                            if (result.type === 'success') {
                              toast.success('Despesa actualizada.');
                              editingId = null;
                              await invalidateAll();
                            } else if (result.type === 'failure') {
                              toast.error(
                                (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                              );
                            }
                          };
                        }}
                        class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                      >
                        <input type="hidden" name="expenseId" value={e.id} />
                        <label class="flex flex-col">
                          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
                            Categoria
                          </span>
                          <select
                            name="category"
                            required
                            value={e.category}
                            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
                            style="border-radius: var(--radius-btn);"
                          >
                            {#each CATEGORIES as c (c.value)}
                              <option value={c.value}>{c.label}</option>
                            {/each}
                          </select>
                        </label>
                        <label class="flex flex-col md:col-span-2">
                          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
                            Descrição
                          </span>
                          <input
                            name="description"
                            type="text"
                            required
                            value={e.description}
                            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
                            style="border-radius: var(--radius-btn);"
                          />
                        </label>
                        <label class="flex flex-col">
                          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
                            Valor (€)
                          </span>
                          <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={e.amount}
                            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)]"
                            style="border-radius: var(--radius-btn);"
                          />
                        </label>
                        <label class="flex flex-col">
                          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1">
                            Data
                          </span>
                          <input
                            name="date"
                            type="date"
                            required
                            value={e.date.slice(0, 10)}
                            class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
                            style="border-radius: var(--radius-btn);"
                          />
                        </label>
                        <div class="md:col-span-5 flex justify-end gap-2">
                          <button
                            type="button"
                            onclick={cancelEdit}
                            class="inline-flex items-center justify-center h-10 w-10 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
                            style="border-radius: var(--radius-btn);"
                            aria-label="Cancelar"
                          >
                            <X class="h-4 w-4" />
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving}
                            class="inline-flex items-center justify-center h-10 w-10 bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white transition-colors disabled:opacity-50"
                            style="border-radius: var(--radius-btn);"
                            aria-label="Guardar"
                          >
                            {#if isSaving}
                              <span class="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
                            {:else}
                              <Check class="h-4 w-4" />
                            {/if}
                          </button>
                        </div>
                      </form>
                    </td>
                  {:else}
                    <td class="px-4 py-2.5">
                      <span
                        class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
                      >
                        {categoryLabel(e.category as OpExpenseCategory)}
                      </span>
                    </td>
                    <td class="px-4 py-2.5">{e.description}</td>
                    <td class="px-4 py-2.5 font-mono text-[11px] text-right text-[var(--color-text-muted)]">
                      {formatDate(e.date)}
                    </td>
                    <td class="px-4 py-2.5 num-value text-[13.5px] text-right">
                      {formatEUR(e.amount)}
                    </td>
                    <td class="px-4 py-2.5">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onclick={() => startEdit(e.id)}
                          class="text-[var(--color-text-faint)] hover:text-[var(--color-text)] p-1.5 transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil class="h-3.5 w-3.5" />
                        </button>
                        <form
                          method="POST"
                          action="?/deleteExpense"
                          use:enhance={({ cancel }) => {
                            if (!window.confirm('Eliminar despesa?')) {
                              cancel();
                              return;
                            }
                            return async ({ result }) => {
                              if (result.type === 'success') {
                                toast.success('Despesa eliminada.');
                                await invalidateAll();
                              } else if (result.type === 'failure') {
                                toast.error(
                                  (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                                );
                              }
                            };
                          }}
                        >
                          <input type="hidden" name="expenseId" value={e.id} />
                          <button
                            type="submit"
                            class="text-[var(--color-text-faint)] hover:text-[var(--color-red)] p-1.5 transition-colors"
                            aria-label="Eliminar"
                          >
                            <Trash2 class="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  {/if}
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr class="border-t border-[var(--color-border)] bg-[var(--color-bg-2)]">
                <td colspan="3" class="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] text-right">
                  Total ({exp.total} registos)
                </td>
                <td class="px-4 py-3 num-value text-[16px] text-right">
                  {formatEUR(exp.totalSum)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          </div>
        {/if}
      {/await}
    </Panel>
</section>
