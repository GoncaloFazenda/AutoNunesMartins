<script lang="ts">
  import { page } from '$app/stores';
  import Concept from '$lib/components/stand-concepts/Concept.svelte';
</script>
<Concept variant="horizonte" id={$page.params.id} />
