<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import type { Snippet } from 'svelte';
  import { isValidNIF } from '@anm/types';
  import Button from '$lib/components/common/Button.svelte';

  type Initial = {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    nif?: string;
    notes?: string;
  };

  interface Props {
    initial?: Initial;
    submitLabel?: string;
    extraActions?: Snippet;
    redirectOnSuccess?: boolean;
  }

  let {
    initial = {},
    submitLabel = 'Guardar',
    extraActions,
    redirectOnSuccess = true,
  }: Props = $props();

  let submitting = $state(false);
  let nifValue = $state(initial.nif ?? '');
  const nifValid = $derived(nifValue.length === 0 || isValidNIF(nifValue));

  function fieldLabel() {
    return 'font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] mb-1.5';
  }

  function inputClass(extra = '') {
    return `h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors ${extra}`;
  }
</script>

<form
  method="POST"
  action="?/submit"
  use:enhance={() => {
    submitting = true;
    return async ({ result, update }) => {
      submitting = false;
      if (result.type === 'success') {
        toast.success('Cliente guardado.');
        if (redirectOnSuccess) {
          const id =
            result.data && typeof result.data === 'object' && 'id' in result.data
              ? (result.data as { id: string }).id
              : undefined;
          if (id) {
            await goto(`/clientes/${id}`);
            return;
          }
        }
      } else if (result.type === 'failure') {
        toast.error(
          (result.data as { error?: string } | undefined)?.error ?? 'Falha ao guardar.',
        );
      }
      await update({ reset: false });
    };
  }}
  class="space-y-6"
>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="flex flex-col md:col-span-2">
      <span class={fieldLabel()}>Nome completo</span>
      <input
        name="name"
        type="text"
        required
        minlength="2"
        maxlength="120"
        value={initial.name ?? ''}
        placeholder="João Silva"
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabel()}>NIF</span>
      <input
        name="nif"
        type="text"
        inputmode="numeric"
        maxlength="9"
        required
        bind:value={nifValue}
        placeholder="923123827"
        class="{inputClass('font-mono tabular-nums')} {nifValid
          ? ''
          : '!border-[var(--color-red)] !ring-[color-mix(in_oklab,var(--color-red)_25%,transparent)] !ring-2'}"
        style="border-radius: var(--radius-btn);"
      />
      {#if !nifValid}
        <span class="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-red)]">
          NIF deve conter apenas dígitos
        </span>
      {/if}
    </label>
    <label class="flex flex-col">
      <span class={fieldLabel()}>Telefone</span>
      <input
        name="phone"
        type="tel"
        inputmode="numeric"
        required
        maxlength="9"
        pattern="\d{9}"
        value={initial.phone ?? ''}
        placeholder="938272382"
        class={inputClass('font-mono tabular-nums')}
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabel()}>Email</span>
      <input
        name="email"
        type="email"
        value={initial.email ?? ''}
        placeholder="joao@exemplo.pt"
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
    <label class="flex flex-col">
      <span class={fieldLabel()}>Morada</span>
      <input
        name="address"
        type="text"
        maxlength="240"
        value={initial.address ?? ''}
        placeholder="Rua das Flores 123, 4500-000 Porto"
        class={inputClass()}
        style="border-radius: var(--radius-btn);"
      />
    </label>
  </div>

  <label class="flex flex-col">
    <span class={fieldLabel()}>Notas</span>
    <textarea
      name="notes"
      rows="5"
      maxlength="4000"
      placeholder="Histórico de contactos, preferências, observações…"
      class="px-3 py-2 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-red)_12%,transparent)] transition-colors"
      style="border-radius: var(--radius-btn);"
      value={initial.notes ?? ''}
    ></textarea>
  </label>

  <div class="flex items-center justify-between gap-3 pt-2">
    <div>{#if extraActions}{@render extraActions()}{/if}</div>
    <div class="flex items-center gap-2">
      <Button variant="ghost" href="/clientes">Cancelar</Button>
      <Button
        variant="primary"
        type="submit"
        loading={submitting}
        disabled={submitting || !nifValid}
      >
        {submitLabel}
      </Button>
    </div>
  </div>
</form>
