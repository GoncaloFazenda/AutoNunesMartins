<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit';
    href?: string;
    disabled?: boolean;
    loading?: boolean;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    class?: string;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    href,
    disabled,
    loading,
    onclick,
    children,
    class: className = '',
  }: Props = $props();

  // Match prototype's .cta recipe exactly:
  //   Barlow, italic, weight 600 (semibold), 13px, letter-spacing .01em, uppercase
  const variantClass = {
    primary:
      'bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] text-white font-display font-semibold italic uppercase tracking-[0.01em]',
    outline:
      'border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] font-mono uppercase tracking-[0.12em] text-[11px]',
    ghost:
      'text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-mono uppercase tracking-[0.12em] text-[11px]',
    danger:
      'bg-transparent border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] text-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_10%,transparent)] font-mono uppercase tracking-[0.12em] text-[11px]',
  };

  const sizeClass = {
    sm: 'h-9 px-3 text-[12px]',
    md: 'h-[38px] px-[18px] text-[13px]',
    lg: 'h-12 px-5 text-[14px]',
  };

  const baseClass =
    'inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
</script>

{#if href}
  <a
    {href}
    class="{baseClass} {variantClass[variant]} {sizeClass[size]} {className}"
    style="border-radius: var(--radius-btn);"
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    onclick={(e) => onclick?.(e)}
    class="{baseClass} {variantClass[variant]} {sizeClass[size]} {className}"
    style="border-radius: var(--radius-btn);"
  >
    {#if loading}
      <span class="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
    {/if}
    {@render children?.()}
  </button>
{/if}
