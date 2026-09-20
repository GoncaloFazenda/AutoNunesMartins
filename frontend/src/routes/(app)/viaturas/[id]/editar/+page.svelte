<script lang="ts">
  import { Trash2 } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
  import WebPublicationPanel from '$lib/components/vehicle/WebPublicationPanel.svelte';
  import PhotoGallery from '$lib/components/vehicle/PhotoGallery.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const v = data.vehicle;
  const initial = {
    brand: v.brand,
    model: v.model,
    year: v.year,
    fuel: v.fuel,
    mileage: v.mileage,
    vin: v.vin,
    licensePlate: v.licensePlate ?? '',
    purchasePrice: v.purchasePrice,
    salePrice: v.salePrice ?? '',
    status: v.status,
    acquisitionDate: v.acquisitionDate.slice(0, 10),
    description: v.description ?? '',
    pendingDocFlags: v.pendingDocFlags,
  };

  let deleting = $state(false);
</script>

<svelte:head>
  <title>Editar {v.brand} {v.model} · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Editar" accent=" {v.brand} {v.model}" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      VIN {v.vin}
    </p>
  </div>

  <Panel>
    <div class="p-6">
      <VehicleForm {initial} submitLabel="Guardar alterações">
        {#snippet extraActions()}
          <form
            method="POST"
            action="?/delete"
            use:enhance={({ cancel }) => {
              if (!window.confirm(`Eliminar definitivamente ${v.brand} ${v.model}?`)) {
                cancel();
                return;
              }
              deleting = true;
              return async ({ result }) => {
                deleting = false;
                if (result.type === 'redirect') {
                  toast.success('Viatura eliminada.');
                } else if (result.type === 'failure') {
                  toast.error((result.data as { error?: string } | undefined)?.error ?? 'Falha.');
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
      </VehicleForm>
    </div>
  </Panel>
  <PhotoGallery vehicleId={data.vehicle.id} photos={data.signedPhotos} />
  <WebPublicationPanel vehicle={data.vehicle} photos={data.signedPhotos} />
</section>
