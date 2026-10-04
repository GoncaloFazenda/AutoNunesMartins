<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { standContact } from './stand-concepts/standContact';
  import { passedHomeStats, whatsappUrl } from '$lib/whatsappContact';

  const href = whatsappUrl(standContact.whatsapp);
  const label = standContact.whatsapp?.demo ? 'WhatsApp — demonstração' : 'Contactar pelo WhatsApp';
  const isHome = $derived(page.url.pathname === '/');
  let pastStats = $state(false);
  let refresh = () => {};
  afterNavigate(() => { pastStats = false; refresh(); });
  onMount(() => {
    let frame = 0;
    let stats: Element | null = null;
    let home: Element | null = null;
    const intersection = new IntersectionObserver(() => schedule(), { threshold: [0, 1] });
    const resize = new ResizeObserver(() => schedule());
    const inspect = () => {
      frame = 0;
      const currentHome = isHome ? document.querySelector('.orbit-home') : null;
      const currentStats = currentHome?.querySelector('.orbit-stats') ?? null;
      if (currentStats !== stats || currentHome !== home) {
        intersection.disconnect(); resize.disconnect();
        stats = currentStats; home = currentHome;
        if (stats) { intersection.observe(stats); resize.observe(stats); }
        if (home) resize.observe(home);
      }
      pastStats = passedHomeStats(stats?.getBoundingClientRect().bottom ?? null);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(inspect); };
    refresh = () => { cancelAnimationFrame(frame); inspect(); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    // Rebind the real stats element after navigation or a changed homepage layout.
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    inspect();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect(); resize.disconnect(); refresh = () => {};
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  });
</script>

{#snippet icon()}
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8A8.5 8.5 0 1 1 20.5 11.7Z" />
    <path transform="translate(2.64 2.64) scale(.78)" d="m8.1 7.6 1.3-.3 1.1 2.3-.9 1.1a8 8 0 0 0 3.6 3.5l1-.9 2.2 1.1-.2 1.3c-.1.8-1 1.2-1.8 1-4.4-1-7.2-3.8-7.4-7.2 0-.8.4-1.6 1.1-1.9Z" />
  </svg>
{/snippet}

<div class="whatsapp-float" class:before-home-stats={isHome && !pastStats}>
  {#if href}
    <a {href} target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"
      data-sveltekit-preload-data="off" data-sveltekit-preload-code="off"
      aria-label={`${label} (abre numa nova janela)`} title={label}>
      {@render icon()}
    </a>
  {:else}
    <button type="button" aria-disabled="true" aria-label="WhatsApp — contacto indisponível" title="WhatsApp — contacto indisponível">
      {@render icon()}
    </button>
  {/if}
</div>

<style>
  .whatsapp-float { position: fixed; z-index: 40; right: max(30px, env(safe-area-inset-right)); bottom: max(44px, env(safe-area-inset-bottom)); }
  a, button { display: grid; place-items: center; width: 60px; height: 60px; padding: 0; border: 1px solid #ffffff38; border-radius: 50%; background: #168b50; color: #fff; box-shadow: 0 3px 10px #0003, 0 10px 26px #00000042; text-decoration: none; cursor: pointer; }
  button[aria-disabled] { background: #34483d; cursor: default; }
  a:focus-visible, button:focus-visible { outline: 3px solid #fff; outline-offset: 3px; box-shadow: 0 0 0 7px #17231e; }
  @media (hover: hover) { a:hover { background: #127440; } }
  @media (prefers-reduced-motion: no-preference) { a { transition: background-color 180ms ease, box-shadow 180ms ease; } }
  :global(body:has(dialog[open])) .whatsapp-float,
  :global(body:has([aria-modal="true"])) .whatsapp-float { visibility: hidden; pointer-events: none; }
  @media (max-width: 700px) {
    .before-home-stats { visibility: hidden; pointer-events: none; }
    .whatsapp-float { right: max(22px, env(safe-area-inset-right)); bottom: max(38px, env(safe-area-inset-bottom)); }
    a, button { width: 54px; height: 54px; }
  }
</style>
