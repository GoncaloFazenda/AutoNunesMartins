<script lang="ts">
  import OrbitVisitStudio from './OrbitVisitStudio.svelte';
  import OrbitCompactFooter from './OrbitCompactFooter.svelte';

  let { onContact }: { onContact: () => void } = $props();
</script>

<OrbitVisitStudio
  id="contactos"
  backgroundTone="original"
  formTreatment="original"
  formDivider
  showDemoNote={false}
  showCallIcon
  borderlessPanels
  mapArtwork="original"
  harmonizedTypography
/>
<OrbitCompactFooter showContacts={false} compact contactHref="#contactos" {onContact} />
