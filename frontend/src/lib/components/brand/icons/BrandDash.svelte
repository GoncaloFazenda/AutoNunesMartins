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
  <rect x="3" y="3" width="7" height="9" />
  <rect x="14" y="3" width="7" height="5" />
  <rect x="14" y="12" width="7" height="9" />
  <rect x="3" y="16" width="7" height="5" />
</svg>
