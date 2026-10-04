<script lang="ts">
  import orbitFont400 from '@fontsource/inter/files/inter-latin-400-normal.woff2?url';
  import orbitFont500 from '@fontsource/inter/files/inter-latin-500-normal.woff2?url';
  import orbitFont600 from '@fontsource/inter/files/inter-latin-600-normal.woff2?url';
  import orbitTitleFont from '@fontsource/barlow/files/barlow-latin-600-normal.woff2?url';
  import orbitTitleItalic from '@fontsource/barlow/files/barlow-latin-600-italic.woff2?url';
  import { onMount, tick } from 'svelte';
  import {
    emptyStock,
    publicPrice,
    type PublicStock,
    type PublicVehicle,
    type PublicCard,
  } from '$lib/publicVehicles';
  import { page } from '$app/stores';
  import { publicVehicleCanonical, vehicleJsonLdScript } from '$lib/vehicleStructuredData';
  import { vehicleSeo } from '$lib/vehicleSeo';
  import { publicPhoto, publicHref, fuelLabels, transmissionLabels } from '$lib/publicVehicles';
  import DiscoverVehicles from './DiscoverVehicles.svelte';
  import { hybridNav } from './hybridNav';
  import { catalogNavigation } from './catalogNavigation';
  import './catalogNavigation.css';
  import { mobileNavigation } from './mobileNavigation';
  import { phoneAttention, ringPhone } from './phoneAttention';
  import './mobileNavigation.css';
  import ThemeToggle from './ThemeToggle.svelte';
  import { ArrowUpRight, ArrowLeft, ArrowRight, Plus, X, Heart, Menu, Phone, MapPin, Clock3, Mail } from 'lucide-svelte';
  import { cars, photo, eur, number } from './data';
  import { responsivePhoto, cardImageSizes, heroImageSizes } from './images';
  import { designMotion, entrance, conditionalEntrance } from './designMotion';
  import StageBackdrop from './StageBackdrop.svelte';
  import OrbitPerspective from './OrbitPerspective.svelte';
  import OrbitFaq from './OrbitFaq.svelte';
  import OrbitAccordion from './OrbitAccordion.svelte';
  import PublicVehicleStory from './PublicVehicleStory.svelte';
  import CabinReveal from './CabinReveal.svelte';
  import OrbitTrust from './OrbitTrust.svelte';
  import OrbitStats from './OrbitStats.svelte';
  import PublicStockBrands from './PublicStockBrands.svelte';
  import type { PublicBrandDirectory } from '$lib/catalogBrandLinks';
  import OrbitEditorialPause from './OrbitEditorialPause.svelte';
  import OrbitRedDot from './OrbitRedDot.svelte';
  import VisitInvitation from './VisitInvitation.svelte';
  import './conversationButton.css';
  import OrbitPageEnding from './OrbitPageEnding.svelte';
  import FormSelectField from './FormSelectField.svelte';
  import OrbitReviews from './OrbitReviews.svelte';
  import { standContact } from './standContact';
  import OrbitCatalog from './OrbitCatalog.svelte';
  import RelatedCarousel from './RelatedCarousel.svelte';
  import OrbitSelect from './OrbitSelect.svelte';
  import OrbitPrivacy from './OrbitPrivacy.svelte';
  import LegalInformation from '../LegalInformation.svelte';
  import OrbitAbout from './OrbitAbout.svelte';
  import OrbitComparison from './OrbitComparison.svelte';
  import OrbitFavorites from './OrbitFavorites.svelte';
  import FavoriteButton from '../FavoriteButton.svelte';
  import { useFavorites } from '$lib/favorites';
  const { ids: favoriteIds } = useFavorites();
  import CompareButton from '../CompareButton.svelte';
  import { useComparison } from '$lib/comparison';
  import { publicCard } from '$lib/publicVehicles';
  const { ids: comparisonIds, additions: comparisonAdditions } = useComparison();
  function comparisonAttention(node: HTMLElement, initial: number) {
    let previous = initial;
    let animation: Animation | undefined;
    return {
      update(value: number) {
        if (value > previous && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          animation?.cancel();
          animation = node.querySelector('.comparison-count')?.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
            { duration: 420, easing: 'ease-out' },
          );
        }
        previous = value;
      },
      destroy() { animation?.cancel(); },
    };
  }
  import { catalogCars, transmissionFor } from './catalogDemo';
  import type { CatalogCar } from './catalog';
  import { catalogResults, sortOptions } from './catalog';
  import './orbitRhythm.css';
  import './orbitInitialLight.css';
  import './orbitDetail.css';
  import './navAddress.css';
  import './homeHeroPhoto.css';
  import { aboutContent } from './aboutContent';
  let {
    id,
    catalog = false,
    privacy = false,
    legalInformation = false,
    about = false,
    compare = false,
    favorites = false,
    stock = emptyStock('unavailable'),
    brandDirectory = { status: 'unavailable', brands: [] },
    publicVehicle,
    relatedVehicles = [],
    errorStatus,
  }: {
    id?: string;
    catalog?: boolean;
    privacy?: boolean;
    legalInformation?: boolean;
    about?: boolean;
    compare?: boolean;
    favorites?: boolean;
    stock?: PublicStock;
    brandDirectory?: PublicBrandDirectory;
    publicVehicle?: PublicVehicle;
    relatedVehicles?: PublicVehicle[];
    errorStatus?: number;
  } = $props();
  const car = $derived(
    publicVehicle
      ? {
          id: publicVehicle.slug,
          brand: publicVehicle.brand,
          model: publicVehicle.model,
          year: publicVehicle.year,
          km: publicVehicle.mileage,
          fuel: fuelLabels[publicVehicle.fuel],
          line: publicVehicle.availability === 'RESERVED' ? 'Reservada' : '',
          power: publicVehicle.specifications?.powerHp ?? 0,
          category: publicVehicle.specifications?.category ?? '',
          price: publicVehicle.price === null ? Number.NaN : Number(publicVehicle.price),
          image: publicVehicle.photos.length
            ? publicPhoto(publicVehicle.slug, 0)
            : '/catalog-placeholder.svg',
        }
      : catalogCars.find((item) => item.id === id),
  );
  const detailSpecs = $derived(
    car
      ? [
          ['Marca', car.brand],
          ['Modelo', car.model],
          ['Ano', car.year],
          ['Quilometragem', number(car.km) + ' km'],
          ...(car.power ? [['Potência', car.power + ' cv']] : []),
          ...(!publicVehicle
            ? [['Caixa', transmissionFor(car)]]
            : publicVehicle.transmission
              ? [['Caixa', transmissionLabels[publicVehicle.transmission]]]
              : []),
          ['Combustível', car.fuel],
          ...(car.category ? [['Categoria', car.category]] : []),
          ...(publicVehicle?.specifications?.engineCc
            ? [['Cilindrada', publicVehicle.specifications.engineCc + ' cm³']]
            : []),
          ...(publicVehicle?.specifications?.doors
            ? [['Portas', publicVehicle.specifications.doors]]
            : []),
          ...(publicVehicle?.specifications?.seats
            ? [['Lugares', publicVehicle.specifications.seats]]
            : []),
          ...(publicVehicle?.specifications?.color
            ? [['Cor', publicVehicle.specifications.color]]
            : []),
        ]
      : [],
  );
  const suggestions = $derived(
    publicVehicle
      ? relatedVehicles.map((item) => ({
          id: item.slug,
          brand: item.brand,
          model: item.model,
          year: item.year,
          price: item.price,
          image: item.photos.length ? publicPhoto(item.slug, 0) : '/catalog-placeholder.svg',
        }))
      : car
        ? cars
            .filter(
              (item) =>
                item.id !== car.id &&
                Number.isFinite(item.price) &&
                item.price > 0 &&
                Number.isFinite(car.price) &&
                car.price > 0,
            )
            .toSorted(
              (a, b) =>
                Math.abs(a.price - car.price) - Math.abs(b.price - car.price) ||
                a.id.localeCompare(b.id),
            )
            .slice(0, 3)
        : [],
  );
  let isDark = $state(true);
  let homeBrand = $state('');
  let homeYear = $state('');
  let homeOrder = $state('relevancia');
  const homeBrands = [...new Set(cars.map((item) => item.brand))].sort();
  const homeYears = [...new Set(cars.map((item) => item.year))].sort((a, b) => b - a);
  function clearHomeFilters() {
    homeBrand = '';
    homeYear = '';
    homeOrder = 'relevancia';
  }
  let saved = $state<string[]>([]);
  let navOpen = $state(false);
  let contactDialog: HTMLDialogElement;
  let contactName = $state<HTMLInputElement>();
  let confirmationHeading = $state<HTMLHeadingElement>();
  let galleryDialog: HTMLDialogElement;
  let sent = $state(false);
  let reason = $state('Gostava de saber mais.');
  let zoom = $state(0);
  let heroIndex = $state(0);
  let heroVersion = $state(1);
  const heroCar = $derived(cars[heroIndex]!);
  const equipmentItems = [
    {
      question: 'Conforto',
      answer:
        'Climatização automática, volante multifunções e um interior pensado para os seus dias. Equipamento ilustrativo a confirmar.',
    },
    {
      question: 'Tecnologia',
      answer:
        'Conectividade, navegação e apoio ao estacionamento. Os detalhes de cada viatura devem ser confirmados com o stand.',
    },
    {
      question: 'Uma escolha informada',
      answer:
        'Na visita, peça informação sobre o histórico, a documentação, a manutenção e as condições de entrega.',
    },
  ];
  function changeHeroSlide(direction: number) {
    heroIndex = (heroIndex + direction + cars.length) % cars.length;
  }
  function heroKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') heroIndex = 0;
    else if (event.key === 'End') heroIndex = cars.length - 1;
    else changeHeroSlide(event.key === 'ArrowRight' ? 1 : -1);
  }
  const selected = $derived(
    catalogResults(
      new URLSearchParams({
        marca: homeBrand,
        ano_min: homeYear,
        ano_max: homeYear,
        ordem: homeOrder,
      }),
      cars,
    ).items.slice(0, 5),
  );
  onMount(() => {
    try {
      const theme = localStorage.getItem('anm-orbit-theme');
      if (theme) isDark = theme === 'dark';
      const stored = JSON.parse(localStorage.getItem('anm-design-saved') || '[]');
      if (Array.isArray(stored)) saved = stored.filter((item) => typeof item === 'string');
    } catch {}
  });
  $effect(() => {
    id;
    publicVehicle?.slug;
    navOpen = false;
    zoom = 0;
  });
  function toggleTheme() {
    isDark = !isDark;
    try {
      localStorage.setItem('anm-orbit-theme', isDark ? 'dark' : 'light');
    } catch {}
  }
  function toggleSave(value: string) {
    saved = saved.includes(value) ? saved.filter((item) => item !== value) : [...saved, value];
    try {
      localStorage.setItem('anm-design-saved', JSON.stringify(saved));
    } catch {}
  }
  async function contact(message?: string) {
    reason =
      message ||
      (car ? `Gostava de conhecer o ${car.brand} ${car.model}.` : 'Gostava de saber mais.');
    sent = false;
    await tick();
    contactDialog.showModal();
    contactName?.focus({ preventScroll: true });
  }
  let contactPointerStartedOutside = false;
  function outsideContact(event: MouseEvent | PointerEvent) {
    const bounds = contactDialog.getBoundingClientRect();
    return (
      event.target === contactDialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    );
  }
  function contactBackdropClick(event: MouseEvent) {
    if (contactPointerStartedOutside && outsideContact(event)) contactDialog.close();
    contactPointerStartedOutside = false;
  }
  function contactKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const controls = contactDialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  function ringNavPhone(event: PointerEvent | FocusEvent) {
    ringPhone((event.currentTarget as HTMLAnchorElement).querySelector('svg'));
  }
</script>

