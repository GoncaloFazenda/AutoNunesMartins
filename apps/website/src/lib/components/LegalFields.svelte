<script lang="ts">
  let { fields }: { fields: { id: string; label: string; value: string | null }[] } = $props();
</script>

<dl>
  {#each fields as field}
    <div><dt>{field.label}</dt><dd class:pending={!field.value?.trim()}>{field.value?.trim() || 'Por preencher / Por confirmar antes da publicação.'}</dd></div>
  {/each}
</dl>

<style>
  dl { margin: 24px 0; }
  dl > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 16px 32px; padding: 18px 0; border-bottom: 1px solid var(--line); }
  dt { color: var(--muted); }
  dd { margin: 0; overflow-wrap: anywhere; }
  .pending { font-style: italic; }
  @media (max-width: 700px) { dl > div { grid-template-columns: minmax(0, 1fr); gap: 8px; } }
</style>
