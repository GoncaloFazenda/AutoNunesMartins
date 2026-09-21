<script lang="ts">
  import { page } from '$app/stores';
  import Concept from '$lib/components/stand-concepts/Concept.svelte';
</script>
<Concept variant="atelier" id={$page.params.id} />
