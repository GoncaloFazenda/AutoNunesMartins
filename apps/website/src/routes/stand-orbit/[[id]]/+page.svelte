<script lang="ts">
  import { page } from '$app/stores';
  import DesignEdition from '$lib/components/stand-concepts/DesignEdition.svelte';
</script>

<DesignEdition edition="orbit" id={$page.params.id} />
