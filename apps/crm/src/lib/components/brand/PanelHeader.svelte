<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { IconComponent } from '$lib/types/ui';

  interface Props {
    icon: IconComponent;
    title: string;
    meta?: string;
    actions?: Snippet;
    /** Override the icon color (e.g. "text-[#e6b800]" for the trophy). Defaults to text. */
    iconClass?: string;
  }

  let { icon: Icon, title, meta, actions, iconClass = 'text-[var(--color-text)]' }: Props = $props();
</script>

<div
  class="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3"
>
  <div class="flex items-center gap-2.5 min-w-0">
    <Icon class="h-[18px] w-[18px] {iconClass} flex-shrink-0" />
    <div class="h-[18px] w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
    <h3
      class="font-display text-[18px] font-bold italic uppercase tracking-[-0.01em] leading-none text-[var(--color-text)] truncate"
    >
      {title}
    </h3>
    {#if meta}
      <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] ml-1">
        {meta}
      </span>
    {/if}
  </div>
  {#if actions}
    <div class="flex items-center gap-2">{@render actions()}</div>
  {/if}
</div>
