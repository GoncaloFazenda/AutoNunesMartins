<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import Button from '$lib/components/common/Button.svelte';
  import type { Fuel, VehicleStatus } from '@anm/types';

  type Initial = {
    brand?: string;
    model?: string;
    year?: number | null;
    fuel?: Fuel | '';
    mileage?: number | null;
    vin?: string;
    purchasePrice?: string;
    salePrice?: string;
    status?: VehicleStatus;
    acquisitionDate?: string;
    description?: string;
    pendingDocFlags?: {
      financing: boolean;
      imt: boolean;
      registration: boolean;
      docs: boolean;
    };
  };

  interface Props {
    initial?: Initial;
    submitLabel?: string;
    /** Optional snippet rendered above the form actions (e.g. delete button on edit). */
    extraActions?: Snippet;
    /** Defaults to `?/submit` form action on the same page. */
    action?: string;
    /** If true, after success goto vehicle detail using returned id. */
    redirectOnSuccess?: boolean;
  }

  let {
    initial = {},
    submitLabel = 'Guardar',
    extraActions,
    action,
    redirectOnSuccess = true,
  }: Props = $props();

  let submitting = $state(false);

  const FUELS: { value: Fuel; label: string }[] = [
    { value: 'GASOLINE', label: 'Gasolina' },
    { value: 'DIESEL', label: 'Gasóleo' },
    { value: 'HYBRID', label: 'Híbrido' },
    { value: 'PLUGIN_HYBRID', label: 'Híbrido Plug-in' },
    { value: 'ELECTRIC', label: 'Elétrico' },
    { value: 'LPG', label: 'GPL' },
  ];

  const STATUSES: { value: VehicleStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'RESERVED', label: 'Reservado' },
    { value: 'SOLD', label: 'Vendido' },
    { value: 'DELIVERED', label: 'Entregue' },
    { value: 'DOCS_PENDING', label: 'Documentos Pendentes' },
  ];

  function fieldLabelClass() {
    return 'font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] mb-1.5';
  }

  function inputClass() {
    return 'h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors';
  }

  const today = new Date().toISOString().slice(0, 10);
  const defaultAcquisitionDate = initial.acquisitionDate ?? today;
</script>

<form
  method="POST"
  action={action ?? '?/submit'}
  use:enhance={({ formData: _formData }) => {
    submitting = true;
    return async ({ result, update }) => {
      submitting = false;
      if (result.type === 'success') {
        toast.success('Viatura guardada.');
        if (redirectOnSuccess) {
          const id =
            result.data && typeof result.data === 'object' && 'id' in result.data
              ? (result.data as { id: string }).id
              : undefined;
          if (id) {
            await goto(`/viaturas/${id}`);
            return;
          }
        }
      } else if (result.type === 'failure') {
        const err =
          (result.data as { error?: string } | undefined)?.error ?? 'Falha ao guardar.';
        toast.error(err);
      }
      await update({ reset: false });
    };
  }}
  class="space-y-6"
>
  <!-- Row 1: identification -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Marca</span>
      <input
        name="brand"
        type="text"
        required
        value={initial.brand ?? ''}
        placeholder="Dacia"
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Modelo</span>
      <input
        name="model"
        type="text"
        required
        value={initial.model ?? ''}
        placeholder="Jogger Extreme"
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Ano</span>
      <input
        name="year"
        type="number"
        min="1950"
        max={new Date().getFullYear() + 1}
        required
        value={initial.year ?? ''}
        placeholder={String(new Date().getFullYear())}
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
  </div>

  <!-- Row 2: VIN + fuel + status -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="flex flex-col md:col-span-1">
      <span class={fieldLabelClass()}>VIN</span>
      <input
        name="vin"
        type="text"
        required
        maxlength="17"
        minlength="17"
        value={initial.vin ?? ''}
        placeholder="WAUZZZ8K9CA000000"
        class="{inputClass()} font-mono tracking-wider uppercase"
        style="border-radius: var(--radius-btn); text-transform: uppercase;"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Combustível</span>
      <select
        name="fuel"
        required
        value={initial.fuel ?? ''}
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      >
        <option value="" disabled>Selecionar…</option>
        {#each FUELS as f (f.value)}
          <option value={f.value}>{f.label}</option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Estado</span>
      <select
        name="status"
        value={initial.status ?? 'AVAILABLE'}
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      >
        {#each STATUSES as s (s.value)}
          <option value={s.value}>{s.label}</option>
        {/each}
      </select>
    </label>
  </div>

  <!-- Row 3: numbers -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Quilometragem</span>
      <input
        name="mileage"
        type="number"
        min="0"
        max="2000000"
        required
        value={initial.mileage ?? ''}
        placeholder="67000"
        class="{inputClass()} tabular-nums"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Preço Compra (€)</span>
      <input
        name="purchasePrice"
        type="number"
        step="0.01"
        min="0"
        required
        value={initial.purchasePrice ?? ''}
        placeholder="14000.00"
        class="{inputClass()} tabular-nums"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>PVP (€)</span>
      <input
        name="salePrice"
        type="number"
        step="0.01"
        min="0"
        value={initial.salePrice ?? ''}
        placeholder="17950.00"
        class="{inputClass()} tabular-nums"
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabelClass()}>Aquisição</span>
      <input
        name="acquisitionDate"
        type="date"
        required
        value={defaultAcquisitionDate}
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
  </div>

  <!-- Description -->
  <label class="flex flex-col">
    <span class={fieldLabelClass()}>Notas</span>
    <textarea
      name="description"
      rows="3"
      placeholder="Histórico de manutenção, extras, observações…"
      class="px-3 py-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
      style="border-radius: var(--radius-btn);"
      value={initial.description ?? ''}
    ></textarea>
  </label>

  <!-- Pending docs flags -->
  <fieldset
    class="border border-[var(--color-border)] p-4"
    style="border-radius: var(--radius-card);"
  >
    <legend class="px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]">
      Documentos pendentes
    </legend>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
      {#each [{ key: 'financing', label: 'Financiamento' }, { key: 'imt', label: 'IMT' }, { key: 'registration', label: 'Registo' }, { key: 'docs', label: 'Documentação' }] as flag (flag.key)}
        <label class="inline-flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            name={`pendingDocFlags.${flag.key}`}
            value="true"
            checked={initial.pendingDocFlags?.[flag.key as keyof typeof initial.pendingDocFlags] ??
              false}
            class="h-4 w-4 accent-[var(--color-red)]"
          />
          {flag.label}
        </label>
      {/each}
    </div>
  </fieldset>

  <!-- Actions -->
  <div class="flex items-center justify-between gap-3 pt-2">
    <div>
      {#if extraActions}
        {@render extraActions()}
      {/if}
    </div>
    <div class="flex items-center gap-2">
      <Button variant="ghost" href="/viaturas">Cancelar</Button>
      <Button variant="primary" type="submit" loading={submitting} disabled={submitting}>
        {submitLabel}
      </Button>
    </div>
  </div>
</form>
