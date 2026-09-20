<script lang="ts">
  import { onMount } from 'svelte';
  const CAR_ENTER_MS = 850;
  const LINE_ENTER_MS = 300;
  const EXIT_MS = 300;
  let phase = $state<'idle' | 'entering' | 'parked' | 'exiting'>('idle');
  let reduced = $state(true);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let element: HTMLAnchorElement;
  let sweep = $state(0);
  let sweepFrame = 0;
  function illuminate(target: number) {
    cancelAnimationFrame(sweepFrame);
    if (reduced) { sweep = target; return; }
    if (target === 1 && sweep > 1) sweep = 0;
    const from = sweep;
    const started = performance.now();
    const duration = target === 1 ? LINE_ENTER_MS : EXIT_MS;
    const draw = (now: number) => {
      const p = Math.min(1, (now - started) / duration);
      sweep = from + (target - from) * (p * p * (3 - 2 * p));
      if (p < 1) sweepFrame = requestAnimationFrame(draw);
    };
    sweepFrame = requestAnimationFrame(draw);
  }
  function enter() {
    clearTimeout(timer);
    illuminate(1);
    phase = reduced ? 'parked' : 'entering';
    if (!reduced) timer = setTimeout(() => phase = 'parked', CAR_ENTER_MS);
  }
  function leave() {
    clearTimeout(timer);
    illuminate(2);
    phase = reduced ? 'idle' : 'exiting';
    if (!reduced) timer = setTimeout(() => phase = 'idle', EXIT_MS);
  }
  onMount(() => {
    const grid = element.parentElement!;
    let peer: Element | undefined;
    const sync = () => {
      const cards = grid.querySelectorAll('.vehicle-card');
      const next = cards[cards.length - 1];
      if (next !== peer) { sizes.disconnect(); peer = next; if (peer) sizes.observe(peer); }
      if (peer) element.style.setProperty('--peer-height', peer.getBoundingClientRect().height + 'px');
    };
    const sizes = new ResizeObserver(sync);
    const children = new MutationObserver(sync);
    children.observe(grid, { childList: true });
    sync();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { reduced = media.matches; if (reduced && phase === 'entering') { clearTimeout(timer); phase = 'parked'; } };
    update(); media.addEventListener('change', update);
    return () => { clearTimeout(timer); cancelAnimationFrame(sweepFrame); sizes.disconnect(); children.disconnect(); media.removeEventListener('change', update); };
  });
</script>

