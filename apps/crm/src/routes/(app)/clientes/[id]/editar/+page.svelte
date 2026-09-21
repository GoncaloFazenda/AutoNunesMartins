<script lang="ts">
  import { Trash2 } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import CustomerForm from '$lib/components/customer/CustomerForm.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const c = $derived(data.customer);

  const initial = $derived({
    name: c.name,
    phone: c.phone,
    email: c.email ?? '',
    address: c.address ?? '',
    nif: c.nif,
    notes: c.notes ?? '',
  });

  let deleting = $state(false);
</script>

<svelte:head>
  <title>Editar {c.name} · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Editar " accent={c.name} size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      NIF {c.nif}
    </p>
  </div>

  <Panel>
    <div class="p-6">
      <CustomerForm {initial} submitLabel="Guardar alterações">
        {#snippet extraActions()}
          <form
            method="POST"
            action="?/delete"
            use:enhance={({ cancel }) => {
              if (!window.confirm(`Eliminar definitivamente ${c.name}?`)) {
                cancel();
                return;
              }
              deleting = true;
              return async ({ result }) => {
                deleting = false;
                if (result.type === 'redirect') {
                  toast.success('Cliente eliminado.');
                } else if (result.type === 'failure') {
                  toast.error(
                    (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
                  );
                }
              };
            }}
          >
            <button
              type="submit"
              disabled={deleting}
              class="inline-flex items-center gap-2 px-3 h-10 border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] text-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_10%,transparent)] font-mono uppercase tracking-[0.2em] text-[11px] transition-colors disabled:opacity-50"
              style="border-radius: var(--radius-btn);"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Eliminar
            </button>
          </form>
        {/snippet}
      </CustomerForm>
    </div>
  </Panel>
</section>
