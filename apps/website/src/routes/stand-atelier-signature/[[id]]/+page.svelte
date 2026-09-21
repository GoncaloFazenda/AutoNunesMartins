<script lang="ts">
  import { page } from '$app/stores';
  import AtelierSignature from '$lib/components/stand-concepts/AtelierSignature.svelte';
</script>
<AtelierSignature variant="atelier" id={$page.params.id} />
