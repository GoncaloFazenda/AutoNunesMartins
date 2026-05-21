<!--
  Hand-drawn Chart icon ported from the index.html prototype's `I.Chart`.
  Axes (left + bottom) with a zig-zag trend line stepping up.
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
  <path d="M3 3v18h18M7 14l3-3 3 3 5-6" />
</svg>
