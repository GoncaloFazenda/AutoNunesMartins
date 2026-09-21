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
  <circle cx="12" cy="12" r="3" />
  <path d="M19 12c0-.5 0-1-.1-1.4l2-1.5-2-3.4-2.3.9c-.7-.5-1.5-1-2.4-1.4L13.5 3h-3l-.7 2.2c-.9.4-1.7.9-2.4 1.4l-2.3-.9-2 3.4 2 1.5C5 11 5 11.5 5 12s0 1 .1 1.4l-2 1.5 2 3.4 2.3-.9c.7.5 1.5 1 2.4 1.4l.7 2.2h3l.7-2.2c.9-.4 1.7-.9 2.4-1.4l2.3.9 2-3.4-2-1.5z" />
</svg>
