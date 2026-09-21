<script lang="ts">
  interface Props {
    text: string;
    accent?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }

  let { text, accent, size = 'lg' }: Props = $props();

  // Line-heights match prototype: page-head h1 is 1, hero-title is 0.92.
  // Mobile fallback per recipe: lg knocks down to 28px and xl to 36px so a
  // long greeting/title doesn't overflow a 360px viewport. Desktop values
  // restore at md (≥768px) to match the prototype exactly.
  const sizes = {
    sm: 'text-[20px] md:text-[24px] leading-[1]',
    md: 'text-[26px] md:text-[32px] leading-[1]',
    lg: 'text-[28px] md:text-[38px] leading-[1]',
    xl: 'text-[36px] md:text-[56px] leading-[0.92]',
  };
</script>

<h1
  class="font-display font-black italic uppercase tracking-[-0.025em] text-[var(--color-text)] {sizes[size]}"
>
  {text}{#if accent}
    <span class="text-[var(--color-red)]">{accent}</span>
  {/if}
</h1>
