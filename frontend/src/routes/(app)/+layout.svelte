<script lang="ts">
  import { onMount } from 'svelte';
  import RedWedge from '$lib/components/brand/RedWedge.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import Topbar from '$lib/components/shell/Topbar.svelte';
  import { sidebar } from '$lib/stores/sidebar';
  import type { LayoutData } from './$types';

  interface Props {
    children?: import('svelte').Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();

  onMount(() => {
    sidebar.hydrate();
  });
</script>

<RedWedge />

<Sidebar
  vehicleCount={data.vehicleStats?.active ?? null}
  taskCount={data.taskStats?.mineActive ?? null}
/>

<div class="main-area relative">
  <div class="header-ambient absolute inset-0 pointer-events-none"></div>
  <div class="relative z-10">
    <Topbar />
    <main class="px-6 pb-12 pr-[24px]">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  /* Sidebar is `position: fixed`; main content lives to its right with a
     left padding that matches the sidebar width. The width is driven by a
     CSS variable so the collapse toggle animates smoothly. */
  :global(html) {
    --sidebar-w: 240px;
    --sidebar-w-collapsed: 68px;
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
</style>
