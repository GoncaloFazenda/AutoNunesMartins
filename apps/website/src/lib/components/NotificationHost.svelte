<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import { cubicInOut, cubicOut } from 'svelte/easing';
  import { ArrowUpRight, X } from 'lucide-svelte';
  import { useNotifications } from '$lib/notifications';
  const notifications = useNotifications();
  const { notices } = notifications;
  let reduced = $state(true);
  let offset = $state(110);
  let announcement = $state('');
  let visibleLimit = $state(4);
  const front = $derived($notices[0]);
  const visible = $derived($notices.slice(0, visibleLimit));
  $effect(() => {
    const message = front?.message ?? '';
    // Announce only the settled front card, not every event in a burst.
    if (!message) { announcement = ''; return; }
    const timer = setTimeout(() => { announcement = message; }, 400);
    return () => clearTimeout(timer);
  });
  async function closeNotice(id: number, event: MouseEvent) {
    const restoreFocus = event.detail === 0;
    notifications.dismiss(id);
    if (restoreFocus) {
      await tick();
      document.querySelector<HTMLButtonElement>('.notice-slot:not([inert]) .notification button')?.focus();
    }
  }
  function displayMessage(message: string) {
    const clean = message.replace(/ \d de 3 viaturas selecionadas\.$/, '');
    const match = clean.match(/^(.*) (adicionado à comparação|removido da comparação|guardado nos favoritos|removido dos favoritos)\.$/);
    if (!match) return { name: '', text: clean };
    const status: Record<string, string> = {
      'adicionado à comparação': 'na comparação.',
      'removido da comparação': 'removido da comparação.',
      'guardado nos favoritos': 'nos favoritos.',
      'removido dos favoritos': 'removido dos favoritos.',
    };
    return { name: match[1], text: status[match[2]!] };
  }
  function enter(node: Element, options: { duration: number }) {
    const row = (node as HTMLElement).style.gridRow;
    const replacing = Array.from(node.parentElement?.querySelectorAll<HTMLElement>('.notice-slot[inert]') ?? []).some(other => other.style.gridRow === row);
    return { ...options, delay: options.duration && replacing ? 120 : 0, easing: cubicOut, css: (t: number, u: number) => `opacity:${t};visibility:${t < .1 ? 'hidden' : 'visible'};transform:translateY(${(replacing ? 6 : -10) * u}px)` };
  }
  function leave(node: Element, options: { duration: number }) {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const opacity = Number(style.opacity);
    return { ...options, easing: cubicInOut, css: (t: number, u: number) => `opacity:${t * opacity};transform:${transform} translateY(${-6 * u}px)` };
  }
  function reposition(node: Element, rects: { from: DOMRect; to: DOMRect }, options: { reduced: boolean }) {
    // Let the outgoing text fade before the next card moves into its space.
    const closingAbove = rects.to.top < rects.from.top && node.parentElement?.querySelector('.notice-slot[inert]');
    return { ...flip(node, rects, { duration: options.reduced ? 0 : 280, easing: cubicOut }), delay: !options.reduced && closingAbove ? 90 : 0 };
  }
  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduced = media.matches; };
    let frame = 0;
    let header: Element | null = null;
    const resize = new ResizeObserver(() => schedule());
    const measure = () => {
      frame = 0;
      const current = document.querySelector('.stand-header');
      if (current !== header) { resize.disconnect(); header = current; if (header) resize.observe(header); }
      const bottom = header?.getBoundingClientRect().bottom ?? 0;
      offset = Math.max(16, Math.ceil(bottom + 12));
      const cardBudget = window.innerWidth <= 700 ? 150 : 100;
      visibleLimit = Math.max(1, Math.min(4, Math.floor((window.innerHeight - offset - 44) / cardBudget)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const changes = new MutationObserver(schedule);
    changes.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    update(); measure(); media.addEventListener('change', update);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('transitionend', schedule, true);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); changes.disconnect();
      media.removeEventListener('change', update);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      document.removeEventListener('transitionend', schedule, true);
    };
  });
  afterNavigate(() => notifications.resumeAfterNavigation());
</script>