<a bind:this={element} class="discover" class:active={phase === 'entering' || phase === 'parked'} data-phase={phase} href="/stand-orbit/viaturas"
  style={`--enter-duration:${CAR_ENTER_MS}ms;--line-enter-duration:${LINE_ENTER_MS}ms;--exit-duration:${EXIT_MS}ms;--wheel-enter-duration:${CAR_ENTER_MS / 2}ms`}
  onpointerenter={(event) => { if (event.pointerType === 'mouse') enter(); }}
  onpointerleave={(event) => { if (event.pointerType === 'mouse') leave(); }}
  onfocus={enter} onblur={leave}>
  <span class="eyebrow">Continue a descobrir</span>
  <strong><span>Ver todas</span><span class="title-accent" style={`--sweep:${sweep};--start:${Math.max(0,sweep-1)*120-10}%;--end:${Math.min(1,sweep)*120-10}%;--light:${Math.min(1,Math.max(0,Math.min(sweep,2-sweep)*8))}`}>as viaturas<span class="title-line" aria-hidden="true"><i></i></span></span></strong>
  <div class="road" aria-hidden="true">
    <div class="car">
      <svg viewBox="0 0 240 100" fill="none" focusable="false">
        <g class="smoke" stroke="currentColor" stroke-width="2"><circle class="puff one" cx="42" cy="81" r="7"/><circle class="puff two" cx="42" cy="81" r="6"/><circle class="puff three" cx="42" cy="81" r="8"/></g>
        <g class="body" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M27 55 55 48 78 26Q83 21 96 21H134Q144 21 154 34L170 49 207 55Q218 57 220 67L222 78H23L20 65Z" fill="var(--bg)"/>
          <path d="m65 48 22-20h43l25 22Z" fill="var(--surface)"/>
          <path d="m112 28 3 21M82 55v18h70M124 57h9M25 62h13M207 62h12M22 80h199"/>
        </g>
        {#each [{x:57,rear:true},{x:182,rear:false}] as wheel}
          <g transform={`translate(${wheel.x} 78)`}>
            <circle r="17" fill="var(--bg)" stroke="currentColor" stroke-width="3"/>
            <g class="wheel" class:rear={wheel.rear} class:front={!wheel.rear} stroke="currentColor" stroke-width="2.5">
              <circle r="10"/><path d="M0-10V10M-9-5 9 5M-9 5 9-5"/><circle r="2" fill="currentColor"/>
            </g>
          </g>
        {/each}
      </svg>
    </div>
  </div>
  <span class="arrow" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 25 25 7M8 7h17v17" /></svg></span>
</a>

<style>
  .discover { position: relative; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; align-self: stretch; width: 100%; height: var(--peer-height, 360px); min-height: 0; padding: clamp(20px, 2.1vw, 32px); padding-bottom: 90px; overflow: hidden; isolation: isolate; border: 1px solid var(--line); border-radius: 4px; color: var(--text); text-decoration: none; background: linear-gradient(145deg, color-mix(in srgb,var(--text) 2%,transparent),transparent 65%); }
  .eyebrow { display: block; color: var(--muted); font-size: 9px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; }
  strong { display: block; margin-top: 12px; font-size: clamp(24px,2.2vw,34px); font-weight: 500; line-height: 1.08; letter-spacing: -.045em; }
  strong > span { display: table; position: relative; }
  .title-accent { color: transparent; background: linear-gradient(90deg, transparent var(--start), color-mix(in srgb,var(--red) calc(var(--light) * 70%),transparent) calc(var(--start) + 10%), color-mix(in srgb,var(--red) calc(var(--light) * 70%),transparent) calc(var(--end) - 10%), transparent var(--end)), linear-gradient(var(--text),var(--text)); background-clip: text; -webkit-background-clip: text; }
  .title-line { position: absolute; left: 0; right: 0; bottom: -.18em; height: 2px; overflow: hidden; filter: var(--orbit-line-glow); opacity: .95; }
  .title-line i { display: block; width: 100%; height: 100%; background: var(--red); transform: translateX(calc((var(--sweep) - 1) * 100%)); }
  @media (prefers-reduced-motion: no-preference) {
    strong > span { transition: transform var(--exit-duration) cubic-bezier(.16,1,.3,1); }
    .active strong > span { transition-duration: var(--line-enter-duration); }
    .active strong > span { transform: translateX(3px); }
  }
  .arrow { position: absolute; right: 24px; bottom: 24px; width: 28px; height: 28px; color: var(--red); }
  .arrow svg { width: 100%; height: 100%; stroke: currentColor; stroke-width: 1.4; }
  .road { position: absolute; bottom: 10px; right: 68px; width: min(180px,58%); height: 65px; pointer-events: none; }
  .car { opacity: 0; transform: translateX(-200px); }
  .car svg { width: 100%; height: 65px; overflow: visible; }
  .puff { opacity: 0; transform-box: fill-box; transform-origin: center; fill: var(--bg); }
  .active .car { opacity: 1; transform: none; }
  .active .arrow { color: var(--red); transform: rotate(45deg); filter: var(--orbit-line-glow); opacity: .95; }
  .discover:focus-visible { outline: 2px solid var(--text); outline-offset: 5px; }
  .active { --edge-light: color-mix(in srgb,var(--line) 55%,var(--text)); border-color: var(--edge-light); box-shadow: 0 0 12px 1px color-mix(in srgb,var(--edge-light) 24%,transparent), 0 0 36px 3px color-mix(in srgb,var(--edge-light) 12%,transparent); }
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .discover { transition: border-color 300ms, box-shadow 300ms; }
    .arrow { transition: transform 300ms, filter 300ms, opacity 300ms; }
    [data-phase='entering'] .car { animation: arrive var(--enter-duration) both; }
    [data-phase='entering'] .wheel { animation: roll var(--wheel-enter-duration) linear 2; }
    [data-phase='parked'] .rear { animation: roll 360ms linear infinite; }
    [data-phase='parked'] .body { animation: eager 140ms infinite alternate; }
    [data-phase='parked'] .puff { animation: smoke 1050ms linear infinite; }
    [data-phase='parked'] .two { animation-delay: 350ms; }
    [data-phase='parked'] .three { animation-delay: 700ms; }
    [data-phase='exiting'] .car { animation: depart var(--exit-duration) ease-in both; }
    [data-phase='exiting'] .wheel { animation: roll var(--exit-duration) linear infinite; }
  }
  @keyframes arrive { 0% { opacity: 0; transform: translateX(-200px); } 12% { opacity: 1; } 75% { transform: translateX(6px) rotate(-2deg); } 100% { opacity: 1; transform: none; } }
  @keyframes depart { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(160px); } }
  @keyframes roll { to { transform: rotate(360deg); } }
  @keyframes eager { from { transform: translateY(0); } to { transform: translate(0.5px,-0.7px) rotate(-.2deg); } }
  @keyframes smoke { 0% { opacity: 0; transform: translate(0,0) scale(.4); } 15% { opacity: .4; } 100% { opacity: 0; transform: translate(-65px,-8px) scale(2); } }
  @media (hover: none) { .car { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .car { opacity: 1; transform: none; } }
</style>
