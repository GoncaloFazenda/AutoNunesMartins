<script lang="ts">
  interface Props {
    width?: string;
    height?: string;
    class?: string;
  }

  let { width = '100%', height = '14px', class: className = '' }: Props = $props();
</script>

<span
  class="skel inline-block align-middle {className}"
  style="width: {width}; height: {height};"
></span>

<style>
  .skel {
    background: linear-gradient(
      90deg,
      var(--color-bg-2) 0%,
      var(--color-bg-3) 50%,
      var(--color-bg-2) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
    border-radius: 3px;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
