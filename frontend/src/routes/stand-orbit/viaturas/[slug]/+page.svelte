<script lang="ts">
  import DesignEdition from '$lib/components/stand-concepts/DesignEdition.svelte';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<DesignEdition edition="orbit" publicVehicle={data.vehicle} />
