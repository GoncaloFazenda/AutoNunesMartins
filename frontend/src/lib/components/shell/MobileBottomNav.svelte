<script lang="ts">
  import { page } from '$app/stores';
  import BrandDash from '$lib/components/brand/icons/BrandDash.svelte';
  import BrandCar from '$lib/components/brand/icons/BrandCar.svelte';
  import BrandUsers from '$lib/components/brand/icons/BrandUsers.svelte';
  import BrandDeal from '$lib/components/brand/icons/BrandDeal.svelte';
  import BrandChart from '$lib/components/brand/icons/BrandChart.svelte';
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
    <a href={item.href} class="bn-item" class:bn-item-active={active}>
      <span class="bn-icon-wrap">
        <item.icon class="bn-icon" />
        {#if badge !== null && badge > 0}
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
