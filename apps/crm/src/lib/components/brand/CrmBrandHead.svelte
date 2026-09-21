<script lang="ts">
  import { theme } from '$lib/stores/theme';
</script>

<svelte:head>
  <link
    rel="icon"
    type="image/png"
    href={$theme === 'dark' ? '/logo-transparent-white-v3.png' : '/logo-transparent.png'}
  />
  <meta name="application-name" content="Auto Nunes Martins" />
</svelte:head>
