<script lang="ts">
  import { page } from '$app/stores';
  import readiness from '$lib/publicationReadiness.json';
  import LegalFields from '../LegalFields.svelte';
  const sections = [
    ['responsavel', 'Quem é responsável'],
    ['pedidos', 'Dados e pedidos'],
    ['finalidades', 'Finalidades e fundamento'],
    ['conservacao', 'Conservação e acesso'],
    ['navegacao', 'Navegação e preferências'],
    ['escolhas', 'Favoritos e comparação'],
    ['direitos', 'Os seus direitos'],
    ['contactar', 'Contactar e reclamar'],
  ];
</script>

<svelte:head>
  <title>Política de privacidade — Auto Nunes Martins</title>
  <meta
    name="description"
    content="Informação de privacidade em preparação, funcionamento das preferências locais e dados por confirmar antes da publicação."
  />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href={`${$page.url.origin}/politica-de-privacidade`} />
  <meta property="og:url" content={`${$page.url.origin}/politica-de-privacidade`} />
</svelte:head>

<main class="privacy" id="inicio">
  <div class="privacy-intro">
    <p class="eyebrow">INFORMAÇÃO CLARA</p>
    <h1>Política de<br /><em>privacidade.</em></h1>
    <p>O que partilha connosco.<br />E o que precisa de saber.</p>
    <small>Última atualização: 4 de outubro de 2026</small>
  </div>
  <div class="privacy-layout">
    <nav aria-label="Nesta política">
      <p class="eyebrow">NESTA PÁGINA</p>
      {#each sections as [id, title], index}<a href={`#${id}`}><span>0{index + 1}</span>{title}</a
        >{/each}
    </nav>
    <div class="privacy-content">
      <aside class="publication-note" aria-label="Estado desta política">
        <strong>Uma nota sobre esta versão</strong>
        <p>
          Este site é uma montra de viaturas usadas, não uma loja de venda de automóveis online. O
          formulário atual é demonstrativo: não envia o pedido nem o guarda num serviço. Não
          introduza dados pessoais reais para o experimentar.
        </p>
        <p>
          Antes da publicação, é necessário confirmar o responsável, os contactos e o funcionamento
          efetivo dos pedidos. Este texto não constitui aconselhamento jurídico nem uma declaração
          de conformidade.
        </p>
      </aside>
      <section id="responsavel">
        <h2>01 <span>Quem é responsável</span></h2>
        <p>Preparação incompleta. Consulte também a <a href="/informacao-legal">identificação do operador e informação legal</a>. Os campos seguintes precisam de confirmação antes da publicação.</p>
        <LegalFields fields={readiness.privacy} />
        <p>
          O site apresenta-se sob o nome Auto Nunes Martins. A identificação jurídica do responsável
          pelo tratamento está <strong>a confirmar antes da publicação</strong>.
        </p>
        <p>
          Os contactos fictícios do protótipo não devem ser usados para enviar pedidos ou exercer
          direitos.
        </p>
      </section>
      <section id="pedidos">
        <h2>02 <span>Dados que pode indicar</span></h2>
        <p>
          O formulário apresenta campos para nome, email, assunto e mensagem. A mensagem pode
          incluir a viatura de interesse, disponibilidade para uma visita ou dúvidas que queira
          esclarecer. Partilhe apenas o necessário; evite documentos de identificação, dados
          bancários ou informação sensível.
        </p>
        <p>
          Nesta demonstração, os campos servem apenas para experimentar a interface. Quando existir
          envio efetivo, a informação de privacidade terá de refletir o serviço utilizado e o
          percurso real dos dados.
        </p>
      </section>
      <section id="finalidades">
        <h2>03 <span>Para quê e com que fundamento</span></h2>
        <p>
          Num serviço de contacto ativo, os dados do pedido destinam-se a responder às suas
          perguntas, combinar uma visita e assegurar o acompanhamento necessário dessa conversa.
        </p>
        <p>
          Consoante o pedido, o fundamento poderá ser a realização de diligências pré-contratuais
          solicitadas por si. Outros tratamentos exigem a identificação do fundamento adequado,
          incluindo uma obrigação legal ou um interesse legítimo devidamente avaliado. Se um
          tratamento depender de consentimento, este deve ser específico e poderá ser retirado, sem
          afetar o tratamento anterior à retirada.
        </p>
        <p>
          O fundamento de cada operação deve ser confirmado antes de ativar a recolha. O simples
          envio de um pedido não deve ser tratado como autorização genérica para marketing.
        </p>
      </section>
      <section id="conservacao">
        <h2>04 <span>Conservação, destinatários e segurança</span></h2>
        <p>
          Se forem recebidos pedidos reais, a conservação deverá limitar-se ao tempo necessário para
          lhes dar resposta e assegurar o acompanhamento justificado, tendo em conta obrigações
          legais aplicáveis. Não está definido neste protótipo um prazo de conservação para um
          serviço de contacto ativo.
        </p>
        <p>
          Eventuais prestadores de alojamento, email ou suporte que precisem de tratar dados devem
          ser identificados e limitados ao estritamente necessário. A existência desses
          destinatários, de partilhas ou de transferências internacionais no serviço final está a
          confirmar; esta página não presume que estejam implementados.
        </p>
        <p>
          A proteção dos dados exige medidas técnicas e organizativas adequadas ao risco, incluindo
          controlo de acessos. As medidas concretas do serviço final devem ser verificadas antes da
          publicação. Nenhum sistema permite prometer segurança absoluta.
        </p>
      </section>
      <section id="navegacao">
        <h2>05 <span>Navegação e preferências</span></h2>
        <p>Para repor a posição após recarregar a página, o site guarda no armazenamento de sessão deste separador o endereço completo da página, a posição de scroll e a hora. Só usa esse registo para reposição quando tem menos de um minuto; esse limite de utilização não é um apagamento automático. O registo acompanha a sessão do separador.</p>
        <p>
          A interface guarda neste navegador a preferência de tema através de armazenamento local.
          Pode apagar esta preferência nas definições do navegador. O funcionamento dos favoritos
          e da comparação é explicado na secção seguinte.
        </p>
        <p>
          Os filtros do catálogo são representados no endereço da página para permitir partilhar a
          pesquisa. Evite escrever dados pessoais na caixa de pesquisa. Algumas fotografias são
          carregadas a partir de um serviço externo de imagens, o que implica um pedido do navegador
          a esse serviço.
        </p>
        <p>
          Esta informação não substitui a verificação dos cookies, registos técnicos e serviços da
          versão publicada. A respetiva informação deverá ser completada de acordo com o que estiver
          efetivamente ativo.
        </p>
      </section>
      <section id="escolhas">
        <h2>06 <span>Favoritos e comparação</span></h2>
        <p>Quando guarda uma viatura ou a adiciona à comparação, os identificadores das viaturas publicadas ficam no armazenamento local deste navegador (<code>localStorage</code>). A comparação permite até três viaturas; os favoritos não têm esse limite.</p>
        <p>Estes identificadores servem exclusivamente para manter e apresentar as suas listas. Esta funcionalidade não cria conta nem perfil de utilizador e não utiliza a seleção para análise de utilização ou marketing. As listas não são guardadas como preferências no backend.</p>
        <p>Ao abrir as listas, o navegador pede à API pública os dados atuais das viaturas selecionadas, incluindo as fotografias disponíveis. O armazenamento local não significa que o site funcione sem comunicações de rede. Uma viatura retirada da publicação pode aparecer como indisponível.</p>
        <p>Não existe um prazo de expiração automático: as escolhas mantêm-se até as remover, limpar a lista ou apagar os dados do site no navegador. Pode usar o coração para retirar um favorito, o botão “Na comparação” para retirar uma viatura da comparação, ou as opções “Limpar favoritos” e “Limpar seleção” nas páginas respetivas.</p>
        <p>A seleção pode atualizar-se entre separadores deste site no mesmo navegador. Não é sincronizada entre dispositivos ou navegadores diferentes. Se o armazenamento estiver bloqueado ou indisponível, as listas podem funcionar apenas durante a navegação atual.</p>
        <p><a href="/favoritos">Gerir favoritos</a> · <a href="/comparar">Gerir comparação</a></p>
      </section>
      <section id="direitos">
        <h2>07 <span>Os seus direitos</span></h2>
        <p>
          Nos termos e condições do RGPD, pode pedir acesso aos seus dados, corrigir dados inexatos,
          solicitar o apagamento ou limitar o tratamento. Pode também opor-se ao tratamento quando
          aplicável e exercer a portabilidade nos casos previstos na lei. Estes direitos não são
          absolutos e a sua aplicação depende do tratamento em causa.
        </p>
        <p>
          Para uma explicação de cada direito, consulte a <a
            href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en"
            >informação da Comissão Europeia</a
          >
          e a
          <a href="https://www.cnpd.pt/cidadaos/direitos/"
            >orientação da CNPD sobre os seus direitos</a
          >.
        </p>
      </section>
      <section id="contactar">
        <h2>08 <span>Contactar e reclamar</span></h2>
        <p>
          Dirija o pedido ao responsável pelo tratamento, através do contacto de privacidade
          indicado acima, quando confirmado. Identifique o direito que pretende exercer e forneça
          apenas a informação necessária para localizar o pedido e confirmar a sua identidade.
          Conserve uma cópia da comunicação.
        </p>
        <p>
          Em regra, deve receber resposta no prazo de um mês; situações complexas podem justificar
          uma prorrogação comunicada e fundamentada. Pode apresentar reclamação à <a
            href="https://www.cnpd.pt/cidadaos/participacoes/"
            >Comissão Nacional de Proteção de Dados</a
          > se considerar que os seus direitos não foram respeitados.
        </p>
        <p class="closing">
          Esta página será atualizada quando forem confirmados os dados do responsável e ativados os
          serviços de contacto. A data acima identifica a atualização do texto, não uma revisão
          jurídica.
        </p>
      </section>
    </div>
  </div>
</main>

<style>
  * {
    box-sizing: border-box;
  }
  .privacy {
    width: var(--orbit-frame);
    max-width: var(--orbit-frame-max);
    margin: auto;
    padding: 56px 0 96px;
  }
  h1,
  h2,
  p {
    margin: 0;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.13em;
    color: var(--muted);
  }
  .privacy-intro {
    padding-bottom: 44px;
    border-bottom: 1px solid var(--line);
  }
  h1 {
    font:
      600 clamp(44px, 5vw, 76px)/1.03 'Barlow',
      sans-serif;
    letter-spacing: -0.045em;
    margin: 20px 0;
  }
  h1 em {
    font-weight: inherit;
  }
  .privacy-intro > p:not(.eyebrow) {
    color: var(--muted);
    line-height: 1.7;
    font-size: 16px;
  }
  .privacy-intro small {
    display: block;
    margin-top: 24px;
    font-size: 11px;
    color: var(--muted);
  }
  .privacy-layout {
    display: grid;
    grid-template-columns: 248px minmax(0, 760px);
    gap: clamp(36px, 8vw, 140px);
    padding-top: 40px;
  }
  nav {
    align-self: start;
  }
  nav > p {
    margin-bottom: 18px;
  }
  nav a {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
    text-decoration: none;
    font-size: 12px;
    color: var(--text);
  }
  nav span {
    font-size: 10px;
    color: var(--muted);
  }
  .publication-note {
    border-left: 2px solid var(--red);
    padding: 4px 0 4px 22px;
    margin-bottom: 40px;
  }
  .publication-note strong {
    font-size: 17px;
    font-weight: 500;
  }
  p {
    font-size: 14px;
    line-height: 1.85;
    color: var(--muted);
  }
  .privacy-content p + p,
  .publication-note p {
    margin-top: 14px;
  }
  section {
    padding: 32px 0;
    border-top: 1px solid var(--line);
    scroll-margin-top: 24px;
  }
  h2 {
    display: flex;
    align-items: baseline;
    gap: 18px;
    color: var(--red);
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 20px;
  }
  h2 span {
    color: var(--text);
    font-size: clamp(23px, 2.2vw, 30px);
    line-height: 1.15;
    letter-spacing: -0.035em;
  }
  strong {
    color: var(--text);
    font-weight: 500;
  }
  .privacy-content a {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
    overflow-wrap: anywhere;
  }
  a:focus-visible {
    outline: 2px solid var(--red);
    outline-offset: 5px;
  }
  .closing {
    font-size: 12px;
  }
  @media (max-width: 800px) {
    .privacy {
      padding-block: 32px 56px;
    }
    .privacy-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 32px;
    }
    nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 20px;
    }
    nav > p {
      grid-column: 1/-1;
    }
  }
  @media (max-width: 420px) {
    nav {
      grid-template-columns: minmax(0, 1fr);
    }
    h1 {
      font-size: 44px;
    }
    .publication-note {
      padding-left: 16px;
    }
  }
</style>
