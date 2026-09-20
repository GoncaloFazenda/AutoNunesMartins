<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft, ArrowUpRight } from 'lucide-svelte';
  import {
    fuelLabels,
    transmissionLabels,
    publicHref,
    publicPhoto,
    publicPrice,
    type PublicVehicle,
  } from '$lib/publicVehicles';
  let { vehicle }: { vehicle: PublicVehicle } = $props();
  let selected = $state(0);
  $effect(() => {
    vehicle.slug;
    selected = 0;
  });
  const title = $derived(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`);
  const description = $derived(
    vehicle.description?.slice(0, 160) ||
      `${title}, ${new Intl.NumberFormat('pt-PT').format(vehicle.mileage)} km, ${fuelLabels[vehicle.fuel]}. Consulte os dados publicados e o preço.`,
  );
</script>

<svelte:head>
  <title>{title} — Auto Nunes Martins</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={new URL(publicHref(vehicle.slug), $page.url.origin).href} />
  <meta name="robots" content="index, follow" />
</svelte:head>
<main class="public-detail">
  <a class="back" href="/stand-orbit/viaturas"><ArrowLeft size={15} /> Voltar às viaturas</a>
  <div class="detail-grid">
    <section class="gallery" aria-label="Fotografias da viatura">
      {#if vehicle.photos.length}
        <img
          class="main-photo"
          src={publicPhoto(vehicle.slug, selected)}
          alt={`${title} — fotografia ${selected + 1}`}
        />
        {#if vehicle.photos.length > 1}<div class="thumbnails">
            {#each vehicle.photos as _, index}<button
                aria-label={`Ver fotografia ${index + 1}`}
                aria-pressed={selected === index}
                onclick={() => (selected = index)}
                ><img src={publicPhoto(vehicle.slug, index)} alt="" loading="lazy" /></button
              >{/each}
          </div>{/if}
      {:else}<div class="no-photo">Imagem indisponível</div>{/if}
      {#if vehicle.availability === 'RESERVED'}<span class="reserved">Reservada</span>{/if}
    </section>
    <section class="details" aria-labelledby="vehicle-title">
      {#if vehicle.availability === 'RESERVED'}<p class="eyebrow">RESERVADA</p>{/if}
      <p class="brand">{vehicle.brand}</p>
      <h1 id="vehicle-title">{vehicle.model}<span>.</span></h1>
      <p class="price">
        {publicPrice(vehicle.price)}{#if vehicle.price !== null}<small>Preço publicado</small>{/if}
      </p>
      <dl>
        <div>
          <dt>Ano</dt>
          <dd>{vehicle.year}</dd>
        </div>
        <div>
          <dt>Quilometragem</dt>
          <dd>{new Intl.NumberFormat('pt-PT').format(vehicle.mileage)} km</dd>
        </div>
        <div>
          <dt>Combustível</dt>
          <dd>{fuelLabels[vehicle.fuel]}</dd>
        </div>
        {#if vehicle.transmission}<div>
            <dt>Transmissão</dt>
            <dd>{transmissionLabels[vehicle.transmission]}</dd>
          </div>{/if}
      </dl>
      <a class="visit" href="/stand-orbit#contactos">Conheça o stand <ArrowUpRight size={18} /></a>
      <p class="note">
        Confirme a disponibilidade, o histórico, o equipamento e as condições com o stand.
      </p>
    </section>
  </div>
  {#if vehicle.description}<section class="description">
      <p class="eyebrow">CONHEÇA OS DETALHES</p>
      <h2>Sobre esta viatura.</h2>
      <p class="approved-description">{vehicle.description}</p>
    </section>{/if}
</main>

<style>
  .gallery {
    position: relative;
  }
  .reserved {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 11px;
    color: #171719;
    background: #f5f5f1;
  }
  .public-detail {
    width: var(--orbit-frame, 94%);
    max-width: var(--orbit-frame-max, 1720px);
    margin: auto;
    padding: 38px 0 90px;
    color: var(--text);
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--muted);
    text-decoration: none;
    min-height: 44px;
    font-size: 13px;
    margin-bottom: 28px;
  }
  .detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: clamp(30px, 5vw, 80px);
  }
  .main-photo {
    display: block;
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: contain;
    background: var(--surface);
    border-radius: 4px;
  }
  .no-photo {
    display: grid;
    place-items: center;
    aspect-ratio: 4/3;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--muted);
  }
  .thumbnails {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    margin-top: 12px;
    padding-bottom: 8px;
  }
  .thumbnails button {
    flex: 0 0 88px;
    border: 1px solid var(--line);
    padding: 3px;
    background: transparent;
    cursor: pointer;
  }
  .thumbnails button[aria-pressed='true'] {
    border-color: var(--red);
  }
  .thumbnails img {
    display: block;
    width: 100%;
    height: 62px;
    object-fit: cover;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--muted);
    margin: 0 0 25px;
  }
  .brand {
    font-size: 14px;
    margin: 0 0 8px;
  }
  h1 {
    font-size: clamp(38px, 4vw, 70px);
    line-height: 1.02;
    letter-spacing: -0.055em;
    font-weight: 500;
    margin: 0;
  }
  h1 span {
    color: var(--red);
  }
  .price {
    font-size: 32px;
    margin: 32px 0;
  }
  .price small {
    display: block;
    font-size: 11px;
    color: var(--muted);
    margin-top: 7px;
  }
  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin: 0 0 30px;
    padding: 24px 0;
    border-block: 1px solid var(--line);
  }
  dt {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 7px;
  }
  dd {
    margin: 0;
    font-size: 16px;
  }
  .visit {
    display: inline-flex;
    gap: 25px;
    align-items: center;
    background: var(--red);
    color: white;
    border-radius: 4px;
    padding: 16px 22px;
    text-decoration: none;
    font-size: 13px;
  }
  .note {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.7;
    max-width: 40ch;
    margin-top: 20px;
  }
  .description {
    max-width: 850px;
    margin-top: 65px;
  }
  h2 {
    font-size: 30px;
    letter-spacing: -0.04em;
    font-weight: 500;
  }
  .approved-description {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    line-height: 1.85;
    color: var(--muted);
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 4px;
  }
  @media (max-width: 760px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
    .public-detail {
      width: 90%;
      padding-top: 24px;
    }
    .details {
      padding-top: 8px;
    }
    .description {
      margin-top: 45px;
    }
  }
</style>
