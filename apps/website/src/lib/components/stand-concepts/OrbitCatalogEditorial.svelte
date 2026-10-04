<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { catalogEditorial } from '$lib/catalogEditorial';
  import type { PublicStock } from '$lib/publicVehicles';
  let { params, stock }: { params: URLSearchParams; stock: PublicStock } = $props();
  const guide = $derived(catalogEditorial(params, stock));
</script>

<section class="catalog-editorial" aria-labelledby="catalog-editorial-heading">
  <div class="editorial-intro">
    <p class="eyebrow">UMA ESCOLHA INFORMADA</p>
    <h2 id="catalog-editorial-heading">{guide.heading}</h2>
    <p class="intro">{guide.intro}</p>
    {#if guide.price}<p class="price-note">{guide.price}</p>{/if}
    {#if !guide.hasResults}<a class="reset" href={guide.resetHref}>Ver todas as viaturas <ArrowUpRight size={16} aria-hidden="true" /></a>{/if}
    <a class="visit" href="#contactos"><span class="visit-label">Podemos ajudar a escolher</span> <ArrowUpRight size={16} aria-hidden="true" /></a>
  </div>
  <div class="editorial-guide">
    {#each guide.guides as item, index}
      <div class="guide-item">
        <span class="number" aria-hidden="true">0{index + 1}</span>
        <div><h3>{item.title}</h3><p>{item.text}</p></div>
      </div>
    {/each}
  </div>
  {#if guide.vehicles.length}
    <div class="reading-list">
      <h3>{guide.pageLabel}</h3>
      <div>{#each guide.vehicles as vehicle}
        <a href={vehicle.href}><span><span class="vehicle-label">{vehicle.label}</span><small>{vehicle.detail}</small></span><ArrowUpRight size={16} aria-hidden="true" /></a>
      {/each}</div>
    </div>
  {/if}
  <p class="editorial-note">Informação baseada nas fichas publicadas. Confirme a disponibilidade e os detalhes com o stand antes da visita.</p>
</section>

<style>
  .catalog-editorial { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: 48px 64px; border-top: 1px solid var(--line); padding-top: 40px; margin-top: 56px; }
  p, h2, h3 { margin: 0; }
  .eyebrow { color: var(--muted); font-size: 10px; letter-spacing: .12em; }
  h2 { max-width: 23ch; font-size: clamp(26px, 2.4vw, 36px); line-height: 1.15; letter-spacing: -.045em; font-weight: 500; margin: 16px 0 20px; text-wrap: balance; }
  .intro, .guide-item p { color: var(--muted); font-size: max(16px, var(--orbit-type-reading, 16px)); line-height: 1.8; max-width: 54ch; }
  .price-note { margin-top: 16px; font-size: 12px; color: var(--muted); line-height: 1.7; }
  a { color: var(--text); text-decoration: none; }
  a:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  .visit, .reset { display: flex; align-items: center; gap: 10px; width: fit-content; min-height: 44px; font-size: 13px; }
  .visit { margin-top: 18px; }
  .reset { margin-top: 12px; }
  .guide-item { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 16px; padding-block: 28px; border-top: 1px solid var(--line); }
  .guide-item:first-child { border-top: 0; padding-top: 0; }
  .guide-item:last-child { padding-bottom: 0; }
  .number { font-size: 10px; line-height: 24px; color: var(--red); font-variant-numeric: tabular-nums; }
  h3 { font-size: 18px; line-height: 1.5; font-weight: 500; letter-spacing: -.02em; }
  .guide-item p { margin-top: 12px; }
  .reading-list, .editorial-note { grid-column: 1 / -1; }
  .reading-list { padding-top: 24px; border-top: 1px solid var(--line); }
  .reading-list h3 { font-size: 13px; margin-bottom: 14px; }
  .reading-list > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .reading-list a { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 76px; box-sizing: border-box; padding: 18px 20px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; line-height: 1.6; }
  .reading-list a > span { min-width: 0; overflow-wrap: anywhere; }
  .vehicle-label { position: relative; display: inline-block; max-width: 100%; }
  .vehicle-label::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px; background: var(--red); opacity: 0; }
  .visit-label { position: relative; display: inline-block; }
  .visit-label::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px; background: var(--red); }
  .reading-list .vehicle-label::after, .visit-label::after { transform: scaleX(0); transform-origin: left; }
  .visit:is(:hover, :focus-visible) { text-decoration: none; }
  .reading-list a:focus-visible .vehicle-label::after, .visit:focus-visible .visit-label::after { transform: scaleX(1); }
  .visit:focus-visible :global(svg) { rotate: 45deg; }
  .reading-list a:focus-visible .vehicle-label::after { opacity: 1; }
  .reading-list a:focus-visible { background: color-mix(in srgb, var(--text) 8%, var(--bg)); border-color: var(--red); text-decoration: none; }
  .reading-list a:focus-visible :global(svg) { rotate: 45deg; color: var(--text); }
  @media (hover: hover) {
    .reading-list a:hover .vehicle-label::after, .visit:hover .visit-label::after { transform: scaleX(1); }
    .visit:hover :global(svg) { rotate: 45deg; }
    .reading-list a:hover .vehicle-label::after { opacity: 1; }
    .reading-list a:hover { background: color-mix(in srgb, var(--text) 8%, var(--bg)); border-color: color-mix(in srgb, var(--text) 36%, var(--bg)); text-decoration: none; }
    .reading-list a:hover :global(svg) { rotate: 45deg; color: var(--text); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .reading-list .vehicle-label::after, .visit-label::after { transition: transform 300ms ease; }
    .visit :global(svg) { transition: rotate 300ms ease; }
    .reading-list a { transition: background-color 180ms ease, border-color 180ms ease; }
    .reading-list a :global(svg) { transition: rotate 300ms ease; }
  }
  small { display: block; margin-top: 4px; font-size: 12px; color: var(--muted); }
  a :global(svg) { flex-shrink: 0; }
  .editorial-note { font-size: 12px; color: var(--muted); line-height: 1.7; }
  @media (hover: hover) { a:hover { text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 5px; } }
  .eyebrow { font-size: 12px; }
  .price-note, .editorial-note, small { font-size: 14px; }
  .visit, .reset, .reading-list h3, .reading-list a { font-size: 15px; }
  @media (max-width: 1200px) { .catalog-editorial { grid-template-columns: 1fr; gap: 40px; } h2 { max-width: 30ch; } }
  @media (max-width: 700px) { .catalog-editorial { margin-top: 36px; padding-top: 28px; } .reading-list > div { grid-template-columns: 1fr; gap: 18px; } }
</style>
