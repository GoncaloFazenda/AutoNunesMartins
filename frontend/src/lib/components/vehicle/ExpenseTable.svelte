<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { Check, Pencil, Plus, Trash2, Wallet, X } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { formatDate, formatEUR } from '$lib/utils/format';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import type { VehicleExpenseDto } from '$lib/server/vehicles';
  import type { VehicleStatus, VehicleExpenseCategory } from '@anm/types';

  interface Props {
    expenses: VehicleExpenseDto[];
    vehicleStatus: VehicleStatus;
  }

  let { expenses, vehicleStatus }: Props = $props();

  let showForm = $state(false);
  let submitting = $state(false);
  let editingId = $state<string | null>(null);
  let savingId = $state<string | null>(null);

  const CATEGORIES: { value: VehicleExpenseCategory; label: string }[] = [
    { value: 'ACQUISITION', label: 'Aquisição' },
    { value: 'REPAIR', label: 'Reparação' },
    { value: 'INSPECTION', label: 'Inspeção' },
    { value: 'TRANSPORT', label: 'Transporte' },
    { value: 'CLEANING', label: 'Limpeza' },
    { value: 'DOCS', label: 'Documentos' },
    { value: 'OTHER', label: 'Outro' },
  ];

  const isSoldLike = $derived(vehicleStatus === 'SOLD' || vehicleStatus === 'DELIVERED');

  function categoryLabel(c: string): string {
    return CATEGORIES.find((x) => x.value === c)?.label ?? c;
  }

  function startEdit(id: string) {
    editingId = id;
  }

  function cancelEdit() {
    editingId = null;
  }

  const today = new Date().toISOString().slice(0, 10);
</script>

<section
  class="overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-1)]"
  style="border-radius: var(--radius-card);"
>
  <PanelHeader icon={Wallet} title="Despesas" meta={`${expenses.length} REGISTOS`}>
    {#snippet actions()}
      <button
        type="button"
        onclick={() => (showForm = !showForm)}
        class="inline-flex items-center gap-1.5 px-3 h-8 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
        style="border-radius: var(--radius-btn);"
      >
        <Plus class="h-3.5 w-3.5" />
        Adicionar
      </button>
    {/snippet}
  </PanelHeader>

  {#if showForm}
    <form
      method="POST"
      action="?/addExpense"
      use:enhance={() => {
        submitting = true;
        return async ({ result, update }) => {
          submitting = false;
          if (result.type === 'success') {
            toast.success('Despesa adicionada.');
            showForm = false;
            await invalidateAll();
            return;
          } else if (result.type === 'failure') {
            const err = result.data as
              | { error?: string; soldConfirmRequired?: boolean }
              | undefined;
            if (err?.soldConfirmRequired) {
              toast.message('Marca a checkbox "viatura já vendida" e tenta novamente.');
            } else {
              toast.error(err?.error ?? 'Falha.');
            }
          }
          await update({ reset: false });
        };
      }}
      class="border-b border-[var(--color-border)] p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
    >
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
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
        <span
          class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Descrição
        </span>
        <input
          name="description"
          required
          type="text"
          placeholder="Troca de pneus"
          class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Valor (€)
        </span>
        <input
          name="amount"
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="120.00"
          class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
        >
          Data
        </span>
        <input
          name="date"
          required
          type="date"
          value={today}
          class="h-10 px-2 bg-[var(--color-bg-2)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>
      {#if isSoldLike}
        <label
          class="md:col-span-4 inline-flex items-center gap-2 text-[12px] text-[var(--color-warning)]"
        >
          <input
            type="checkbox"
            name="confirmedOnSold"
            value="true"
            class="h-4 w-4 accent-[var(--color-red)]"
          />
          Esta viatura já está vendida — confirmo a alteração e que o lucro será recalculado.
        </label>
      {/if}
      <div class="md:col-span-1 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onclick={() => (showForm = false)}>Cancelar</Button>
        <Button variant="primary" size="sm" type="submit" loading={submitting}>
          Adicionar
        </Button>
      </div>
    </form>
  {/if}

  {#if expenses.length === 0}
    <div
      class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]"
    >
      Sem despesas registadas
    </div>
  {:else}
    <table class="w-full text-[13px]">
      <thead>
        <tr class="border-b border-[var(--color-border)]">
          <th
            class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Categoria
          </th>
          <th
            class="text-left px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Descrição
          </th>
          <th
            class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Data
          </th>
          <th
            class="text-right px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            Valor
          </th>
          <th class="w-20"></th>
        </tr>
      </thead>
      <tbody>
        {#each expenses as e (e.id)}
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
                    return async ({ result, update }) => {
                      savingId = null;
                      if (result.type === 'success') {
                        toast.success('Despesa actualizada.');
                        editingId = null;
                        await invalidateAll();
                        return;
                      }
                      if (result.type === 'failure') {
                        const err = result.data as
                          | { error?: string; soldConfirmRequired?: boolean }
                          | undefined;
                        if (err?.soldConfirmRequired) {
                          toast.message(
                            'Marca a checkbox "viatura já vendida" e tenta novamente.',
                          );
                        } else {
                          toast.error(err?.error ?? 'Falha.');
                        }
                      }
                      await update({ reset: false });
                    };
                  }}
                  class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                >
                  <input type="hidden" name="expenseId" value={e.id} />
                  <label class="flex flex-col">
                    <span
                      class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
                    >
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
                    <span
                      class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
                    >
                      Descrição
                    </span>
                    <input
                      name="description"
                      required
                      type="text"
                      value={e.description}
                      class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
                      style="border-radius: var(--radius-btn);"
                    />
                  </label>
                  <label class="flex flex-col">
                    <span
                      class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
                    >
                      Valor (€)
                    </span>
                    <input
                      name="amount"
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={e.amount}
                      class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] tabular-nums outline-none focus:border-[var(--color-red)]"
                      style="border-radius: var(--radius-btn);"
                    />
                  </label>
                  <label class="flex flex-col">
                    <span
                      class="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
                    >
                      Data
                    </span>
                    <input
                      name="date"
                      required
                      type="date"
                      value={e.date.slice(0, 10)}
                      class="h-10 px-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
                      style="border-radius: var(--radius-btn);"
                    />
                  </label>

                  {#if isSoldLike}
                    <label
                      class="md:col-span-4 inline-flex items-center gap-2 text-[12px] text-[var(--color-warning)]"
                    >
                      <input
                        type="checkbox"
                        name="confirmedOnSold"
                        value="true"
                        class="h-4 w-4 accent-[var(--color-red)]"
                      />
                      Viatura já vendida — confirmo a alteração e recálculo do lucro.
                    </label>
                  {/if}

                  <div class="md:col-span-1 flex justify-end gap-2">
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
                        <span
                          class="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
                        ></span>
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
                  class="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]"
                >
                  {categoryLabel(e.category)}
                </span>
              </td>
              <td class="px-4 py-2.5">{e.description}</td>
              <td
                class="px-4 py-2.5 font-mono text-[11px] text-right text-[var(--color-text-muted)]"
              >
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
                      return async ({ result, update }) => {
                        if (result.type === 'success') {
                          toast.success('Despesa eliminada.');
                          await invalidateAll();
                          return;
                        }
                        if (result.type === 'failure')
                          toast.error(
                            (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                          );
                        await update({ reset: false });
                      };
                    }}
                  >
                    <input type="hidden" name="expenseId" value={e.id} />
                    {#if isSoldLike}
                      <input type="hidden" name="confirmedOnSold" value="true" />
                    {/if}
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
    </table>
  {/if}
</section>
