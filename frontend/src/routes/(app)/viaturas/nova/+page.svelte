<script lang="ts">
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
  import WebPublicationPanel from '$lib/components/vehicle/WebPublicationPanel.svelte';
  import PhotoGallery from '$lib/components/vehicle/PhotoGallery.svelte';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Nova Viatura · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Nova" accent=" Viatura" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      Adicionar entrada ao inventário
    </p>
  </div>

  {#if data.vehicle}
    <p>
      Viatura criada: {data.vehicle.brand}
      {data.vehicle.model}. Adicione fotografias e escolha se pretende publicá-la no website.
    </p>
    <PhotoGallery vehicleId={data.vehicle.id} photos={data.signedPhotos} />
    <WebPublicationPanel vehicle={data.vehicle} photos={data.signedPhotos} />
    <a class="inline-flex min-h-11 items-center underline" href={`/viaturas/${data.vehicle.id}`}
      >Concluir e abrir ficha CRM →</a
    >
  {:else}
    <Panel>
      <div class="p-6">
        <VehicleForm submitLabel="Adicionar Viatura" />
      </div>
    </Panel>
    <Panel
      ><div class="p-6 space-y-3">
        <h2 class="text-lg font-semibold">Publicação no website</h2>
        <p class="text-sm text-[var(--color-text-muted)]">
          Não publicada por defeito. Primeiro guarde a viatura; no passo seguinte poderá carregar e
          autorizar fotografias, confirmar os dados públicos e escolher «Publicar no site». Sem
          foto, confirme a publicação com «Imagem indisponível»; sem preço, verá «Preço sob
          consulta». Disponível e Reservado são elegíveis; uma viatura reservada será identificada
          como tal.
        </p>
        <button disabled class="min-h-11 px-4 border border-[var(--color-border)] opacity-50"
          >Publicar no site</button
        >
        <p class="text-sm">Primeiro passo: guardar a viatura. Fotografias e preço são opcionais.</p>
      </div></Panel
    >
  {/if}
</section>
