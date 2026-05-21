<script lang="ts">
  import BrandSun from '$lib/components/brand/icons/BrandSun.svelte';
  import BrandMoon from '$lib/components/brand/icons/BrandMoon.svelte';
  import { theme } from '$lib/stores/theme';

  interface Props {
    size?: number;
  }

  let { size = 38 }: Props = $props();
</script>

<button
  type="button"
  onclick={() => theme.toggle()}
  class="inline-flex items-center justify-center border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
  style="width: {size}px; height: {size}px; border-radius: var(--radius-btn);"
  aria-label="Alternar tema"
>
  {#if $theme === 'dark'}
    <BrandSun class="h-4 w-4" />
  {:else}
    <BrandMoon class="h-4 w-4" />
  {/if}
</button>
