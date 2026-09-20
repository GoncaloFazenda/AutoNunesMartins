<script lang="ts">
  import { ArrowUpRight } from 'lucide-svelte';
  import { photo } from './data';
  const perspectives = [
    {
      id: 'audi-a6',
      label: '01 / TODOS OS DIAS',
      title: 'Espaço para tudo.',
      image: 'photo-1606664515524-ed2f786a0bd6',
      name: 'Audi A6 Avant',
    },
    {
      id: 'porsche-911',
      label: '02 / OUTROS PLANOS',
      title: 'Vontade de mais.',
      image: 'photo-1503376780353-7e6692767b70',
      name: 'Porsche 911 Carrera',
    },
    {
      id: 'tesla-model-s',
      label: '03 / A SUA ESCOLHA',
      title: 'O futuro é seu.',
      image: 'photo-1617788138017-80ad40651399',
      name: 'Tesla Model S',
    },
  ];
</script>

<section
  class="orbit-spread"
  data-scene
  data-approach
  aria-label="Três perspetivas para o seu próximo carro"
>
  <div class="spread-deck">
    {#each perspectives as item, index}
      <a
        class="spread-card card-{index}"
        href={`/stand-orbit/${item.id}`}
        aria-label={`${item.title} Conhecer ${item.name}`}
      >
        <span class="spread-label">{item.label}<span aria-hidden="true">↗</span></span>
        <div class="spread-photo">
          <img src={photo(item.image, 1200)} alt={item.name} loading="lazy" />
        </div>
        <div class="spread-caption">
          <p>{item.title}</p>
          <ArrowUpRight size={22} />
        </div>
      </a>
    {/each}
  </div>
</section>

<style>
  .orbit-spread {
    --approach: 1;
    --spread: 1;
    --travel: 105%;
    --card-width: 31%;
    --card-height: clamp(300px, 28vw, 420px);
    width: 95%;
    max-width: 1640px;
    margin: 18px auto 30px;
    padding: 48px 0;
    box-sizing: border-box;
  }
  .spread-deck {
    height: var(--card-height);
    position: relative;
    perspective: 1500px;
  }
  .spread-card {
    position: absolute;
    top: 0;
    left: calc((100% - var(--card-width)) / 2);
    width: var(--card-width);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    box-sizing: border-box;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--surface);
    color: var(--text);
    text-decoration: none;
    box-shadow: 0 22px 55px #0002;
    transform-origin: 50% 80%;
  }
  .spread-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .spread-photo {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: 2px;
    background: #252528;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .spread-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  p {
    margin: 0;
    font-size: clamp(20px, 2vw, 28px);
    letter-spacing: -0.045em;
    line-height: 1.2;
  }
  .card-0 {
    z-index: 1;
    transform: translateX(calc(var(--spread) * var(--travel) * -1))
      translateY(calc(16px - var(--spread) * 16px)) rotate(calc(-7deg + var(--spread) * 5deg))
      rotateY(calc(12deg - var(--spread) * 12deg));
  }
  .card-1 {
    z-index: 3;
    transform: translateY(calc(var(--spread) * -14px)) rotate(calc(2deg - var(--spread) * 2deg));
  }
  .card-2 {
    z-index: 2;
    background: var(--red);
    color: #fff;
    transform: translateX(calc(var(--spread) * var(--travel)))
      translateY(calc(24px - var(--spread) * 24px)) rotate(calc(8deg - var(--spread) * 6deg))
      rotateY(calc(-12deg + var(--spread) * 12deg));
  }
  .spread-card:focus-visible {
    outline: 3px solid var(--text);
    outline-offset: 6px;
  }
  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .orbit-spread {
      --spread: var(--approach);
    }
    .spread-photo img {
      transition: scale 650ms cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .spread-card:hover img {
      scale: 1.055;
    }
    :global(.motion-on) .orbit-spread:focus-within {
      --spread: 1;
    }
  }
  @media (min-width: 601px) and (max-width: 900px) {
    .orbit-spread {
      --card-height: 290px;
    }
    .spread-card {
      padding: 12px;
      gap: 12px;
    }
    .spread-label {
      font-size: 8px;
    }
    p {
      font-size: 19px;
    }
  }
  @media (max-width: 600px) {
    .orbit-spread {
      --card-height: 310px;
      width: 100%;
      padding: 12px 0;
      margin-block: 8px 26px;
    }
    /* The same opening becomes a swipeable row on phones, without extra vertical travel. */
    .spread-deck {
      height: auto;
      display: flex;
      gap: 16px;
      padding: 25px 7%;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--line) transparent;
      scroll-snap-type: x proximity;
      scroll-padding-inline: 7vw;
    }
    .spread-card {
      position: relative;
      left: auto;
      flex: 0 0 88%;
      height: var(--card-height);
      gap: 12px;
      padding: 14px;
      scroll-snap-align: start;
    }
    .card-0 {
      transform: rotate(calc(-5deg + var(--spread) * 5deg));
    }
    .card-1 {
      transform: translateX(calc((1 - var(--spread)) * (-100% - 16px)))
        rotate(calc(2deg - var(--spread) * 2deg));
    }
    .card-2 {
      transform: translateX(calc((1 - var(--spread)) * (-200% - 32px)))
        rotate(calc(5deg - var(--spread) * 5deg));
    }
    p {
      font-size: 24px;
    }
  }
</style>
