<script lang="ts">
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
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

  <Panel>
    <div class="p-6">
      <VehicleForm submitLabel="Adicionar Viatura" />
    </div>
  </Panel>
</section>
