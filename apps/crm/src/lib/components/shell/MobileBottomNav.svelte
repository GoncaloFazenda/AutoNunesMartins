<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import { page } from '$app/stores';
  import BrandDash from '$lib/components/brand/icons/BrandDash.svelte';
  import BrandCar from '$lib/components/brand/icons/BrandCar.svelte';
  import BrandUsers from '$lib/components/brand/icons/BrandUsers.svelte';
  import BrandDeal from '$lib/components/brand/icons/BrandDeal.svelte';
  import BrandChart from '$lib/components/brand/icons/BrandChart.svelte';
  import { quickTask } from '$lib/stores/quickTask';
  import type { IconComponent } from '$lib/types/ui';

  interface Props {
    /** Active vehicles (same source as sidebar). Quiet chip. */
    vehicleCount?: number | null;
    /** Active tasks (same source as sidebar). Red alert chip. */
    taskCount?: number | null;
  }

  let { vehicleCount = null, taskCount = null }: Props = $props();

  interface Item {
    href: string;
    label: string;
    icon: IconComponent;
    badge?: () => number | null;
    badgeTone?: 'dim' | 'alert';
  }

  const items: Item[] = [
    { href: '/dashboard', label: 'Painel', icon: BrandDash },
    { href: '/viaturas', label: 'Viaturas', icon: BrandCar, badge: () => vehicleCount },
    { href: '/clientes', label: 'Clientes', icon: BrandUsers },
    {
      href: '/tarefas',
      label: 'Tarefas',
      icon: BrandDeal,
      badge: () => taskCount,
      badgeTone: 'alert',
    },
    { href: '/financeiro', label: 'Finanças', icon: BrandChart },
  ];

  function isActive(href: string, current: string): boolean {
    return current === href || current.startsWith(href + '/');
  }
</script>

<!--
  Bottom navigation — visible below md only. Sits above the red wedge (z:3),
  below the mobile sidebar drawer (z:40) so the drawer overlays everything.

  Active item gets a 2px red top-rail with the same glow shadow as the
  sidebar's left-rail active state — keeps a single brand language across
  the two navigation surfaces.
