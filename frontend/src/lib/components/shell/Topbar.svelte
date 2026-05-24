<script lang="ts">
  import { page } from '$app/stores';
  import { Menu, X } from 'lucide-svelte';
  import BrandDl from '$lib/components/brand/icons/BrandDl.svelte';
  import BrandPlus from '$lib/components/brand/icons/BrandPlus.svelte';
  import BrandSearch from '$lib/components/brand/icons/BrandSearch.svelte';
  import ThemeToggle from '$lib/components/brand/ThemeToggle.svelte';
  import NotificationBell from '$lib/components/shell/NotificationBell.svelte';
  import GlobalSearch from '$lib/components/shell/GlobalSearch.svelte';
  import { mobileDrawer } from '$lib/stores/sidebar';

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

  // The active leaf crumb doubles as the mobile page title since the full
  // breadcrumb trail is hidden below md (path is implied by hamburger nav).
  const pageTitle = $derived(resolvedCrumbs[resolvedCrumbs.length - 1] ?? 'Painel');

  // Mobile search-expansion state. When true, the search takes over the
  // entire topbar row and the other action buttons are hidden. Tap the X
  // to collapse back to the icon.
  let mobileSearchOpen = $state(false);
</script>

<header
  class="topbar relative flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-[22px] border-b border-[var(--color-border)]"
>
  {#if !mobileSearchOpen}
    <!-- Hamburger (mobile only) — toggles the sidebar drawer.
         Visibility owned by .tb-icbtn's media query, not `md:hidden`. -->
    <button
      type="button"
      class="tb-icbtn"
      onclick={() => mobileDrawer.toggle()}
      aria-label="Abrir menu"
    >
      <Menu class="h-5 w-5" />
    </button>

    <!-- Breadcrumbs (desktop) -->
    <div class="hidden md:flex items-center gap-2 flex-shrink-0">
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

    <!-- Mobile page title (replaces breadcrumb trail). Same red-dot prefix
         and mono treatment so it reads as part of the same family. -->
    <div class="flex md:hidden items-center gap-2 flex-1 min-w-0">
      <span class="h-1.5 w-1.5 bg-[var(--color-red)] flex-shrink-0"></span>
      <span
        class="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text)] font-semibold truncate"
      >
        {pageTitle}
      </span>
    </div>
  {/if}

  <!-- Global search. On desktop it's inline (flex-1). On mobile it's hidden
       and replaced by a search icon button; tapping the icon flips
       `mobileSearchOpen` and re-shows the search taking over the row. -->
  <div class="hidden md:flex flex-1 min-w-0">
    <GlobalSearch />
  </div>

  {#if mobileSearchOpen}
    <div class="flex md:hidden flex-1 min-w-0">
      <GlobalSearch />
    </div>
    <button
      type="button"
      class="tb-icbtn flex-shrink-0"
      onclick={() => (mobileSearchOpen = false)}
      aria-label="Fechar pesquisa"
    >
      <X class="h-5 w-5" />
    </button>
  {/if}

  <!-- Actions row (right). Hidden on mobile while the search overlay is
       expanded so the search input gets the full width. -->
  {#if !mobileSearchOpen}
    <div class="flex items-center gap-2 flex-shrink-0 ml-auto">
      <!-- Mobile-only search icon button (replaces inline search field). -->
      <button
        type="button"
        class="tb-icbtn"
        onclick={() => (mobileSearchOpen = true)}
        aria-label="Pesquisar"
      >
        <BrandSearch class="h-4 w-4" />
      </button>

      <!-- Theme toggle and Export: desktop only. Theme lives inside the
           sidebar drawer on mobile via the user-footer (future), Export is
           rarely the primary action on a phone. -->
      <div class="hidden md:inline-flex">
        <ThemeToggle size={38} />
      </div>

      <button
        type="button"
        class="hidden md:inline-flex items-center justify-center h-[38px] w-[38px] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
        style="border-radius: var(--radius-btn);"
        aria-label="Exportar"
      >
        <BrandDl class="h-4 w-4" />
      </button>

      <NotificationBell />

      {#if showAddVehicle}
        <!-- Desktop: full red CTA with italic uppercase label. Mobile:
             icon-only red square so the brand red still anchors the topbar
             without consuming a label's worth of width. -->
        <a
          href="/viaturas/nova"
          class="hidden md:inline-flex items-center gap-2 h-[38px] px-[18px] font-display font-semibold italic uppercase text-[13px] tracking-[0.01em] text-white bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] transition-colors"
          style="border-radius: var(--radius-btn);"
        >
          <BrandPlus class="h-4 w-4" />
          Adicionar Viatura
        </a>
        <a
          href="/viaturas/nova"
          class="inline-flex md:hidden items-center justify-center h-10 w-10 text-white bg-[var(--color-red)] hover:bg-[var(--color-red-soft)] transition-colors"
          style="border-radius: var(--radius-btn);"
          aria-label="Adicionar viatura"
        >
          <BrandPlus class="h-4 w-4" />
        </a>
      {/if}
    </div>
  {/if}
</header>

<style>
  /*
    Shared icon-button used for the hamburger, mobile search trigger, and
    the in-search X — all of which are mobile-only by design.

    Visibility is owned here (not via Tailwind's `md:hidden`) because the
    Svelte-scoped `.tb-icbtn.svelte-xxx` selector has higher specificity
    than a flat utility class, so its `display: inline-flex` would beat
    `md:hidden` and the buttons would leak onto desktop.

    40px tap target — close enough to the Apple HIG ≥ 44 target on touch,
    and consistent with the topbar's mobile visual rhythm.
  */
  .tb-icbtn {
    display: none;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    border-radius: var(--radius-btn);
    flex-shrink: 0;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
  }
  @media (max-width: 767px) {
    .tb-icbtn {
      display: inline-flex;
    }
  }
  .tb-icbtn:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    background: rgba(255, 255, 255, 0.025);
  }
  :global([data-theme='light']) .tb-icbtn:hover {
    background: rgba(0, 0, 0, 0.025);
  }
</style>
