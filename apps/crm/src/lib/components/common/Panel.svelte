<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    class?: string;
  }

  let { children, class: className = '' }: Props = $props();
</script>

<section
  class="panel-surface overflow-hidden border border-[var(--color-border)]  {className}"
  style="border-radius: var(--radius-card);"
>
  {@render children?.()}
</section>

<style>
  /* Match prototype line 714: subtle 180deg gradient gives panels depth.
     Dark theme uses the prototype's exact colors; light theme falls back to flat bg-1. */
  :global([data-theme='dark']) .panel-surface,
  :global(html:not([data-theme='light'])) .panel-surface {
    background: linear-gradient(180deg, #131316 0%, #101012 100%);
  }
  :global([data-theme='light']) .panel-surface {
    background: var(--color-bg-1);
  }
</style>
