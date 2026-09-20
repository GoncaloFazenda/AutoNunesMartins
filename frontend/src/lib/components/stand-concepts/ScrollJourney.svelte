<script lang="ts">
  import { photo } from './data';
  let { vehicleImage }: { vehicleImage?: string } = $props();
  let active = $state(0);
  const chapters = [
    {
      title: 'O primeiro olhar.',
      subtitle: 'Há encontros que ficam.',
      detail: 'Uma linha. Uma proporção. A sensação de ter encontrado algo que é seu.',
      image: 'photo-1503376780353-7e6692767b70',
      label: '01 / DESCOBRIR',
    },
    {
      title: 'A vontade de ir.',
      subtitle: 'O destino pode esperar.',
      detail: 'Desligar a rotina. Escolher outra estrada. Recuperar o prazer do caminho.',
      image: 'photo-1440404653325-ab127d49abc1',
      label: '02 / SENTIR',
    },
    {
      title: 'O próximo capítulo.',
      subtitle: 'Começa consigo.',
      detail: 'O carro certo para os dias que conhece. E para todos os que ainda vêm.',
      image: 'photo-1555215695-3004980ad54e',
      label: '03 / PARTIR',
    },
  ];
  function track(node: HTMLElement) {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const update = () => {
      frame = 0;
      if (preference.matches) {
        node.classList.remove('motion-ready');
        active = 0;
        return;
      }
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, rect.height - viewport));
      const entry = clamp((viewport - rect.top) / viewport);
      const next = Math.min(2, Math.floor(progress * 3));
      active = next;
      node.style.setProperty('--journey-progress', String(progress));
      node.style.setProperty('--journey-entry', String(entry));
      node.style.setProperty('--chapter-progress', String(clamp(progress * 3 - next)));
    };
    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(update);
    };
    const configure = () => {
      node.classList.toggle('motion-ready', !preference.matches);
      schedule();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible) schedule();
      },
      { rootMargin: '100px' },
    );
    observer.observe(node);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', configure);
    configure();
    return {
      destroy() {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        preference.removeEventListener('change', configure);
      },
    };
  }
</script>

