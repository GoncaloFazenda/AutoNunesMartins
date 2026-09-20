<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import CrmBrandHead from '$lib/components/brand/CrmBrandHead.svelte';
  import RedWedge from '$lib/components/brand/RedWedge.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import Topbar from '$lib/components/shell/Topbar.svelte';
  import MobileBottomNav from '$lib/components/shell/MobileBottomNav.svelte';
  import QuickTaskBubble from '$lib/components/shell/QuickTaskBubble.svelte';
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

  /*
    ─── Mobile drawer swipe gestures ──────────────────────────────────────
    Native-feeling drag-to-open / drag-to-close for the sidebar drawer.

    State machine:
      idle → pending-open  (touch landed in left 20px while drawer closed)
      idle → pending-close (any touch while drawer open)
      pending-* → opening|closing once horizontal intent is confirmed
                  (>8px horizontal AND horizontal > vertical AND correct direction)
      opening|closing → idle on touchend, with snap-open or snap-close
                        based on distance/velocity thresholds.

    During the active drag phase we:
      • Add `drawer-dragging` to <html> — CSS in Sidebar/layout disables
        the transform transition and drives position from --drawer-drag-x.
      • For opening: open the store immediately so the backdrop mounts;
        if the gesture is cancelled mid-drag, close it again on touchend.
      • preventDefault on touchmove to stop the page from scrolling
        sideways while the drawer is being dragged.

    Caveat: on iOS Safari (non-PWA) the very-left edge is owned by the
    system back-gesture, so the first ~5px may not register. Users can
    still grab from 5-20px in.
  */
  const EDGE_SIZE = 20;
  const COMMIT_DISTANCE_RATIO = 0.4;
  const COMMIT_VELOCITY = 0.3;
  const DIRECTION_LOCK = 8;

  onMount(() => {
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let drawerWidth = 280;
    let mode: 'idle' | 'pending-open' | 'pending-close' | 'opening' | 'closing' = 'idle';

    function readDrawerWidth(): number {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--sidebar-w-mobile')
        .trim();
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : 280;
    }

    function reset() {
      document.documentElement.classList.remove('drawer-dragging');
      document.documentElement.style.removeProperty('--drawer-drag-x');
      document.documentElement.style.removeProperty('--drawer-drag-progress');
      mode = 'idle';
    }

    function onTouchStart(e: TouchEvent) {
      if (window.innerWidth >= 768) return;
      if (e.touches.length !== 1) {
        reset();
        return;
      }
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = t.clientY;
      lastT = performance.now();
      velocity = 0;
      drawerWidth = readDrawerWidth();

      const isOpen = get(mobileDrawer);
      if (!isOpen) {
        mode = startX < EDGE_SIZE ? 'pending-open' : 'idle';
      } else {
        mode = 'pending-close';
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (mode === 'idle') return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (mode === 'pending-open' || mode === 'pending-close') {
        if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          mode = 'idle';
          return;
        }
        if (mode === 'pending-open' && dx <= 0) {
          mode = 'idle';
          return;
        }
        if (mode === 'pending-close' && dx >= 0) {
          mode = 'idle';
          return;
        }
        mode = mode === 'pending-open' ? 'opening' : 'closing';
        document.documentElement.classList.add('drawer-dragging');
        if (mode === 'opening') mobileDrawer.open();
      }

      if (mode === 'opening' || mode === 'closing') {
        e.preventDefault();
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        velocity = (t.clientX - lastX) / dt;
        lastX = t.clientX;
        lastT = now;

        let translateX: number;
        if (mode === 'opening') {
          // dx is positive going right; map [0..drawerWidth] → [-drawerWidth..0]
          translateX = Math.min(0, Math.max(-drawerWidth, dx - drawerWidth));
        } else {
          // dx is negative going left; map [-drawerWidth..0] → [-drawerWidth..0]
          translateX = Math.min(0, Math.max(-drawerWidth, dx));
        }
        const progress = (drawerWidth + translateX) / drawerWidth;
        document.documentElement.style.setProperty('--drawer-drag-x', `${translateX}px`);
        document.documentElement.style.setProperty('--drawer-drag-progress', `${progress.toFixed(3)}`);
      }
    }

    function onTouchEnd() {
      if (mode !== 'opening' && mode !== 'closing') {
        reset();
        return;
      }
      const dx = lastX - startX;
      const distance = Math.abs(dx);
      const distanceCommit = distance > drawerWidth * COMMIT_DISTANCE_RATIO;
      const velocityCommit =
        (mode === 'opening' && velocity > COMMIT_VELOCITY) ||
        (mode === 'closing' && velocity < -COMMIT_VELOCITY);
      const commit = distanceCommit || velocityCommit;
      const wasOpening = mode === 'opening';

      reset();

      if (wasOpening) {
        if (commit) mobileDrawer.open();
        else mobileDrawer.close();
      } else {
        if (commit) mobileDrawer.close();
        else mobileDrawer.open();
      }
    }

    function onTouchCancel() {
      if (mode === 'opening' || mode === 'closing') {
        const wasOpening = mode === 'opening';
        reset();
        if (wasOpening) mobileDrawer.close();
      } else {
        reset();
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      reset();
    };
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

<CrmBrandHead />

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

<QuickTaskBubble />

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

  /* While a swipe gesture is in progress, fade the backdrop in lockstep
     with the drawer's drag progress (0 = closed, 1 = fully open). */
  :global(html.drawer-dragging) :global(.drawer-backdrop) {
    opacity: var(--drawer-drag-progress, 1);
    animation: none;
    transition: none;
  }
</style>
