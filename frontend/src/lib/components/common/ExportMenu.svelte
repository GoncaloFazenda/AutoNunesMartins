<script lang="ts">
  /*
    Botão "Exportar" com dropdown CSV/PDF. Substitui os antigos `<Button>` que
    apontavam diretamente para `?format=csv` — agora o utilizador escolhe
    explicitamente o formato e nunca se exporta nada por default. Pequeno
    chevron sinaliza que abre um menu.

    Cada item do menu navega para `{baseHref}?format={csv|pdf}&{extraQuery}`,
    preservando os filtros da página actual quando o caller passa `extraQuery`
    (tipicamente `$page.url.search`).
  */
  import { onMount, onDestroy } from 'svelte';
  import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-svelte';

  interface Props {
    /** URL base do endpoint de export (sem query string). */
    baseHref: string;
    /**
     * Query string adicional a preservar (filtros da página actual). Pode
     * vir com ou sem `?`/`&` à cabeça — é normalizado internamente.
     */
    extraQuery?: string;
    /**
     * Altura do botão. `md` (default) bate com o `<Button size="md">` que
     * usávamos antes; `sm` para sítios mais densos.
     */
    size?: 'sm' | 'md';
    /** Classes adicionais aplicadas ao botão. */
    class?: string;
  }

  let { baseHref, extraQuery = '', size = 'md', class: className = '' }: Props = $props();

  let isOpen = $state(false);
  let menuEl = $state<HTMLDivElement | null>(null);
  let buttonEl = $state<HTMLButtonElement | null>(null);

  function toggle() {
    isOpen = !isOpen;
  }
  function close() {
    isOpen = false;
  }

  // Constrói o href final juntando `?format=…` ao baseHref e — quando o
  // caller passou filtros — anexando-os como pares `&k=v` adicionais.
  function buildHref(format: 'csv' | 'pdf'): string {
    const tail = extraQuery.replace(/^[?&]+/, '');
    return tail ? `${baseHref}?format=${format}&${tail}` : `${baseHref}?format=${format}`;
  }

  function onDocClick(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    if (menuEl?.contains(target) || buttonEl?.contains(target)) return;
    close();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  onMount(() => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
  });

  // Estilo do botão (mesma receita visual que `<Button variant="outline">`)
  // para o menu encaixar onde quer que estivesse o botão antigo.
  const sizeClass = size === 'sm' ? 'h-9 px-3 text-[12px]' : 'h-[38px] px-[18px] text-[13px]';
</script>

<div class="relative inline-block">
  <button
    bind:this={buttonEl}
    type="button"
    onclick={toggle}
    aria-haspopup="menu"
    aria-expanded={isOpen}
    aria-label="Exportar"
    class="inline-flex items-center justify-center gap-2 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] font-mono uppercase tracking-[0.12em] text-[11px] transition-colors {sizeClass} {className}"
    style="border-radius: var(--radius-btn);"
  >
    <Download class="h-4 w-4" />
    Exportar
    <ChevronDown
      class="h-3.5 w-3.5 transition-transform"
      style={isOpen ? 'transform: rotate(180deg);' : ''}
    />
  </button>

  {#if isOpen}
    <!--
      Painel ancorado ao botão. `min-w-full` garante que nunca fica mais
      estreito que o botão; `right-0` alinha à direita (consistente com os
      botões de export que costumam estar no canto direito da page-head).
    -->
    <div
      bind:this={menuEl}
      role="menu"
      class="absolute right-0 top-[calc(100%+6px)] min-w-[180px] border border-[var(--color-border)] shadow-xl z-50 panel-surface overflow-hidden"
      style="border-radius: var(--radius-card);"
    >
      <a
        href={buildHref('csv')}
        role="menuitem"
        onclick={close}
        class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors"
      >
        <FileSpreadsheet class="h-4 w-4 text-[var(--color-text-muted)]" />
        <div class="flex flex-col leading-tight">
          <span class="font-display font-semibold text-[13px]">CSV</span>
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
            Folha de cálculo
          </span>
        </div>
      </a>
      <a
        href={buildHref('pdf')}
        role="menuitem"
        onclick={close}
        class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-red)_6%,transparent)] transition-colors border-t border-[var(--color-border)]"
      >
        <FileText class="h-4 w-4 text-[var(--color-text-muted)]" />
        <div class="flex flex-col leading-tight">
          <span class="font-display font-semibold text-[13px]">PDF</span>
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]">
            Documento imprimível
          </span>
        </div>
      </a>
    </div>
  {/if}
</div>

<style>
  /* Igual ao NotificationBell / Panel — gradient subtil em dark, flat em light. */
  :global([data-theme='dark']) .panel-surface,
  :global(html:not([data-theme='light'])) .panel-surface {
    background: linear-gradient(180deg, #131316 0%, #101012 100%);
  }
  :global([data-theme='light']) .panel-surface {
    background: var(--color-bg-1);
  }
</style>
