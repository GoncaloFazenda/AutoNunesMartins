<script lang="ts">
  import type { IconComponent } from '$lib/types/ui';

  interface Props {
    icon: IconComponent;
    label: string;
    value?: string;
    valueClass?: string;
  }

  let { icon: Icon, label, value, valueClass = '' }: Props = $props();
</script>

<div class="spec-row">
  <Icon class="spec-icon" />
  <div class="spec-sep"></div>
  <div class="flex flex-col gap-0.5">
    <span class="spec-label">{label}</span>
    {#if value}
      <span class="font-mono text-[13px] tabular-nums text-[var(--color-text)] {valueClass}">
        {value}
      </span>
    {/if}
  </div>
</div>
