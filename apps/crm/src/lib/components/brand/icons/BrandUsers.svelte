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
  <circle cx="9" cy="8" r="3.5" />
  <path d="M3 20a6 6 0 0 1 12 0M16 8.5a2.5 2.5 0 1 0 0 5" />
</svg>
