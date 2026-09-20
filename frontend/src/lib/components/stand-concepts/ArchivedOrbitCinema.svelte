<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { designMotion } from './designMotion';
  import { photo } from './data';

  let { onContact }: { onContact: (message: string) => void } = $props();
</script>

<div class="cinema-motion-root orbit" use:designMotion>
  <section class="orbit-cinema" data-scene aria-label="Do ecrã para a estrada">
    <div class="cinema-stage" data-pin>
      <div class="cinema-frame">
        <img
          src={photo('photo-1576212767334-9e289e294c77', 2000)}
          alt="Uma estrada que atravessa a paisagem"
          loading="lazy"
        />
      </div>
      <div class="cinema-context">
        <span class="red-dot"></span> DO ECRÃ PARA A ESTRADA<span>O PRÓXIMO PASSO</span>
      </div>
      <div class="cinema-type"><span>MENOS ROTINA.</span><span>MAIS CAMINHO.</span></div>
      <div class="cinema-bottom">
        <p>
          Já se imagina ao volante?<br /><span
            >Combine uma visita. O próximo caminho começa de perto.</span
          >
        </p>
        <button
          class="pill cinema-visit"
          onclick={() => onContact('Gostava de combinar uma visita para conhecer uma viatura.')}
        >
          Vamos marcar uma visita <ArrowUpRight size={19} />
        </button>
      </div>
      <div class="cinema-route" aria-hidden="true">
        <span>DESCOBRIR</span><i><b></b></i><span>CONHECER</span>
      </div>
    </div>
  </section>
</div>

<style>
  .cinema-motion-root {
    --bg: #0c0c0e;
    --surface: #17171a;
    --text: #f5f5f1;
    --muted: #96969d;
    --line: #ffffff24;
    --red: #e30613;
    --scene-height: clamp(520px, 72svh, 680px);
    color: var(--text);
    font:
      400 14px/1.65 'Inter',
      sans-serif;
    color-scheme: dark;
  }
  .cinema-motion-root * {
    box-sizing: border-box;
  }
  button {
    border: 0;
    font: inherit;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  p {
    margin: 0;
  }
  .orbit-cinema,
  :global(.motion-on) .orbit-cinema {
    position: relative;
    width: 97%;
    max-width: 1720px;
    height: var(--scene-height);
    min-height: 0;
    margin: 15px auto 0;
    background: var(--bg);
  }
  .cinema-stage,
  :global(.motion-on) .cinema-stage {
    position: relative;
    height: var(--scene-height);
    min-height: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    isolation: isolate;
    background: #0c0c0e;
    border-radius: 6px;
  }
  .cinema-frame {
    position: absolute;
    inset: 0;
    z-index: -1;
    clip-path: inset(10% 20% round 10px);
  }
  .cinema-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.6);
  }
  .cinema-type {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: white;
    font-size: clamp(50px, 6.7vw, 104px);
    font-weight: 500;
    letter-spacing: -0.075em;
    line-height: 1.1;
    white-space: nowrap;
  }
  .cinema-type span:first-child {
    align-self: start;
    margin-left: 4%;
  }
  .cinema-type span:last-child {
    align-self: end;
    margin-right: 4%;
  }
  .cinema-context {
    position: absolute;
    top: 30px;
    left: 4%;
    right: 4%;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .cinema-context > span:last-child {
    margin-left: auto;
    color: #ffffff90;
  }
  .red-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--red);
    flex-shrink: 0;
  }
  .cinema-bottom {
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    color: white;
  }
  .cinema-bottom p {
    font-size: 19px;
    line-height: 1.5;
  }
  .cinema-bottom p > span {
    font-size: 13px;
    color: #ffffffb0;
  }
  .pill {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 13px 22px;
    border-radius: 50px;
    font-size: 13px;
    transition:
      transform 0.25s,
      background 0.25s;
  }
  .pill:hover {
    transform: translateY(-3px);
  }
  .cinema-visit {
    flex-shrink: 0;
    color: #111;
    background: #f5f5f1;
    border-color: #f5f5f1;
  }
  .cinema-visit:hover {
    color: white;
    background: var(--red);
  }
  .cinema-route {
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    color: #fff9;
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .cinema-route i {
    position: relative;
    flex: 1;
    height: 1px;
    background: #ffffff30;
  }
  .cinema-route b {
    position: absolute;
    inset: 0;
    background: var(--red);
    transform-origin: left;
  }
  .cinema-route b:after {
    content: '';
    position: absolute;
    top: -2px;
    right: 0;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--red);
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .orbit-cinema {
      height: calc(var(--scene-height) + 54svh);
    }
    :global(.motion-on) .cinema-stage {
      position: sticky;
      top: max(0px, calc((100svh - var(--scene-height)) / 2));
    }
    :global(.motion-on) .cinema-frame {
      clip-path: inset(
        calc(15% - var(--p) * 15%) calc(25% - var(--p) * 25%) round calc(35px - var(--p) * 35px)
      );
    }
    :global(.motion-on) .cinema-frame img {
      transform: scale(calc(1.22 - var(--p) * 0.22));
    }
    :global(.motion-on) .cinema-type span:first-child {
      transform: translateX(calc(var(--p) * 5%));
    }
    :global(.motion-on) .cinema-type span:last-child {
      transform: translateX(calc(var(--p) * -5%));
    }
    :global(.motion-on) .cinema-route b {
      transform: scaleX(var(--p));
    }
  }
  @media (max-width: 700px) {
    .cinema-motion-root {
      --scene-height: 550px;
    }
    .orbit-cinema,
    :global(.motion-on) .orbit-cinema {
      width: 100%;
    }
    .cinema-type {
      margin-top: -70px;
      font-size: 10.4vw;
    }
    .cinema-type span:first-child {
      margin-left: 3%;
    }
    .cinema-type span:last-child {
      margin-right: 3%;
    }
    .cinema-bottom {
      left: 5%;
      right: 5%;
      bottom: 65px;
      flex-direction: column;
      align-items: start;
      gap: 18px;
    }
    .cinema-bottom p {
      font-size: 17px;
    }
    .cinema-bottom p > span {
      display: inline-block;
      max-width: 31ch;
      font-size: 12px;
    }
    .cinema-context {
      top: 22px;
      font-size: 9px;
    }
    .cinema-context > span:last-child {
      display: none;
    }
    .cinema-route {
      bottom: 22px;
      gap: 12px;
      font-size: 8px;
    }
  }
  @media (max-width: 700px) and (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .orbit-cinema {
      height: calc(var(--scene-height) + 32svh);
    }
    :global(.motion-on) .cinema-stage {
      top: auto;
    }
    :global(.motion-on) .cinema-type span:first-child {
      transform: translateX(calc(var(--p) * 5%));
    }
    :global(.motion-on) .cinema-type span:last-child {
      transform: translateX(calc(var(--p) * -5%));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cinema-motion-root * {
      animation: none !important;
      transition: none !important;
    }
    .orbit-cinema,
    :global(.motion-on) .orbit-cinema {
      height: var(--scene-height);
    }
    .cinema-stage,
    :global(.motion-on) .cinema-stage {
      position: relative;
    }
    :global(.motion-on) .cinema-type span,
    :global(.motion-on) .cinema-frame img {
      transform: none;
    }
  }
</style>