<svelte:head>
  {#if publicVehicle}
    {@const seo = vehicleSeo(publicVehicle)}
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
    {#if publicVehicle.photos.length}<meta property="og:image" content={new URL(publicPhoto(publicVehicle.slug, 0), $page.url.origin).href} />{/if}
    <link rel="canonical" href={publicVehicleCanonical(publicVehicle, $page.url.origin)} />
    <meta property="og:url" content={publicVehicleCanonical(publicVehicle, $page.url.origin)} />
    {@html vehicleJsonLdScript(publicVehicle, $page.url.origin)}
  {/if}
  {#if !favorites && !compare && !id && !catalog && !privacy && !publicVehicle && !errorStatus}
    <link rel="canonical" href={new URL(about ? '/quem-somos' : '/', $page.url.origin).href} />
    <meta property="og:url" content={new URL(about ? '/quem-somos' : '/', $page.url.origin).href} />
  {/if}

  <link rel="preload" href={orbitFont400} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={orbitFont500} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={orbitFont600} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={orbitTitleFont} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={orbitTitleItalic} as="font" type="font/woff2" crossorigin="anonymous" />
  {#if !favorites && !compare && !about && !catalog && !privacy && !publicVehicle && !errorStatus}<title
      >{car ? `${car.brand} ${car.model} — Auto Nunes Martins` : 'Auto Nunes Martins — Automóveis usados'}</title
    ><meta
      name="description"
      content="Conheça a Auto Nunes Martins e consulte as viaturas publicadas. Compare preço, ano e quilometragem e contacte-nos para saber mais."
    />{/if}
  {#if id && !favorites && !compare && !about && !catalog && !privacy && !publicVehicle}<meta
      name="robots"
      content="noindex, follow"
    />{/if}</svelte:head
>

<div
  id={!favorites && !compare && !about && !id && !catalog && !privacy && !publicVehicle ? 'inicio' : undefined}
  class="design orbit"
  class:orbit-home={!favorites && !compare && !about && !id && !catalog && !privacy && !publicVehicle}
  class:orbit-catalog={catalog}
  class:orbit-inner={!!(favorites || compare || about || id || catalog || privacy || publicVehicle || errorStatus)}
  class:orbit-privacy={privacy || about || compare || favorites}
  class:orbit-company={about}
  class:orbit-detail={!!car || !!publicVehicle}
  class:public-detail={!!publicVehicle}
  class:dark={isDark}
  data-hero-version={heroVersion}
  class:has-address={!!standContact.address || !!standContact.email || standContact.hours.length > 0}
  use:designMotion
>
  <div class="read-line" aria-hidden="true"></div>
  {#if standContact.address || standContact.email || standContact.hours.length}
    <div class="nav-contact-strip">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll the contact strip.) -->
      <div class="nav-contact-inner" role="region" tabindex="0" aria-label="Contactos e horário — deslize para ver mais">
      <div class="nav-contact-left">
      {#if standContact.address}<address class="nav-address"><MapPin size={13} strokeWidth={1.6} aria-hidden="true" /><span>{standContact.address.replace(/\n/g, ' · ')}</span></address>{/if}
      {#if standContact.hours.length}<div class="nav-hours" aria-label="Horário">
        <Clock3 size={13} strokeWidth={1.6} aria-hidden="true" />
        {#each standContact.hours.filter(hours => hours.days !== 'Domingo e feriados') as hours}<span><span>{hours.days}</span><span>{hours.time}</span></span>{/each}
      </div>{/if}
      </div>
      {#if standContact.email}<span class="nav-email"><a href={`mailto:${standContact.email}`}><Mail size={13} strokeWidth={1.6} aria-hidden="true" />{standContact.email}</a></span>{/if}
      </div>
    </div>
  {/if}
  <div class="nav-reserve" aria-hidden="true"></div>
  <header
    class="stand-header"
    use:catalogNavigation={{ enabled: !!(favorites || compare || about || id || catalog || privacy || publicVehicle || errorStatus), directional: catalog, open: navOpen }}
    use:hybridNav={{
      enabled: !favorites && !compare && !about && !id && !catalog && !privacy && !publicVehicle,
      open: navOpen,
      close: () => (navOpen = false),
    }}
  >
    <a class="logo" href="/"
      ><img
        src={isDark ? '/logo-transparent-white-v3.png' : '/logo-transparent.png'}
        alt="Auto Nunes Martins — início"
        width="180"
        height="80"
      /></a
    >
    <nav
      id="stand-navigation"
      class:open={navOpen}
      aria-label="Navegação"
      use:mobileNavigation={{ open: navOpen, close: () => (navOpen = false) }}
    >
      <a
        href="/"
        aria-current={!favorites && !compare && !id && !catalog && !privacy && !about && !publicVehicle && !errorStatus
          ? 'page'
          : undefined}
        onclick={() => (navOpen = false)}><span class="nav-label">Início</span></a
      >
      <a
        href="/viaturas"
        aria-current={catalog ? 'page' : undefined}
        onclick={() => (navOpen = false)}
        ><span class="nav-label">Viaturas</span>
      </a><a
        href="/quem-somos"
        aria-current={about ? 'page' : undefined}
        onclick={() => (navOpen = false)}><span class="nav-label">Quem somos</span></a
      >
      <a href="/comparar" class:has-comparison={$comparisonIds.length > 0} use:comparisonAttention={$comparisonAdditions} aria-current={compare ? 'page' : undefined}
        aria-label={`Comparar, ${$comparisonIds.length} viaturas selecionadas`}
        onclick={() => (navOpen = false)}><span class="nav-label">Comparar</span><span class="comparison-count" aria-hidden="true">{$comparisonIds.length}</span></a>
      <div class="mobile-theme"><ThemeToggle dark={isDark} onchange={toggleTheme} /></div>
    </nav>
    <div class="header-actions">
      <div class="desktop-theme"><ThemeToggle dark={isDark} onchange={toggleTheme} /></div>
      <a class="nav-favorites" class:filled={$favoriteIds.length > 0} href="/favoritos"
        aria-current={favorites ? 'page' : undefined} aria-label={`Guardados, ${$favoriteIds.length} viaturas nos favoritos`}
        onclick={() => (navOpen = false)}><Heart size={19} strokeWidth={1.5} fill={$favoriteIds.length ? 'currentColor' : 'none'} aria-hidden="true" /><span class="favorite-label">Guardados</span><span class="favorite-count" class:empty={!$favoriteIds.length} aria-hidden="true">{$favoriteIds.length > 99 ? '99+' : $favoriteIds.length}</span></a>
      {#if standContact.phone}<a
          class="nav-phone"
          use:phoneAttention
          onpointerenter={ringNavPhone}
          onfocus={ringNavPhone}
          href={`tel:${standContact.phone.international}`}
          onclick={() => (navOpen = false)}
          ><Phone size={16} strokeWidth={1.7} aria-hidden="true" /><span class="nav-phone-copy"><span>Ligar agora</span><span class="nav-phone-number">{standContact.phone.display}</span></span></a
        >{/if}
      <button
        class="mobile-menu icon-button"
        aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-controls="stand-navigation"
        aria-expanded={navOpen}
        onclick={() => (navOpen = !navOpen)}
        >{#if navOpen}<X size={21} />{:else}<Menu size={21} />{/if}</button
      >
      <span class="edition-label orbit-edition-label">{'seleção'} / 0{'1'}</span>
    </div>
  </header>

  {#if errorStatus}
    <main class="not-found">
      <p class="kicker">UM DESVIO DE PERCURSO · {errorStatus}</p>
      <h1>
        {errorStatus === 404
          ? 'Esta viatura não está publicada.'
          : 'Não foi possível abrir esta página.'}
      </h1>
      <p>
        {errorStatus === 404
          ? 'Consulte a seleção atual de viaturas aprovadas para o website.'
          : 'Tente novamente mais tarde.'}
      </p>
      <a class="pill" href="/viaturas">Voltar às viaturas <ArrowUpRight size={18} /></a>
    </main>
  {:else if favorites}
    <OrbitFavorites card={vehicleCard} />
  {:else if compare}
    <OrbitComparison />
  {:else if catalog}
    <OrbitCatalog card={vehicleCard} {stock} {brandDirectory} />
  {:else if privacy}
    {#if legalInformation}<LegalInformation />{:else}<OrbitPrivacy />{/if}
  {:else if about}
    <OrbitAbout onContact={() => contact()} />
  {:else if id && !car}
    <main class="not-found">
      <p class="kicker">DESVIO DE PERCURSO</p>
      <h1>Esta viatura<br />não está por aqui.</h1>
      <a class="pill" href="/">Voltar à seleção <ArrowUpRight size={18} /></a>
    </main>
  {:else if car}
    <main class="vehicle-page">
      <div class="breadcrumbs">
        <a href="/viaturas"><ArrowLeft size={14} /> Voltar às viaturas</a><span
          >{car.brand} / {car.model}</span
        >{#if publicVehicle}<span class="detail-favorite-desktop"><FavoriteButton id={publicVehicle.slug} name={`${publicVehicle.brand} ${publicVehicle.model}`} text /></span>{:else}<button
          onclick={() => toggleSave(car.id)}
          class:saved={saved.includes(car.id)}
          aria-pressed={saved.includes(car.id)}
          ><Heart
            size={16}
            fill={saved.includes(car.id) ? 'currentColor' : 'none'}
          />{saved.includes(car.id) ? 'Guardada' : 'Guardar'}</button
        >{/if}
      </div>

      <section class="vehicle-layout" data-scene>
        <div class="vehicle-photography">
          <div class="vehicle-gallery">
            <button
              class="vehicle-photo"
              onclick={() => galleryDialog.showModal()}
              aria-label={publicVehicle && !publicVehicle.photos.length
                ? 'Imagem indisponível'
                : 'Ampliar fotografia'}
              disabled={!!publicVehicle && !publicVehicle.photos.length}
              ><img
                src={publicVehicle?.photos.length
                  ? publicPhoto(publicVehicle.slug, zoom)
                  : photo(car.image, 2000)}
                alt={`${car.brand} ${car.model} — ${publicVehicle ? (publicVehicle.photos.length ? 'fotografia ' + (zoom + 1) : 'imagem indisponível') : 'imagem ilustrativa'}`}
                style={publicVehicle
                  ? '--zoom:1;object-position:center'
                  : `--zoom:${zoom === 0 ? 1 : 1.32};object-position:${zoom === 1 ? '25%' : zoom === 2 ? '75%' : '50%'} center`}
              /><span class="photo-counter"
                >{publicVehicle
                  ? publicVehicle.photos.length
                    ? zoom + 1 + ' / ' + publicVehicle.photos.length
                    : 'SEM FOTOGRAFIA'
                  : '01 / 01'} <span>{publicVehicle ? '' : 'FOTOGRAFIA ILUSTRATIVA'}</span></span
              ><span class="expand"><Plus size={24} /></span></button
            >
            {#if publicVehicle}
              {#if publicVehicle.photos.length > 1}<div
                  class="detail-thumbnails"
                  role="group"
                  aria-label="Fotografias da viatura"
                >
                  {#each publicVehicle.photos as _, i}<button
                      type="button"
                      aria-label={'Ver fotografia ' + (i + 1)}
                      aria-pressed={zoom === i}
                      onclick={() => (zoom = i)}
                      ><img src={publicPhoto(publicVehicle.slug, i)} alt="" loading="lazy" /><span
                        >{i + 1}</span
                      ></button
                    >{/each}
                </div>{/if}
            {:else}
              <div
                class="detail-thumbnails"
                role="group"
                aria-label="Vistas da fotografia ilustrativa"
              >
                {#each ['Completa', 'Pormenor I', 'Pormenor II'] as label, i}
                  <button
                    type="button"
                    aria-label={'Ver vista: ' + label}
                    aria-pressed={zoom === i}
                    onclick={() => (zoom = i)}
                  >
                    <img
                      src={photo(car.image, 320)}
                      alt=""
                      style:transform={'scale(' + (i === 0 ? 1 : 1.32) + ')'}
                      style:object-position={(i === 1 ? '25%' : i === 2 ? '75%' : '50%') +
                        ' center'}
                    />
                    <span>{label}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          <div class="photo-controls">
            <span
              >{publicVehicle
                ? publicVehicle.photos.length +
                  (publicVehicle.photos.length === 1 ? ' fotografia' : ' fotografias')
                : 'Veja os detalhes.'}</span
            >
            {#if !publicVehicle}<div>
                {#each ['Completa', 'Pormenor I', 'Pormenor II'] as label, i}<button
                    class:active={zoom === i}
                    onclick={() => (zoom = i)}>{label}</button
                  >{/each}
              </div>{/if}
          </div>
        </div>
        <aside class="purchase" use:entrance>
          <p class="kicker"><OrbitRedDot /> UM NOVO PONTO DE PARTIDA</p>
          <h1>{car.brand}<br /><span>{car.model}</span></h1>
          {#if car.line}<p class="model-line">{car.line.split(' · ')[0]}</p>{/if}
          <div class="purchase-price">
            <span>{publicVehicle ? 'Preço publicado' : 'Preço de demonstração'}</span><strong
              >{publicVehicle ? publicPrice(publicVehicle.price) : eur(car.price)}</strong
            >
          </div>
          <div class="quick-specs">
            <span>{car.year}<small>Ano</small></span><span
              >{number(car.km)}<small>Quilómetros</small></span
            ><span>{car.fuel}<small>Combustível</small></span>
          </div>
          <button class="pill primary" onclick={() => contact()}
            >Quero conhecer <ArrowUpRight size={18} /></button
          ><button
            class="secondary-contact"
            onclick={() => contact('Gostava de apresentar a minha viatura para retoma.')}
            >Tem uma viatura para retoma? <Plus size={15} /></button
          >
          {#if publicVehicle}<div class="detail-compare" role="group" aria-label="Guardar e comparar viatura"><CompareButton id={publicVehicle.slug} name={`${publicVehicle.brand} ${publicVehicle.model}`} /><span class="detail-favorite-mobile"><FavoriteButton id={publicVehicle.slug} name={`${publicVehicle.brand} ${publicVehicle.model}`} text /></span></div>{/if}
          <p class="fine-print">
            {publicVehicle
              ? 'Confirme a disponibilidade, o histórico e as condições com o stand.'
              : 'Fotografia, preço e características ilustrativos. Esta página é uma proposta visual.'}
          </p>
        </aside>
        <section class="detail-facts" use:entrance>
          <div>
            <p class="kicker">O ESSENCIAL. SEM RUÍDO.</p>
            <h2>Todos os detalhes.<br /><span>Uma só escolha.</span></h2>
          </div>
          <dl>
            {#each detailSpecs as spec}<div>
                <dt>{spec[0]}</dt>
                <dd>{spec[1]}</dd>
              </div>{/each}
          </dl>
        </section>
        {#if !publicVehicle || publicVehicle.photos.length > 1}
          <section class="detail-band" data-scene>
            <img
              src={publicVehicle ? publicPhoto(publicVehicle.slug, 1) : photo(car.image, 1800)}
              alt=""
              loading="lazy"
            />
            <div>
              <p class="kicker">A ESCOLHA É SUA.</p>
              <h2>O caminho<br />também.</h2>
              <button class="pill" onclick={() => contact()}
                >Vamos falar <ArrowUpRight size={18} /></button
              >
            </div>
            <span class="band-index" aria-hidden="true">↗</span>
          </section>
        {/if}
        {#if publicVehicle}<PublicVehicleStory vehicle={publicVehicle} onContact={() => contact()} />{/if}
        {#if !publicVehicle}
          <section class="equipment" use:entrance>
            <h2>Bom por fora.<br />Melhor de perto.</h2>
            <div>
              {#key car.id}<OrbitAccordion
                  items={equipmentItems}
                  idPrefix={`equipment-${car.id}`}
                />{/key}
            </div>
          </section>
        {/if}
      </section>
      {#if suggestions.length}<section class="related">
          <p class="kicker">
            {publicVehicle ? 'PREÇOS PRÓXIMOS DO SEU' : 'PREÇOS PRÓXIMOS · DEMONSTRAÇÃO'}
          </p>
          <h2>Continue a explorar.</h2>
          {#if publicVehicle}
            {#key publicVehicle.slug}<RelatedCarousel vehicles={relatedVehicles} card={vehicleCard} />{/key}
          {:else}<div class="related-grid">
            {#each suggestions as item}<a
                href={publicVehicle ? publicHref(item.id) : `/demo/${item.id}`}
                ><div class="related-image">
                  <img
                    src={photo(item.image, 900)}
                    alt={`${item.brand} ${item.model}`}
                    loading="lazy"
                  /><span><ArrowUpRight size={20} /></span>
                </div>
                <div class="related-body">
                  <span class="related-brand">{item.brand}</span>
                  <h3>{item.model}</h3>
                  <p>{item.year}</p>
                  <strong class="related-price">{publicPrice(item.price)}</strong>
                </div></a
              >{/each}
          </div>{/if}
        </section>{/if}
    </main>
  {:else}
    <main>
      <section
        class="orbit-intro"
        data-scene
        data-scroll-hero
        aria-label="Viaturas em destaque"
        aria-roledescription="carrossel"
      >
        <div class="orbit-stage" data-hero-stage>
          {#if heroVersion === 2}<div class="home-stand-backdrop" aria-hidden="true">
            <img src={aboutContent.heroImage.id} srcset={aboutContent.heroImage.srcset} sizes="(max-width: 700px) 100vw, (max-width: 1050px) 80vw, 100vw" width="1024" height="768" alt="" loading="eager" fetchpriority="high" decoding="async" />
          </div>{/if}
          <StageBackdrop />
          <div class="orbit-topline">
            <span class="kicker hero-kicker"
              ><span class="hero-kicker-dot"><OrbitRedDot /></span><span
                >AUTOMÓVEIS USADOS.<span class="hero-kicker-complement">NOVAS HISTÓRIAS.</span
                ></span
              ></span
            ><span class="kicker">PORTUGAL / SELEÇÃO AUTOMÓVEL</span>
          </div>
          <div class="orbit-copy">
            <img
              class="orbit-hero-signature"
              src={isDark || heroVersion === 2 ? '/logo-transparent-white-v3.png' : '/logo-transparent.png'}
              alt="Auto Nunes Martins"
              width="1881"
              height="836"
            />
            <h1 class="orbit-title">
              O próximo<br /><span>é seu<span class="hero-period">.</span></span>
            </h1>
            <p class="orbit-title-note">
              O carro certo para os seus dias.<br />Escolhido ao seu ritmo.
            </p>
          </div>
          <div class="orbit-object">
            <div class="object-edge"></div>
            <a
              class="orbit-main-photo"
              id="orbit-featured"
              href={`/demo/${heroCar.id}`}
              aria-label={`Ver ${heroCar.brand} ${heroCar.model} — destaque ${heroIndex + 1} de ${cars.length}`}
            >
              {#each cars as featured, index (featured.id)}
                <img
                  class:active={heroIndex === index}
                  src={photo(featured.image, 1800)}
                  srcset={responsivePhoto(featured.image)}
                  sizes={heroVersion === 2 ? '(max-width: 700px) 92vw, 57vw' : heroImageSizes}
                  alt={heroIndex === index
                    ? `${featured.brand} ${featured.model} — imagem ilustrativa`
                    : ''}
                  aria-hidden={heroIndex !== index}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'low'}
                  decoding="async"
                />
              {/each}
              <span class="featured-badge" aria-hidden="true">EM DESTAQUE</span>
              <div>
                <span
                  >{heroCar.brand}
                  {heroCar.model}<small>{heroCar.year} · {number(heroCar.km)} KM</small></span
                >
                <ArrowUpRight size={24} />
              </div></a
            ><span class="object-coordinate coordinate-a" aria-hidden="true">EM DESTAQUE</span>
          </div>
          <div
            class="orbit-side"
            role="group"
            aria-label="Navegar pelos destaques"
            style={`--hero-progress:${(heroIndex + 1) / cars.length}`}
          >
            <button
              type="button"
              aria-label="Destaque anterior"
              aria-controls="orbit-featured"
              onclick={() => changeHeroSlide(-1)}
              onkeydown={heroKeydown}><ArrowLeft size={18} aria-hidden="true" /></button
            >
            <div class="hero-slide-index" aria-hidden="true">
              <span>{String(heroIndex + 1).padStart(2, '0')}</span>
              <span class="hero-index-track"></span>
              <span>{String(cars.length).padStart(2, '0')}</span>
            </div>
            <button
              type="button"
              aria-label="Destaque seguinte"
              aria-controls="orbit-featured"
              onclick={() => changeHeroSlide(1)}
              onkeydown={heroKeydown}><ArrowRight size={18} aria-hidden="true" /></button
            >
            <span class="hero-status" role="status" aria-live="polite" aria-atomic="true">
              Destaque {heroIndex + 1} de {cars.length}: {heroCar.brand}
              {heroCar.model}.
            </span>
          </div>
        </div>
      </section>

      <div class="hero-versions" role="group" aria-label="Escolher composição do hero">
        {#each [1, 2] as version}
          <button type="button" aria-label={`Versão ${version} do hero`} aria-pressed={heroVersion === version} title={['Original', 'Fotografia imersiva'][version - 1]} onclick={() => heroVersion = version}>{version}</button>
        {/each}
      </div>
      <OrbitStats />

      <section class="showroom" id="selecao">
        <div class="showroom-heading" use:entrance>
          <div>
            <h2>
              O próximo pode estar aqui<span class="heading-period">.</span>
            </h2>
          </div>
        </div>
        <div class="showroom-layout">
          <aside class="catalog-controls">
            <div class="home-basic-filters">
              <OrbitSelect
                id="home-brand"
                label="Marca"
                value={homeBrand}
                options={[
                  { value: '', label: 'Todas as marcas' },
                  ...homeBrands.map((value) => ({ value, label: value })),
                ]}
                onChange={(value) => (homeBrand = value)}
                subtle
              />
              <OrbitSelect
                id="home-year"
                label="Ano"
                value={homeYear}
                options={[
                  { value: '', label: 'Todos os anos' },
                  ...homeYears.map((year) => ({ value: String(year), label: String(year) })),
                ]}
                onChange={(value) => (homeYear = value)}
                subtle
              />
              <OrbitSelect
                id="home-sort"
                label="Ordenar por"
                value={homeOrder}
                options={Object.entries(sortOptions).map(([value, label]) => ({ value, label }))}
                onChange={(value) => (homeOrder = value)}
                subtle
              />
              <button
                class="home-clear"
                onclick={clearHomeFilters}
                disabled={!homeBrand && !homeYear && homeOrder === 'relevancia'}
                >Limpar filtros</button
              >
            </div>

            <p class="catalog-note">
              O primeiro passo é descobrir.<br />O próximo, conhecer de perto.
            </p>
          </aside>
          <div class="car-grid" style={`--home-result-rows:${Math.max(1, selected.length)}`}>
            {#each selected as vehicle, index (vehicle.id)}{@render vehicleCard(
                vehicle,
                index,
              )}{/each}{#if selected.length === 0}<div class="no-results" aria-live="polite">
                <h3>A sua pesquisa<br />pede outro caminho.</h3>
                <button
                  onclick={() => {
                    clearHomeFilters();
                  }}>Limpar filtros <ArrowUpRight size={17} /></button
                >
              </div>{/if}
            <DiscoverVehicles />
          </div>
        </div>
      </section>

      <div class="home-brands"><PublicStockBrands directory={brandDirectory} /></div>

      <section class="about" id="sobre">
        <div class="about-head" use:entrance>
          <h2>Não vendemos<br />a mesma escolha<br /><span>a toda a gente.</span></h2>
        </div>
        <div class="about-content" use:entrance={120}>
          <p>
            Os seus dias, os seus planos, o que espera de um carro. É por aí que começa a conversa.
          </p>
          <p class="muted">
            Acreditamos em informação clara e no tempo certo para decidir. Descubra a seleção,
            conheça os detalhes e fale connosco sobre aquilo que procura.
          </p>
          <button class="conversation-pill" onclick={() => contact()}
            >Vamos conhecer-nos <ArrowUpRight size={18} /></button
          >
          <div class="about-signature">
            <span>AUTO NUNES MARTINS</span><span>COMÉRCIO DE AUTOMÓVEIS</span>
          </div>
        </div>
      </section>

      <CabinReveal />
      <OrbitPerspective />
      <OrbitTrust />
      <OrbitReviews />
      <OrbitEditorialPause onContact={contact} />
    </main>
  {/if}

  {#if !favorites && !compare && !about && !catalog && !privacy && !errorStatus}<section class="services">
      <p class="kicker">O CARRO É SÓ O INÍCIO.</p>
      <div>
        {#each [['01', 'Dar o próximo passo.', 'Conheça a viatura ao seu ritmo. Combine uma visita e esclareça as suas dúvidas.', 'Quero combinar uma visita.'], ['02', 'Mudar de companhia.', 'Tem uma viatura para retoma? Conte-nos um pouco sobre ela e sobre os seus planos.', 'Gostava de falar sobre uma retoma.'], ['03', 'Saber os detalhes.', 'Equipamento, documentação e condições: reúna a informação antes de decidir.', 'Gostava de esclarecer algumas dúvidas.']] as service, index}<article
            use:conditionalEntrance={car || publicVehicle ? false : index * 90}
          >
            <span>{service[0]}<ArrowUpRight size={22} /></span>
            <h3>{service[1]}</h3>
            <p>{service[2]}</p>
            <button onclick={() => contact(service[3])}><span class="service-cta-label">Vamos conversar</span><ArrowUpRight size={15} aria-hidden="true" /></button>
          </article>{/each}
      </div>
    </section>{/if}
  {#if (catalog || privacy) && !errorStatus}
    <OrbitFaq />
  {:else if favorites || compare || about || catalog || privacy || publicVehicle || errorStatus}
    <!-- The shared contact/footer follows the content without duplicating the homepage FAQ. -->
  {:else if !id}
    <VisitInvitation onContact={contact} logoSrc={'/logo-transparent.png'} />
    <OrbitFaq />
  {:else}
    <OrbitFaq
      heading="Perguntas com resposta"
      showIntro={false}
      questions={[
        {
          question: 'Como posso visitar o stand?',
          answer:
            'Indique a viatura e a sua disponibilidade no formulário. Este protótipo permite experimentar o pedido sem enviar qualquer mensagem.',
        },
        {
          question: 'Posso guardar uma viatura?',
          answer:
            'Sim. Use o coração junto de cada carro. A seleção fica guardada neste navegador e pode consultá-la no filtro Guardadas.',
        },
        {
          question: 'Os dados já são reais?',
          answer:
            'Não. Fotografias, preços e especificações são ilustrativos. As condições comerciais serão confirmadas antes da publicação.',
        },
      ]}
    />
  {/if}

  <OrbitPageEnding onContact={() => contact()} />

  <dialog
    bind:this={contactDialog}
    class="contact-dialog"
    aria-labelledby="contact-heading"
    aria-describedby={sent ? 'contact-description' : undefined}
    onkeydown={contactKeydown}
    onpointerdown={(event) => {
      contactPointerStartedOutside = outsideContact(event);
    }}
    onpointercancel={() => {
      contactPointerStartedOutside = false;
    }}
    onclick={contactBackdropClick}
  >
    <button
      class="dialog-close icon-button"
      onclick={() => contactDialog.close()}
      aria-label="Fechar"><X size={22} /></button
    >
    <p class="kicker">VAMOS CONVERSAR</p>
    {#if sent}<h2 id="contact-heading" tabindex="-1" bind:this={confirmationHeading}>
        Primeiro passo,<br />experimentado.
      </h2>
      <p id="contact-description">
        Esta é uma demonstração. O pedido não foi enviado e os dados não foram guardados.
      </p>
      <button class="pill primary" onclick={() => contactDialog.close()}
        >Continuar a descobrir <ArrowUpRight size={18} /></button
      >{:else}<h2 id="contact-heading">O que tem<br />em mente?</h2>
      <form
        onsubmit={async (event) => {
          event.preventDefault();
          sent = true;
          await tick();
          confirmationHeading?.focus({ preventScroll: true });
        }}
      >
        <label
          >Nome<input
            bind:this={contactName}
            required
            name="name"
            autocomplete="name"
            placeholder="O seu nome"
          /></label
        ><label
          >Email<input
            required
            type="email"
            name="email"
            autocomplete="email"
            placeholder="nome@exemplo.pt"
          /></label
        ><label
          >Assunto<FormSelectField
            ><select name="subject">
              <option>Informações gerais</option>
              <option>Conhecer uma viatura</option>
              <option>Marcar uma visita</option>
              <option>Falar sobre uma retoma</option>
            </select></FormSelectField
          ></label
        ><label>Mensagem<textarea name="message" rows="3" bind:value={reason}></textarea></label
        ><button class="pill primary" type="submit"
          >Experimentar pedido <ArrowUpRight size={18} /></button
        >
      </form>{/if}
  </dialog>
  <dialog bind:this={galleryDialog} class="gallery-dialog">
    <button
      class="dialog-close icon-button"
      onclick={() => galleryDialog.close()}
      aria-label="Fechar fotografia"><X size={25} /></button
    >{#if car}<img
        src={publicVehicle?.photos.length
          ? publicPhoto(publicVehicle.slug, zoom)
          : photo(car.image, 2400)}
        alt={`${car.brand} ${car.model}${publicVehicle ? '' : ' — fotografia ilustrativa'}`}
      />
      <p>{car.brand} {car.model}{publicVehicle ? '' : ' / FOTOGRAFIA ILUSTRATIVA'}</p>{/if}
  </dialog>
</div>

{#snippet vehicleCard(vehicle: CatalogCar | PublicCard, index: number, animate: boolean = true)}
  <article class="vehicle-card" use:conditionalEntrance={animate ? (index % 2) * 110 : false}>
    <a class="card-image" href={'href' in vehicle ? vehicle.href : `/demo/${vehicle.id}`}
      ><img
        src={photo(vehicle.image, 1100)}
        srcset={responsivePhoto(vehicle.image, 1600)}
        sizes={cardImageSizes}
        alt={`${vehicle.brand} ${vehicle.model}${'approved' in vehicle ? (vehicle.image === '/catalog-placeholder.svg' ? ' — imagem indisponível' : '') : ' — imagem ilustrativa'}`}
        loading="lazy"
      />{#if vehicle.category}<span class="image-category">{vehicle.category}</span>{/if}<span
        class="card-arrow"><ArrowUpRight size={23} /></span
      ></a
    >
    <div class="card-body">
    <div class="card-info">
      <a href={'href' in vehicle ? vehicle.href : `/demo/${vehicle.id}`}
        ><span>{vehicle.brand}</span>
        <h3>{vehicle.model}</h3></a
      >{#if 'approved' in vehicle}<FavoriteButton id={vehicle.id} name={`${vehicle.brand} ${vehicle.model}`} />{:else}<button
        class="save"
        class:saved={saved.includes(vehicle.id)}
        onclick={() => toggleSave(vehicle.id)}
        aria-label={`${saved.includes(vehicle.id) ? 'Remover' : 'Guardar'} ${vehicle.brand} ${vehicle.model}`}
        aria-pressed={saved.includes(vehicle.id)}
        ><Heart size={18} fill={saved.includes(vehicle.id) ? 'currentColor' : 'none'} /></button
      >{/if}
    </div>
    <div class="card-specs">
      <span>{vehicle.year}</span><span>{number(vehicle.km)} km</span><span>{vehicle.fuel}</span>
    </div>
    <div class="card-price">
      <strong>{'approved' in vehicle ? publicPrice(vehicle.price) : eur(vehicle.price)}</strong><a
        href={'href' in vehicle ? vehicle.href : `/demo/${vehicle.id}`}
        ><span class="card-cta-label">Ver viatura</span> <ArrowUpRight size={14} /></a
      >
    </div>
    {#if 'approved' in vehicle}<div class="card-compare"><CompareButton id={vehicle.id} name={`${vehicle.brand} ${vehicle.model}`} /></div>{/if}
    </div>
  </article>
{/snippet}

<style>
  .home-brands { width: var(--orbit-frame); max-width: var(--orbit-frame-max); margin: var(--orbit-space-section) auto 0; }
  .nav-favorites { position: relative; display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; color: var(--text); border-radius: 50%; }
  .nav-favorites.filled { color: var(--red); }
  .nav-favorites[aria-current="page"] { background: color-mix(in srgb, var(--text) 6%, transparent); }
  .nav-favorites .favorite-count { position: absolute; top: 0; right: 0; width: 24px; min-width: 24px; flex: 0 0 24px; height: 16px; padding: 0 3px; border-radius: 10px; display: grid; place-items: center; background: var(--bg); color: var(--text); font-size: 9px; border: 1px solid var(--line); font-variant-numeric: tabular-nums; }
  .nav-favorites .favorite-count.empty { visibility: hidden; }
  .favorite-label { display: none; color: var(--text); }
  .desktop-theme :global(button) { border: 1px solid var(--line); border-radius: 4px; min-height: 44px; padding-inline: 10px; }
  @media (min-width: 1001px) {
    .design.orbit .header-actions { gap: 12px; }
    .nav-favorites { display: inline-flex; gap: 8px; width: auto; padding-inline: 10px; border-radius: 4px; font-size: 12px; text-decoration: none; }
    .favorite-label { display: inline; }
    .nav-favorites .favorite-count { position: static; }
    .nav-favorites:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }
  }
  .nav-favorites:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }
  .mobile-theme { display: none; }
  @media (max-width: 700px) {
    .desktop-theme { display: none; }
    .mobile-theme { display: block; border-top: 1px solid var(--line); padding-top: 8px; }
    .mobile-theme :global(button) { min-height: 44px; gap: 9px; }
    .mobile-theme :global(button span) { display: inline; }
    .design.orbit .stand-header .logo { width: 96px; flex-basis: 96px; padding: 0; }
    .design.orbit .stand-header .logo img { width: 100%; }
    .design.orbit > header.stand-header { padding-inline: 16px; gap: 8px; }
  }
  .comparison-count { display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: 7px; border: 1px solid var(--line); border-radius: 50%; font-size: 10px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .has-comparison .comparison-count { background: var(--red); border-color: var(--red); color: white; }
  .nav-phone-copy { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; line-height: 1.1; }
  .nav-phone-number { font-size: 10px; letter-spacing: .01em; font-weight: 400; white-space: nowrap; }
  @media (max-width: 1000px) {
    .nav-phone-number { display: none; }
    .nav-favorites .favorite-count { top: 5px; right: 0; background: transparent; border: 0; font-size: 10px; font-weight: 500; }
  }
  .card-compare { margin-top: 14px; }
  .detail-compare { margin-top: 16px; }
  @media (min-width: 701px) and (max-width: 1050px) { .design.orbit .stand-header nav { gap: 18px; } }
  @media (max-width: 380px) {
    .design.orbit > header.stand-header { padding-inline: 8px; gap: 4px; }
    .design.orbit .stand-header .logo { width: 78px; flex-basis: 78px; padding: 0; }
    .design.orbit .stand-header .logo img { width: 100%; }
    .design.orbit .nav-phone { gap: 6px; padding-inline: 8px; }
    .nav-phone-number { font-size: 9px; }
  }
  .design.orbit {
    font-family: 'Orbit Inter', Arial, sans-serif;
  }
  .home-basic-filters {
    display: grid;
    gap: 18px;
    min-width: 0;
  }
  .home-clear {
    justify-self: start;
    color: var(--muted);
    min-height: 44px;
    font-size: 12px;
    padding: 0;
    text-decoration: underline;
  }
  .home-clear:disabled {
    opacity: 0.4;
  }
  @media (max-width: 700px) {
    .home-basic-filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }
  .design.orbit-catalog,
  .design.orbit-privacy {
    --orbit-frame: min(96%, calc(100% - 48px));
    --orbit-frame-max: 1720px;
  }
  .design.orbit.orbit-company {
    --company-nav-height: 94px;
  }
  .design.orbit.orbit-company header {
    position: sticky;
    top: 0;
    height: var(--company-nav-height);
    min-height: var(--company-nav-height);
    box-sizing: border-box;
    z-index: 60;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    transform: none;
  }
  .design.orbit.orbit-company :global(#contactos) {
    scroll-margin-top: calc(var(--company-nav-height) + 20px);
  }
  @media (max-width: 700px) {
    .design.orbit.orbit-company {
      --company-nav-height: 82px;
    }
  }
  .design.orbit-catalog header,
  .design.orbit-privacy header {
    padding-inline: max(24px, 2%, calc((100% - 1720px) / 2));
  }
  @media (max-width: 700px) {
    .design.orbit-catalog,
    .design.orbit-privacy {
      --orbit-frame: 90%;
    }
    .design.orbit-catalog header,
    .design.orbit-privacy header {
      padding-inline: 5%;
    }
  }
  .design {
    --bg: #f3f3ef;
    --surface: #fff;
    --text: #171719;
    --muted: #6b6b70;
    --line: #17171924;
    --red: #e30613;
    --mx: 0;
    --my: 0;
    --p: 0;
    --enter: 1;
    --through: 0;
    background: var(--bg);
    color: var(--text);
    font:
      400 14px/1.5 'Inter',
      sans-serif;
    overflow: clip;
    color-scheme: light;
  }
  .design.orbit:not(.dark) {
    --bg: #f5f5f1;
  }
  .design.dark {
    --bg: #0c0c0e;
    --surface: #17171a;
    --text: #f5f5f1;
    --muted: #96969d;
    --line: #ffffff24;
    color-scheme: dark;
  }
  .design * {
    box-sizing: border-box;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }
  button {
    background: none;
    border: 0;
    cursor: pointer;
  }
  button,
  a,
  input,
  select,
  textarea {
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1,
  h2 {
    letter-spacing: -0.075em;
    line-height: 1.02;
    font-weight: 500;
  }
  h2 {
    font-size: clamp(40px, 4.3vw, 72px);
  }
  h3 {
    font-weight: 500;
  }
  button:disabled {
    cursor: default;
  }
  img {
    max-width: 100%;
  }
  .read-line {
    position: fixed;
    inset: 0 0 auto;
    height: 2px;
    background: var(--red);
    transform: scaleX(var(--reading, 0));
    transform-origin: left;
    z-index: 100;
    pointer-events: none;
  }
  .kicker {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 9px;
    letter-spacing: 0.13em;
    font-weight: 500;
    line-height: 1.6;
  }
  .muted {
    color: var(--muted);
  }
  header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 108px;
    padding: 0 4%;
    border-bottom: 1px solid var(--line);
    gap: 30px;
  }
  .logo {
    width: 156px;
    background: white;
    border-radius: 3px;
    padding: 4px 7px;
    flex-shrink: 0;
  }
  .logo img {
    width: 100%;
    height: auto;
    display: block;
  }
  .orbit .logo {
    background: transparent;
  }
  nav {
    display: flex;
    gap: 38px;
    align-items: center;
    font-size: 11px;
  }
  @media (min-width: 701px) {
    .design :global(.visit-invitation + .orbit-faq) {
      margin-top: clamp(32px, 4vw, 64px);
    }
    #stand-navigation > a {
      min-height: 44px;
      padding-inline: 6px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -.015em;
      text-decoration: none;
      white-space: nowrap;
    }
    #stand-navigation > a::after { content: none; }
    #stand-navigation .nav-label { position: relative; }
    #stand-navigation .nav-label::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      height: 2px;
      bottom: -9px;
      background: var(--red);
      opacity: 1;
      transform: scaleX(0);
      transform-origin: left;
    }
    #stand-navigation > a[aria-current='page'] { color: var(--text); }
    #stand-navigation > a[aria-current='page'] .nav-label::after { opacity: .7; transform: scaleX(1); }
    #stand-navigation > a:focus-visible .nav-label::after { opacity: 1; transform: scaleX(1); }
    @media (hover: hover) {
      #stand-navigation > a:hover .nav-label::after { opacity: 1; transform: scaleX(1); }
    }
    @media (prefers-reduced-motion: no-preference) {
      #stand-navigation .nav-label::after { transition: transform 180ms ease-out; }
    }
    #stand-navigation > a:focus-visible {
      outline: 2px solid var(--text);
      outline-offset: 3px;
      border-radius: 2px;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .edition-label {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .icon-button {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid var(--line);
    border-radius: 50%;
  }
  .mobile-menu {
    display: none;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    background: var(--text);
    color: var(--bg);
    padding: 17px 24px;
    border-radius: 50px;
    font-size: 11px;
    transition:
      transform 0.25s,
      background 0.25s;
  }
  .pill:hover {
    transform: translateY(-3px);
    background: var(--red);
    color: white;
  }
  .pill.primary {
    background: var(--red);
    color: white;
  }
  /* Orbit: a suspended photographic object in a scroll-controlled space. */
  .orbit-intro {
    position: relative;
    height: calc(100svh - 108px);
    min-height: 720px;
  }
  .orbit-stage {
    height: 100%;
    position: relative;
    perspective: 1400px;
    isolation: isolate;
    overflow: hidden;
  }
  .orbit-topline {
    position: absolute;
    top: 35px;
    left: 4%;
    right: 4%;
    display: flex;
    justify-content: space-between;
    z-index: 3;
  }
  .orbit-topline .kicker:last-child {
    color: var(--muted);
    font-size: 8px;
  }
  .orbit-topline .hero-kicker {
    align-items: flex-start;
  }
  .hero-kicker-dot {
    display: inline-flex;
    align-items: center;
    height: 1.6em;
  }
  .hero-kicker-complement {
    display: block;
    margin-top: 3px;
    color: var(--muted);
    font-size: 0.8em;
    font-weight: 400;
    letter-spacing: 0.1em;
  }
  @media (max-width: 701px) {
    .hero-kicker-complement {
      display: none;
    }
  }
  .orbit-title {
    position: absolute;
    top: 10%;
    left: 7%;
    font-size: clamp(90px, 12.3vw, 200px);
    z-index: 0;
    line-height: 0.9;
    letter-spacing: -0.085em;
  }
  .orbit-title > span {
    display: block;
    margin-left: 14vw;
    color: var(--muted);
  }
  .orbit-object {
    position: absolute;
    width: 48%;
    height: 47%;
    left: 33%;
    top: 30%;
    transform-style: preserve-3d;
    /* Match the animated desktop pose at zero scroll/pointer input before hydration. */
    transform: translate3d(0, 0, 0) rotateY(-7deg) rotateX(3deg) rotateZ(-3deg) scale(1);
  }
  .orbit-main-photo {
    position: absolute;
    inset: 0;
    display: block;
    border: 1px solid #ffffff20;
    overflow: hidden;
    box-shadow: 0 35px 90px #0007;
    border-radius: 5px;
    background: #252528;
  }
  .orbit-main-photo img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
  }
  .orbit-main-photo img.active {
    opacity: 1;
  }
  .orbit-main-photo > div > span {
    text-transform: uppercase;
  }
  .orbit-side {
    position: absolute;
    z-index: 4;
    right: 0;
    top: 49%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .orbit-side button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--bg);
    color: var(--text);
  }
  .orbit-side button:hover {
    background: var(--surface);
    color: var(--red);
  }
  .hero-slide-index {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }
  .hero-slide-index > span:first-child {
    color: var(--text);
  }
  .hero-index-track {
    position: relative;
    width: 1px;
    height: 56px;
    background: var(--line);
  }
  .hero-index-track::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--red);
    transform: scaleY(var(--hero-progress));
    transform-origin: top;
  }
  .hero-status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: no-preference) {
    .orbit-main-photo img {
      transition: opacity 420ms ease;
    }
    .hero-index-track::after {
      transition: transform 240ms ease;
    }
  }
  @media (max-width: 700px) {
    .orbit-side {
      top: auto;
      bottom: 60px;
      left: 5%;
      right: 5%;
      transform: none;
      flex-direction: row;
      justify-content: space-between;
    }
    .hero-slide-index {
      flex-direction: row;
      gap: 14px;
    }
    .hero-index-track {
      width: 64px;
      height: 1px;
    }
    .hero-index-track::after {
      transform: scaleX(var(--hero-progress));
      transform-origin: left;
    }
  }
  .orbit-main-photo:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, #000b, transparent 45%);
  }
  .orbit-main-photo > div {
    position: absolute;
    z-index: 2;
    bottom: 25px;
    left: 25px;
    right: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-size: 11px;
    letter-spacing: 0.05em;
  }
  .orbit-main-photo small {
    display: block;
    font-size: 8px;
    margin-top: 7px;
    opacity: 0.7;
  }
  .object-edge {
    position: absolute;
    inset: 14px -14px -14px 14px;
    border: 1px solid var(--line);
    transform: translateZ(-30px);
    border-radius: 6px;
  }
  .object-coordinate {
    position: absolute;
    font-size: 8px;
    letter-spacing: 0.12em;
    color: var(--muted);
  }
  .coordinate-a {
    top: -30px;
    left: 0;
  }
  .featured-badge {
    display: none;
    position: absolute;
    z-index: 3;
    top: clamp(14px, 1.8vw, 22px);
    left: clamp(14px, 1.8vw, 22px);
    padding: 5px 8px;
    border: 1px solid rgb(255 255 255 / 16%);
    border-radius: 3px;
    background: rgb(16 17 20 / 90%);
    color: #fff;
    font-size: clamp(9px, 0.8vw, 11px);
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.08em;
    pointer-events: none;
  }
  @media (max-width: 700px) {
    .featured-badge {
      display: block;
    }
    .orbit-object > .object-coordinate {
      display: none;
    }
  }

  :global(.motion-on) .orbit-intro {
    height: 175svh;
    min-height: 1100px;
  }
  :global(.motion-on) .orbit-stage {
    position: sticky;
    top: 0;
    height: 100svh;
  }
  :global(.motion-on) .orbit-object {
    transform: translate3d(
        calc(var(--mx) * -28px - var(--p) * 12vw),
        calc(var(--my) * -18px - var(--p) * 2vh),
        calc(var(--p) * 160px)
      )
      rotateY(calc(-9deg + var(--mx) * 9deg + var(--p) * 16deg))
      rotateX(calc(5deg - var(--my) * 7deg - var(--p) * 5deg))
      rotateZ(calc(-4deg + var(--p) * 7deg)) scale(calc(1 + var(--p) * 0.12));
  }
  :global(.motion-on) .orbit-title {
    transform: translateX(calc(var(--p) * -9vw));
    opacity: calc(1 - var(--p) * 0.75);
  }
  :global(.motion-on) .orbit-title > span {
    transform: translateX(calc(var(--p) * 22vw));
  }
  /* Flux: broad typographic opening with an unfolding triptych. */

  .showroom {
    padding: 100px 4%;
    scroll-margin-top: 25px;
  }
  .showroom-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    margin-bottom: 50px;
    gap: 25px;
  }

  .showroom-heading h2 {
    font-size: clamp(40px, 4.7vw, 72px);
  }
  .showroom-heading h2 > .heading-period {
    color: var(--red);
  }

  .showroom-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 60px;
  }
  .catalog-controls {
    position: sticky;
    top: 35px;
    align-self: start;
  }

  .catalog-note {
    font-size: 10px;
    line-height: 1.8;
    color: var(--muted);
    border-top: 1px solid var(--line);
    padding-top: 25px;
  }
  .car-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 55px 28px;
  }
  .vehicle-card {
    min-width: 0;
  }
  .vehicle-card,
  .related-grid > a {
    border-radius: 4px;
    outline: 1px solid color-mix(in srgb, var(--text) 22%, var(--bg));
    outline-offset: 0;
  }
  .related-grid > a:focus-visible {
    outline: 2px solid var(--red);
  }
  .card-image {
    display: block;
    position: relative;
    aspect-ratio: 1.5;
    overflow: hidden;
    background: var(--surface);
    border-radius: 4px;
  }
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .card-image:hover img {
    transform: scale(1.055);
  }
  .image-category {
    position: absolute;
    top: 16px;
    left: 16px;
    background: #ffffffeb;
    color: #171719;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 8px;
  }
  .card-arrow {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: #fff;
    color: #171719;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    transition: rotate 0.3s;
  }
  .card-image:hover .card-arrow {
    rotate: 45deg;
  }
  .card-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 22px;
  }
  .card-info > a > span {
    color: var(--muted);
    font-size: 10px;
  }
  .card-info h3 {
    font-size: 27px;
    letter-spacing: -0.05em;
  }
  .save {
    color: var(--muted);
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
  }
  .save.saved {
    color: var(--red);
  }
  .card-specs {
    display: flex;
    gap: 0;
    font-size: 10px;
    color: var(--muted);
    margin-top: 13px;
  }
  .card-specs > span + span:before {
    content: '·';
    padding: 0 12px;
  }
  .card-price {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--line);
    padding-top: 18px;
    margin-top: 20px;
    gap: 15px;
  }
  .card-price strong {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.04em;
  }
  .card-price > a {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 9px;
  }
  .no-results {
    grid-column: 1/-1;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    gap: 25px;
  }
  .no-results h3 {
    font-size: 35px;
    letter-spacing: -0.05em;
  }
  .no-results button {
    display: flex;
    align-items: center;
    gap: 25px;
    border-bottom: 1px solid;
    padding: 0 0 12px;
  }

  .about {
    padding: 140px 7%;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 10%;
  }

  .about-head h2 {
    font-size: clamp(45px, 5.5vw, 85px);
  }
  .about-head h2 > span {
    color: var(--muted);
  }
  .about-content {
    padding-top: 47px;
  }
  .about-content > p {
    font-size: 19px;
    line-height: 1.65;
    letter-spacing: -0.025em;
    max-width: 460px;
  }
  .about-content > p.muted {
    font-size: 13px;
    margin-top: 25px;
    line-height: 1.8;
    letter-spacing: 0;
  }
  .about-content .conversation-pill {
    margin-top: 30px;
  }
  .about-signature {
    margin-top: 50px;
    border-top: 1px solid var(--line);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    gap: 20px;
  }
  .about-signature span:last-child {
    color: var(--muted);
  }
  .services {
    padding: 20px 4% 90px;
  }
  .services > .kicker {
    padding-bottom: 25px;
  }
  .services > div {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--line);
  }
  .services article {
    padding: 32px 35px 20px 0;
  }
  .services article + article {
    border-left: 1px solid var(--line);
    padding-left: 35px;
  }
  .services article > span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: var(--red);
  }
  .services h3 {
    font-size: 25px;
    letter-spacing: -0.04em;
    margin: 30px 0 20px;
  }
  .services p {
    font-size: 12px;
    line-height: 1.8;
    color: var(--muted);
    max-width: 330px;
  }
  .services button {
    display: flex;
    gap: 30px;
    align-items: center;
    font-size: 10px;
    padding: 0;
    border: 0;
    margin-top: 30px;
  }

  /* Vehicle pages retain the visual language of their respective edition. */
  .breadcrumbs {
    padding: 30px 4%;
    display: flex;
    justify-content: space-between;
    gap: 25px;
    align-items: center;
    font-size: 10px;
    color: var(--muted);
  }
  .breadcrumbs a,
  .breadcrumbs button {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .breadcrumbs button.saved {
    color: var(--red);
  }
  .vehicle-layout {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: 5%;
    padding: 20px 4% 80px;
  }
  .vehicle-photography {
    min-width: 0;
  }
  .vehicle-photo {
    position: relative;
    display: block;
    width: 100%;
    height: 650px;
    overflow: hidden;
    padding: 0;
    background: var(--surface);
    border-radius: 5px;
  }
  .vehicle-photo > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(var(--zoom));
    transition:
      transform 0.7s,
      object-position 0.7s;
  }
  .photo-counter {
    position: absolute;
    left: 25px;
    bottom: 25px;
    display: flex;
    align-items: center;
    gap: 22px;
    font-size: 11px;
    color: white;
    text-shadow: 0 1px 5px #000;
  }
  .photo-counter > span {
    font-size: 8px;
    letter-spacing: 0.1em;
  }
  .expand {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #fff;
    color: #111;
  }
  .photo-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    gap: 15px;
    margin-top: 18px;
    color: var(--muted);
  }
  .photo-controls button {
    font-size: 9px;
    padding: 8px 10px;
    border-bottom: 1px solid transparent;
  }
  .photo-controls button.active {
    color: var(--text);
    border-color: var(--red);
  }
  .purchase {
    position: sticky;
    top: 40px;
    align-self: start;
    padding-top: 18px;
  }
  .purchase h1 {
    font-size: clamp(45px, 4.5vw, 75px);
    margin: 27px 0 18px;
  }
  .purchase h1 > span {
    color: var(--muted);
  }
  .model-line {
    font-size: 12px;
    color: var(--muted);
  }
  .purchase-price {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .purchase-price > span {
    font-size: 9px;
    color: var(--muted);
  }
  .purchase-price strong {
    font-size: 43px;
    letter-spacing: -0.06em;
    font-weight: 500;
  }
  .quick-specs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: 22px 0;
    margin: 24px 0;
  }
  .quick-specs > span {
    font-size: 16px;
    letter-spacing: -0.03em;
  }
  .quick-specs small {
    display: block;
    color: var(--muted);
    font-size: 8px;
    letter-spacing: 0;
    margin-top: 5px;
  }
  .purchase .pill {
    width: 100%;
    margin-top: 5px;
  }
  .secondary-contact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    padding: 20px 0;
    width: 100%;
  }
  .fine-print {
    font-size: 9px;
    color: var(--muted);
    line-height: 1.8;
    max-width: 310px;
  }
  .detail-facts {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 8%;
    padding: 50px 7% 100px;
  }
  .detail-facts .kicker {
    margin-bottom: 25px;
  }
  .detail-facts h2 {
    font-size: 50px;
  }
  .detail-facts h2 > span {
    color: var(--muted);
  }
  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 35px;
  }
  dl > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 0;
    border-top: 1px solid var(--line);
    gap: 15px;
  }
  dt {
    font-size: 10px;
    color: var(--muted);
  }
  dd {
    margin: 0;
    font-size: 12px;
    text-align: right;
  }
  .detail-band {
    height: 650px;
    position: relative;
    overflow: hidden;
    color: #fff;
    background: #111;
  }
  .detail-band > img {
    width: 100%;
    height: 115%;
    object-fit: cover;
    filter: brightness(0.45);
    margin-top: -5%;
  }
  .detail-band > div {
    position: absolute;
    left: 7%;
    top: 18%;
    z-index: 2;
  }
  .detail-band h2 {
    font-size: clamp(65px, 8vw, 125px);
    margin: 25px 0 35px;
  }
  .band-index {
    position: absolute;
    right: 6%;
    bottom: 8%;
    font-size: 200px;
    font-weight: 400;
    line-height: 1;
    color: #ffffff60;
  }
  :global(.motion-on) .detail-band > img {
    transform: translateY(calc((var(--through) - 0.5) * 65px));
  }
  :global(.motion-on) .band-index {
    transform: rotate(calc(var(--through) * 30deg));
  }
  .equipment {
    padding: 100px 7%;
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 8%;
  }
  .equipment h2 {
    font-size: 50px;
  }

  .related {
    padding: 30px 4% 110px;
  }
  .related > .kicker {
    margin-bottom: 22px;
  }
  .related h2 {
    font-size: 50px;
  }
  .related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    margin-top: 40px;
  }
  .related-grid > a > .related-image {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1.5;
    border-radius: 4px;
  }
  .related-grid img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: transform 0.8s;
  }
  .related-grid a:hover img {
    transform: scale(1.05);
  }
  .related-grid > a > .related-image > span {
    position: absolute;
    right: 15px;
    bottom: 15px;
    background: #fff;
    color: #111;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: grid;
    place-items: center;
  }
  .related-grid h3 {
    font-size: 22px;
    letter-spacing: -0.05em;
    margin-top: 17px;
  }
  .related-grid p {
    font-size: 10px;
    color: var(--muted);
    margin-top: 8px;
  }

  .not-found {
    min-height: 65vh;
    padding: 80px 7%;
  }
  .not-found h1 {
    font-size: clamp(40px, 6vw, 85px);
    margin: 25px 0 40px;
  }
  dialog {
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 45px;
    max-height: 90svh;
    overflow: auto;
  }
  dialog::backdrop {
    background: #000b;
    backdrop-filter: blur(12px);
  }
  .contact-dialog {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(520px, calc(100vw - 32px));
    max-width: calc(100vw - 32px);
    max-height: calc(100dvh - 32px);
    overscroll-behavior: contain;
    padding: 36px;
  }
  .dialog-close {
    position: absolute;
    top: 15px;
    right: 15px;
  }
  .contact-dialog > .kicker {
    margin-bottom: 22px;
    padding-right: 36px;
  }
  .contact-dialog h2 {
    font-size: 48px;
    margin-bottom: 22px;
  }
  .contact-dialog > p:not(.kicker) {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 22px;
  }
  .contact-dialog form {
    margin-top: 25px;
  }
  .contact-dialog label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 16px 0;
    font-size: 10px;
  }
  .contact-dialog input,
  .contact-dialog select,
  .contact-dialog textarea {
    background: var(--bg);
    border: 1px solid var(--line);
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    width: 100%;
  }
  .contact-dialog textarea {
    resize: vertical;
  }
  .contact-dialog input:focus-visible,
  .contact-dialog select:focus-visible,
  .contact-dialog textarea:focus-visible {
    outline: none;
  }
  .contact-dialog :is(input, select, textarea) {
    border-width: 1px;
  }
  .contact-dialog .dialog-close {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
  }
  .contact-dialog .dialog-close:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 3px;
  }
  @media (hover: hover) {
    .contact-dialog :is(input, select, textarea):hover {
      background: color-mix(in srgb, var(--bg) 94%, var(--text));
      border-color: color-mix(in srgb, var(--line) 55%, var(--text));
      box-shadow: 0 0 12px color-mix(in srgb, var(--text) 3%, transparent);
    }
    .contact-dialog .dialog-close:hover {
      color: var(--red);
      border-color: var(--red);
      background: color-mix(in srgb, var(--text) 7%, transparent);
    }
  }
  .contact-dialog :is(input, select, textarea):focus {
    box-shadow: inset 0 0 0 0.35px var(--text);
    background: color-mix(in srgb, var(--bg) 92%, var(--text));
    border-color: var(--text);
    outline: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .contact-dialog .dialog-close {
      transition:
        color 160ms ease,
        background-color 160ms ease,
        border-color 160ms ease;
    }
    .contact-dialog :is(input, select, textarea) {
      transition:
        background-color 180ms ease,
        border-color 180ms ease,
        box-shadow 180ms ease;
    }
    .contact-dialog[open] {
      animation: contact-arrive 220ms ease-out;
    }
    @keyframes contact-arrive {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  }
  .contact-dialog .pill {
    width: 100%;
    margin-top: 10px;
  }
  .gallery-dialog {
    background: #111;
    color: white;
    padding: 45px 25px 20px;
    width: 95vw;
    max-width: 1800px;
  }
  .gallery-dialog img {
    width: 100%;
    height: 75svh;
    object-fit: contain;
  }
  .gallery-dialog p {
    font-size: 9px;
    letter-spacing: 0.1em;
    padding-top: 15px;
    text-align: center;
  }
  @media (min-width: 1800px) {
    .showroom,
    .about,
    .services,
    .detail-facts,
    .equipment,
    .related {
      padding-left: calc((100vw - 1650px) / 2);
      padding-right: calc((100vw - 1650px) / 2);
    }
  }
  @media (max-width: 1100px) {
    nav {
      gap: 25px;
    }
    .edition-label {
      display: none;
    }
    .orbit-title {
      font-size: 13vw;
    }
    .orbit-object {
      width: 56%;
      height: 43%;
      left: 29%;
      top: 34%;
    }

    .showroom-layout {
      grid-template-columns: 160px 1fr;
      gap: 35px;
    }

    .car-grid {
      gap: 40px 22px;
    }
    .card-info h3 {
      font-size: 24px;
    }
    .card-specs {
      font-size: 9px;
    }
    .card-specs > span + span:before {
      padding: 0 8px;
    }
    .about {
      padding: 100px 4%;
      gap: 6%;
    }
    .services h3 {
      font-size: 22px;
    }
    .vehicle-layout {
      grid-template-columns: 1.3fr 1fr;
      gap: 4%;
    }
    .vehicle-photo {
      height: 570px;
    }

    .detail-facts,
    .equipment {
      padding-inline: 4%;
      gap: 5%;
    }
    .detail-facts h2,
    .equipment h2 {
      font-size: 40px;
    }
  }
  @media (max-width: 700px) {
    header {
      height: 86px;
      padding: 0 5%;
      gap: 20px;
    }
    .logo {
      width: 138px;
    }
    .header-actions {
      gap: 10px;
    }
    .mobile-menu {
      display: grid;
    }
    nav {
      display: none;
      position: absolute;
      top: 86px;
      left: 0;
      right: 0;
      padding: 25px 5%;
      background: var(--bg);
      border-bottom: 1px solid var(--line);
      font-size: 13px;
    }
    nav.open {
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .kicker {
      font-size: 8px;
    }
    .pill {
      padding: 15px 20px;
      font-size: 10px;
    }
    .orbit-intro,
    :global(.motion-on) .orbit-intro {
      height: 760px;
      min-height: 0;
    }
    .orbit-stage,
    :global(.motion-on) .orbit-stage {
      height: 100%;
      position: relative;
    }
    .orbit-topline {
      top: 30px;
      left: 5%;
      right: 5%;
    }
    .orbit-topline .kicker:first-child {
      font-size: 7px;
    }
    .orbit-topline .kicker:last-child {
      display: none;
    }
    .orbit-title {
      font-size: 18vw;
      top: 15%;
      left: 5%;
    }
    .orbit-title > span {
      margin-left: 5vw;
    }
    .orbit-object,
    :global(.motion-on) .orbit-object {
      width: 80%;
      height: 34%;
      left: 12%;
      top: 38%;
      transform: rotateY(-6deg) rotateZ(-4deg);
    }
    .orbit-main-photo > div {
      bottom: 17px;
      left: 17px;
      right: 17px;
      font-size: 9px;
    }
    .orbit-main-photo small {
      font-size: 7px;
    }
    .coordinate-a {
      font-size: 7px;
      top: -23px;
    }

    :global(.motion-on) .orbit-title {
      transform: none;
      opacity: 1;
    }
    :global(.motion-on) .orbit-title > span {
      transform: none;
    }

    .showroom {
      padding: 60px 5%;
    }
    .showroom-heading {
      gap: 20px;
      margin-bottom: 30px;
    }
    .showroom-heading h2 {
      font-size: 42px;
    }

    .showroom-layout {
      display: block;
    }
    .catalog-controls {
      position: static;
      margin-bottom: 30px;
    }

    .catalog-note {
      display: none;
    }
    .car-grid {
      grid-template-columns: 1fr;
      gap: 35px;
    }

    .card-image {
      aspect-ratio: 1.45;
    }
    .card-info h3 {
      font-size: 27px;
    }
    .card-info {
      margin-top: 17px;
    }
    .card-specs {
      font-size: 10px;
    }
    .card-price {
      margin-top: 16px;
      padding-top: 15px;
    }
    .card-price strong {
      font-size: 22px;
    }

    .about {
      padding: 70px 5%;
      grid-template-columns: 1fr;
      gap: 30px;
    }
    .about-head h2 {
      font-size: 49px;
    }
    .about-content {
      padding: 0;
    }
    .about-content > p {
      font-size: 17px;
    }
    .about-signature {
      margin-top: 35px;
      font-size: 7px;
    }
    .services {
      padding: 0 5% 55px;
    }
    .services > div {
      grid-template-columns: 1fr;
    }
    .services article,
    .services article + article {
      padding: 27px 0;
      border-left: 0;
      border-bottom: 1px solid var(--line);
    }
    .services h3 {
      font-size: 27px;
      margin: 22px 0 15px;
    }
    .services p {
      max-width: none;
    }

    .breadcrumbs {
      padding: 23px 5%;
      font-size: 9px;
      gap: 15px;
    }
    .breadcrumbs > span {
      display: none;
    }
    .vehicle-layout {
      display: flex;
      flex-direction: column;
      padding: 10px 5% 45px;
      gap: 30px;
    }
    .vehicle-photo {
      height: 380px;
    }
    .purchase {
      position: static;
      padding-top: 0;
      width: 100%;
    }
    .purchase h1 {
      font-size: 58px;
    }
    .purchase-price {
      margin-top: 25px;
    }
    .purchase-price strong {
      font-size: 40px;
    }
    .quick-specs {
      margin-top: 20px;
    }
    .fine-print {
      max-width: none;
    }
    .photo-controls {
      font-size: 9px;
      gap: 10px;
      flex-wrap: wrap;
    }
    .photo-controls button {
      font-size: 8px;
      padding: 8px;
    }
    .photo-counter {
      left: 18px;
      bottom: 22px;
      font-size: 10px;
      gap: 15px;
    }
    .photo-counter > span {
      font-size: 6px;
    }
    .detail-facts {
      padding: 30px 5% 55px;
      grid-template-columns: 1fr;
      gap: 30px;
    }
    .detail-facts h2 {
      font-size: 42px;
    }
    dl {
      gap: 0 20px;
    }
    dl > div {
      gap: 10px;
      align-items: start;
    }
    dt {
      font-size: 9px;
    }
    dd {
      font-size: 10px;
    }
    .detail-band {
      height: 550px;
    }
    .detail-band h2 {
      font-size: 65px;
    }
    .detail-band > div {
      left: 6%;
      top: 17%;
    }
    .band-index {
      font-size: 110px;
      right: 5%;
      bottom: 10%;
    }
    .equipment {
      padding: 60px 5%;
      grid-template-columns: 1fr;
      gap: 30px;
    }
    .equipment h2 {
      font-size: 42px;
    }
    .related {
      padding: 0 5% 60px;
    }
    .related h2 {
      font-size: 40px;
    }
    .related-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      margin-top: 30px;
    }

    .contact-dialog {
      padding: 40px 25px 25px;
    }
    .contact-dialog h2 {
      font-size: 42px;
    }
    .gallery-dialog {
      padding: 50px 10px 20px;
    }
    .gallery-dialog img {
      height: 65svh;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .design * {
      animation: none !important;
      transition: none !important;
    }
    .read-line {
      display: none;
    }
    .orbit-intro,
    :global(.motion-on) .orbit-intro {
      height: 850px;
      min-height: 0;
    }

    .orbit-stage,
    :global(.motion-on) .orbit-stage {
      position: relative;
      height: 100%;
    }

    :global(.motion-on) .orbit-object {
      transform: rotateZ(-4deg);
    }
    :global(.motion-on) .orbit-title,
    :global(.motion-on) .orbit-title > span,
    :global(.motion-on) .detail-band > img,
    :global(.motion-on) .band-index {
      transform: none;
    }
    :global(.motion-on) .orbit-title {
      opacity: 1;
    }
  }
  /* Compact choreography: complete each effect within a short scroll. */
  .design {
    --intro-height: clamp(560px, 76svh, 740px);
    --scene-height: clamp(520px, 72svh, 680px);
  }
  .design header {
    height: 94px;
    padding-inline: max(4%, calc((100vw - 1440px) / 2));
  }
  .orbit-intro,
  :global(.motion-on) .orbit-intro {
    width: 94%;
    max-width: 1480px;
    margin-inline: auto;
    height: var(--intro-height);
    min-height: 0;
  }
  :global(.motion-on) .orbit-intro {
    height: calc(var(--intro-height) + 22svh);
  }
  .orbit-stage,
  :global(.motion-on) .orbit-stage {
    height: var(--intro-height);
    min-height: 0;
  }
  .orbit-title {
    top: 24%;
    left: 3%;
    font-size: clamp(62px, 6.7vw, 102px);
    line-height: 0.98;
  }
  .orbit-title > span {
    margin: 0;
  }
  .orbit-object {
    width: 47%;
    height: 54%;
    left: 49%;
    top: 20%;
  }
  .orbit-topline {
    left: 3%;
    right: 3%;
    top: 25px;
  }

  :global(.motion-on) .orbit-object {
    transform: translate3d(
        calc(var(--mx) * -16px - var(--p) * 16px),
        calc(var(--my) * -12px - var(--p) * 12px),
        0
      )
      rotateY(calc(-7deg + var(--mx) * 7deg + var(--p) * 10deg))
      rotateX(calc(3deg - var(--my) * 5deg - var(--p) * 3deg))
      rotateZ(calc(-3deg + var(--p) * 4deg)) scale(calc(1 + var(--p) * 0.035));
  }
  :global(.motion-on) .orbit-title {
    transform: translateY(calc(var(--p) * -12px));
    opacity: calc(1 - var(--p) * 0.1);
  }
  :global(.motion-on) .orbit-title > span {
    transform: translateX(calc(var(--p) * 12px));
  }

  .showroom {
    max-width: 1440px;
    width: 92%;
    margin: auto;
    padding: 55px 0 65px;
  }
  .showroom-heading {
    margin-bottom: 32px;
  }
  .showroom-heading h2 {
    font-size: clamp(35px, 3.5vw, 53px);
  }

  .showroom-layout {
    grid-template-columns: 180px 1fr;
    gap: 40px;
  }
  .car-grid {
    gap: 36px 25px;
  }

  .card-info h3 {
    font-size: 25px;
  }
  .card-info {
    margin-top: 16px;
  }
  .card-price {
    margin-top: 14px;
    padding-top: 14px;
  }

  .about {
    max-width: 1440px;
    width: 92%;
    margin: auto;
    padding: 75px 0;
    gap: 8%;
  }
  .about-head h2 {
    font-size: clamp(40px, 4.1vw, 62px);
  }
  .about-content > p {
    font-size: 17px;
  }
  .services,
  .related,
  .detail-facts,
  .equipment {
    width: 92%;
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: 0;
  }
  .services {
    padding-bottom: 55px;
  }

  .services h3 {
    font-size: 23px;
    margin: 22px 0 15px;
  }

  .vehicle-layout,
  .breadcrumbs {
    width: 92%;
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: 0;
  }
  .vehicle-photo {
    height: clamp(440px, 64svh, 600px);
  }

  .purchase h1 {
    font-size: clamp(43px, 4vw, 59px);
  }
  .detail-band {
    height: 460px;
    max-width: 1480px;
    width: 94%;
    margin-inline: auto;
  }
  .detail-band h2 {
    font-size: clamp(58px, 6vw, 86px);
  }
  .band-index {
    font-size: 140px;
  }
  @media (min-width: 701px) and (max-width: 1050px) {
    .orbit-title {
      font-size: 63px;
    }
    .orbit-object {
      width: 49%;
      left: 47%;
      height: 48%;
      top: 24%;
    }

    .showroom-layout {
      grid-template-columns: 155px 1fr;
      gap: 25px;
    }
  }
  @media (max-width: 700px) {
    .design {
      --intro-height: max(640px, calc(100svh - 82px));
      --scene-height: 550px;
    }
    .design header {
      height: 82px;
      padding-inline: 5%;
    }
    nav {
      top: 82px;
    }
    .orbit-intro,
    :global(.motion-on) .orbit-intro {
      width: 100%;
      height: var(--intro-height);
    }
    .orbit-stage,
    :global(.motion-on) .orbit-stage {
      position: relative;
      height: var(--intro-height);
    }
    .orbit-title {
      font-size: clamp(48px, 13vw, 76px);
      top: 12%;
      left: 5%;
    }
    .orbit-title > span {
      margin-left: 0;
    }
    .orbit-object,
    :global(.motion-on) .orbit-object {
      width: 68%;
      height: 32%;
      left: 24%;
      top: 39%;
      transform: rotateY(-5deg) rotateZ(-3deg);
    }
    .orbit-topline {
      left: 5%;
      right: 5%;
    }

    :global(.motion-on) .orbit-title,
    :global(.motion-on) .orbit-title > span {
      transform: none;
      opacity: 1;
    }

    .showroom {
      width: 90%;
      padding: 38px 0 45px;
    }
    .showroom-heading h2 {
      font-size: 35px;
    }
    .showroom-layout {
      display: block;
    }

    .car-grid {
      gap: 30px;
    }

    .about {
      width: 90%;
      padding: 50px 0;
    }
    .about-head h2 {
      font-size: 40px;
    }
    .services,
    .related,
    .detail-facts,
    .equipment {
      width: 90%;
    }

    .vehicle-layout,
    .breadcrumbs {
      width: 90%;
    }
    .vehicle-photo {
      height: 340px;
    }

    .detail-band {
      width: 100%;
      height: 420px;
    }
    .detail-band h2 {
      font-size: 59px;
    }
    .band-index {
      font-size: 95px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .orbit-intro,
    :global(.motion-on) .orbit-intro {
      height: var(--intro-height);
    }
    .orbit-stage,
    :global(.motion-on) .orbit-stage {
      position: relative;
    }

    :global(.motion-on) .orbit-object {
      transform: rotateZ(-3deg);
    }
    :global(.motion-on) .orbit-title,
    :global(.motion-on) .orbit-title > span {
      transform: none;
      opacity: 1;
    }
  }
  @media (min-width: 701px) {
    .design header {
      padding-inline: max(2.5%, calc((100vw - 1640px) / 2));
    }
    .orbit-intro,
    :global(.motion-on) .orbit-intro {
      width: 97%;
      max-width: 1720px;
    }
    .showroom,
    .about,
    .services,
    .related,
    .detail-facts,
    .equipment,
    .vehicle-layout,
    .breadcrumbs {
      width: 95%;
      max-width: 1640px;
    }
    .detail-band {
      width: 97%;
      max-width: 1720px;
    }
  }
  /* Element-relative destinations remain aligned at every container width. */

  @media (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .orbit-stage {
      top: max(0px, calc((100svh - var(--intro-height)) / 2));
    }

    :global(.motion-on) .orbit-intro {
      height: calc(var(--intro-height) + 32svh);
    }
  }
  @media (max-width: 700px) {
  }
  @media (max-width: 700px) and (prefers-reduced-motion: no-preference) {
    :global(.motion-on) .orbit-intro {
      height: var(--intro-height);
    }
    :global(.motion-on) .orbit-stage {
      top: auto;
    }
  }
  /* Shared scale: useful text stays readable; display type has explicit limits. */
  .design {
    --type-label: 11px;
    --type-small: 12px;
    --type-body: 14px;
    --type-section: clamp(32px, 3.2vw, 50px);
    font-size: var(--type-body);
    line-height: 1.65;
  }
  .design h1,
  .design h2 {
    line-height: 1.08;
    letter-spacing: -0.055em;
    text-wrap: balance;
  }
  .design h3 {
    line-height: 1.25;
    letter-spacing: -0.035em;
  }
  .design .kicker {
    font-size: var(--type-label);
    letter-spacing: 0.1em;
    line-height: 1.55;
  }
  .design .pill {
    min-height: 46px;
    font-size: 13px;
    padding: 13px 22px;
    gap: 20px;
  }
  .design .icon-button {
    width: 42px;
    height: 42px;
  }
  .design header {
    gap: 24px;
  }
  .design .logo {
    width: 150px;
  }
  .design nav {
    font-size: 13px;
    gap: 28px;
  }

  .edition-label {
    font-size: 10px;
  }
  .orbit-title {
    font-size: clamp(58px, 6.3vw, 98px);
  }

  .orbit-topline .kicker:last-child {
    font-size: 10px;
  }
  .orbit-main-photo > div {
    font-size: 12px;
    letter-spacing: 0.025em;
  }
  .orbit-main-photo small {
    font-size: 10px;
    margin-top: 6px;
  }
  .object-coordinate {
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .showroom-heading h2,
  .about-head h2,
  .detail-facts h2,
  .equipment h2,
  .related h2 {
    font-size: var(--type-section);
  }
  .showroom-heading {
    align-items: center;
    gap: 24px;
  }

  .showroom-layout {
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 32px;
  }

  .catalog-note {
    font-size: 12px;
    line-height: 1.75;
  }
  .car-grid {
    gap: 36px 24px;
    align-items: start;
  }
  .card-image {
    aspect-ratio: 1.55;
  }
  .card-image img {
    display: block;
  }

  .card-info {
    gap: 12px;
    margin-top: 16px;
  }
  .card-info > a {
    min-width: 0;
  }
  .card-info > a > span {
    font-size: 12px;
  }
  .card-info h3 {
    font-size: clamp(22px, 1.65vw, 27px);
    margin-top: 3px;
  }
  .save {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
  }
  .card-specs {
    flex-wrap: wrap;
    row-gap: 5px;
    font-size: 12px;
    margin-top: 12px;
  }
  .card-specs > span {
    white-space: nowrap;
  }
  .card-specs > span + span:before {
    padding: 0 9px;
  }
  .image-category {
    font-size: 11px;
    top: 13px;
    left: 13px;
    padding: 5px 10px;
  }
  .card-arrow {
    width: 38px;
    height: 38px;
    bottom: 13px;
    right: 13px;
  }
  .card-price {
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding-top: 15px;
  }
  .card-price strong {
    font-size: 23px;
    line-height: 1.2;
  }
  .card-price > a {
    font-size: 12px;
    gap: 8px;
    min-height: 32px;
  }

  .about {
    padding-block: 68px;
  }
  .about-content {
    padding-top: 38px;
  }
  .about-content > p {
    font-size: 18px;
    line-height: 1.7;
    max-width: 46ch;
  }
  .about-content > p.muted {
    font-size: 14px;
    line-height: 1.8;
    max-width: 54ch;
  }
  .about-signature {
    font-size: 10px;
    gap: 18px;
    flex-wrap: wrap;
  }
  .services article {
    min-width: 0;
  }
  .services article > span {
    font-size: 12px;
  }
  .services h3 {
    font-size: clamp(22px, 1.75vw, 28px);
  }
  .services p {
    font-size: 14px;
    line-height: 1.8;
    max-width: 40ch;
  }
  .services button {
    font-size: 12px;
    min-height: 42px;
    margin-top: 20px;
  }

  .breadcrumbs {
    font-size: 12px;
    padding-block: 24px;
  }
  .breadcrumbs button {
    min-height: 40px;
  }
  .vehicle-layout {
    grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr);
    gap: 36px;
    padding-bottom: 55px;
    align-items: start;
  }
  .vehicle-photo {
    aspect-ratio: 1.5;
    height: auto;
    max-height: 570px;
  }
  .vehicle-photo > img {
    display: block;
  }
  .photo-counter {
    font-size: 12px;
    gap: 15px;
  }
  .photo-counter > span {
    font-size: 10px;
  }
  .photo-controls {
    font-size: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .photo-controls button {
    font-size: 12px;
    min-height: 40px;
    padding: 9px 12px;
  }
  .purchase {
    min-width: 0;
    padding-top: 12px;
  }
  .purchase h1 {
    font-size: clamp(39px, 3.7vw, 56px);
    overflow-wrap: anywhere;
    margin: 22px 0 14px;
  }

  .model-line {
    font-size: 14px;
  }
  .purchase-price {
    margin-top: 26px;
  }
  .purchase-price > span {
    font-size: 12px;
  }
  .purchase-price strong {
    font-size: clamp(33px, 3vw, 43px);
  }
  .quick-specs {
    gap: 14px;
    margin-block: 20px;
    padding-block: 20px;
  }
  .quick-specs > span {
    font-size: clamp(15px, 1.2vw, 19px);
    overflow-wrap: anywhere;
  }
  .quick-specs small {
    font-size: 11px;
    line-height: 1.4;
  }
  .secondary-contact {
    font-size: 12px;
    gap: 15px;
    min-height: 46px;
    line-height: 1.5;
    text-align: left;
  }
  .fine-print {
    font-size: 11px;
    line-height: 1.75;
    max-width: 45ch;
  }
  .detail-facts,
  .equipment {
    gap: 48px;
    padding-block: 55px;
  }
  dl {
    min-width: 0;
    gap: 0 26px;
  }
  dt {
    font-size: 12px;
  }
  dd {
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  dl > div {
    gap: 16px;
    padding-block: 17px;
  }
  .detail-band {
    height: clamp(350px, 48svh, 460px);
  }
  .detail-band h2 {
    font-size: clamp(48px, 5.1vw, 75px);
    line-height: 1.08;
    margin: 20px 0 26px;
  }
  .related {
    padding-block: 30px 65px;
  }
  .related-grid {
    margin-top: 28px;
  }
  .related-grid > a > .related-image {
    aspect-ratio: 1.55;
  }
  .related-grid h3 {
    font-size: 22px;
  }
  .related-grid p {
    font-size: 12px;
  }
  .contact-dialog h2 {
    font-size: clamp(35px, 4vw, 44px);
  }
  .contact-dialog > p:not(.kicker) {
    font-size: 13px;
  }
  .contact-dialog label {
    font-size: 12px;
  }
  .contact-dialog input,
  .contact-dialog select,
  .contact-dialog textarea {
    font-size: 16px;
    min-height: 46px;
  }
  .gallery-dialog p {
    font-size: 11px;
  }
  @media (min-width: 1500px) {
    .car-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 701px) and (max-width: 1100px) {
    .design nav {
      gap: 17px;
      font-size: 12px;
    }
    .design .logo {
      width: 142px;
    }
    .design header {
      gap: 18px;
    }
    .showroom-layout {
      display: block;
    }
    .catalog-controls {
      position: static;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px 24px;
      margin-bottom: 26px;
    }

    .catalog-note {
      display: none;
    }
    .vehicle-layout {
      grid-template-columns: minmax(0, 1fr) minmax(300px, 0.9fr);
      gap: 24px;
    }

    .quick-specs {
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .quick-specs > span:last-child {
      grid-column: 1/-1;
    }
    .detail-facts,
    .equipment {
      grid-template-columns: 1fr 1.2fr;
      gap: 28px;
    }
    dl {
      grid-template-columns: 1fr;
    }
    .about {
      gap: 40px;
    }
  }
  @media (max-width: 700px) {
    .design {
      --type-label: 10px;
      --type-section: clamp(30px, 8.4vw, 39px);
    }
    .design h1,
    .design h2 {
      letter-spacing: -0.055em;
    }
    .design .logo {
      width: 135px;
    }
    .design nav {
      font-size: 14px;
    }
    .design .pill {
      font-size: 12px;
      min-height: 46px;
      padding: 12px 18px;
    }
    .orbit-title {
      font-size: clamp(46px, 12.8vw, 67px);
    }
    .orbit-object,
    :global(.motion-on) .orbit-object {
      width: 76%;
      left: 17%;
      height: 34%;
      top: 39%;
    }
    .orbit-topline .kicker {
      font-size: 9px;
      max-width: 29ch;
    }
    .object-coordinate {
      font-size: 8px;
    }
    .orbit-main-photo > div {
      font-size: 10px;
    }
    .orbit-main-photo small {
      font-size: 9px;
    }

    .showroom-heading {
      align-items: start;
    }
    .showroom-heading h2 {
      max-width: 13ch;
    }

    .car-grid {
      gap: 30px;
    }
    .card-image,
    .related-grid > a > .related-image {
      aspect-ratio: 1.45;
    }
    .card-info h3 {
      font-size: 24px;
    }
    .card-price strong {
      font-size: 23px;
    }

    .about {
      gap: 26px;
      padding-block: 48px;
    }
    .about-content {
      padding-top: 0;
    }
    .about-content > p {
      font-size: 17px;
    }
    .about-content > p.muted {
      font-size: 14px;
    }
    .about-signature {
      font-size: 10px;
    }
    .services h3 {
      font-size: 24px;
    }
    .services p {
      max-width: none;
    }

    .breadcrumbs {
      font-size: 11px;
      padding-block: 16px;
    }
    .vehicle-layout {
      display: flex;
      gap: 24px;
      padding-bottom: 32px;
    }
    .vehicle-photo {
      height: auto;
      aspect-ratio: 1.3;
      max-height: 400px;
    }
    .photo-counter {
      left: 15px;
      bottom: 20px;
      gap: 10px;
      font-size: 11px;
    }
    .photo-counter > span {
      font-size: 8px;
      max-width: 16ch;
      text-align: left;
    }
    .photo-controls {
      font-size: 12px;
    }
    .photo-controls button {
      font-size: 11px;
      padding-inline: 10px;
    }
    .purchase h1 {
      font-size: clamp(37px, 10vw, 48px);
    }

    .purchase-price strong {
      font-size: 36px;
    }
    .quick-specs {
      gap: 10px;
    }
    .quick-specs > span {
      font-size: 16px;
    }
    .quick-specs small {
      font-size: 11px;
    }
    .detail-facts,
    .equipment {
      gap: 28px;
      padding-block: 40px;
    }
    dl {
      grid-template-columns: 1fr;
      gap: 0;
    }
    dt {
      font-size: 12px;
    }
    dd {
      font-size: 13px;
    }
    .detail-band h2 {
      font-size: 49px;
    }
    .related-grid h3 {
      font-size: 23px;
    }
    .related-grid p {
      font-size: 13px;
    }
    .contact-dialog h2 {
      font-size: 36px;
    }
  }
  @media (max-width: 380px) {
    .orbit-title {
      font-size: 44px;
    }

    .card-specs {
      font-size: 11px;
    }
    .card-specs > span + span:before {
      padding-inline: 7px;
    }
  }
  /* Orbit's next chapter: a larger photograph, with a separate typographic focal point. */
  .orbit .orbit-object {
    width: 53%;
    height: 64%;
    left: 43%;
    top: calc(17% + 5px);
  }
  .orbit .orbit-title {
    z-index: 2;
    top: 24%;
  }
  .orbit .orbit-title > span {
    position: relative;
    color: var(--text);
  }
  .orbit-title-note {
    position: absolute;
    top: 60%;
    left: 3%;
    display: flex;
    align-items: center;
    gap: 13px;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  @media (prefers-reduced-motion: no-preference) {
    .orbit:global(.motion-on) .orbit-title-note {
      transform: translateX(calc(var(--p) * 10px));
    }

    .orbit:global(.motion-on) .orbit-title {
      animation: orbit-title-arrival 1000ms cubic-bezier(0.2, 0.65, 0.3, 1) both;
    }
    @keyframes orbit-title-arrival {
      from {
        opacity: 0.55;
        translate: 0 12px;
      }
      to {
        opacity: 1;
        translate: 0 0;
      }
    }
  }
  @media (min-width: 701px) and (max-width: 1050px) {
    .orbit .orbit-title {
      font-size: clamp(50px, 6.4vw, 67px);
    }
    .orbit .orbit-object {
      width: 54%;
      left: 43%;
      height: 57%;
      top: 21%;
    }
    .orbit-title-note {
      top: 55%;
      font-size: 8px;
      gap: 8px;
    }
  }
  @media (max-width: 700px) {
    .orbit .orbit-title {
      top: 12%;
      font-size: clamp(46px, 12.8vw, 67px);
    }
    .orbit .orbit-object,
    .orbit:global(.motion-on) .orbit-object {
      width: 86%;
      left: 8%;
      height: 39%;
      top: 41%;
    }
    .orbit-title-note {
      top: 35%;
      left: 5%;
      font-size: 8px;
      gap: 10px;
    }
  }
  /* Preserve the resting composition; the hero now follows natural document scroll. */
  @media (min-width: 701px) and (prefers-reduced-motion: no-preference) {
    /* Mirror heroScrollProgress at scroll zero, before parser-time initialization. */
    .orbit .orbit-intro {
      --p: clamp(0, tan(atan2(calc((100svh - var(--intro-height)) / 2 - 94px), 4svh)), 1);
    }
    .orbit .orbit-object {
      transform: translate3d(
          calc(var(--mx) * -16px - var(--p) * 16px),
          calc(var(--my) * -12px - var(--p) * 12px),
          0
        )
        rotateY(calc(-7deg + var(--mx) * 7deg + var(--p) * 10deg))
        rotateX(calc(3deg - var(--my) * 5deg - var(--p) * 3deg))
        rotateZ(calc(-3deg + var(--p) * 4deg)) scale(calc(1 + var(--p) * 0.035));
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    /* Freeze the former initial sticky offset as padding, never as scroll pinning.
       Keep the total scene height so later sections and refresh restoration stay stable. */
    .orbit .orbit-intro,
    .orbit:global(.motion-on) .orbit-intro {
      --hero-nav-space: 94px;
      box-sizing: border-box;
      height: calc(var(--intro-height) + 4svh);
      padding-top: clamp(
        0px,
        calc((100svh - var(--intro-height)) / 2 - var(--hero-nav-space)),
        4svh
      );
    }
    .orbit .orbit-stage,
    .orbit:global(.motion-on) .orbit-stage {
      position: relative;
      top: 0;
    }
  }
  @media (max-width: 700px) {
    .orbit {
      --intro-height: clamp(520px, calc(100svh - 204px), 640px);
    }
  }
  @media (max-width: 700px) and (prefers-reduced-motion: no-preference) {
    .orbit .orbit-intro,
    .orbit:global(.motion-on) .orbit-intro {
      --hero-nav-space: 82px;
    }
  }

  /* Photo stays edge-to-edge; only the information below it receives padding. */
  .design.orbit { --vehicle-card-hover-shadow: 0 8px 24px color-mix(in srgb, var(--text) 12%, transparent); }
  .design.orbit.dark { --vehicle-card-hover-shadow: 0 0 22px color-mix(in srgb, var(--text) 12%, transparent); }
  .vehicle-card, .related-grid > a {
    background: var(--bg);
  }
  .vehicle-card .card-image, .related-grid > a > .related-image {
    border-radius: 4px 4px 0 0;
  }
  .card-body, .related-body {
    padding: clamp(18px, 1.6vw, 24px);
  }
  .vehicle-card .card-info { margin-top: 0; align-items: flex-start; }
  .vehicle-card .card-info h3, .related-grid .related-body h3 {
    font-size: clamp(21px, 1.6vw, 25px);
    font-weight: 500;
    line-height: 1.25;
    letter-spacing: -.035em;
    margin-top: 5px;
    overflow-wrap: anywhere;
  }
  .vehicle-card .card-info > a > span, .related-brand {
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }
  .vehicle-card .card-specs {
    margin-top: 16px;
    font-size: 12px;
    line-height: 1.65;
  }
  .vehicle-card .card-price {
    margin-top: 20px;
    padding-top: 18px;
    gap: 12px 16px;
  }
  .vehicle-card .card-price strong, .related-price {
    font-size: clamp(21px, 1.6vw, 25px);
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -.035em;
  }
  .vehicle-card .card-price > a { min-height: 44px; font-size: 12px; }
  .related-grid .related-body p { margin-top: 12px; font-size: 12px; line-height: 1.65; }
  .related-price { display: block; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--line); }
  .vehicle-card:focus-within { outline-color: color-mix(in srgb, var(--text) 50%, var(--bg)); }
  .vehicle-card:focus-within, .related-grid > a:focus-visible { box-shadow: var(--vehicle-card-hover-shadow); }
  .vehicle-card:focus-within .card-arrow,
  .related-grid > a:focus-visible > .related-image > span { color: #fff; background: var(--red); rotate: 45deg; }
  .card-price > a:focus-visible :global(svg) { rotate: 45deg; }
  .card-arrow :global(svg), .related-image > span :global(svg) {
    color: inherit;
    stroke: currentColor;
    transition: none;
  }
  .vehicle-card .card-body :is(a, button):focus-visible { outline: 2px solid var(--red); outline-offset: 4px; }
  @media (hover: hover) {
    .vehicle-card:hover .card-arrow,
    .related-grid > a:hover > .related-image > span { color: #fff; background: var(--red); rotate: 45deg; }
    .card-price > a:hover :global(svg) { rotate: 45deg; }
    .vehicle-card:hover, .related-grid > a:hover {
      outline-color: color-mix(in srgb, var(--text) 40%, var(--bg));
      box-shadow: var(--vehicle-card-hover-shadow);
    }
    .vehicle-card .card-info > a:hover h3 {
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 4px;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .vehicle-card, .related-grid > a { transition: outline-color 180ms ease, box-shadow 240ms ease; }
    .vehicle-card .card-arrow, .related-grid > a > .related-image > span { transition: rotate 300ms ease; }
    .card-price > a :global(svg) { transition: rotate 300ms ease; }
  }
  @media (prefers-reduced-motion: reduce) {
    .vehicle-card .card-arrow, .related-grid > a > .related-image > span { transition: none; }
  }

  .card-cta-label { position: relative; }
  .card-cta-label::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 100%; height: 1px; background: currentColor; opacity: 0; transform: scaleX(0); transform-origin: left; }
  .card-price > a:focus-visible .card-cta-label::after { opacity: 1; transform: scaleX(1); }
  @media (hover: hover) {
    .card-price > a:hover .card-cta-label::after { opacity: 1; transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .card-cta-label::after { transition: transform 300ms ease, opacity 300ms ease; }
  }
  .services button > .service-cta-label { position: relative; }
  .services button > .service-cta-label::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -3px;
    height: 1px; background: var(--red); transform: scaleX(0); transform-origin: left;
  }
  .services button:focus-visible > .service-cta-label::after { transform: scaleX(1); }
  .services button :global(svg) { color: var(--text); }
  .services button:focus-visible :global(svg) { rotate: 45deg; }
  @media (hover: hover) {
    .services button:hover > .service-cta-label::after { transform: scaleX(1); }
    .services button:hover :global(svg) { rotate: 45deg; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .services button > .service-cta-label::after { transition: transform 220ms ease; }
    .services button :global(svg) { transition: rotate 220ms ease; }
  }
</style>
