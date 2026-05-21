<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { page } from '$app/stores';

  interface Props {
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
  }

  let { currentPage, totalPages, total, pageSize }: Props = $props();

  function buildHref(targetPage: number): string {
    const usp = new URLSearchParams($page.url.searchParams);
    if (targetPage <= 1) usp.delete('page');
    else usp.set('page', String(targetPage));
    const qs = usp.toString();
    return qs ? `${$page.url.pathname}?${qs}` : $page.url.pathname;
  }

  const start = $derived(total === 0 ? 0 : (currentPage - 1) * pageSize + 1);
  const end = $derived(Math.min(currentPage * pageSize, total));
</script>

<nav
  class="flex items-center justify-between gap-4 px-4 py-3 border-t border-[var(--color-border)] font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
  aria-label="Paginação"
>
  <span class="tabular-nums">
    {start}–{end} de {total}
  </span>

  <div class="flex items-center gap-1">
    <a
      href={currentPage > 1 ? buildHref(currentPage - 1) : '#'}
      aria-disabled={currentPage <= 1}
      class="inline-flex items-center justify-center h-8 w-8 border border-[var(--color-border)] transition-colors {currentPage <=
      1
        ? 'opacity-30 pointer-events-none'
        : 'hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
      style="border-radius: var(--radius-btn);"
    >
      <ChevronLeft class="h-3.5 w-3.5" />
    </a>
    <span class="tabular-nums text-[var(--color-text)] px-2">
      {currentPage} / {Math.max(1, totalPages)}
    </span>
    <a
      href={currentPage < totalPages ? buildHref(currentPage + 1) : '#'}
      aria-disabled={currentPage >= totalPages}
      class="inline-flex items-center justify-center h-8 w-8 border border-[var(--color-border)] transition-colors {currentPage >=
      totalPages
        ? 'opacity-30 pointer-events-none'
        : 'hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]'}"
      style="border-radius: var(--radius-btn);"
    >
      <ChevronRight class="h-3.5 w-3.5" />
    </a>
  </div>
</nav>
