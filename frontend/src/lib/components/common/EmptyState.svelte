<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { IconComponent } from '$lib/types/ui';

  interface Props {
    icon: IconComponent;
    title: string;
    description?: string;
    actions?: Snippet;
  }

  let { icon: Icon, title, description, actions }: Props = $props();
</script>

<div class="flex flex-col items-center text-center px-6 py-16">
  <div class="mb-5 flex items-center gap-3">
    <Icon class="h-7 w-7 text-[var(--color-red)]" />
    <div class="h-7 w-[1.5px] bg-[var(--color-red)]"></div>
    <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)]">
      Sem registos
    </span>
  </div>
  <h3
    class="font-display text-[28px] font-black italic uppercase tracking-[-0.025em] mb-2"
  >
    {title}
  </h3>
  {#if description}
    <p class="text-[14px] text-[var(--color-text-muted)] max-w-[460px] mb-6">
      {description}
    </p>
  {/if}
  {#if actions}
    <div class="flex items-center gap-2">{@render actions()}</div>
  {/if}
</div>
