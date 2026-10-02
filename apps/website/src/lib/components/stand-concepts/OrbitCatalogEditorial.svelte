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
    <a class="visit" href="#contactos">Podemos ajudar a escolher <ArrowUpRight size={16} aria-hidden="true" /></a>
  </div>
  <div class="editorial-guide">
    {#each guide.guides as item, index}
      <div class="guide-item">
        <span class="number" aria-hidden="true">0{index + 1}</span>
        <div><h3>{item.title}</h3><p>{item.text}</p></div>
      </div>
    {/each}
  </div>
  {#if guide.links.length}
    <nav class="explore" aria-label={guide.linkHeading}>
      <h3>{guide.linkHeading}</h3>
      <div class="model-links">
        {#each guide.links as link}
          <a href={link.href} aria-current={link.current ? 'page' : undefined}>
            {link.label}<span>{link.count}</span><ArrowUpRight size={14} aria-hidden="true" />
          </a>
        {/each}
      </div>
    </nav>
  {/if}
  {#if guide.vehicles.length}
    <div class="reading-list">
      <h3>{guide.pageLabel}</h3>
      <div>{#each guide.vehicles as vehicle}
        <a href={vehicle.href}><span>{vehicle.label}<small>{vehicle.detail}</small></span><ArrowUpRight size={16} aria-hidden="true" /></a>
      {/each}</div>
    </div>
  {/if}
  <p class="editorial-note">Informação baseada nas fichas publicadas. Confirme a disponibilidade e os detalhes com o stand antes da visita.</p>
</section>

<style>
  .catalog-editorial { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: 32px 48px; border-top: 1px solid var(--line); padding-top: 40px; margin-top: 56px; }
  p, h2, h3 { margin: 0; }
  .eyebrow { color: var(--muted); font-size: 10px; letter-spacing: .12em; }
  h2 { max-width: 23ch; font-size: clamp(26px, 2.4vw, 36px); line-height: 1.15; letter-spacing: -.045em; font-weight: 500; margin: 16px 0 20px; text-wrap: balance; }
  .intro, .guide-item p { color: var(--muted); font-size: var(--orbit-type-reading); line-height: var(--orbit-leading-reading); max-width: 62ch; }
  .price-note { margin-top: 16px; font-size: 12px; color: var(--muted); line-height: 1.7; }
  a { color: var(--text); text-decoration: none; }
  a:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  .visit, .reset { display: flex; align-items: center; gap: 10px; width: fit-content; min-height: 44px; font-size: 13px; }
  .visit { margin-top: 18px; }
  .reset { margin-top: 12px; }
  .guide-item { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 12px; padding-block: 20px; border-top: 1px solid var(--line); }
  .guide-item:first-child { border-top: 0; padding-top: 0; }
  .guide-item:last-child { padding-bottom: 0; }
  .number { font-size: 10px; line-height: 24px; color: var(--red); font-variant-numeric: tabular-nums; }
  h3 { font-size: 16px; line-height: 1.5; font-weight: 500; letter-spacing: -.02em; }
  .guide-item p { margin-top: 8px; }
  .explore, .reading-list, .editorial-note { grid-column: 1 / -1; }
  .explore, .reading-list { padding-top: 24px; border-top: 1px solid var(--line); }
  .explore h3, .reading-list h3 { font-size: 13px; margin-bottom: 14px; }
  .model-links { display: flex; flex-wrap: wrap; gap: 8px 24px; }
  .model-links a { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; font-size: 14px; }
  .model-links a > span { color: var(--muted); font-size: 11px; }
  .model-links [aria-current] { text-decoration: underline; text-underline-offset: 5px; }
  .reading-list > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .reading-list a { display: flex; align-items: start; justify-content: space-between; gap: 10px; min-height: 44px; font-size: 13px; line-height: 1.6; }
  small { display: block; margin-top: 4px; font-size: 12px; color: var(--muted); }
  a :global(svg) { flex-shrink: 0; }
  .editorial-note { font-size: 12px; color: var(--muted); line-height: 1.7; }
  @media (hover: hover) { a:hover { text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 5px; } }
  @media (max-width: 1200px) { .catalog-editorial { grid-template-columns: 1fr; gap: 28px; } h2 { max-width: 30ch; } }
  @media (max-width: 700px) { .catalog-editorial { margin-top: 36px; padding-top: 28px; } .reading-list > div { grid-template-columns: 1fr; gap: 18px; } }
</style>
