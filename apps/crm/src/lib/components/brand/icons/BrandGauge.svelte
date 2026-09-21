<!--
  Hand-drawn Gauge icon ported from the index.html prototype's `I.Gauge`.
  Half-circle dial at the bottom with a needle pointing up-right to the
  high reading.
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
  <path d="M3.5 14a8.5 8.5 0 1 1 17 0" />
  <path d="M12 14L17 8" />
  <circle cx="12" cy="14" r="1.6" fill="currentColor" />
</svg>