<div class="announcements" role="status" aria-live="polite" aria-atomic="true" aria-label="Notificações">{announcement}</div>
<div class="notification-stack" style={`--notice-top:${offset}px`} aria-label="Avisos do site">
  {#each visible as notice, index (notice.id)}
    {@const message = displayMessage(notice.message)}
    <div class="notice-slot" style={`grid-row:${index + 1}`} inert={!visible.some(item => item.id === notice.id)} animate:reposition={{ reduced }} in:enter={{ duration: reduced ? 0 : 240 }} out:leave={{ duration: reduced ? 0 : 280 }}>
      {#if index === visible.length - 1 && $notices.length > visibleLimit + 1}<div class="notice-layer layer-back" aria-hidden="true" transition:fade={{ duration: reduced ? 0 : 240 }}></div>{/if}
      {#if index === visible.length - 1 && $notices.length > visibleLimit}<div class="notice-layer layer-middle" aria-hidden="true" transition:fade={{ duration: reduced ? 0 : 240 }}></div>{/if}
    <aside class="notification" class:has-action={!!notice.action} aria-label={notice.channel === 'comparison' ? 'Comparação' : notice.channel === 'favorites' ? 'Favoritos' : 'Notificação'}
      onpointerenter={() => notifications.pause(notice.id, 'pointer')}
      onpointerleave={() => notifications.resume(notice.id, 'pointer')}
      onfocusin={() => notifications.pause(notice.id, 'focus')}
      onfocusout={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) notifications.resume(notice.id, 'focus'); }}>
      <p class="notice-message">{#if message.name}<strong>{message.name}</strong>{' '}{/if}<span>{message.text}</span></p>
      {#if notice.action}<a class="notice-action" href={notice.action.href}>{notice.action.label}<ArrowUpRight size={17} aria-hidden="true" /></a>{/if}
      <button type="button" aria-label={`Fechar aviso: ${notice.message}`} onclick={event => closeNotice(notice.id, event)}><X size={18} aria-hidden="true" /></button>
    </aside>
    </div>
  {/each}
</div>

<style>
  .announcements { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .notification-stack { --notice-bg: #fafbf8; --notice-glass: #fafbf8e0; --notice-text: #191c19; --notice-muted: #515850; --notice-line: #ffffffc4; position: fixed; z-index: 80; left: 50%; top: max(var(--notice-top), calc(env(safe-area-inset-top) + 12px)); transform: translateX(-50%); width: min(880px, calc(100% - 24px)); max-height: calc(100dvh - var(--notice-top) - 12px); display: grid; gap: 10px; padding: 6px 16px 36px; pointer-events: none; font-family: 'Orbit Inter', Arial, sans-serif; }
  :global(body:has(.design.dark)) .notification-stack { --notice-bg: #1b1e1b; --notice-glass: #1b1e1bdc; --notice-text: #f5f6f2; --notice-muted: #c3c8c1; --notice-line: #ffffff26; }
  .notification { grid-area: 1 / 1; position: relative; z-index: 4; display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: center; gap: 18px; width: 100%; padding: 12px 12px 12px 24px; background: var(--notice-bg); color: var(--notice-text); border: 1px solid var(--notice-line); border-radius: 12px; box-shadow: 0 10px 24px #00000024, 0 2px 6px #00000014; flex-shrink: 0; pointer-events: auto; }
  .notice-slot { grid-column: 1; display: grid; min-width: 0; z-index: 1; }
  .notice-slot[inert] { pointer-events: none; z-index: 2; }
  .notice-slot[inert] .notification { pointer-events: none; }
  .notice-layer { grid-area: 1 / 1; border: 1px solid var(--notice-line); border-radius: 12px; background: var(--notice-bg); box-shadow: 0 6px 16px #00000018; pointer-events: none; transform-origin: center bottom; }
  .layer-middle { z-index: 3; transform: translateY(8px) scaleX(.975); }
  .layer-back { z-index: 2; transform: translateY(16px) scaleX(.95); opacity: .75; }
  .notification.has-action { grid-template-columns: minmax(0, 1fr) auto 44px; }
  @supports ((backdrop-filter: blur(16px)) or (-webkit-backdrop-filter: blur(16px))) {
    .notification { background: var(--notice-glass); backdrop-filter: blur(16px) saturate(115%); -webkit-backdrop-filter: blur(16px) saturate(115%); }
  }
  .notice-message { margin: 0; min-width: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; color: var(--notice-muted); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
  .notice-message strong { color: var(--notice-text); font-weight: 500; }
  .notice-action { display: inline-flex; align-items: center; justify-content: center; gap: 20px; min-height: 44px; padding: 10px 18px; border-radius: 30px; background: var(--notice-text); color: var(--notice-bg); font-size: 13px; font-weight: 500; white-space: nowrap; text-decoration: none; }
  .notice-action:is(:hover, :focus-visible) { background: #e30613; color: white; }
  .notice-action:is(:hover, :focus-visible) :global(svg) { rotate: 45deg; }
  button { display: grid; place-items: center; background: transparent; color: var(--notice-muted); border: 0; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; }
  button:hover { background: color-mix(in srgb, var(--notice-text) 6%, transparent); color: var(--notice-text); }
  a:focus-visible, button:focus-visible { outline: 2px solid #e30613; outline-offset: 3px; }
  :global(body:has(.mobile-menu[aria-expanded="true"])) .notification-stack,
  :global(body:has(dialog[open])) .notification-stack { visibility: hidden; pointer-events: none; }
  @media (prefers-reduced-motion: no-preference) { .notice-action { transition: background-color 180ms ease, color 180ms ease; } .notice-action :global(svg) { transition: rotate 220ms ease; } }
  @media (max-width: 700px) {
    .notification-stack { width: 100%; padding-inline: 12px; }
    .notification, .notification.has-action { grid-template-columns: minmax(0, 1fr) 36px; gap: 10px 8px; padding: 12px 10px 12px 16px; border-radius: 10px; }
    .notice-message { font-size: 14px; }
    .notification button { grid-column: 2; grid-row: 1; align-self: start; width: 36px; margin-top: -4px; position: relative; }
    .notification button::before { content: ''; position: absolute; inset: 0 -4px; }
    .notice-action { grid-column: 1; grid-row: 2; justify-self: start; min-height: 42px; padding: 9px 16px; gap: 18px; }
  }
</style>





