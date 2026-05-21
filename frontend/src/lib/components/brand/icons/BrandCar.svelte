<!--
  Hand-drawn Car icon ported from the index.html prototype's `I.Car`.
  Side-3/4 view with two wheel dots — the dealership's signature mark.
  Accepts the same `class` prop API as lucide-svelte icons so it can be
  swapped into components that expect a lucide icon (KPICard, etc.).
-->
<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = '' }: Props = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  aria-hidden="true"
>
  <path d="M5 17h14M5 17v2H3v-7l2-5h14l2 5v7h-2v-2M2 12h20" />
  <circle cx="7" cy="14" r="1.2" fill="currentColor" />
  <circle cx="17" cy="14" r="1.2" fill="currentColor" />
</svg>
