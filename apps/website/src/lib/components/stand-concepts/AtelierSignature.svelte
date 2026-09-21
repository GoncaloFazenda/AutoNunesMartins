<script lang="ts">
  import { onMount } from 'svelte';
  import ScrollJourney from './ScrollJourney.svelte';
  import { scrollMotion } from './scrollMotion';
  import { cars, photo, eur, number } from './data';
  let { variant, id }: { variant: 'atelier' | 'horizonte'; id?: string } = $props();
  const base = '/stand-atelier-signature';
  let dark = $state(false);
  let saved = $state<string[]>([]);
  function toggleTheme() {
    dark = !dark;
    try {
      localStorage.setItem('anm-signature-theme', dark ? 'dark' : 'light');
    } catch {}
  }
  function saveCar() {
    if (!car) return;
    saved = saved.includes(car.id) ? saved.filter((value) => value !== car.id) : [...saved, car.id];
    try {
      localStorage.setItem('anm-signature-saved', JSON.stringify(saved));
    } catch {}
  }
  const car = $derived(cars.find((c) => c.id === id));
  let filter = $state('Todas');
  let search = $state('');
  let sort = $state('selection');
  let menu = $state(false);
  let contact = $state(false);
  let sent = $state(false);
  let gallery = $state(false);
  let angle = $state(0);
  let scroll = $state(0);
  let reduced = $state(false);
  const filtered = $derived(
    cars
      .filter(
        (c) =>
          (filter === 'Todas' || c.category === filter || c.fuel === filter) &&
          `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()),
      )
      .toSorted((a, b) =>
        sort === 'price' ? a.price - b.price : sort === 'year' ? b.year - a.year : 0,
      ),
  );
  $effect(() => {
    id;
    angle = 0;
    gallery = false;
    menu = false;
  });
  onMount(() => {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      dark = localStorage.getItem('anm-signature-theme') === 'dark';
      const stored = JSON.parse(localStorage.getItem('anm-signature-saved') || '[]');
      if (Array.isArray(stored)) saved = stored.filter((value) => typeof value === 'string');
    } catch {}
  });
  function reveal(node: HTMLElement) {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    let animations: Animation[] = [];
    const reset = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        node.classList.remove('pending');
      }
    };
    node.classList.add('pending');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          node.classList.remove('pending');
          observer.unobserve(node);
          if (preference.matches) return;
          const card = node.classList.contains('car-card');
          const index = card ? Array.from(node.parentElement?.children ?? []).indexOf(node) : 0;
          const delay =
            window.innerWidth > 700 && card
              ? (index % (window.innerWidth > 1100 ? 3 : 2)) * 100
              : 0;
          animations.push(
            node.animate(
              [
                {
                  opacity: 0,
                  transform: `perspective(1200px) translateY(${card ? 65 : 38}px) rotateX(${card ? 5 : 0}deg)`,
                },
                { opacity: 1, transform: 'perspective(1200px) translateY(0) rotateX(0)' },
              ],
              {
                duration: card ? 1000 : 850,
                delay,
                easing: 'cubic-bezier(.16,1,.3,1)',
                fill: 'backwards',
              },
            ),
          );
          const children = node.querySelectorAll<HTMLElement>(
            '.specs > div, .principles > div, .ownership-grid > article, .steps article',
          );
          children.forEach((child, i) =>
            animations.push(
              child.animate(
                [
                  { opacity: 0, transform: 'translateY(25px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                {
                  duration: 750,
                  delay: 150 + i * 120,
                  easing: 'cubic-bezier(.16,1,.3,1)',
                  fill: 'backwards',
                },
              ),
            ),
          );
        });
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    preference.addEventListener('change', reset);
    return {
      destroy() {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        preference.removeEventListener('change', reset);
      },
    };
  }
  function openContact() {
    sent = false;
    contact = true;
  }
</script>

<svelte:window
  bind:scrollY={scroll}
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      gallery = false;
      contact = false;
      menu = false;
    }
  }}
/>
<svelte:head
  ><title
    >{car
      ? `${car.brand} ${car.model}`
      : variant === 'atelier'
        ? 'O próximo capítulo começa aqui'
        : 'Há caminhos que merecem outro carro'} · Auto Nunes Martins</title
  ><meta
    name="description"
    content="Duas perspetivas sobre a próxima viagem. Descubra a seleção Auto Nunes Martins."
  /></svelte:head
>

<div class="concept {variant} signature" class:dark use:scrollMotion>
  <div class="reading-progress" aria-hidden="true"></div>
  <div class="preview">
    AUTO NUNES MARTINS <span>A sua próxima escolha começa aqui.</span><a href={`${base}#contacto`}
      >Conheça-nos ↗</a
    >
  </div>
  <header class:scrolled={scroll > 50}>
    <a class="official-logo" href={base} aria-label="Auto Nunes Martins — início"
      ><img src="/logo.png" alt="Auto Nunes Martins — comércio de automóveis" /></a
    >
    <nav class:expanded={menu} aria-label="Navegação principal">
      <a href={`${base}#colecao`}>As nossas viaturas</a><a href={`${base}#filosofia`}
        >A nossa forma de estar</a
      ><button onclick={openContact}>Vamos conversar <span>↗</span></button>
    </nav>
    <div class="header-tools">
      <button
        class="theme-toggle"
        onclick={toggleTheme}
        aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        aria-pressed={dark}>{dark ? '☀' : '☾'} <span>{dark ? 'Claro' : 'Escuro'}</span></button
      ><button
        class="menu"
        onclick={() => (menu = !menu)}
        aria-label="Abrir navegação"
        aria-expanded={menu}>{menu ? 'Fechar' : 'Menu'} ☰</button
      >
    </div>
  </header>

  {#if id && !car}
    <section class="missing">
      <p>Este caminho não tem uma viatura.</p>
      <h1>Vamos voltar<br />à seleção?</h1>
      <a class="button" href={base}>Ver viaturas ↗</a>
    </section>
  {:else if car}
    <main class="detail">
      <div class="breadcrumb">
        <a href={`${base}#colecao`}>← Todas as viaturas</a><button
          onclick={saveCar}
          aria-pressed={saved.includes(car.id)}
          >{saved.includes(car.id) ? '♥ Guardada na sua seleção' : '♡ Guardar esta viatura'}</button
        ><span>{car.brand} / {car.model}</span>
      </div>
      <section class="detail-intro" use:reveal>
        <div>
          <p class="eyebrow">A NOSSA SELEÇÃO / {car.year}</p>
          <h1>{car.brand}<br /><em>{car.model}.</em></h1>
          <p>{car.line}</p>
        </div>
        <div class="price-block">
          <small>O seu próximo capítulo</small><strong>{eur(car.price)}</strong><button
            class="button"
            onclick={openContact}>Quero conhecer esta viatura ↗</button
          >
        </div>
      </section>
      <div class="detail-image">
        <img
          src={photo(car.image, 2000)}
          alt={`${car.brand} ${car.model} — fotografia ilustrativa`}
          style={`object-position:${angle === 1 ? '25% 50%' : angle === 2 ? '75% 50%' : '50% 50%'};transform:scale(${angle ? 1.35 : 1})`}
        /><span class="image-note">Fotografia ilustrativa</span><button
          class="gallery-button"
          onclick={() => (gallery = true)}>⤢ Ampliar fotografia</button
        >
      </div>
      <div class="image-tools">
        <span>Um olhar mais próximo.</span>
        <div>
          {#each ['Completa', 'Pormenor esquerdo', 'Pormenor direito'] as label, i}<button
              class:chosen={angle === i}
              onclick={() => (angle = i)}>{label}</button
            >{/each}
        </div>
      </div>
      <section class="specs" use:reveal>
        {#each [['Ano', String(car.year)], ['Quilómetros', `${number(car.km)} km`], ['Combustível', car.fuel], ['Caixa', 'Automática'], ['Potência', `${car.power} cv`]] as spec}<div
          >
            <small>{spec[0]}</small><strong>{spec[1]}</strong>
          </div>{/each}
      </section>
      <section class="detail-story" use:reveal>
        <div>
          <p class="eyebrow">PARA OS DIAS QUE VÊM</p>
          <h2>Mais do que chegar.<br /><em>Gostar do caminho.</em></h2>
          <p>
            Há escolhas que fazem parte de quem somos. Esta é uma viatura para quem valoriza o
            prazer de conduzir, os detalhes bem resolvidos e a liberdade de decidir o próximo
            destino.
          </p>
          <p>
            Conheça-a ao seu ritmo. Estamos disponíveis para apresentar todos os detalhes e ajudar a
            encontrar a escolha certa para si.
          </p>
        </div>
        <div class="equipment">
          <h3>O essencial, à vista.</h3>
          {#each [['Conforto & interior', 'Climatização automática, volante multifunções e acabamentos de qualidade.'], ['Tecnologia & ligação', 'Sistema de navegação, conectividade Bluetooth e sensores de estacionamento.'], ['Sobre esta apresentação', 'Especificações, equipamento, preços e fotografias são exemplos para avaliação visual. Não constituem uma oferta comercial.']] as item}<details
            >
              <summary>{item[0]} <span>+</span></summary>
              <p>{item[1]}</p>
            </details>{/each}
        </div>
      </section>
      <section class="related">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CONTINUE A DESCOBRIR</p>
            <h2>Outros caminhos.</h2>
          </div>
          <a href={`${base}#colecao`}>Ver toda a seleção ↗</a>
        </div>
        <div class="cards related-cards">
          {#each cars.filter((c) => c.id !== id).slice(0, 3) as vehicle}<a
              class="car-card"
              href={`${base}/${vehicle.id}`}
              ><div class="car-photo">
                <img
                  loading="lazy"
                  src={photo(vehicle.image, 900)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                /><span>↗</span>
              </div>
              <div class="car-heading">
                <h3>{vehicle.brand} <b>{vehicle.model}</b></h3>
                <strong>{eur(vehicle.price)}</strong>
              </div>
              <p class="car-meta">
                {vehicle.year} <i>·</i>
                {number(vehicle.km)} km <i>·</i>
                {vehicle.fuel}
              </p></a
            >{/each}
        </div>
      </section>
    </main>
  {:else}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span class="dot"></span> AUTO NUNES MARTINS · SELEÇÃO AUTOMÓVEL</p>
          <h1>
            {#if variant === 'atelier'}O próximo<br />capítulo.<br /><em>O seu carro.</em>{:else}Há
              caminhos<br />que merecem<br /><em>outro carro.</em>{/if}
          </h1>
          <p class="hero-description">
            Para a rotina. Para o inesperado.<br />Para tudo o que ainda está por viver.
          </p>
          <a class="button" href="#colecao">Encontre o seu próximo carro <span>↗</span></a>
          <div class="hero-foot">
            <span>Escolhidos com critério.<br />Apresentados com transparência.</span><a
              href="#colecao"
              aria-label="Descer para as viaturas">↓</a
            >
          </div>
        </div>
        <div class="hero-visual">
          <img
            src={photo('photo-1503376780353-7e6692767b70', 2000)}
            alt="Porsche numa estrada rodeada de natureza"
            style={`transform:translateY(${reduced ? 0 : Math.min(scroll * 0.13, 100)}px) scale(1.13)`}
          />
          <div class="visual-top">
            <span>01 / EM DESTAQUE</span><span>UMA NOVA PERSPETIVA</span>
          </div>
          <a class="hero-caption" href={`${base}/porsche-911`}
            ><div>
              <small>A ARTE DE CONDUZIR</small>
              <h2>Porsche 911 Carrera</h2>
              <p>2021 · Automática · 18 900 km</p>
            </div>
            <span>↗</span></a
          >
        </div>
        <div class="hero-index">{variant === 'atelier' ? 'ATELIER — 01' : 'HORIZONTE — 02'}</div>
      </section>
      <div class="values-strip">
        <span>O carro certo.</span><span>Uma escolha informada.</span><span
          >Uma conversa de cada vez.</span
        ><span>O caminho é seu. ↗</span>
      </div>
      <section class="collection" id="colecao">
        <div class="scroll-statement">
          <p class="eyebrow">NÃO É APENAS SOBRE CONDUZIR.</p>
          <p class="statement-text">
            {#each ['É', 'sobre', 'aquilo', 'que', 'o', 'faz', 'querer', 'partir.'] as word, i}<span
                style={`--word-index:${i}`}
                >{word}
              </span>{/each}
          </p>
          <span class="statement-rule" aria-hidden="true"></span>
        </div>
        <div class="section-heading" use:reveal>
          <div>
            <p class="eyebrow">ESCOLHAS COM PERSONALIDADE</p>
            <h2>Encontre a sua<br /><em>próxima direção.</em></h2>
          </div>
          <p>
            Uma seleção para diferentes formas de viver.<br />Descubra o que faz sentido para si.
          </p>
        </div>
        <div class="filterbar">
          <div class="filters">
            {#each ['Todas', 'Familiar', 'Berlina', 'Desportivo', 'Elétrico'] as item}<button
                class:active={filter === item}
                onclick={() => (filter = item)}>{item}</button
              >{/each}
          </div>
          <div class="search-sort">
            <input
              aria-label="Pesquisar viaturas"
              placeholder="Pesquisar marca ou modelo"
              bind:value={search}
            /><select aria-label="Ordenar viaturas" bind:value={sort}
              ><option value="selection">A nossa seleção</option><option value="price"
                >Preço mais baixo</option
              ><option value="year">Mais recentes</option></select
            >
          </div>
        </div>
        <p class="results" aria-live="polite">
          {filtered.length.toString().padStart(2, '0')} VIATURAS PARA DESCOBRIR
        </p>
        <div class="cards">
          {#each filtered as vehicle, i (vehicle.id)}<a
              class="car-card"
              href={`${base}/${vehicle.id}`}
              use:reveal
              ><div class="car-photo">
                <img
                  loading="lazy"
                  src={photo(vehicle.image, 1100)}
                  alt={`${vehicle.brand} ${vehicle.model} — imagem ilustrativa`}
                />
                <div class="car-label">{vehicle.category}</div>
                <span>↗</span>
              </div>
              <div class="car-heading">
                <h3>{vehicle.brand} <b>{vehicle.model}</b></h3>
                <strong>{eur(vehicle.price)}</strong>
              </div>
              <p class="car-meta">
                {vehicle.year} <i>·</i>
                {number(vehicle.km)} km <i>·</i>
                {vehicle.fuel}
              </p>
              <div class="card-bottom">
                <small>{vehicle.line.split(' · ')[0]}</small><span>Conhecer viatura ↗</span>
              </div></a
            >{/each}
        </div>
        {#if !filtered.length}<div class="empty">
            <h3>Vamos explorar outro caminho?</h3>
            <p>Não encontrámos viaturas com esta pesquisa.</p>
            <button
              class="button"
              onclick={() => {
                filter = 'Todas';
                search = '';
              }}>Limpar filtros</button
            >
          </div>{/if}
      </section>
      <section class="philosophy" id="filosofia">
        <div class="philosophy-image">
          <img
            loading="lazy"
            src={photo('photo-1440404653325-ab127d49abc1', 1400)}
            alt="Estrada que atravessa uma paisagem natural"
          /><span>O MELHOR DESTINO É O QUE ESCOLHE.</span>
        </div>
        <div class="philosophy-copy" use:reveal>
          <p class="eyebrow">A NOSSA FORMA DE ESTAR</p>
          <h2>Um carro é pessoal.<br /><em>A escolha também.</em></h2>
          <p>
            Não há dois condutores iguais. Por isso, começamos por ouvir: os seus dias, os seus
            planos, aquilo que procura no próximo carro.
          </p>
          <p>
            Depois, tratamos de tornar a escolha mais simples. Com informação clara, atenção ao
            detalhe e espaço para decidir.
          </p>
          <a href="#contacto">Conheça-nos numa conversa <span>↗</span></a>
          <div class="principles">
            <div>
              <small>01</small>
              <h3>Ouvir primeiro.</h3>
            </div>
            <div>
              <small>02</small>
              <h3>Mostrar tudo.</h3>
            </div>
            <div>
              <small>03</small>
              <h3>Escolher bem.</h3>
            </div>
          </div>
        </div>
      </section>
      <section class="steps" use:reveal>
        <p class="eyebrow">SIMPLES, DO PRIMEIRO OLÁ À PRÓXIMA VIAGEM</p>
        <div>
          {#each [['01', 'Descubra.', 'Explore a seleção e guarde uma ideia do que procura.'], ['02', 'Conheça.', 'Veja os detalhes e combine uma visita ao seu ritmo.'], ['03', 'Parta.', 'Encontre a viatura que faz sentido na sua vida.']] as item}<article
            >
              <small>{item[0]} /</small>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </article>{/each}
        </div>
      </section>
    </main>
  {/if}

  {#if !id || car}<ScrollJourney vehicleImage={car?.image} />{/if}
  {#if saved.length && !id}
    <section class="saved-section" use:reveal>
      <p class="eyebrow">A SUA SELEÇÃO</p>
      <h2>Para voltar a ver.</h2>
      <div class="saved-list">
        {#each cars.filter((c) => saved.includes(c.id)) as selected}<a
            href={`${base}/${selected.id}`}
            ><img src={photo(selected.image, 500)} alt={selected.model} /><span
              >{selected.brand} {selected.model}<small>{eur(selected.price)}</small></span
            ><b>↗</b></a
          >{/each}
      </div>
    </section>
  {/if}
  <section class="ownership" use:reveal>
    <div class="section-heading">
      <div>
        <p class="eyebrow">CADA DETALHE CONTA</p>
        <h2>Uma escolha.<br /><em>Várias possibilidades.</em></h2>
      </div>
      <p>Há mais para conversar além do carro.<br />Vamos encontrar o caminho que faz sentido.</p>
    </div>
    <div class="ownership-grid">
      <article>
        <span class="service-symbol">↔</span><small>01 / A SUA VIATURA ATUAL</small>
        <h3>Está a pensar trocar?</h3>
        <p>
          Partilhe a marca, o modelo, o ano e os quilómetros da sua viatura. São o ponto de partida
          para conversar sobre uma possível retoma.
        </p>
        <button onclick={openContact}>Falar sobre a minha viatura ↗</button>
      </article>
      <article>
        <span class="service-symbol">↗</span><small>02 / CONHECER PRIMEIRO</small>
        <h3>Veja de perto.</h3>
        <p>
          As fotografias são o início. Combine uma visita para conhecer os detalhes, sentar-se ao
          volante e esclarecer as suas dúvidas.
        </p>
        <button onclick={openContact}>Combinar uma visita ↗</button>
      </article>
      <article>
        <span class="service-symbol">+</span><small>03 / DECIDIR COM CLAREZA</small>
        <h3>Todos os pormenores.</h3>
        <p>
          Equipamento, documentação, condições de compra e entrega: reúna a informação de que
          precisa antes de tomar a sua decisão.
        </p>
        <button onclick={openContact}>Pedir mais informações ↗</button>
      </article>
    </div>
  </section>
  <section class="faq-section" use:reveal>
    <div>
      <p class="eyebrow">ANTES DE DAR O PRÓXIMO PASSO</p>
      <h2>Boas perguntas.<br /><em>Respostas claras.</em></h2>
      <p>Há algo mais que gostava de saber?</p>
      <button onclick={openContact}>Fale connosco ↗</button>
    </div>
    <div class="faq-items">
      {#each [['Como posso conhecer uma viatura?', 'Use o pedido de contacto para indicar a viatura e a sua disponibilidade. Nesta versão de demonstração, pode experimentar o formulário sem enviar dados.'], ['Posso apresentar a minha viatura para retoma?', 'Pode indicar os dados da sua viatura no pedido de contacto. Uma eventual avaliação depende da análise da viatura e das condições acordadas com o stand.'], ['Onde encontro o equipamento e os detalhes?', 'Na ficha de cada viatura encontra as características principais e uma secção de equipamento. Nesta apresentação, os dados são ilustrativos e devem ser confirmados antes da publicação.'], ['Consigo guardar as viaturas que me interessam?', 'Sim. Abra uma ficha e carregue em Guardar esta viatura. A sua seleção fica disponível neste navegador, sem criar uma conta.'], ['Os carros apresentados estão disponíveis para compra?', 'Esta é uma proposta visual com dados de demonstração. Preços, fotografias e especificações não representam anúncios comerciais confirmados.']] as entry}<details
        >
          <summary>{entry[0]}<span>+</span></summary>
          <p>{entry[1]}</p>
        </details>{/each}
    </div>
  </section>
  <section class="contact-section" id="contacto" use:reveal>
    <p class="eyebrow">A PRÓXIMA VIAGEM COMEÇA NUMA CONVERSA</p>
    <div>
      <h2>Qual é o seu<br /><em>próximo destino?</em></h2>
      <button onclick={openContact} aria-label="Abrir pedido de contacto">↗</button>
    </div>
    <p>Estamos por aqui. Conte-nos o que procura.</p>
    <div class="contact-options">
      <button onclick={openContact}>01 — Quero conhecer uma viatura ↗</button><button
        onclick={openContact}>02 — Gostava de falar sobre uma retoma ↗</button
      >
    </div>
  </section>
  <footer>
    <a class="footer-brand" href={base}>auto nunes martins<span>O caminho é seu.</span></a>
    <div>
      <a href={`${base}#colecao`}>Viaturas</a><a href={`${base}#filosofia`}>Sobre nós</a><button
        onclick={openContact}>Contacto</button
      >
    </div>
    <div class="footer-bottom">
      <span>© {new Date().getFullYear()} Auto Nunes Martins</span><span
        >Conceito {variant === 'atelier' ? 'Atelier' : 'Horizonte'} · Demonstração visual</span
      ><a
        href="#top"
        onclick={() => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })}
        >Voltar ao início ↑</a
      >
    </div>
  </footer>

  {#if contact}<div class="modal-backdrop" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Pedido de contacto de demonstração"
        tabindex="-1"
        class="contact-modal"
      >
        <button class="close" onclick={() => (contact = false)} aria-label="Fechar">×</button>
        <p class="eyebrow">VAMOS CONVERSAR</p>
        {#if sent}<h2>Até à próxima<br /><em>conversa.</em></h2>
          <p>Esta é uma demonstração: o pedido não foi enviado e os dados não foram guardados.</p>
          <button class="button" onclick={() => (contact = false)}>Continuar a descobrir ↗</button
          >{:else}<h2>O primeiro passo<br /><em>é simples.</em></h2>
          <p>Formulário de demonstração. Nenhuma mensagem será enviada.</p>
          <form
            onsubmit={(e) => {
              e.preventDefault();
              sent = true;
            }}
          >
            <label
              >O seu nome<input required autocomplete="name" placeholder="Como se chama?" /></label
            ><label
              >Email<input
                required
                type="email"
                autocomplete="email"
                placeholder="nome@exemplo.pt"
              /></label
            ><label
              >O que procura?<textarea
                rows="3"
                value={car ? `Gostava de conhecer o ${car.brand} ${car.model}.` : ''}
                placeholder="Conte-nos um pouco dos seus planos."
              /></label
            ><button class="button" type="submit">Experimentar pedido ↗</button>
          </form>{/if}
      </section>
    </div>{/if}
  {#if gallery && car}<div
      class="modal-backdrop gallery"
      role="dialog"
      aria-modal="true"
      aria-label="Fotografia ampliada"
      tabindex="-1"
    >
      <button class="close" onclick={() => (gallery = false)} aria-label="Fechar fotografia"
        >×</button
      ><img
        src={photo(car.image, 2400)}
        alt={`${car.brand} ${car.model} — imagem ilustrativa ampliada`}
      />
      <p>Fotografia ilustrativa · {car.brand} {car.model}</p>
    </div>{/if}
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(body) {
    margin: 0;
  }
  .concept {
    --paper: #f6f4ee;
    --ink: #252c29;
    --muted: #70766f;
    --line: #d9dcd3;
    --accent: #c25437;
    --panel: #eceee6;
    background: var(--paper);
    color: var(--ink);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    font-size: 14px;
    overflow: clip;
  }
  .concept * {
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
  }
  button,
  a,
  input,
  select,
  summary,
  textarea {
    -webkit-tap-highlight-color: transparent;
  }
  button {
    cursor: pointer;
    color: inherit;
  }
  button:focus-visible,
  a:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 5px;
  }
  button {
    border: 0;
    background: none;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1,
  h2 {
    font-weight: 400;
    letter-spacing: -0.065em;
    line-height: 1.03;
  }
  h1 {
    font-size: clamp(60px, 6.8vw, 114px);
  }
  h2 {
    font-size: clamp(38px, 4.5vw, 72px);
  }
  em {
    font-family: Georgia, serif;
    font-weight: 400;
  }
  h3 {
    font-weight: 500;
  }
  small {
    font-size: 11px;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.17em;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 26px;
  }
  .dot {
    height: 6px;
    width: 6px;
    background: var(--accent);
    border-radius: 50%;
  }
  .preview {
    height: 32px;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    align-items: center;
    padding: 0 4.5%;
    gap: 20px;
    font-size: 9px;
    letter-spacing: 0.1em;
  }
  .preview span {
    opacity: 0.65;
    letter-spacing: 0;
  }
  .preview a {
    margin-left: auto;
  }
  header {
    height: 102px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4.5%;
    border-bottom: 1px solid var(--line);
    position: relative;
    z-index: 5;
    background: var(--paper);
  }
  .wordmark {
    display: flex;
    gap: 14px;
    align-items: center;
    font-size: 9px;
    letter-spacing: 0.09em;
    line-height: 1.5;
  }
  .brand-mark {
    font-size: 43px;
    letter-spacing: -6px;
    font-weight: 600;
    line-height: 1;
  }
  .brand-mark span {
    font-size: 24px;
    color: var(--accent);
    vertical-align: top;
    margin-left: 4px;
  }
  .wordmark b {
    font-weight: 600;
  }
  nav {
    display: flex;
    gap: 40px;
    align-items: center;
    font-size: 12px;
  }
  nav button {
    border-bottom: 1px solid var(--ink);
    padding: 10px 0;
  }
  nav button span {
    margin-left: 28px;
  }
  .menu {
    display: none;
  }
  .hero {
    position: relative;
    min-height: 740px;
    height: calc(100svh - 134px);
    max-height: 1050px;
    display: grid;
    grid-template-columns: 47% 53%;
    padding: 35px 4.5% 55px;
    gap: 20px;
  }
  .hero-copy {
    padding: 38px 0 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    z-index: 2;
  }
  .hero-description {
    margin: 28px 0;
    color: var(--muted);
    font-size: 15px;
  }
  .button {
    background: var(--ink);
    color: var(--paper);
    padding: 17px 25px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: 25px;
    font-size: 12px;
    border-radius: 2px;
    transition:
      background 0.25s,
      transform 0.25s;
  }
  .button:hover {
    background: var(--accent);
    transform: translateY(-2px);
  }
  .hero-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
    margin-top: auto;
    padding-top: 30px;
    font-size: 10px;
    color: var(--muted);
  }
  .hero-foot > a {
    font-size: 24px;
    border: 1px solid var(--line);
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 50%;
  }
  .hero-visual {
    overflow: hidden;
    position: relative;
    background: #343d36;
  }
  .hero-visual > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50%;
    will-change: transform;
  }
  .hero-visual:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #0002, transparent 40%, #0009);
    pointer-events: none;
  }
  .visual-top {
    position: absolute;
    z-index: 1;
    top: 28px;
    left: 28px;
    right: 28px;
    display: flex;
    justify-content: space-between;
    color: white;
    font-size: 8px;
    letter-spacing: 0.12em;
  }
  .hero-caption {
    position: absolute;
    bottom: 35px;
    left: 35px;
    right: 35px;
    z-index: 1;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: end;
  }
  .hero-caption small {
    letter-spacing: 0.15em;
    font-size: 9px;
  }
  .hero-caption h2 {
    font:
      400 27px 'Inter',
      sans-serif;
    letter-spacing: -0.04em;
    margin: 8px 0;
  }
  .hero-caption p {
    font-size: 11px;
    opacity: 0.75;
  }
  .hero-caption > span {
    border: 1px solid #fff7;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    font-size: 24px;
  }
  .hero-index {
    position: absolute;
    bottom: 17px;
    right: 4.5%;
    font-size: 8px;
    letter-spacing: 0.16em;
    color: var(--muted);
  }
  .values-strip {
    padding: 27px 4.5%;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    font-size: 12px;
  }
  .values-strip span:before {
    content: '+';
    margin-right: 20px;
    color: var(--accent);
  }
  .collection,
  .related {
    padding: 110px 4.5%;
  }
  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 30px;
    margin-bottom: 48px;
  }
  .section-heading > p {
    font-size: 13px;
    color: var(--muted);
    padding-bottom: 8px;
  }
  .section-heading > a {
    font-size: 12px;
    border-bottom: 1px solid;
    padding-bottom: 6px;
  }
  .filterbar {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--line);
    padding-bottom: 22px;
  }
  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .filters button {
    border: 1px solid var(--line);
    border-radius: 30px;
    padding: 10px 18px;
    font-size: 11px;
  }
  .filters .active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
  .search-sort {
    display: flex;
    gap: 15px;
  }
  input,
  select,
  textarea {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink);
    padding: 10px;
    font-size: 12px;
    border-radius: 0;
    max-width: 100%;
  }
  select option {
    background: var(--paper);
  }
  input::placeholder {
    color: var(--muted);
  }
  .results {
    font-size: 9px;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin: 20px 0 30px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 48px 25px;
  }
  .car-card {
    display: block;
    min-width: 0;
  }
  .car-photo {
    position: relative;
    aspect-ratio: 1.45;
    overflow: hidden;
    background: var(--panel);
  }
  .car-photo img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition:
      transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
      filter 0.5s;
    filter: saturate(0.8);
  }
  .car-card:hover img {
    transform: scale(1.045);
    filter: saturate(1);
  }
  .car-photo > span {
    position: absolute;
    bottom: 17px;
    right: 17px;
    border-radius: 50%;
    background: var(--paper);
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    font-size: 20px;
    transition: transform 0.3s;
  }
  .car-card:hover .car-photo > span {
    transform: rotate(45deg);
  }
  .car-label {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 5px 10px;
    background: #f6f4eedb;
    color: #252c29;
    font-size: 9px;
  }
  .car-heading {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
    margin: 21px 0 10px;
  }
  .car-heading h3 {
    font-size: 19px;
    line-height: 1.25;
    letter-spacing: -0.04em;
  }
  .car-heading h3 b {
    display: block;
    font-weight: 400;
    color: var(--muted);
    font-size: 16px;
    margin-top: 4px;
  }
  .car-heading strong {
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: -0.04em;
  }
  .car-meta {
    font-size: 10px;
    color: var(--muted);
  }
  .car-meta i {
    font-style: normal;
    padding: 0 10px;
  }
  .card-bottom {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--line);
    margin-top: 19px;
    padding-top: 15px;
    font-size: 10px;
  }
  .card-bottom small {
    font-size: 10px;
    color: var(--muted);
  }
  .philosophy {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--panel);
    min-height: 650px;
  }
  .philosophy-image {
    position: relative;
    overflow: hidden;
    min-height: 400px;
  }
  .philosophy-image img {
    width: 100%;
    height: 100%;
    position: absolute;
    object-fit: cover;
    filter: brightness(0.75) saturate(0.7);
  }
  .philosophy-image span {
    position: absolute;
    bottom: 35px;
    left: 9%;
    color: #fff;
    letter-spacing: 0.15em;
    font-size: 9px;
  }
  .philosophy-copy {
    padding: 80px 12%;
  }
  .philosophy-copy h2 {
    font-size: clamp(35px, 3.7vw, 58px);
    margin-bottom: 32px;
  }
  .philosophy-copy > p:not(.eyebrow) {
    font-size: 13px;
    color: var(--muted);
    max-width: 420px;
    margin-bottom: 16px;
  }
  .philosophy-copy > a {
    display: inline-flex;
    justify-content: space-between;
    gap: 35px;
    border-bottom: 1px solid;
    padding: 15px 0;
    font-size: 12px;
    margin-top: 10px;
  }
  .principles {
    display: flex;
    gap: 30px;
    border-top: 1px solid var(--line);
    margin-top: 44px;
    padding-top: 22px;
  }
  .principles small {
    color: var(--accent);
  }
  .principles h3 {
    font-size: 11px;
    margin-top: 8px;
  }
  .steps {
    padding: 100px 8%;
  }
  .steps > div {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 60px;
  }
  .steps article {
    border-top: 1px solid var(--line);
    padding-top: 24px;
  }
  .steps small {
    color: var(--accent);
  }
  .steps h3 {
    font-size: 36px;
    letter-spacing: -0.05em;
    margin: 20px 0 15px;
  }
  .steps p {
    font-size: 13px;
    max-width: 270px;
    color: var(--muted);
  }
  .contact-section {
    background: #dfe5d8;
    padding: 80px 8%;
    color: #26342e;
  }
  .contact-section > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .contact-section h2 {
    font-size: clamp(44px, 6vw, 96px);
  }
  .contact-section button {
    height: 100px;
    width: 100px;
    border: 1px solid #26342e;
    border-radius: 50%;
    font-size: 45px;
    transition:
      background 0.3s,
      color 0.3s;
  }
  .contact-section button:hover {
    background: #26342e;
    color: #fff;
  }
  .contact-section > p:last-child {
    margin-top: 25px;
    font-size: 13px;
  }
  footer {
    padding: 60px 4.5% 25px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 40px;
  }
  .footer-brand {
    font-size: 28px;
    letter-spacing: -0.06em;
  }
  .footer-brand span {
    display: block;
    letter-spacing: 0;
    font-size: 11px;
    margin-top: 8px;
    color: var(--muted);
  }
  footer > div:not(.footer-bottom) {
    display: flex;
    gap: 30px;
    align-items: start;
    font-size: 12px;
  }
  .footer-bottom {
    border-top: 1px solid var(--line);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 9px;
    color: var(--muted);
    gap: 15px;
  }
  .empty,
  .missing {
    padding: 80px 5%;
    text-align: center;
  }
  .empty p {
    margin: 15px 0 25px;
  }
  .missing h1 {
    margin: 30px 0;
  }
  .detail {
    padding-top: 0;
  }
  .breadcrumb {
    display: flex;
    justify-content: space-between;
    padding: 28px 4.5%;
    font-size: 11px;
    color: var(--muted);
  }
  .detail-intro {
    padding: 35px 8% 55px;
    display: flex;
    justify-content: space-between;
    gap: 25px;
    align-items: end;
  }
  .detail-intro h1 {
    font-size: clamp(50px, 6vw, 94px);
  }
  .detail-intro > div > p:last-child {
    margin-top: 22px;
    color: var(--muted);
    font-size: 13px;
  }
  .price-block {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 13px;
  }
  .price-block small {
    color: var(--muted);
  }
  .price-block strong {
    font-size: 38px;
    font-weight: 400;
    letter-spacing: -0.05em;
  }
  .detail-image {
    margin: 0 4.5%;
    height: 65vh;
    min-height: 350px;
    max-height: 800px;
    position: relative;
    overflow: hidden;
    background: #333;
  }
  .detail-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      transform 0.7s,
      object-position 0.7s;
  }
  .image-note {
    position: absolute;
    left: 24px;
    bottom: 25px;
    font-size: 10px;
    color: white;
    text-shadow: 0 1px 3px #000;
  }
  .gallery-button {
    position: absolute;
    right: 25px;
    bottom: 25px;
    padding: 12px 17px;
    background: var(--paper);
    font-size: 11px;
  }
  .image-tools {
    padding: 20px 4.5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    font-size: 11px;
    color: var(--muted);
  }
  .image-tools button {
    padding: 8px 15px;
    font-size: 10px;
    border-bottom: 1px solid transparent;
  }
  .image-tools .chosen {
    border-color: var(--ink);
    color: var(--ink);
  }
  .specs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin: 40px 8% 0;
    padding: 35px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .specs div {
    padding: 0 20px;
    border-right: 1px solid var(--line);
  }
  .specs div:first-child {
    padding-left: 0;
  }
  .specs div:last-child {
    border: 0;
  }
  .specs small {
    display: block;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .specs strong {
    font-size: 22px;
    font-weight: 400;
    letter-spacing: -0.05em;
  }
  .detail-story {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 10%;
    padding: 90px 8% 0;
  }
  .detail-story h2 {
    font-size: clamp(35px, 3.5vw, 58px);
    margin-bottom: 30px;
  }
  .detail-story p:not(.eyebrow) {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 18px;
    max-width: 500px;
  }
  .equipment h3 {
    font-size: 24px;
    letter-spacing: -0.04em;
    margin-bottom: 30px;
  }
  .equipment details {
    border-top: 1px solid var(--line);
  }
  summary {
    padding: 22px 0;
    list-style: none;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary span {
    font-size: 17px;
  }
  details[open] summary span {
    transform: rotate(45deg);
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
    background: #10231ecc;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px;
    overflow: auto;
  }
  .contact-modal {
    background: var(--paper);
    padding: 50px;
    width: min(560px, 100%);
    max-height: 90svh;
    overflow: auto;
    position: relative;
  }
  .close {
    position: absolute;
    top: 14px;
    right: 18px;
    font-size: 30px;
    z-index: 1;
  }
  .contact-modal h2 {
    font-size: 46px;
    margin-bottom: 20px;
  }
  .contact-modal > p:not(.eyebrow) {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 24px;
  }
  .contact-modal label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    margin: 16px 0;
  }
  .contact-modal .button {
    width: 100%;
    margin-top: 12px;
  }
  .gallery {
    flex-direction: column;
    color: white;
  }
  .gallery img {
    width: auto;
    height: auto;
    max-height: 80vh;
    max-width: 95vw;
    object-fit: contain;
  }
  .gallery p {
    margin-top: 18px;
    font-size: 12px;
  }
  .pending {
    opacity: 0;
    transform: translateY(28px);
  }
  :global([class].pending) {
    transition:
      opacity 0.8s,
      transform 0.8s;
  }
  .section-heading,
  .car-card,
  .philosophy-copy,
  .steps,
  .detail-intro,
  .specs,
  .detail-story,
  .contact-section {
    transition:
      opacity 0.8s,
      transform 0.8s;
  }
  .horizonte {
    --paper: #12251f;
    --ink: #f0f1e8;
    --muted: #a4b1a7;
    --line: #ffffff24;
    --accent: #cadd95;
    --panel: #1d342b;
  }
  .horizonte .preview {
    background: #cadd95;
    color: #12251f;
  }
  .horizonte header {
    background: #12251f;
  }
  .horizonte .hero {
    display: block;
    height: calc(100svh - 134px);
    min-height: 740px;
    padding: 0;
  }
  .horizonte .hero-visual {
    position: absolute;
    inset: 0;
  }
  .horizonte .hero-visual > img {
    object-position: 65% 55%;
    filter: saturate(0.7);
  }
  .horizonte .hero-visual:after {
    background:
      linear-gradient(90deg, #081a16ee 0%, #081a1699 37%, #081a1610 75%),
      linear-gradient(0deg, #081a1699, transparent 35%);
  }
  .horizonte .hero-copy {
    padding: 80px 6%;
    height: 100%;
    max-width: 780px;
  }
  .horizonte h1 {
    font-size: clamp(60px, 7.5vw, 120px);
  }
  .horizonte h1 em {
    color: #d6e6ab;
  }
  .horizonte .hero-description {
    color: #d0d9d0;
  }
  .horizonte .hero-foot {
    max-width: 450px;
    color: #bdc9bc;
  }
  .horizonte .hero-foot > a {
    color: #eaf1df;
  }
  .horizonte .visual-top {
    top: 40px;
    left: auto;
    right: 5%;
    gap: 30px;
  }
  .horizonte .hero-caption {
    left: auto;
    right: 5%;
    bottom: 60px;
    gap: 40px;
  }
  .horizonte .hero-index {
    color: #b8c6b4;
  }
  .horizonte .button {
    background: #d1e2aa;
    color: #162a21;
    border-radius: 40px;
  }
  .horizonte .button:hover {
    background: #e8f3d2;
  }
  .horizonte .values-strip {
    background: #1d342b;
  }
  .horizonte .collection {
    padding-top: 120px;
  }
  .horizonte .car-photo {
    border-radius: 5px;
    aspect-ratio: 1.35;
  }
  .horizonte .car-label {
    border-radius: 20px;
    background: #172b22df;
    color: #eaf0df;
  }
  .horizonte .car-photo > span {
    background: #d1e2aa;
    color: #162a21;
  }
  .horizonte .car-heading h3 {
    font-size: 22px;
  }
  .horizonte .cards {
    gap: 50px 30px;
  }
  .horizonte .philosophy {
    margin: 0 4.5%;
    border-radius: 5px;
    overflow: hidden;
  }
  .horizonte .philosophy-copy {
    padding: 70px 10%;
  }
  .horizonte .contact-section {
    background: #d1e2aa;
  }
  .horizonte .specs {
    background: #1d342b;
    padding: 32px;
    border: 0;
    border-radius: 4px;
  }
  .horizonte .detail-image {
    border-radius: 5px;
  }
  .horizonte .gallery-button {
    background: #d1e2aa;
    color: #162a21;
    border-radius: 30px;
  }
  @media (min-width: 1500px) {
    .collection,
    .related {
      padding-left: 8%;
      padding-right: 8%;
    }
  }
  @media (max-width: 1100px) {
    nav {
      gap: 22px;
    }
    .hero {
      grid-template-columns: 49% 51%;
      min-height: 670px;
    }
    .hero-copy {
      padding-top: 25px;
    }
    .hero-copy h1 {
      font-size: 72px;
    }
    .hero-caption h2 {
      font-size: 20px;
    }
    .visual-top span:last-child {
      display: none;
    }
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .related-cards .car-card:last-child {
      display: none;
    }
    .philosophy-copy {
      padding: 55px 9%;
    }
    .principles {
      gap: 15px;
    }
    .horizonte .hero-caption {
      max-width: 300px;
    }
    .horizonte .hero-copy {
      padding-top: 75px;
    }
    .steps {
      padding: 80px 5%;
    }
    .steps > div {
      gap: 35px;
    }
  }
  @media (max-width: 700px) {
    .preview {
      font-size: 8px;
      padding: 0 5%;
    }
    .preview span {
      display: none;
    }
    header {
      height: 82px;
      padding: 0 5%;
    }
    .wordmark {
      font-size: 8px;
    }
    .brand-mark {
      font-size: 37px;
    }
    .menu {
      display: block;
      font-size: 11px;
    }
    nav {
      display: none;
      position: absolute;
      top: 82px;
      left: 0;
      right: 0;
      background: var(--paper);
      padding: 30px 5%;
      border-bottom: 1px solid var(--line);
    }
    nav.expanded {
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .hero {
      height: auto;
      max-height: none;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 30px 5% 40px;
      gap: 30px;
    }
    .hero-copy {
      padding-top: 10px;
    }
    .eyebrow {
      font-size: 8px;
      margin-bottom: 22px;
    }
    .hero-copy h1 {
      font-size: 67px;
    }
    .hero-description {
      font-size: 13px;
      margin: 22px 0;
    }
    .button {
      padding: 15px 21px;
      font-size: 11px;
    }
    .hero-foot {
      display: none;
    }
    .hero-visual {
      height: 410px;
      width: 100%;
    }
    .hero-caption {
      left: 22px;
      right: 22px;
      bottom: 25px;
    }
    .hero-caption h2 {
      font-size: 23px;
    }
    .visual-top {
      left: 22px;
      top: 22px;
    }
    .hero-index {
      bottom: 14px;
    }
    .values-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 22px 5%;
      font-size: 9px;
    }
    .values-strip span:before {
      margin-right: 9px;
    }
    .collection,
    .related {
      padding: 65px 5%;
    }
    .section-heading {
      flex-direction: column;
      align-items: start;
      gap: 20px;
      margin-bottom: 30px;
    }
    .section-heading > p {
      font-size: 12px;
    }
    h2 {
      font-size: 44px;
    }
    .filters {
      gap: 6px;
    }
    .filters button {
      padding: 8px 12px;
      font-size: 10px;
    }
    .search-sort {
      width: 100%;
      gap: 8px;
    }
    .search-sort input {
      width: 58%;
      min-width: 0;
    }
    .search-sort select {
      width: 42%;
      font-size: 10px;
    }
    .cards {
      grid-template-columns: 1fr;
      gap: 35px;
    }
    .car-photo {
      aspect-ratio: 1.5;
    }
    .car-heading h3 {
      font-size: 22px;
    }
    .car-heading strong {
      font-size: 19px;
    }
    .car-heading h3 b {
      display: inline;
      margin-left: 5px;
      font-size: 18px;
    }
    .car-meta {
      font-size: 11px;
    }
    .philosophy {
      grid-template-columns: 1fr;
    }
    .philosophy-image {
      min-height: 360px;
    }
    .philosophy-copy {
      padding: 45px 7%;
    }
    .philosophy-copy h2 {
      font-size: 43px;
    }
    .principles {
      justify-content: space-between;
    }
    .steps {
      padding: 60px 6%;
    }
    .steps > div {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    .steps h3 {
      font-size: 30px;
      margin: 10px 0;
    }
    .steps p {
      max-width: 100%;
    }
    .contact-section {
      padding: 50px 6%;
    }
    .contact-section h2 {
      font-size: 44px;
    }
    .contact-section button {
      height: 57px;
      width: 57px;
      flex-shrink: 0;
      font-size: 29px;
    }
    .contact-section .eyebrow {
      font-size: 7px;
    }
    footer {
      padding: 40px 6% 24px;
      gap: 30px;
    }
    .footer-brand {
      font-size: 26px;
    }
    footer > div:not(.footer-bottom) {
      font-size: 11px;
      gap: 25px;
    }
    .footer-bottom {
      flex-direction: column;
      gap: 10px;
    }
    .horizonte .hero {
      height: 740px;
      min-height: 0;
      padding: 0;
    }
    .horizonte .hero-copy {
      padding: 60px 6%;
    }
    .horizonte .hero-copy h1 {
      font-size: 68px;
    }
    .horizonte .hero-visual {
      height: 100%;
      width: 100%;
    }
    .horizonte .hero-visual:after {
      background: linear-gradient(180deg, #081a16dd, #081a1670 55%, #081a1688);
    }
    .horizonte .hero-visual > img {
      object-position: 58% 50%;
    }
    .horizonte .visual-top {
      display: none;
    }
    .horizonte .hero-caption {
      left: 6%;
      right: 6%;
      bottom: 45px;
      max-width: none;
    }
    .horizonte .hero-caption h2 {
      font-size: 22px;
    }
    .horizonte .collection {
      padding-top: 65px;
    }
    .horizonte .cards {
      gap: 35px;
    }
    .horizonte .philosophy {
      margin: 0 5%;
    }
    .horizonte .philosophy-copy {
      padding: 40px 7%;
    }
    .breadcrumb {
      padding: 22px 5%;
      font-size: 9px;
    }
    .detail-intro {
      padding: 20px 6% 35px;
      flex-direction: column;
      align-items: start;
      gap: 30px;
    }
    .detail-intro h1 {
      font-size: 65px;
    }
    .price-block {
      width: 100%;
    }
    .price-block strong {
      font-size: 31px;
    }
    .price-block .button {
      width: 100%;
    }
    .detail-image {
      margin: 0;
      height: 370px;
      min-height: 0;
    }
    .image-tools {
      flex-direction: column;
      align-items: start;
      padding: 15px 5%;
      gap: 9px;
    }
    .image-tools button {
      padding: 8px 10px;
      font-size: 9px;
    }
    .specs {
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
      margin: 20px 6% 0;
      padding: 25px 0;
    }
    .specs div,
    .specs div:first-child {
      padding: 0;
      border: 0;
    }
    .specs strong {
      font-size: 22px;
    }
    .detail-story {
      grid-template-columns: 1fr;
      padding: 55px 6% 0;
      gap: 35px;
    }
    .detail-story h2 {
      font-size: 42px;
    }
    .horizonte .specs {
      padding: 25px;
    }
    .contact-modal {
      padding: 40px 25px;
    }
    .contact-modal h2 {
      font-size: 39px;
    }
    .gallery-button {
      right: 15px;
      bottom: 15px;
    }
    .image-note {
      left: 15px;
      bottom: 65px;
    }
    .related-cards .car-card:last-child {
      display: block;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }
    .concept * {
      transition: none !important;
      animation: none !important;
    }
    .pending {
      opacity: 1;
      transform: none;
    }
    .hero-visual > img {
      will-change: auto;
    }
  }
  .signature {
    --paper: #f4f2ee;
    --ink: #0f0f11;
    --muted: #5a5c61;
    --line: rgba(15, 15, 17, 0.12);
    --accent: #e30613;
    --panel: #fff;
    transition:
      background 0.3s,
      color 0.3s;
    color-scheme: light;
  }
  .signature.dark {
    --paper: #0a0a0b;
    --ink: #f4f4f2;
    --muted: #a8a8a4;
    --line: rgba(255, 255, 255, 0.12);
    --panel: #131316;
    color-scheme: dark;
  }
  .signature .preview {
    background: #131316;
    color: #f4f4f2;
    padding-inline: max(28px, calc((100vw - 1240px) / 2));
    letter-spacing: 0.12em;
  }
  .signature header {
    padding-inline: max(28px, calc((100vw - 1240px) / 2));
    gap: 25px;
    height: 112px;
  }
  .official-logo {
    width: 198px;
    display: block;
    flex-shrink: 0;
    background: white;
    border-radius: 4px;
    padding: 5px 8px;
  }
  .official-logo img {
    width: 100%;
    height: auto;
    display: block;
  }
  .header-tools {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .theme-toggle {
    height: 39px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--line);
    border-radius: 30px;
    padding: 0 13px;
    font-size: 17px;
  }
  .theme-toggle span {
    font-size: 10px;
  }
  .theme-toggle:hover {
    border-color: var(--accent);
  }
  .signature nav {
    gap: 26px;
    font-size: 11px;
  }
  .signature nav button {
    border-color: var(--accent);
  }
  .signature .hero {
    width: min(1384px, 100%);
    margin-inline: auto;
    padding: 38px 40px 55px;
    grid-template-columns: 46% 54%;
    height: auto;
    min-height: 740px;
    gap: 0;
  }
  .signature .hero-copy {
    padding: 40px 28px 0 0;
  }
  .signature .hero-copy h1 {
    font-size: clamp(65px, 6.1vw, 95px);
  }
  .signature .hero-copy em {
    color: var(--accent);
  }
  .signature .hero-visual {
    border-radius: 6px;
  }
  .signature .hero-index {
    right: 40px;
  }
  .signature .button {
    background: #e30613;
    color: white;
    border-radius: 4.4px;
  }
  .signature .button:hover {
    background: #a8030d;
  }
  .signature .values-strip {
    padding-inline: max(28px, calc((100vw - 1200px) / 2));
    font-size: 11px;
    background: var(--panel);
  }
  .signature .collection,
  .signature .related {
    width: min(1256px, 100%);
    margin-inline: auto;
    padding: 95px 28px;
  }
  .signature .cards {
    gap: 40px 24px;
  }
  .signature .car-photo {
    border-radius: 6.6px;
  }
  .signature .car-photo > span {
    background: #fff;
    color: #e30613;
  }
  .signature .car-label {
    background: #fff;
    color: #0f0f11;
    border-radius: 3px;
  }
  .signature .filters .active {
    background: #e30613;
    color: #fff;
    border-color: #e30613;
  }
  .signature .car-heading h3 {
    font-size: 20px;
  }
  .signature .car-heading strong {
    font-size: 17px;
  }
  .signature .philosophy {
    width: min(1320px, calc(100% - 56px));
    margin-inline: auto;
    border-radius: 6px;
    overflow: hidden;
  }
  .signature .philosophy-copy {
    padding: 65px 10%;
  }
  .signature .philosophy-copy h2 {
    font-size: 48px;
  }
  .signature .steps {
    max-width: 1256px;
    margin: auto;
    padding: 90px 28px;
  }
  .signature .contact-section {
    background: var(--panel);
    color: var(--ink);
    padding: 75px max(28px, calc((100vw - 1200px) / 2));
    border-top: 1px solid var(--line);
  }
  .signature .contact-section h2 {
    font-size: clamp(45px, 5.8vw, 82px);
  }
  .signature .contact-section em {
    color: var(--accent);
  }
  .signature .contact-section > div > button {
    background: #e30613;
    border-color: #e30613;
    color: white;
  }
  .signature .contact-section > div > button:hover {
    background: #a8030d;
  }
  .signature footer {
    padding: 60px max(28px, calc((100vw - 1200px) / 2)) 25px;
  }
  .signature .footer-brand {
    font-family: 'Barlow', sans-serif;
    font-weight: 700;
    font-style: italic;
    font-size: 32px;
  }
  .signature .footer-brand span {
    font-style: normal;
    font-family: 'Inter', sans-serif;
  }
  .signature .breadcrumb,
  .signature .detail-intro,
  .signature .image-tools {
    max-width: 1256px;
    margin-inline: auto;
    padding-inline: 28px;
  }
  .signature .detail-intro {
    padding-top: 35px;
    padding-bottom: 50px;
  }
  .signature .detail-intro h1 {
    font-size: 80px;
  }
  .signature .detail-intro h1 em {
    color: var(--accent);
  }
  .signature .breadcrumb button {
    font-size: 11px;
  }
  .signature .breadcrumb button[aria-pressed='true'] {
    color: var(--accent);
  }
  .signature .detail-image {
    width: min(1320px, calc(100% - 56px));
    margin: auto;
    border-radius: 6px;
    height: 600px;
  }
  .signature .specs {
    max-width: 1200px;
    width: calc(100% - 56px);
    margin: 35px auto 0;
  }
  .signature .detail-story {
    max-width: 1256px;
    margin: auto;
    padding: 85px 28px 0;
    gap: 8%;
  }
  .ownership,
  .faq-section,
  .saved-section {
    max-width: 1256px;
    margin: auto;
    padding: 75px 28px;
  }
  .ownership-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .ownership article {
    background: var(--panel);
    padding: 32px;
    border: 1px solid var(--line);
    border-radius: 6px;
  }
  .ownership article small {
    display: block;
    font-size: 8px;
    letter-spacing: 0.1em;
    color: var(--muted);
  }
  .service-symbol {
    display: grid;
    place-items: center;
    color: #e30613;
    background: rgba(227, 6, 19, 0.07);
    height: 48px;
    width: 48px;
    font-size: 25px;
    border-radius: 50%;
    margin-bottom: 30px;
  }
  .ownership h3 {
    font-size: 23px;
    letter-spacing: -0.04em;
    margin: 15px 0;
  }
  .ownership article p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.8;
  }
  .ownership article button {
    font-size: 11px;
    padding: 0 0 6px;
    margin-top: 25px;
    border-bottom: 1px solid #e30613;
  }
  .faq-section {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 75px;
    padding-top: 50px;
    padding-bottom: 110px;
  }
  .faq-section h2 {
    font-size: 48px;
  }
  .faq-section > div > p:not(.eyebrow) {
    margin-top: 25px;
    color: var(--muted);
    font-size: 12px;
  }
  .faq-section > div > button {
    margin-top: 15px;
    padding: 0 0 7px;
    border-bottom: 1px solid var(--accent);
    font-size: 12px;
  }
  .faq-items details {
    border-top: 1px solid var(--line);
  }
  .faq-items details:last-child {
    border-bottom: 1px solid var(--line);
  }
  .faq-items p {
    color: var(--muted);
    font-size: 12px;
    padding: 0 25px 22px 0;
  }
  .faq-items summary {
    font-size: 12px;
    gap: 20px;
  }
  .signature .contact-options {
    display: flex;
    justify-content: start;
    gap: 45px;
    margin-top: 40px;
    border-top: 1px solid var(--line);
    padding-top: 25px;
  }
  .signature .contact-section .contact-options button {
    width: auto;
    height: auto;
    border: 0;
    border-radius: 0;
    background: none;
    color: var(--ink);
    font-size: 11px;
    text-align: left;
  }
  .signature .contact-section .contact-options button:hover {
    background: none;
    color: var(--accent);
  }
  .saved-section {
    padding-bottom: 20px;
  }
  .saved-section h2 {
    font-size: 42px;
  }
  .saved-list {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 25px;
  }
  .saved-list a {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border: 1px solid var(--line);
    background: var(--panel);
    border-radius: 5px;
    font-size: 12px;
  }
  .saved-list img {
    width: 85px;
    height: 60px;
    object-fit: cover;
  }
  .saved-list small {
    display: block;
    color: var(--muted);
    margin-top: 5px;
  }
  .saved-list b {
    padding: 0 12px;
    color: var(--accent);
  }
  @media (max-width: 1050px) {
    .signature nav {
      gap: 16px;
      font-size: 10px;
    }
    .official-logo {
      width: 165px;
    }
    .signature header {
      gap: 16px;
    }
    .signature .hero {
      min-height: 650px;
    }
    .signature .hero-copy h1 {
      font-size: 72px;
    }
    .signature .philosophy-copy h2 {
      font-size: 40px;
    }
    .signature .values-strip {
      font-size: 10px;
    }
    .ownership article {
      padding: 24px;
    }
    .signature .detail-intro h1 {
      font-size: 65px;
    }
    .faq-section {
      gap: 40px;
    }
    .signature .theme-toggle span {
      display: none;
    }
  }
  @media (max-width: 700px) {
    .signature header {
      height: 92px;
      padding-inline: 20px;
    }
    .official-logo {
      width: 160px;
    }
    .signature nav {
      top: 92px;
      padding: 25px;
      font-size: 12px;
    }
    .signature .hero {
      width: 100%;
      padding: 25px 20px 40px;
      display: flex;
      min-height: 0;
    }
    .signature .hero-copy {
      padding: 12px 0 28px;
    }
    .signature .hero-copy h1 {
      font-size: 65px;
    }
    .signature .hero-visual {
      height: 370px;
    }
    .signature .hero-index {
      right: 22px;
    }
    .signature .values-strip {
      padding: 22px 20px;
    }
    .signature .collection,
    .signature .related {
      padding: 60px 20px;
    }
    .signature .cards {
      gap: 32px;
    }
    .signature .car-heading h3 {
      font-size: 21px;
    }
    .signature .philosophy {
      width: calc(100% - 40px);
    }
    .signature .philosophy-copy {
      padding: 40px 25px;
    }
    .signature .philosophy-copy h2 {
      font-size: 39px;
    }
    .signature .steps {
      padding: 55px 20px;
    }
    .ownership,
    .faq-section,
    .saved-section {
      padding: 50px 20px;
    }
    .ownership-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .ownership article {
      padding: 25px;
    }
    .service-symbol {
      margin-bottom: 20px;
    }
    .faq-section {
      grid-template-columns: 1fr;
      gap: 30px;
      padding-bottom: 65px;
    }
    .faq-section h2 {
      font-size: 40px;
    }
    .signature .contact-section {
      padding: 50px 20px;
    }
    .signature .contact-section h2 {
      font-size: 43px;
    }
    .signature .contact-options {
      flex-direction: column;
      gap: 20px;
    }
    .signature footer {
      padding: 40px 20px 25px;
    }
    .signature .breadcrumb {
      padding: 20px;
      gap: 15px;
      flex-wrap: wrap;
    }
    .signature .breadcrumb > span {
      display: none;
    }
    .signature .detail-intro {
      padding: 20px 20px 35px;
    }
    .signature .detail-intro h1 {
      font-size: 61px;
    }
    .signature .detail-image {
      width: 100%;
      height: 350px;
      border-radius: 0;
    }
    .signature .image-tools {
      padding: 18px 20px;
    }
    .signature .specs {
      width: calc(100% - 40px);
      margin-top: 20px;
    }
    .signature .detail-story {
      padding: 55px 20px 0;
    }
    .signature .theme-toggle {
      padding: 0 11px;
    }
    .signature .header-tools {
      gap: 10px;
    }
  }
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #e30613;
    z-index: 90;
    transform: scaleX(var(--page-progress, 0));
    transform-origin: left;
    pointer-events: none;
  }
  .scroll-statement {
    padding: 0 0 100px;
    max-width: 950px;
    margin: auto;
    --scroll-entry: 1;
  }
  .statement-text {
    font-size: clamp(44px, 5.9vw, 88px);
    letter-spacing: -0.065em;
    line-height: 1.12;
    font-weight: 400;
    margin: 0;
    color: var(--ink);
  }
  .statement-text span:last-child {
    font-family: Georgia, serif;
    font-style: italic;
    color: var(--accent);
  }
  .statement-rule {
    display: block;
    height: 1px;
    background: var(--line);
    margin-top: 45px;
    transform-origin: left;
  }
  .scroll-enhanced .statement-text span {
    color: transparent;
    background: linear-gradient(
      90deg,
      var(--ink) 50%,
      color-mix(in srgb, var(--ink) 18%, var(--paper)) 50%
    );
    background-size: 200% 100%;
    background-position-x: calc(
      100% - clamp(0, (var(--scroll-entry, 0) * 10 - var(--word-index)), 1) * 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
  }
  .scroll-enhanced .statement-text span:last-child {
    background-image: linear-gradient(
      90deg,
      var(--accent) 50%,
      color-mix(in srgb, var(--ink) 18%, var(--paper)) 50%
    );
  }
  .scroll-enhanced .statement-rule {
    transform: scaleX(var(--scroll-entry, 0));
  }
  .scroll-enhanced .hero-copy {
    transform: translateY(calc(var(--scroll-progress, 0) * -28px));
  }
  .scroll-enhanced .hero-visual {
    clip-path: inset(
      0 calc(var(--scroll-progress, 0) * 2%) round calc(6px + var(--scroll-progress, 0) * 24px)
    );
  }
  .scroll-enhanced .philosophy-image img {
    transform: translateY(var(--scroll-shift, 0px)) scale(1.15);
  }
  .scroll-enhanced .detail-image {
    clip-path: inset(
      0 calc((1 - var(--scroll-entry, 1)) * 8%) round calc((1 - var(--scroll-entry, 1)) * 35px)
    );
  }
  .scroll-enhanced .detail-image img {
    translate: 0 var(--scroll-shift, 0px);
    height: 110%;
    margin-top: -3%;
  }
  .scroll-enhanced .contact-section > div > button[aria-label] {
    rotate: calc(-35deg + var(--scroll-entry, 1) * 35deg);
    scale: calc(0.78 + var(--scroll-entry, 1) * 0.22);
  }
  .signature .contact-section:before {
    content: '';
    display: block;
    height: 3px;
    width: 70px;
    background: #e30613;
    margin-bottom: 35px;
    transform-origin: left;
    transform: scaleX(var(--scroll-entry, 1));
  }
  @media (max-width: 700px) {
    .scroll-statement {
      padding-bottom: 65px;
    }
    .statement-text {
      font-size: 44px;
    }
    .statement-rule {
      margin-top: 30px;
    }
    .scroll-enhanced .hero-copy {
      transform: none;
    }
    .scroll-enhanced .hero-visual {
      clip-path: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .reading-progress {
      display: none;
    }
    .scroll-enhanced .hero-copy,
    .scroll-enhanced .philosophy-image img {
      transform: none;
    }
    .scroll-enhanced .hero-visual,
    .scroll-enhanced .detail-image {
      clip-path: none;
    }
    .scroll-enhanced .detail-image img {
      translate: none;
    }
    .scroll-enhanced .statement-text span {
      background: none;
      color: var(--ink);
    }
    .scroll-enhanced .statement-text span:last-child {
      color: var(--accent);
    }
    .scroll-enhanced .statement-rule,
    .signature .contact-section:before {
      transform: none;
    }
    .scroll-enhanced .contact-section > div > button[aria-label] {
      rotate: none;
      scale: 1;
    }
  }
  /* Wider composition, with modern sans-serif typography throughout. */
  .signature h1,
  .signature h2,
  .signature em,
  .signature .statement-text span:last-child {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 500;
    letter-spacing: -0.065em;
  }
  @media (min-width: 701px) {
    .signature header,
    .signature .preview {
      padding-inline: max(3.5%, calc((100vw - 1600px) / 2));
    }
    .signature .hero {
      width: min(1680px, 100%);
      padding-inline: 3.5%;
    }
    .signature .collection,
    .signature .related,
    .signature .steps,
    .signature .ownership,
    .signature .faq-section,
    .signature .saved-section,
    .signature .detail-intro,
    .signature .breadcrumb,
    .signature .image-tools,
    .signature .detail-story {
      width: 93%;
      max-width: 1600px;
      padding-inline: 0;
    }
    .signature .philosophy,
    .signature .detail-image {
      width: 93%;
      max-width: 1600px;
    }
    .signature .specs {
      width: 93%;
      max-width: 1500px;
    }
    .signature .values-strip,
    .signature .contact-section,
    .signature footer {
      padding-inline: max(3.5%, calc((100vw - 1600px) / 2));
    }
    .signature .scroll-statement {
      max-width: 1180px;
    }
  }
</style>