-->
<nav class="bottom-nav" aria-label="Navegação principal">
  {#each items as item (item.href)}
    {@const active = isActive(item.href, $page.url.pathname)}
    {@const badge = item.badge?.() ?? null}
    {@const tone = item.badgeTone ?? 'dim'}
    {@const isTasks = item.href === '/tarefas'}
    <!--
      Tasks cell carries a small "+" affordance in addition to the link:
      tap on the cell navigates as usual; tap on the "+" opens the
      Quick Task panel inline without leaving the current page. The "+"
      is a sibling button (not nested in the <a>) so the two tap targets
      don't conflict.
    -->
    <div class="bn-cell" class:bn-cell-tasks={isTasks}>
      <a href={item.href} class="bn-item" class:bn-item-active={active}>
        <span class="bn-icon-wrap">
          <item.icon class="bn-icon" />
          {#if badge !== null && badge > 0 && !isTasks}
            <!-- Tasks cell drops the count badge in favour of the "+" affordance
                 (rendered as a sibling button below) — the count is still
                 visible on the sidebar and the /tarefas page. -->
            <span
              class="bn-badge"
              class:bn-badge-alert={tone === 'alert'}
              aria-label={`${badge} ${item.label.toLowerCase()}`}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          {/if}
        </span>
        <span class="bn-label">{item.label}</span>
      </a>
      {#if isTasks}
        <button
          type="button"
          class="bn-quick-add"
          aria-label="Nova tarefa rápida"
          onpointerdown={(e) => e.stopPropagation()}
          onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            quickTask.open();
          }}
        >
          <Plus class="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      {/if}
    </div>
  {/each}
</nav>

<style>
  /*
    Hidden by default; only renders below md. Visibility is owned here
    (not via Tailwind's `md:hidden`) because Svelte's scoped class selector
    has higher specificity than a flat utility class, so the component's
    own `display` value would otherwise override `md:hidden` on desktop.
  */
  .bottom-nav {
    display: none;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    grid-template-columns: repeat(5, 1fr);
    background: linear-gradient(180deg, #0a0a0b 0%, #0e0e10 100%);
    border-top: 1px solid var(--color-border);
    /*
      Respect the iOS home-indicator safe area. On devices without one,
      env() evaluates to 0 and the nav has a clean 8px bottom rhythm.
    */
    padding-bottom: env(safe-area-inset-bottom, 0);
    /*
      Sit above the red wedge (z:3) so the wedge doesn't peek out from the
      right edge of the bar, but below the sidebar drawer (z:40) so the
      drawer overlays the nav when open.
    */
    box-shadow: 0 -8px 24px -12px rgba(0, 0, 0, 0.6);
  }
  :global([data-theme='light']) .bottom-nav {
    background: linear-gradient(180deg, #fafaf6 0%, #f4f2ee 100%);
    box-shadow: 0 -8px 24px -16px rgba(0, 0, 0, 0.15);
  }

  /*
    Each grid cell wraps the link plus (for Tasks) the "+" affordance.
    Position relative so the absolutely-positioned "+" anchors to the cell.
  */
  .bn-cell {
    position: relative;
    /* Promote to its own stacking context so .bn-quick-add reliably sits
       above .bn-item even if some browsers paint relative-positioned
       siblings differently. */
    z-index: 0;
  }
  .bn-cell > .bn-item {
    width: 100%;
    /* Explicit lower stacking so the "+" button (z-index: 2) is unambiguously
       on top and receives clicks. */
    z-index: 1;
  }

  /*
    "+" affordance on the Tasks cell — opens the Quick Task panel without
    navigating. Sits in the upper-right of the cell, roughly where the
    count badge lives on the other items. Red brand fill so it reads as
    a primary action, not a status indicator.

    Tap target is enlarged via a transparent ::before so the visible 22px
    pill is easy to hit (touch guidelines want ~40px).
  */
  .bn-quick-add {
    position: absolute;
    top: 4px;
    right: 12px;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-red);
    color: #fff;
    border: 0;
    border-radius: 999px;
    padding: 0;
    box-shadow: 0 2px 8px color-mix(in oklab, var(--color-red) 45%, transparent);
    z-index: 3;
    cursor: pointer;
    /* Claim the tap so the OS doesn't try to scroll or activate the
       underlying link in the same gesture. */
    touch-action: manipulation;
    transition:
      transform 0.16s var(--ease-brand),
      background-color 0.18s var(--ease-brand),
      box-shadow 0.18s var(--ease-brand);
  }
  .bn-quick-add::before {
    /* Invisible hit-area extension — adds ~10px in every direction so the
       button is reliably tappable without inflating its visible footprint. */
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 999px;
  }
  @media (hover: hover) and (pointer: fine) {
    .bn-quick-add:hover {
      background: var(--color-red-soft);
      box-shadow: 0 3px 12px color-mix(in oklab, var(--color-red) 60%, transparent);
    }
  }
  .bn-quick-add:active {
    transform: scale(0.88);
    transition-duration: 0.08s;
  }
  @media (max-width: 767px) {
    .bottom-nav {
      display: grid;
    }
  }

  .bn-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 56px;
    color: var(--color-text-muted);
    text-decoration: none;
    /* Stretch the active rail to the full cell width by removing default
       button/anchor inline-block oddities. */
    width: 100%;
    transition: color 0.12s, background-color 0.12s;
  }
  .bn-item:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.025);
  }
  :global([data-theme='light']) .bn-item:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  .bn-item:active {
    background: rgba(255, 255, 255, 0.04);
  }

  .bn-item-active {
    color: var(--color-text);
  }
  .bn-item-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    height: 2px;
    background: var(--color-red);
    box-shadow: 0 0 10px color-mix(in oklab, var(--color-red) 50%, transparent);
  }
  .bn-item-active :global(.bn-icon) {
    color: var(--color-red);
  }

  .bn-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  :global(.bn-icon) {
    width: 22px;
    height: 22px;
    color: inherit;
  }

  .bn-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    line-height: 1;
  }

  /*
    Badge — anchored top-right of the icon, not the cell. Uses the same
    dim/alert tone language as the sidebar so the two surfaces feel like
    one system. Min-width keeps single digits round; double digits stretch
    into a pill, "99+" caps the visible width.
  */
  .bn-badge {
    position: absolute;
    top: -6px;
    right: -10px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    font-weight: 600;
    line-height: 1;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }
  :global([data-theme='light']) .bn-badge {
    background: rgba(15, 15, 17, 0.12);
  }
  .bn-badge-alert {
    background: var(--color-red);
    color: #fff;
  }
</style>
