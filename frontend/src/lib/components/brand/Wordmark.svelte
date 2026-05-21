<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    showCaption?: boolean;
  }

  let { size = 'md', showCaption = true }: Props = $props();

  // Match prototype: sidebar brand uses 20px / -0.02em tracking
  const sizes = {
    sm: 'text-[18px]',
    md: 'text-[20px] tracking-[-0.02em]',
    lg: 'text-[28px]',
  };
</script>

<div class="flex flex-col leading-none">
  <div class="font-display font-black italic uppercase tracking-[-0.025em] {sizes[size]}">
    <span class="text-[var(--color-red)]">AUTO</span><span class="text-[var(--color-text)]"
      >NUNES</span
    >
    <span class="text-[var(--color-text)]">MARTINS</span>
  </div>
  {#if showCaption}
    <div
      class="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.25em] text-[var(--color-text-faint)]"
    >
      Comércio de Automóveis
    </div>
  {/if}
</div>