<section class="journey" use:track aria-label="O próximo capítulo">
  <div class="journey-stage">
    <div class="journey-frame">
      <div class="journey-images" aria-hidden="true">
        {#each chapters as chapter, index}
          <img
            class:active={active === index}
            src={photo(index === 0 && vehicleImage ? vehicleImage : chapter.image, 1800)}
            alt=""
            loading="lazy"
          />
        {/each}
      </div>
      <div class="journey-shade"></div>
      <div class="journey-heading">
        <span>AUTO NUNES MARTINS</span><span>O CAMINHO É SEU.</span>
      </div>
      <div class="chapter-number" aria-hidden="true">0{active + 1}<span>/ 03</span></div>
      <div class="chapter-stack">
        {#each chapters as chapter, index}
          <div class="chapter" class:active={active === index} aria-hidden={active !== index}>
            <p class="chapter-label">{chapter.label}</p>
            <h2>{chapter.title}<br /><em>{chapter.subtitle}</em></h2>
            <p class="chapter-detail">{chapter.detail}</p>
          </div>
        {/each}
      </div>
      <div class="journey-bottom">
        <span>CONTINUE A EXPLORAR <b>↓</b></span>
        <div class="chapter-rail" aria-hidden="true">
          {#each chapters as _, index}<div
              class:complete={active > index}
              class:current={active === index}
            >
              <i></i>
            </div>{/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .journey {
    --journey-progress: 0;
    --journey-entry: 1;
    --chapter-progress: 0;
    background: var(--paper);
    position: relative;
    margin: 35px 0 70px;
  }
  .journey-stage {
    height: 760px;
    max-height: 100svh;
    display: grid;
    place-items: center;
  }
  .journey-frame {
    position: relative;
    width: calc(100% - 56px);
    max-width: 1320px;
    height: 90%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 8px;
    background: #131316;
    color: #fff;
  }
  .journey-images,
  .journey-shade {
    position: absolute;
    inset: 0;
    z-index: -1;
  }
  .journey-images img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.12);
    transition:
      opacity 0.7s ease,
      transform 1.1s ease;
  }
  .journey-images img.active {
    opacity: 1;
    transform: scale(1.03);
  }
  .journey-shade {
    background:
      linear-gradient(90deg, rgba(10, 10, 11, 0.8), rgba(10, 10, 11, 0.12)),
      linear-gradient(0deg, rgba(10, 10, 11, 0.7), transparent 60%);
  }
  .journey-heading {
    position: absolute;
    top: 40px;
    left: 5%;
    right: 5%;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    font-size: 9px;
    letter-spacing: 0.17em;
  }
  .journey-heading span:first-child:before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #e30613;
    border-radius: 50%;
    margin-right: 13px;
  }
  .chapter-stack {
    position: absolute;
    left: 7%;
    right: 7%;
    bottom: 21%;
    display: grid;
  }
  .chapter {
    grid-area: 1/1;
    opacity: 0;
    transform: translateY(32px);
    transition:
      opacity 0.45s,
      transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1);
    pointer-events: none;
  }
  .chapter.active {
    opacity: 1;
    transform: translateY(0);
  }
  .chapter-label {
    font-size: 10px;
    letter-spacing: 0.19em;
    margin: 0 0 22px;
    color: #fff;
  }
  .chapter h2 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(42px, 5.7vw, 88px);
    font-weight: 400;
    letter-spacing: -0.06em;
    line-height: 1.07;
    margin: 0;
  }
  .chapter em {
    font-family: Georgia, serif;
    font-weight: 400;
    color: #f4f2ee;
  }
  .chapter-detail {
    font:
      400 13px/1.8 'Inter',
      sans-serif;
    max-width: 350px;
    margin: 25px 0 0;
    color: #e0e0e0;
  }
  .chapter-number {
    position: absolute;
    top: 13%;
    right: 7%;
    font:
      400 clamp(100px, 18vw, 260px)/1 'Barlow',
      sans-serif;
    letter-spacing: -0.07em;
    color: rgba(255, 255, 255, 0.12);
    transition: transform 0.5s;
  }
  .chapter-number span {
    font:
      400 10px 'Inter',
      sans-serif;
    letter-spacing: 0.1em;
    color: #ddd;
    position: absolute;
    bottom: 14px;
    right: 0;
  }
  .journey-bottom {
    position: absolute;
    bottom: 40px;
    left: 5%;
    right: 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 25px;
  }
  .journey-bottom > span {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .journey-bottom b {
    margin-left: 25px;
    font-size: 19px;
    font-weight: 400;
  }
  .chapter-rail {
    display: flex;
    gap: 8px;
    width: 230px;
  }
  .chapter-rail > div {
    height: 2px;
    background: #ffffff40;
    flex: 1;
    overflow: hidden;
  }
  .chapter-rail i {
    display: block;
    height: 100%;
    background: #e30613;
    transform: scaleX(0);
    transform-origin: left;
  }
  .chapter-rail .current i {
    transform: scaleX(var(--chapter-progress));
  }
  .chapter-rail .complete i {
    transform: scaleX(1);
  }
  .motion-ready {
    height: 270svh;
  }
  .motion-ready .journey-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    max-height: none;
  }
  .motion-ready .journey-frame {
    max-width: none;
    width: calc(88% + var(--journey-entry) * 12%);
    height: calc(78% + var(--journey-entry) * 22%);
    border-radius: calc(28px - var(--journey-entry) * 28px);
  }
  .motion-ready .journey-images img.active {
    transform: scale(calc(1.1 - var(--chapter-progress) * 0.07));
  }
  @media (max-width: 700px) {
    .journey {
      margin: 20px 0 35px;
    }
    .journey-stage {
      height: 650px;
    }
    .journey-frame {
      width: calc(100% - 40px);
    }
    .motion-ready {
      height: 230svh;
    }
    .journey-heading {
      top: 28px;
      font-size: 7px;
    }
    .journey-heading span:last-child {
      display: none;
    }
    .chapter-stack {
      left: 7%;
      right: 7%;
      bottom: 23%;
    }
    .chapter h2 {
      font-size: clamp(35px, 8.5vw, 57px);
      line-height: 1.12;
    }
    .chapter-detail {
      font-size: 12px;
      max-width: 280px;
    }
    .chapter-number {
      top: 16%;
      font-size: 130px;
    }
    .chapter-label {
      font-size: 8px;
    }
    .journey-bottom {
      bottom: 28px;
      gap: 15px;
    }
    .journey-bottom > span {
      font-size: 7px;
    }
    .journey-bottom b {
      margin-left: 10px;
    }
    .chapter-rail {
      width: 110px;
    }
    .journey-images img {
      object-position: 60% 50%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .journey.motion-ready {
      height: auto;
    }
    .journey-stage,
    .motion-ready .journey-stage {
      position: relative;
      height: 650px;
      max-height: 100svh;
    }
    .chapter,
    .journey-images img {
      transition: none !important;
      transform: none !important;
    }
    .journey-bottom {
      display: none;
    }
  }
  .chapter em {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
  }
  .journey-frame {
    max-width: 1600px;
  }
</style>
