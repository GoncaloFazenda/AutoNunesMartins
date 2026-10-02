<script lang="ts">
  import OrbitRedDot from './OrbitRedDot.svelte';
  let { spaceBelow = 0 }: { spaceBelow?: number } = $props();
</script>

<p class="visit-label" style:margin-bottom={`${spaceBelow}px`}><OrbitRedDot /> VISITAR O STAND</p>

<style>
  .visit-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: #ececef;
    font-family: 'Orbit Inter', Arial, sans-serif;
    font-size: 10px;
    font-weight: 400;
    line-height: 1.65;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
</style>
