<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import RedWedge from '$lib/components/brand/RedWedge.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import Topbar from '$lib/components/shell/Topbar.svelte';
  import MobileBottomNav from '$lib/components/shell/MobileBottomNav.svelte';
  import { sidebar, mobileDrawer } from '$lib/stores/sidebar';
  import type { LayoutData } from './$types';

  interface Props {
    children?: import('svelte').Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();

  onMount(() => {
    sidebar.hydrate();
  });

  // Lock the body scroll while the mobile drawer is open. Adds a class on
  // <html> rather than mutating inline styles so the lock survives HMR and
  // route changes cleanly.
  $effect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('drawer-open', $mobileDrawer);
    return () => document.documentElement.classList.remove('drawer-open');
  });

  // Auto-close the drawer when navigation occurs — prevents the drawer
  // staying open on the next page after tapping a nav link.
  let lastPath = $state($page.url.pathname);
  $effect(() => {
    if ($page.url.pathname !== lastPath) {
      lastPath = $page.url.pathname;
      mobileDrawer.close();
    }
  });

  // Escape key closes the mobile drawer from anywhere.
  $effect(() => {
    if (!$mobileDrawer) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') mobileDrawer.close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<RedWedge />

<Sidebar
  vehicleCount={data.vehicleStats?.active ?? null}
  taskCount={data.taskStats?.mineActive ?? null}
/>

<!--
  Mobile drawer backdrop. Only visible below md, only when the drawer is
  open. Tap to dismiss. Sits between the main content (z-10) and the
  sidebar (z-5 desktop, z-40 mobile) so the sidebar floats above it.
-->
{#if $mobileDrawer}
  <button
    type="button"
    class="drawer-backdrop"
    aria-label="Fechar menu"
    onclick={() => mobileDrawer.close()}
  ></button>
{/if}

<div class="main-area relative">
  <div class="header-ambient absolute inset-0 pointer-events-none"></div>
  <div class="relative z-10">
    <Topbar />
    <main class="main-content px-6 pb-12 pr-[24px]">
      {@render children?.()}
    </main>
  </div>
</div>

<MobileBottomNav
  vehicleCount={data.vehicleStats?.active ?? null}
  taskCount={data.taskStats?.mineActive ?? null}
/>

<style>
  /* Sidebar is `position: fixed`; main content lives to its right with a
     left padding that matches the sidebar width. The width is driven by a
     CSS variable so the collapse toggle animates smoothly. */
  :global(html) {
    --sidebar-w: 240px;
    --sidebar-w-collapsed: 68px;
    --sidebar-w-mobile: 280px;
  }
  .main-area {
    background: var(--color-bg-0);
    overflow-x: hidden;
    margin-left: var(--sidebar-w);
    min-height: 100vh;
    transition: margin-left 0.2s var(--ease-brand);
  }
  :global(html[data-sidebar='collapsed']) .main-area {
    margin-left: var(--sidebar-w-collapsed);
  }

  /* Below md: the sidebar becomes an off-canvas drawer, so the main area
     takes the full viewport width. Padding tightens too — 24px is too much
     when total width is ~360px. The bottom-padding clears the fixed
     MobileBottomNav (56px nav + iOS safe-area). */
  @media (max-width: 767px) {
    .main-area {
      margin-left: 0;
    }
    .main-content {
      padding-left: 16px;
      padding-right: 16px;
      padding-bottom: calc(72px + env(safe-area-inset-bottom, 0));
    }
  }

  /* Backdrop sits above main content but below the drawer itself. */
  :global(.drawer-backdrop) {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    border: 0;
    padding: 0;
    cursor: pointer;
    animation: drawer-fade-in 0.18s var(--ease-brand);
  }
  :global([data-theme='light']) :global(.drawer-backdrop) {
    background: rgba(20, 20, 24, 0.45);
  }
  @keyframes drawer-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Body scroll lock while the drawer is open. */
  :global(html.drawer-open),
  :global(html.drawer-open body) {
    overflow: hidden;
  }
</style>
