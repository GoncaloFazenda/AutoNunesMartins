<script lang="ts">
  import { page } from '$app/stores';
  import DesignEdition from '$lib/components/stand-concepts/DesignEdition.svelte';
</script>
<svelte:head>
  <title>{$page.status === 404 ? 'Viatura não disponível' : 'Temporariamente indisponível'} — Auto Nunes Martins</title>
  <meta name="robots" content="noindex, follow" />
</svelte:head>
<DesignEdition id="unavailable" errorStatus={$page.status} />
