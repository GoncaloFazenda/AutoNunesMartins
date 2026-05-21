<script lang="ts">
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import CustomerForm from '$lib/components/customer/CustomerForm.svelte';
</script>

<svelte:head>
  <title>Novo Cliente · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <div>
    <ItalicHero text="Novo" accent=" Cliente" size="lg" />
    <p
      class="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
    >
      <span class="text-[var(--color-red)]">●</span>
      Registar novo contacto
    </p>
  </div>

  <Panel>
    <div class="p-6">
      <CustomerForm submitLabel="Registar Cliente" />
    </div>
  </Panel>
</section>
