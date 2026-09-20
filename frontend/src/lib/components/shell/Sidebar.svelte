<script lang="ts">
  import { page } from '$app/stores';
  import { Activity, ChevronLeft } from 'lucide-svelte';
  import type { IconComponent } from '$lib/types/ui';
  // Hand-drawn icons from the index.html prototype's `I.*` library
  // (same look/feel as the dashboard KPI icons).
  import BrandDash from '$lib/components/brand/icons/BrandDash.svelte';
  import BrandCar from '$lib/components/brand/icons/BrandCar.svelte';
  import BrandUsers from '$lib/components/brand/icons/BrandUsers.svelte';
  import BrandDeal from '$lib/components/brand/icons/BrandDeal.svelte';
  import BrandChart from '$lib/components/brand/icons/BrandChart.svelte';
  import BrandDoc from '$lib/components/brand/icons/BrandDoc.svelte';
  import BrandReceipt from '$lib/components/brand/icons/BrandReceipt.svelte';
  import BrandSet from '$lib/components/brand/icons/BrandSet.svelte';
  import BrandLogout from '$lib/components/brand/icons/BrandLogout.svelte';
  import { SignOutButton, useClerkContext } from 'svelte-clerk';
  import Wordmark from '$lib/components/brand/Wordmark.svelte';
  import { sidebar, mobileDrawer } from '$lib/stores/sidebar';

  const ctx = useClerkContext();

  interface Props {
    /**
     * Active-vehicle count shown as a small badge next to "Viaturas".
     * Active = AVAILABLE + RESERVED + DOCS_PENDING (everything still in
     * stock). Excludes SOLD and DELIVERED. Null hides the badge.
     */
    vehicleCount?: number | null;
    /**
     * Active task count shown as a red badge next to "Tarefas". Includes
     * tasks assigned to the current user OR unassigned ("general"),
     * status TODO + IN_PROGRESS (excludes DONE). Null hides the badge.
     */
    taskCount?: number | null;
  }

  let { vehicleCount = null, taskCount = null }: Props = $props();

  interface NavItem {
    href: string;
    label: string;
    /** Either a Brand* SVG component or a lucide icon — see IconComponent union. */
    icon: IconComponent;
    /** Returns the badge count for this item, or null to hide it. */
    badge?: () => number | null;
    /**
     * Visual tone of the badge:
     *   'dim'   — muted gray chip (passive count, e.g. inventory size)
     *   'alert' — brand-red chip (action-required, e.g. open tasks)
     * Defaults to 'dim'.
     */
    badgeTone?: 'dim' | 'alert';
  }

  interface NavSection {
    heading: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      heading: 'Operação',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: BrandDash },
        { href: '/viaturas', label: 'Viaturas', icon: BrandCar, badge: () => vehicleCount },
        // Sits between Viaturas and Clientes to mirror the natural workflow:
        // first the car enters inventory, then it gets sold, then the buyer
        // shows up in the customer registry.
        { href: '/vendas', label: 'Vendas', icon: BrandReceipt },
        { href: '/clientes', label: 'Clientes', icon: BrandUsers },
        {
          href: '/tarefas',
          label: 'Tarefas',
          icon: BrandDeal,
          badge: () => taskCount,
          badgeTone: 'alert',
        },
      ],
    },
    {
      heading: 'Finanças',
      items: [{ href: '/financeiro', label: 'Financeiro', icon: BrandChart }],
    },
    {
      heading: 'Histórico',
      // Keep the lucide Activity icon here — it's the same one used in the
      // activity log feed which the user wants preserved.
      items: [{ href: '/atividade', label: 'Atividade', icon: Activity }],
    },
    {
      heading: 'Recursos',
      items: [
        { href: '/guia', label: 'Guia de Fluxo', icon: BrandDoc },
        { href: '/definicoes', label: 'Definições', icon: BrandSet },
      ],
    },
  ];

  // Prefer the explicit username; fall back to the user's full name, else
  // first name. (Avoids showing the email-prefix as a name.)
  const userName = $derived(
    ctx.user?.username
      ?? ctx.user?.fullName
      ?? ctx.user?.firstName
      ?? 'Admin',
  );
  const initials = $derived.by(() => {
    return userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  // Clerk's `imageUrl` is always populated (it returns a generated default if
  // no photo is uploaded). `hasImage` is true only when the user actually
  // uploaded a real picture — gate on that so we don't show Clerk's generic
  // colored chip when we'd rather use our branded red gradient + initials.
  const avatarUrl = $derived(
    ctx.user?.hasImage ? (ctx.user?.imageUrl ?? null) : null,
  );

  function isActive(href: string, current: string): boolean {
    return current === href || current.startsWith(href + '/');
  }

  const collapsed = $derived($sidebar === 'collapsed');
  const mobileOpen = $derived($mobileDrawer);
</script>

<!--
  Sidebar collapse/expand animation:

  • The container animates its `width` between two CSS variables.
  • All inner items use a fixed *expanded-width* inner box (`.sidebar-inner`)
    and `overflow: hidden` on the container clips the right side as the
    sidebar narrows. This avoids any text reflow during the transition —
    icons stay put, labels just get clipped + faded.
  • Icons are pinned at a horizontal position that happens to coincide with
    the center of the collapsed sidebar (padding-left = (68-18)/2 ≈ 25px),
    so the icon doesn't translate when collapsing/expanding.
  • Labels fade via opacity; they never change width, never wrap.
-->

<aside class="sidebar" class:collapsed class:mobile-open={mobileOpen} aria-hidden={!mobileOpen ? undefined : 'false'}>
  <div class="sidebar-inner">
    <!--
      Brand block:
        • The wordmark is a link to /dashboard — clicking the logo from any
          page returns to the panel home.
        • The collapse toggle lives in the top-right corner of this row. It
          stays inside the sidebar (no overflow clipping) and is always
          visible: when expanded it sits next to the wordmark; when
          collapsed it occupies the center of the 68px-wide column.
    -->
    <div class="brand-block">
      <a
        href="/dashboard"
        class="brand-link"
        aria-label="Ir para o painel"
        title="Ir para o painel"
      >
        <div class="brand-content">
          <Wordmark size="sm" />
        </div>
      </a>
      <button
        type="button"
        onclick={() => sidebar.toggle()}
        class="sidebar-toggle"
        title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        aria-pressed={collapsed ? 'false' : 'true'}
      >
        <ChevronLeft class="h-4 w-4 toggle-icon" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="nav-scroll">
      {#each sections as section (section.heading)}
        <div class="nav-section">
          <div class="nav-heading">{section.heading}</div>
          {#each section.items as item (item.href)}
            {@const active = isActive(item.href, $page.url.pathname)}
            {@const badge = item.badge?.() ?? null}
            {@const tone = item.badgeTone ?? 'dim'}
            <a
              href={item.href}
              class="nav-item"
              class:nav-item-active={active}
              title={collapsed ? item.label : undefined}
            >
              <item.icon class="nav-icon h-[18px] w-[18px] flex-shrink-0" />
              <span class="nav-label">{item.label}</span>
              {#if badge !== null && badge > 0}
                <span
                  class="nav-badge"
                  class:nav-badge-active={active}
                  class:nav-badge-alert={tone === 'alert'}
                >
                  {badge}
                </span>
              {/if}
            </a>
          {/each}
        </div>
      {/each}
    </nav>

    <!-- User footer -->
    <div class="user-footer">
      <div class="user-avatar" title={collapsed ? userName : undefined}>
        {#if avatarUrl}
          <img src={avatarUrl} alt={userName} referrerpolicy="no-referrer" />
        {:else}
          <span class="user-avatar-initials">{initials || 'A'}</span>
        {/if}
        <span class="user-presence"></span>
      </div>
      <div class="user-meta">
        <div class="user-name">{userName}</div>
        <div class="user-role">Gerente</div>
      </div>
      <SignOutButton class="sign-out">
        <BrandLogout class="h-4 w-4" />
      </SignOutButton>
    </div>
  </div>

  <!--
    The toggle button used to live as a floating chip on the sidebar's right
    edge, but because the sidebar uses `overflow: hidden` (so the inner box
    clips during collapse) the chip got cut in half. The toggle now lives in
    the topbar (top-left, before the breadcrumbs) where it's always fully
    visible and accessible from any page.
  -->
</aside>

<style>
  /* ─── Container ─────────────────────────────────────────────────────── */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--sidebar-w, 240px);
    background: linear-gradient(180deg, #0a0a0b 0%, #0e0e10 100%);
    border-right: 1px solid var(--color-border);
    z-index: 5;
    overflow: hidden; /* clip the inner expanded box when collapsed */
    transition: width 0.22s var(--ease-brand);
  }
  .sidebar.collapsed {
    width: var(--sidebar-w-collapsed, 68px);
  }
  :global([data-theme='light']) .sidebar {
    background: linear-gradient(180deg, #fafaf6 0%, #f4f2ee 100%);
  }

  /*
    ─── Mobile drawer mode ─────────────────────────────────────────────
    Below md: the sidebar is a fixed off-canvas drawer. It's always at its
    expanded width regardless of the desktop `.collapsed` class (collapse is
    desktop-only), and slides in/out via translateX. Sits above the
    backdrop (which is z-30) so it overlays everything.
  */
  @media (max-width: 767px) {
    .sidebar,
    .sidebar.collapsed {
      width: var(--sidebar-w-mobile, 280px);
      transform: translateX(-100%);
      transition: transform 0.22s var(--ease-brand);
      z-index: 40;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
    }
    .sidebar.mobile-open,
    .sidebar.collapsed.mobile-open {
      transform: translateX(0);
    }
    /* While a swipe gesture is in progress, drop the transition and drive
       position from --drawer-drag-x (set on <html> by the layout). The var
       is a negative px value: 0 = fully open, -<drawer-width>px = closed. */
    :global(html.drawer-dragging) .sidebar,
    :global(html.drawer-dragging) .sidebar.mobile-open,
    :global(html.drawer-dragging) .sidebar.collapsed,
    :global(html.drawer-dragging) .sidebar.collapsed.mobile-open {
      transform: translateX(var(--drawer-drag-x, 0));
      transition: none;
    }
    /* Inner box is the mobile width too — no clipping needed since
       collapse doesn't apply below md. */
    .sidebar .sidebar-inner,
    .sidebar.collapsed .sidebar-inner {
      width: var(--sidebar-w-mobile, 280px);
    }
    /* Hide the desktop collapse chevron — drawer toggle lives in topbar. */
    .sidebar-toggle {
      display: none;
    }
    /* Brand block reclaims the right padding since toggle is gone. */
    .brand-block {
      padding: 18px 22px;
    }
    /* Force expanded-state visibility on inner items regardless of the
       `.collapsed` class (which is desktop-only state). */
    .sidebar.collapsed .brand-content,
    .sidebar.collapsed .nav-heading,
    .sidebar.collapsed .nav-label,
    .sidebar.collapsed .nav-badge,
    .sidebar.collapsed .user-meta {
      opacity: 1;
      pointer-events: auto;
    }
    .sidebar.collapsed :global(.sign-out) {
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Inner box keeps the EXPANDED width even when the sidebar is collapsed —
     so nothing inside reflows. The container's overflow:hidden clips it. */
  .sidebar-inner {
    width: var(--sidebar-w, 240px);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ─── Brand block ───────────────────────────────────────────────────── */
  .brand-block {
    position: relative;
    /* Reserve space on the right for the absolutely-positioned toggle so
       the wordmark never overlaps it in the expanded state. */
    padding: 18px 56px 18px 22px;
    border-bottom: 1px solid var(--color-border);
    min-height: 72px;
    display: flex;
    align-items: center;
  }
  .brand-link {
    display: block;
    min-width: 0;
    flex: 1;
    color: inherit;
    text-decoration: none;
    border-radius: var(--radius-btn);
    transition: opacity 0.12s;
  }
  .brand-link:hover {
    opacity: 0.85;
  }
  .brand-link:focus-visible {
    outline: 2px solid var(--color-red);
    outline-offset: 4px;
  }
  .brand-content {
    transition: opacity 0.15s ease;
  }
  .sidebar.collapsed .brand-content {
    opacity: 0;
    pointer-events: none;
  }

  /*
    ─── Collapse/expand toggle ─────────────────────────────────────────
    The toggle is ALWAYS absolutely positioned. Its `left` value animates
    in sync with the sidebar's width transition:
      • Expanded  → near the right edge of the brand block (~pixel 200)
      • Collapsed → dead center of the 68px collapsed column (pixel 18)
    This way the button slides smoothly between positions instead of
    snapping when the class changes.
  */
  .sidebar-toggle {
    position: absolute;
    top: 50%;
    /* 16px = half the button's height (32 / 2) */
    transform: translateY(-50%);
    /* Expanded: 240 inner width − 22 right-padding − 32 button = ~186px,
       rounded to 188 for a tiny visual breathing margin. */
    left: calc(var(--sidebar-w, 240px) - 52px);
    height: 32px;
    width: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-btn);
    cursor: pointer;
    transition:
      left 0.22s var(--ease-brand),
      color 0.12s,
      border-color 0.12s,
      background 0.12s;
  }
  .sidebar.collapsed .sidebar-toggle {
    /* Centered in the 68px collapsed column. (68/2 − 32/2 = 18) */
    left: calc(var(--sidebar-w-collapsed, 68px) / 2 - 16px);
  }
  .sidebar-toggle:hover {
    color: var(--color-red);
    border-color: var(--color-red);
    background: color-mix(in oklab, var(--color-red) 6%, transparent);
  }
  .sidebar-toggle:focus-visible {
    outline: 2px solid var(--color-red);
    outline-offset: 2px;
  }
  .toggle-icon {
    transition: transform 0.22s var(--ease-brand);
  }
  .sidebar.collapsed .toggle-icon {
    /* Flip the chevron so it points right (= "expand") when collapsed. */
    transform: rotate(180deg);
  }

  /* ─── Nav ───────────────────────────────────────────────────────────── */
  .nav-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
  }
  .nav-section {
    margin-bottom: 20px;
  }
  .nav-heading {
    padding: 0 26px;
    margin-bottom: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    white-space: nowrap;
    transition: opacity 0.15s ease;
  }
  .sidebar.collapsed .nav-heading {
    opacity: 0;
    pointer-events: none;
  }

  .nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    /* padding-left chosen so the 18px icon centers in the 68px collapsed
       width: (68 - 18) / 2 = 25px. Icon never moves between states. */
    padding: 10px 16px 10px 25px;
    color: var(--color-text-muted);
    font-size: 13.5px;
    white-space: nowrap;
    transition: color 0.12s, background-color 0.12s;
  }
  .nav-item:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.025);
  }
  .nav-item-active {
    color: var(--color-text);
    font-weight: 600;
    background: color-mix(in oklab, var(--color-red) 8%, transparent);
  }
  .nav-item-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-red);
    box-shadow: 0 0 10px color-mix(in oklab, var(--color-red) 50%, transparent);
  }

  .nav-label {
    transition: opacity 0.15s ease;
  }
  .sidebar.collapsed .nav-label {
    opacity: 0;
    pointer-events: none;
  }

  /*
    Subtle count chip next to a nav item — matches the prototype's
    `.sb-item .badge.dim` variant. Not a notification: just a quiet
    monospace number showing inventory size. Faint white-tinted background,
    muted text, sharp 2px corners. Brightens slightly when the row is
    active (hovered or current page) but never goes red.
  */
  .nav-badge {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--color-text-muted);
    border-radius: 2px;
    transition: opacity 0.15s ease, color 0.12s, background 0.12s;
    flex-shrink: 0;
  }
  .nav-item:hover .nav-badge {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.09);
  }
  .nav-badge.nav-badge-active {
    background: rgba(255, 255, 255, 0.08);
    color: var(--color-text);
  }
  :global([data-theme='light']) .nav-badge {
    background: rgba(15, 15, 17, 0.06);
    color: var(--color-text-muted);
  }
  :global([data-theme='light']) .nav-item:hover .nav-badge {
    background: rgba(15, 15, 17, 0.1);
    color: var(--color-text);
  }
  :global([data-theme='light']) .nav-badge.nav-badge-active {
    background: rgba(15, 15, 17, 0.08);
    color: var(--color-text);
  }
  .sidebar.collapsed .nav-badge {
    opacity: 0;
    pointer-events: none;
  }

  /*
    Alert tone — brand red on white. Used for "action required" counts like
    your open tasks. Overrides the dim defaults; the typography (mono 10px /
    weight 500 / 2px corners) stays consistent.
  */
  .nav-badge-alert {
    background: var(--color-red) !important;
    color: #fff !important;
    font-weight: 600;
  }
  .nav-item:hover .nav-badge-alert {
    background: var(--color-red-soft) !important;
  }
  .nav-badge-alert.nav-badge-active {
    background: var(--color-red) !important;
    color: #fff !important;
  }

  /* ─── User footer ───────────────────────────────────────────────────── */
  .user-footer {
    border-top: 1px solid var(--color-border);
    padding: 14px 16px 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .user-avatar {
    position: relative;
    height: 36px;
    width: 36px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-btn);
    overflow: hidden;
    /* Red gradient acts as the fallback background behind the initials when
       no Clerk photo is available; the <img> overlays it edge-to-edge when
       one is. */
    background: linear-gradient(135deg, var(--color-red) 0%, var(--color-red-deep) 100%);
    /* Subtle ring so the photo doesn't melt into the dark footer background. */
    box-shadow: 0 0 0 1px var(--color-border);
  }
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .user-avatar-initials {
    font-family: 'Barlow', system-ui, sans-serif;
    font-weight: 900;
    font-style: italic;
    font-size: 14px;
    color: #fff;
    /* tiny optical balance — italic shifts characters right of center */
    letter-spacing: -0.02em;
  }
  .user-presence {
    position: absolute;
    top: -2px;
    right: -2px;
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: var(--color-success);
    border: 2px solid var(--color-bg-0);
  }
  .user-meta {
    min-width: 0;
    flex: 1;
    transition: opacity 0.15s ease;
  }
  .sidebar.collapsed .user-meta {
    opacity: 0;
    pointer-events: none;
  }
  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-faint);
  }
  :global(.sign-out) {
    color: var(--color-text-muted);
    padding: 8px;
    transition: color 0.12s, opacity 0.15s ease;
    flex-shrink: 0;
  }
  :global(.sign-out:hover) {
    color: var(--color-red);
  }
  .sidebar.collapsed :global(.sign-out) {
    opacity: 0;
    pointer-events: none;
  }

  /* Hide scrollbars but keep scroll behaviour */
  .nav-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
</style>
