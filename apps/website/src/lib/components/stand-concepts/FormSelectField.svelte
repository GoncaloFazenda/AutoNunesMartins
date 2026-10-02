<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronDown } from 'lucide-svelte';

  let { children }: { children: Snippet } = $props();
</script>

<span class="form-select-field">
  {@render children()}
  <ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" />
</span>

<style>
  .form-select-field { display: block; position: relative; width: 100%; min-width: 0; }
  .form-select-field :global(select[name]) {
    width: 100%;
    appearance: none;
    padding-inline-end: 42px;
  }
  .form-select-field :global(svg) {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    width: 16px;
    height: 16px;
  }
</style>
