<script lang="ts">
  import {
    BookOpen,
    Check,
    ChevronRight,
    FileCheck,
    FileText,
    Landmark,
    Stamp,
  } from 'lucide-svelte';
  import type { IconComponent } from '$lib/types/ui';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';

  interface Stage {
    step: string;
    title: string;
    icon: IconComponent;
    description: string;
    checklist: string[];
    completed: string;
    flagKey: string;
  }

  const stages: Stage[] = [
    {
      step: '01',
      title: 'Financiamento',
      icon: Landmark,
      description:
        'Aguardar a aprovação do financiamento bancário ou confirmação de pagamento integral pelo cliente.',
      checklist: [
        'Receber proposta da instituição financeira',
        'Validar montante, juros e duração',
        'Recolher comprovativo de aprovação',
      ],
      completed: 'Concluído quando o crédito é aprovado e o stand recebe o pagamento.',
      flagKey: 'financing',
    },
    {
      step: '02',
      title: 'IMT / Importação',
      icon: Stamp,
      description:
        'Tratamento de impostos no Instituto da Mobilidade e Transportes — DAV e ISV se aplicável (importação).',
      checklist: [
        'Submeter Declaração Aduaneira de Veículo (DAV)',
        'Pagar Imposto sobre Veículos (ISV)',
        'Guardar comprovativos',
      ],
      completed: 'Concluído quando a DAV está validada e o ISV pago.',
      flagKey: 'imt',
    },
    {
      step: '03',
      title: 'Registo Automóvel',
      icon: FileCheck,
      description:
        'Pedir o registo de propriedade junto da Conservatória do Registo Automóvel em nome do novo proprietário.',
      checklist: [
        'Recolher CRC anterior e DAV',
        'Submeter o pedido online ou em balcão',
        'Pagar emolumentos e taxas',
      ],
      completed: 'Concluído quando o novo CRC é emitido em nome do cliente.',
      flagKey: 'registration',
    },
    {
      step: '04',
      title: 'Documentação Final',
      icon: FileText,
      description:
        'Reunir e entregar toda a documentação ao cliente — chave, livrete, fatura e garantias.',
      checklist: [
        'Imprimir e assinar contrato de compra',
        'Entregar livrete e CRC original',
        'Confirmar inspeção e seguro',
      ],
      completed: 'Concluído quando o cliente assina o auto de entrega.',
      flagKey: 'docs',
    },
  ];
</script>

<svelte:head>
  <title>Guia de Fluxo · Auto Nunes Martins</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-8">
  <!-- Page header -->
  <div>
    <div
      class="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-red)]"
    >
      ● Onboarding · Equipa
    </div>
    <ItalicHero text="Fluxo " accent="Pós-Entrega" size="lg" />
    <p
      class="mt-3 text-[14px] leading-relaxed text-[var(--color-text-muted)] max-w-prose"
    >
      Quatro etapas obrigatórias entre a venda e a entrega final da viatura ao cliente.
      Cada etapa tem um <em>flag</em> próprio no detalhe da viatura — marcá-lo como
      concluído torna a viatura visível como
      <strong>"Documentos Pendentes"</strong> até todas as etapas estarem fechadas.
    </p>
  </div>

  <!-- Flow visualisation -->
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
    {#each stages as stage, i (stage.step)}
      <article
        class="relative flex flex-col border border-[var(--color-border)] bg-[var(--color-bg-1)] overflow-hidden"
        style="border-radius: var(--radius-card);"
      >
        <!-- Red corner accent -->
        <div
          class="absolute top-0 right-0 w-12 h-12 pointer-events-none"
          style="background: linear-gradient(135deg, transparent 50%, var(--color-red) 50%); opacity: 0.18;"
        ></div>

        <header class="p-5 border-b border-[var(--color-border)]">
          <div class="flex items-center gap-3 mb-3">
            <stage.icon class="h-5 w-5 text-[var(--color-red)]" />
            <div class="h-5 w-[1.5px] bg-[var(--color-red)]"></div>
            <span
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
            >
              Etapa {stage.step}
            </span>
          </div>
          <h3
            class="font-display text-[22px] font-black italic uppercase tracking-[-0.02em] leading-none"
          >
            {stage.title}
          </h3>
        </header>

        <div class="p-5 space-y-4 flex-1 flex flex-col">
          <p class="text-[13px] leading-relaxed text-[var(--color-text-muted)]">
            {stage.description}
          </p>

          <ul class="space-y-2">
            {#each stage.checklist as item (item)}
              <li class="flex items-start gap-2 text-[12.5px]">
                <span
                  class="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-red)] flex-shrink-0"
                ></span>
                <span class="text-[var(--color-text)]">{item}</span>
              </li>
            {/each}
          </ul>

          <div
            class="mt-auto pt-3 border-t border-[var(--color-border)] flex items-start gap-2"
          >
            <Check class="h-3.5 w-3.5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
            <span class="text-[11.5px] leading-snug text-[var(--color-text-muted)] italic">
              {stage.completed}
            </span>
          </div>

          <div
            class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
          >
            flag: <code class="text-[var(--color-text-muted)]">pendingDocFlags.{stage.flagKey}</code>
          </div>
        </div>
      </article>

      {#if i < stages.length - 1}
        <!-- Chevron between cards -->
        <div class="hidden lg:flex items-center justify-center self-center">
          <ChevronRight class="h-8 w-8 text-[var(--color-red)] opacity-70" />
        </div>
      {/if}
    {/each}
  </div>

  <!-- Status legend -->
  <Panel>
    <PanelHeader icon={BookOpen} title="Como ler o estado no detalhe da viatura" />
    <div class="p-5 space-y-4 text-[13px] text-[var(--color-text-muted)]">
      <p>
        Cada viatura tem um painel <strong>"Documentos pendentes"</strong> na sua página
        de detalhe. As caixas representam exactamente estas quatro etapas.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div
          class="flex items-start gap-3 p-3 border border-[color-mix(in_oklab,var(--color-red)_30%,transparent)]"
          style="border-radius: var(--radius-btn);"
        >
          <span
            class="h-2 w-2 rounded-full bg-[var(--color-red)] mt-1.5 flex-shrink-0"
          ></span>
          <div>
            <div class="text-[var(--color-red)] font-semibold mb-1">Pendente</div>
            <div class="text-[12px] text-[var(--color-text-muted)]">
              A etapa ainda não foi concluída — aparece a vermelho.
            </div>
          </div>
        </div>
        <div
          class="flex items-start gap-3 p-3 border border-[var(--color-border)]"
          style="border-radius: var(--radius-btn);"
        >
          <span
            class="h-2 w-2 rounded-full bg-[var(--color-success)] mt-1.5 flex-shrink-0"
          ></span>
          <div>
            <div class="text-[var(--color-success)] font-semibold mb-1">Concluída</div>
            <div class="text-[12px] text-[var(--color-text-muted)]">
              A etapa está tratada — desmarcar a caixa no formulário de edição.
            </div>
          </div>
        </div>
      </div>

      <p class="pt-2 italic text-[12.5px] text-[var(--color-text-faint)]">
        Nota: o estado da viatura passa automaticamente a "Vendida" ao registar uma venda.
        Marcar como "Entregue" só faz sentido quando todas as etapas acima estiverem fechadas.
      </p>
    </div>
  </Panel>
</section>
