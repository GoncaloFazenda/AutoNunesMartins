<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { catalogBrandLinks, type PublicBrandDirectory } from '$lib/catalogBrandLinks';
  import { brandLogo } from '$lib/brandLogos';
  let { directory }: { directory: PublicBrandDirectory } = $props();
  const links = $derived(directory.status === 'ready' ? catalogBrandLinks(directory.brands) : []);
</script>

<section class="stock-brands" aria-label="Explorar por marca">
  <div class="brands-heading">
    <h2>Explorar por marca.</h2>
    <p>Marcas com viaturas disponíveis.</p>
  </div>
  {#if links.length}
    <nav aria-label="Marcas do catálogo">
      <ul>
        {#each links as brand (brand.name)}
          {@const logo = brandLogo(brand.name)}
          <li><a href={brand.href} class:without-logo={!logo}>
            {#if logo}<img class="brand-logo" src={logo} alt="" aria-hidden="true" width="72" height="44" loading="lazy" decoding="async" />{/if}
            <span class="brand-label"><span class="brand-name">{brand.name}</span>
            <span class="brand-count">{brand.count} {brand.count === 1 ? 'disponível' : 'disponíveis'}</span></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a></li>
        {/each}
      </ul>
    </nav>
  {:else}
    <p class="empty">{directory.status === 'ready' ? 'Neste momento não há marcas com viaturas disponíveis.' : 'Não foi possível consultar as marcas neste momento.'} <a href="/viaturas">Consultar catálogo <ArrowUpRight size={15} aria-hidden="true" /></a></p>
  {/if}
</section>

<style>
  .stock-brands { border-top: 1px solid var(--line); padding-top: 32px; }
  .brands-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px 32px; margin-bottom: 24px; }
  h2, p { margin: 0; }
  h2 { font-size: clamp(26px, 2.5vw, 36px); font-weight: 500; line-height: 1.2; letter-spacing: -.04em; }
  p { color: var(--muted); font-size: 14px; line-height: 1.7; }
  ul { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0 28px; margin: 0; padding: 0; list-style: none; }
  li { min-width: 0; }
  a { color: var(--text); text-decoration: none; }
  li a { display: grid; grid-template-columns: 72px minmax(0, 1fr) 17px; align-items: center; gap: 16px; height: 100%; min-height: 96px; border-bottom: 1px solid var(--line); padding: 20px 4px; box-sizing: border-box; font-size: 16px; }
  .brand-logo { display: block; width: 72px; height: 44px; object-fit: contain; }
  .brand-logo[src$='/audi.svg'], .brand-logo[src$='/dacia.svg'] { transform: scale(1.4); }
  :global(.dark) .brand-logo { filter: invert(1); }
  .brand-label { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-width: 0; }
  .without-logo .brand-label { grid-column: 1 / 3; }
  .brand-name { position: relative; min-width: 0; overflow-wrap: anywhere; }
  .brand-name::after { content: ''; position: absolute; inset: auto 0 -4px; height: 1px; background: var(--red); transform: scaleX(0); transform-origin: left; }
  .brand-count { color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  a :global(svg) { flex-shrink: 0; }
  a:focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  a:focus-visible .brand-name::after { transform: scaleX(1); }
  a:focus-visible :global(svg) { rotate: 45deg; color: var(--red); }
  .empty a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-left: 8px; }
  @media (hover: hover) {
    a:hover .brand-name::after { transform: scaleX(1); }
    a:hover :global(svg) { rotate: 45deg; color: var(--red); }
    .empty a:hover { text-decoration: underline; text-underline-offset: 4px; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .brand-name::after { transition: transform 220ms ease; }
    a :global(svg) { transition: rotate 220ms ease, color 220ms ease; }
  }
  @media (max-width: 1100px) { ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 700px) {
    .stock-brands { padding-top: 24px; }
    .brands-heading { display: block; margin-bottom: 16px; }
    .brands-heading p { margin-top: 10px; }
    ul { column-gap: 20px; }
    li a { grid-template-columns: minmax(0, 1fr) 17px; grid-template-rows: 44px auto; gap: 16px 8px; font-size: 15px; min-height: 144px; padding-block: 18px; }
    .brand-logo { grid-column: 1 / -1; }
    .brand-label, .without-logo .brand-label { grid-column: 1; grid-row: 2; }
    li a :global(svg) { grid-column: 2; grid-row: 2; }
    .empty a { display: flex; width: fit-content; margin: 8px 0 0; }
  }
  @media (max-width: 380px) { ul { column-gap: 16px; } li a { font-size: 14px; column-gap: 6px; } }
</style>
