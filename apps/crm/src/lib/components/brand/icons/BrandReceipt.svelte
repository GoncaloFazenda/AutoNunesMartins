<!--
  Hand-drawn Receipt icon ported from the index.html prototype's `I.Receipt`.
  Tall paper with a zig-zag bottom edge and three horizontal item lines.
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
  <path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z" />
  <path d="M9 8h6M9 12h6M9 16h4" />
</svg>
