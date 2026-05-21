<script lang="ts">
  import { page } from '$app/stores';
  import BrandDl from '$lib/components/brand/icons/BrandDl.svelte';
  import BrandPlus from '$lib/components/brand/icons/BrandPlus.svelte';
  import ThemeToggle from '$lib/components/brand/ThemeToggle.svelte';
  import NotificationBell from '$lib/components/shell/NotificationBell.svelte';
  import GlobalSearch from '$lib/components/shell/GlobalSearch.svelte';

  interface Props {
    crumbs?: string[];
    showAddVehicle?: boolean;
    hasAlerts?: boolean;
  }

  let { crumbs, showAddVehicle = true, hasAlerts = false }: Props = $props();

  const resolvedCrumbs = $derived.by<string[]>(() => {
    if (crumbs) return crumbs;
    const path = $page.url.pathname;
    if (path === '/dashboard') return ['Painel', 'Dashboard'];
    if (path.startsWith('/viaturas')) return ['Painel', 'Viaturas'];
    if (path.startsWith('/clientes')) return ['Painel', 'Clientes'];
    if (path.startsWith('/tarefas')) return ['Painel', 'Tarefas'];
    if (path.startsWith('/financeiro')) return ['Painel', 'Financeiro'];
    if (path.startsWith('/sales')) return ['Painel', 'Vendas'];
    if (path.startsWith('/atividade')) return ['Painel', 'Atividade'];
    if (path.startsWith('/guia')) return ['Painel', 'Guia de Fluxo'];
    if (path.startsWith('/definicoes')) return ['Painel', 'Definições'];
    return ['Painel'];
  });
</script>

<header
  class="topbar relative flex items-center gap-4 px-6 py-[22px] border-b border-[var(--color-border)]"
>
  <!-- Breadcrumbs -->
  <div class="flex items-center gap-2 flex-shrink-0">
    <span class="h-1.5 w-1.5 bg-[var(--color-red)]"></span>
    <div class="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]">
      {#each resolvedCrumbs as crumb, i (i)}
        {#if i > 0}
          <span class="text-[var(--color-text-faint)]">/</span>
        {/if}
        <span
          class={i === resolvedCrumbs.length - 1
            ? 'text-[var(--color-text)] font-semibold'
            : 'text-[var(--color-text-muted)]'}
        >
          {crumb}
        </span>
      {/each}
    </div>
  </div>

  <!-- Global search (Cmd/Ctrl+K) — live results dropdown across vehicles,
       customers and tasks. -->
  <GlobalSearch />

  <!-- Actions — pinned to the far right via ml-auto so they sit at the
       viewport edge regardless of how much space the search bar consumes. -->
  <div class="flex items-center gap-2 flex-shrink-0 ml-auto">
    <ThemeToggle size={38} />

    <button
      type="button"
      class="inline-flex items-center justify-center h-[38px] w-[38px] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
      style="border-radius: var(--radius-btn);"
      aria-label="Exportar"
    >
      <BrandDl class="h-4 w-4" />
    </button>

    <NotificationBell />

    {#if showAddVehicle}
      <a
        href="/viaturas/nova"
        class="inline-flex items-center gap-2 h-[38px] px-[18px] font-display font-semibold italic uppercase text-[13px] tracking-[0.01em] text-white bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] transition-colors"
        style="border-radius: var(--radius-btn);"
      >
        <BrandPlus class="h-4 w-4" />
        Adicionar Viatura
      </a>
    {/if}
  </div>
</header>
