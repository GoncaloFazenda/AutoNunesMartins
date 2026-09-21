<script lang="ts">
  import { Construction } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import { formatDateLong } from '$lib/utils/format';

  interface Props {
    title: string;
    accent?: string;
    module: string;
  }

  let { title, accent, module }: Props = $props();
  const today = new Date();
</script>

<section class="pt-8 pb-12">
  <div class="flex items-center justify-between gap-6 mb-8">
    <div>
      <ItalicHero text={title} accent={accent} size="lg" />
      <div
        class="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        {formatDateLong(today)}
      </div>
    </div>
  </div>

  <div
    class="flex items-start gap-4 p-8 border border-[var(--color-border)] bg-[var(--color-bg-1)]"
    style="border-radius: var(--radius-card);"
  >
    <Construction class="h-6 w-6 text-[var(--color-red)] flex-shrink-0" />
    <div class="h-6 w-[1.5px] bg-[var(--color-red)] flex-shrink-0"></div>
    <div>
      <div
        class="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] mb-2"
      >
        Em Construção
      </div>
      <p class="font-display text-[22px] font-bold italic uppercase tracking-tight">
        {module}
      </p>
      <p class="mt-2 text-[14px] text-[var(--color-text-muted)] max-w-[640px]">
        Esta secção será implementada no próximo módulo do plano. O esqueleto da aplicação,
        autenticação e linguagem visual já estão prontos.
      </p>
    </div>
  </div>
</section>
