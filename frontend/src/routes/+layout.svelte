<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { ClerkProvider } from 'svelte-clerk';
  import { Toaster } from 'svelte-sonner';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  onMount(() => {
    theme.hydrate();
  });
</script>

<ClerkProvider>
  {@render children?.()}
</ClerkProvider>

<!--
  Toaster — using svelte-sonner's `richColors` defaults, which give green /
  red / amber / blue tinted backgrounds per type. We only constrain the
  width so it can't ever overflow on narrow viewports, and stack with
  expand so multiple toasts are all visible.
-->
<Toaster
  position="bottom-right"
  theme={$theme}
  richColors
  closeButton
  duration={4500}
  expand
  visibleToasts={5}
/>

<style>
  /* Wider toast with room to breathe; clamped to viewport so it never
     overflows. */
  :global([data-sonner-toaster]) {
    --width: min(440px, calc(100vw - 40px)) !important;
  }

  /* Bigger card: more padding, slightly larger type, taller. */
  :global([data-sonner-toast]) {
    padding: 20px 44px 20px 22px !important;
    font-size: 15px !important;
    line-height: 1.45 !important;
    border-radius: 8px !important;
    min-height: 72px !important;
    box-shadow: 0 22px 50px -18px rgba(0, 0, 0, 0.55) !important;
  }
  :global([data-sonner-toast] [data-title]) {
    font-size: 15px !important;
    font-weight: 600 !important;
  }
  :global([data-sonner-toast] [data-description]) {
    font-size: 13.5px !important;
    margin-top: 3px !important;
  }
  :global([data-sonner-toast] [data-icon]) {
    width: 22px !important;
    height: 22px !important;
    margin-top: 1px !important;
  }
  :global([data-sonner-toast] [data-icon] svg) {
    width: 22px !important;
    height: 22px !important;
  }

  /* Close button: top-right corner, floating chip style. */
  :global([data-sonner-toast] [data-close-button]) {
    left: auto !important;
    right: -8px !important;
    top: -8px !important;
    width: 22px !important;
    height: 22px !important;
    border-radius: 999px !important;
  }
</style>
