<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import {
    Activity,
    ArrowRightLeft,
    Calendar,
    Car,
    CheckCircle2,
    CircleDollarSign,
    ListPlus,
    PencilLine,
    Receipt,
    Tag,
    Trash2,
    User as UserIcon,
    UserCog,
    UserPlus,
    Wallet,
  } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import StatusBadge from '$lib/components/brand/StatusBadge.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import SpecRow from '$lib/components/brand/SpecRow.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Skeleton from '$lib/components/common/Skeleton.svelte';
  import { formatDate, formatDateLong, formatEUR } from '$lib/utils/format';
  import type { IconComponent } from '$lib/types/ui';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const s = $derived(data.sale);
  const v = $derived(s.vehicle);
  const c = $derived(s.customer);
  const t = $derived(s.tradeIn);
  // True when this sale captured a manual extra commission (e.g. financing
  // referral). Drives the optional Comissão column in the profit summary.
  const hasCommission = $derived(Number(s.commission ?? '0') > 0);
  // Localized labels for the trade-in fuel chip — mirrors the vehicle
  // detail page's mapping so the wording stays consistent.
  const FUEL_LABELS: Record<string, string> = {
    GASOLINE: 'Gasolina',
    DIESEL: 'Gasóleo',
    HYBRID: 'Híbrido',
    PLUGIN_HYBRID: 'Híbrido Plug-in',
    ELECTRIC: 'Elétrico',
    LPG: 'GPL',
  };
  // Whether the sale was registered as a B2B sale to a dealer. Drives the
  // panel meta label and the IVA cell (which is meaningless in this regime
  // because no VAT is discriminated by the seller).
  const isComerciante = $derived(s.buyerType === 'COMERCIANTE');

  let updatingDelivery = $state(false);

  // ─── Timeline styling — mirrors /atividade so the look stays consistent.
  // Each activity type maps to an icon + brand-tinted accent colour + a
  // human-readable Portuguese label. Anything not in the map falls back to
  // a neutral icon.
  const STYLE_FOR_TYPE: Record<string, { icon: IconComponent; color: string; label: string }> = {
    VEHICLE_ADDED:          { icon: Car,              color: '#22d3ee', label: 'Viatura adicionada' },
    VEHICLE_UPDATED:        { icon: PencilLine,       color: '#5eead4', label: 'Viatura editada' },
    VEHICLE_STATUS_CHANGED: { icon: ArrowRightLeft,   color: '#06b6d4', label: 'Estado de viatura' },
    VEHICLE_DELETED:        { icon: Trash2,           color: 'var(--color-red)', label: 'Viatura eliminada' },
    SALE_CREATED:           { icon: Receipt,          color: '#e6b800', label: 'Venda registada' },
    SALE_UPDATED:           { icon: PencilLine,       color: '#f59e0b', label: 'Venda editada' },
    TRADE_IN_RECEIVED:      { icon: ArrowRightLeft,   color: '#f97316', label: 'Retoma recebida' },
    CUSTOMER_ADDED:         { icon: UserPlus,         color: '#a78bfa', label: 'Cliente adicionado' },
    CUSTOMER_UPDATED:       { icon: UserCog,          color: '#c4b5fd', label: 'Cliente editado' },
    TASK_CREATED:           { icon: ListPlus,         color: '#5c8def', label: 'Tarefa criada' },
    TASK_STATUS_CHANGED:    { icon: ArrowRightLeft,   color: '#7dd3fc', label: 'Estado de tarefa' },
    TASK_COMPLETED:         { icon: CheckCircle2,     color: 'var(--color-success)', label: 'Tarefa concluída' },
    EXPENSE_ADDED:          { icon: Wallet,           color: '#e0a040', label: 'Despesa registada' },
    EXPENSE_UPDATED:        { icon: CircleDollarSign, color: '#fbbf24', label: 'Despesa editada' },
  };

  function styleFor(type: string): { icon: IconComponent; color: string; label: string } {
    return STYLE_FOR_TYPE[type] ?? { icon: Activity, color: 'var(--color-text-muted)', label: type };
  }

  function relativeTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'agora';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d`;
    return formatDate(iso);
  }

  function dateBucket(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return 'Hoje';
    if (sameDay(d, yesterday)) return 'Ontem';
    return formatDateLong(d);
  }
</script>

<svelte:head>
  <title>Venda · {v.brand} {v.model}</title>
</svelte:head>

<section class="pt-8 pb-12 space-y-6">
  <!-- Header -->
  <div class="flex items-end justify-between gap-6">
    <div>
      <div class="mb-2 flex items-center gap-2">
        <StatusBadge status={s.deliveryStatus} />
        <span
          class="font-mono text-[9.5px] uppercase tracking-[0.14em] px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-text-muted)]"
          style="border-radius: 999px;"
          title={isComerciante
            ? 'Venda B2B a comerciante — sem IVA discriminado pelo vendedor.'
            : 'Venda a particular — regime de margem 23/123.'}
        >
          {isComerciante ? 'Comerciante' : 'Particular'}
        </span>
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Vendida em {formatDate(s.saleDate)}
        </span>
      </div>
      <ItalicHero text={`${v.brand} `} accent={v.model} size="lg" />
      <p
        class="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        <span class="text-[var(--color-red)]">●</span>
        Para {c.name} <span class="text-[var(--color-text-faint)]">·</span> NIF {c.nif}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" href={`/viaturas/${v.id}`}>Ver viatura</Button>
      <Button variant="outline" href={`/clientes/${c.id}`}>Ver cliente</Button>
    </div>
  </div>

  <!-- Profit summary. When a financing-referral commission was captured at
       sale time, it gets its own cell between IVA and Lucro Real so the
       breakdown clearly shows what's the vehicle margin and what's the
       intermediation income that lifts the bottom line.
       `{@const}` must be the immediate child of a control-flow block, so
       we use a $derived in the script tag's scope. -->
  <Panel>
    <PanelHeader
      icon={Receipt}
      title="Margem · IVA"
      meta={isComerciante ? 'SEM IVA — COMERCIANTE' : 'REGIME MARGEM 23/123'}
    />
    <div
      class="p-5 grid grid-cols-2 gap-4 {hasCommission ? 'md:grid-cols-5' : 'md:grid-cols-4'}"
    >
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Preço Compra
        </div>
        <div class="num-value text-[20px]">
          {formatEUR(v.purchasePrice)}
        </div>
      </div>
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Preço Venda
        </div>
        <div class="num-value text-[20px]">
          {formatEUR(s.salePrice)}
        </div>
      </div>
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          {isComerciante ? 'IVA' : 'IVA (23/123)'}
        </div>
        {#if isComerciante}
          <div
            class="num-value text-[20px] text-[var(--color-text-faint)]"
            title="Venda a comerciante — sem IVA discriminado pelo vendedor."
          >
            —
          </div>
        {:else}
          <div class="num-value text-[20px] text-[var(--color-warning)]">
            {formatEUR(s.vatAmount)}
          </div>
        {/if}
      </div>
      {#if hasCommission}
        <div>
          <div
            class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
          >
            Comissão
          </div>
          <div class="num-value text-[20px] text-[var(--color-success)]">
            + {formatEUR(s.commission)}
          </div>
        </div>
      {/if}
      <div>
        <div
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
        >
          Lucro Real
        </div>
        <div
          class="num-value text-[24px] {Number(s.realProfit) < 0
            ? 'text-[var(--color-red)]'
            : 'text-[var(--color-success)]'}"
        >
          {formatEUR(s.realProfit)}
        </div>
      </div>
    </div>
  </Panel>

  <!--
    Lucro consolidado da retoma. Só aparece quando o carro VENDIDO entrou no
    stock como retoma duma venda anterior. Mostra o ciclo completo: lucro
    original (que ficou parcialmente em forma de carro) + lucro desta venda
    = total efetivo do par de negócios. Responde diretamente à pergunta
    "valeu a pena ter aceitado essa retoma?".
  -->
  {#if v.sourceTradeIn}
    {@const origin = v.sourceTradeIn}
    {@const originalProfit = Number(origin.sale.realProfit)}
    {@const thisProfit = Number(s.realProfit)}
    {@const consolidated = originalProfit + thisProfit}
    <Panel>
      <PanelHeader
        icon={ArrowRightLeft}
        title="Lucro consolidado da retoma"
        meta="CICLO COMPLETO"
      />
      <div class="p-5 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <a
            href={`/vendas/${origin.sale.id}`}
            class="group block"
            title="Abrir a venda que originou esta retoma"
          >
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5 flex items-center gap-1.5"
            >
              Venda original
              <span class="text-[#f97316] normal-case tracking-normal opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <div
              class="num-value text-[20px] {originalProfit < 0
                ? 'text-[var(--color-red)]'
                : 'text-[var(--color-success)]'} group-hover:underline decoration-dotted underline-offset-4"
            >
              {formatEUR(originalProfit.toFixed(2))}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5 truncate"
            >
              {origin.sale.vehicle.brand} {origin.sale.vehicle.model} → {origin.sale.customer.name}
            </div>
          </a>
          <div>
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
            >
              + Esta venda
            </div>
            <div
              class="num-value text-[20px] {thisProfit < 0
                ? 'text-[var(--color-red)]'
                : 'text-[var(--color-success)]'}"
            >
              {formatEUR(thisProfit.toFixed(2))}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5 truncate"
            >
              Resale do carro recebido na retoma.
            </div>
          </div>
          <div class="border-l border-[var(--color-border)] pl-5">
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
            >
              = Total do ciclo
            </div>
            <div
              class="num-value text-[28px] {consolidated < 0
                ? 'text-[var(--color-red)]'
                : 'text-[var(--color-success)]'}"
            >
              {formatEUR(consolidated.toFixed(2))}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5"
            >
              {consolidated >= 0 ? 'A retoma compensou.' : 'A retoma deu prejuízo no ciclo.'}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  {/if}

  <!-- Two-col: vehicle + customer cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Panel>
      <PanelHeader icon={Car} title="Viatura" />
      <div class="p-5 space-y-3">
        <SpecRow icon={Car} label="Marca / Modelo" value={`${v.brand} ${v.model}`} />
        <SpecRow icon={Calendar} label="Ano" value={String(v.year)} />
        <SpecRow icon={Tag} label="VIN" value={v.vin} />
      </div>
    </Panel>

    <Panel>
      <PanelHeader icon={UserIcon} title="Cliente" />
      <div class="p-5 space-y-3">
        <SpecRow icon={UserIcon} label="Nome" value={c.name} />
        <SpecRow icon={Tag} label="NIF" value={c.nif} />
        <SpecRow icon={UserIcon} label="Telefone" value={c.phone} />
        {#if c.email}
          <SpecRow icon={UserIcon} label="Email" value={c.email} />
        {/if}
      </div>
    </Panel>
  </div>

  <!--
    Retoma. Only rendered when this sale captured a trade-in. Shows the
    abated value (already reflected in the Margem · IVA panel above) and
    the disposition. STOCK includes a deep-link to the freshly-created
    Vehicle row so the dealer can follow the second deal through to sale.
  -->
  {#if t}
    <Panel>
      <PanelHeader
        icon={ArrowRightLeft}
        title="Retoma"
        meta={t.disposition === 'STOCK' ? 'NO STOCK' : 'PARA ABATE'}
      >
        {#snippet actions()}
          {#if t.disposition === 'STOCK' && t.resultingVehicleId}
            <Button variant="outline" size="sm" href={`/viaturas/${t.resultingVehicleId}`}>
              Ver viatura no stock
            </Button>
          {/if}
        {/snippet}
      </PanelHeader>
      <div class="p-5 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-[14px]">
          <div>
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
            >
              Marca / Modelo
            </div>
            <div class="font-display font-semibold">
              {t.brand} {t.model}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5"
            >
              {t.year} · {FUEL_LABELS[t.fuel] ?? t.fuel} · {t.mileage.toLocaleString('pt-PT')} km
            </div>
          </div>
          <div>
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
            >
              Identificação
            </div>
            <div class="font-mono text-[13px] tabular-nums">
              {#if t.licensePlate}
                {t.licensePlate}
              {:else}
                <span class="text-[var(--color-text-faint)]">sem matrícula</span>
              {/if}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5 truncate"
              title={t.vin ?? ''}
            >
              {#if t.vin}
                VIN {t.vin}
              {:else}
                <span class="text-[var(--color-text-faint)]">sem VIN</span>
              {/if}
            </div>
          </div>
          <div>
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1"
            >
              Valor da retoma
            </div>
            <div class="num-value text-[20px]">
              {formatEUR(t.allowanceValue)}
            </div>
            <div
              class="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-text-muted)] mt-0.5"
            >
              {#if t.disposition === 'STOCK'}
                Preço de compra da viatura no stock.
              {:else}
                Custo da aquisição (não afeta esta venda).
              {/if}
            </div>
          </div>
        </div>
        {#if t.notes}
          <div class="border-t border-[var(--color-border)] pt-4">
            <div
              class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)] mb-1.5"
            >
              Notas
            </div>
            <div class="text-[13px] leading-relaxed text-[var(--color-text-muted)] whitespace-pre-wrap">
              {t.notes}
            </div>
          </div>
        {/if}
      </div>
    </Panel>
  {/if}

  <!-- Delivery management -->
  <Panel>
    <PanelHeader icon={Calendar} title="Entrega" />
    <form
      method="POST"
      action="?/delivery"
      use:enhance={() => {
        updatingDelivery = true;
        return async ({ result }) => {
          updatingDelivery = false;
          if (result.type === 'success') {
            toast.success('Entrega actualizada.');
            await invalidateAll();
          } else if (result.type === 'failure') {
            toast.error(
              (result.data as { error?: string } | undefined)?.error ?? 'Falha.',
            );
          }
        };
      }}
      class="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
    >
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
        >
          Estado
        </span>
        <select
          name="deliveryStatus"
          value={s.deliveryStatus}
          class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        >
          <option value="PENDING">Pendente</option>
          <option value="SCHEDULED">Agendada</option>
          <option value="DELIVERED">Entregue</option>
        </select>
      </label>
      <label class="flex flex-col">
        <span
          class="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1.5"
        >
          Data de entrega
        </span>
        <input
          name="deliveryDate"
          type="date"
          value={s.deliveryDate ? s.deliveryDate.slice(0, 10) : ''}
          class="h-11 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[14px] outline-none focus:border-[var(--color-red)]"
          style="border-radius: var(--radius-btn);"
        />
      </label>
      <div class="flex justify-end">
        <Button variant="primary" type="submit" loading={updatingDelivery}>
          Actualizar entrega
        </Button>
      </div>
    </form>
  </Panel>

  <!--
    Timeline / Histórico do negócio
    Cronologia da venda + da viatura ligada. Carrega via stream para não
    bloquear o resto da página: enquanto o ActivityLog vem, mostra um
    skeleton; quando chega, agrupa por dia e desenha o mesmo layout
    icon + accent line + texto + autor + tempo relativo que /atividade usa.
    O `meta` do header indica a contagem total de eventos no scope.
  -->
  <Panel>
    {#await data.timeline}
      <PanelHeader icon={Activity} title="Histórico do negócio" />
      <div class="p-4 space-y-2">
        {#each Array(4) as _, i (i)}
          <Skeleton width="100%" height="42px" />
        {/each}
      </div>
    {:then tl}
      <PanelHeader icon={Activity} title="Histórico do negócio" meta={`${tl.total} EVENTOS`} />
      {#if tl.items.length === 0}
        <div
          class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
        >
          Sem eventos registados para esta venda.
        </div>
      {:else}
        <!--
          Build date groups inline so the markup stays self-contained. The
          activity list comes pre-sorted newest-first from the API; we walk
          it once and bucket consecutive entries under the same date header.
        -->
        {@const groups = (() => {
          const out: { bucket: string; rows: typeof tl.items }[] = [];
          for (const row of tl.items) {
            const bucket = dateBucket(row.createdAt);
            const last = out[out.length - 1];
            if (last && last.bucket === bucket) last.rows.push(row);
            else out.push({ bucket, rows: [row] });
          }
          return out;
        })()}
        {#each groups as group (group.bucket)}
          <div
            class="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] bg-[var(--color-bg-2)] border-y border-[var(--color-border)] flex items-center gap-2"
          >
            <span class="h-1 w-1 rounded-full bg-[var(--color-red)]"></span>
            {group.bucket}
            <span class="text-[var(--color-text-faint)]">·</span>
            <span class="num-value text-[10px]">{group.rows.length}</span>
          </div>
          <ul class="divide-y divide-[var(--color-border)]">
            {#each group.rows as item (item.id)}
              {@const style = styleFor(item.type)}
              {@const Icon = style.icon}
              {@const actorLabel = item.actor?.name ?? 'Sistema'}
              <!--
                For trade-in events, augment the second line with the car's
                identification (plate preferred, VIN fallback) and, when the
                car entered stock, deep-link to the new vehicle page so the
                dealer can jump straight to its details from the timeline.
              -->
              {@const isTradeIn = item.type === 'TRADE_IN_RECEIVED' && t !== null}
              {@const tradeInId = isTradeIn ? (t!.licensePlate ?? t!.vin) : null}
              {@const tradeInHref =
                isTradeIn && t!.disposition === 'STOCK' && t!.resultingVehicleId
                  ? `/viaturas/${t!.resultingVehicleId}`
                  : null}
              <li
                class="grid items-center gap-3 md:gap-4 px-5 py-3 grid-cols-[36px_1.5px_1fr_auto] md:grid-cols-[36px_1.5px_1fr_auto_auto] {tradeInHref
                  ? 'hover:bg-[color-mix(in_oklab,#f97316_6%,transparent)] transition-colors'
                  : ''}"
              >
                <span
                  class="inline-flex items-center justify-center h-9 w-9 rounded-full"
                  style="background: color-mix(in oklab, {style.color} 12%, transparent);"
                >
                  <Icon class="h-4 w-4" style="color: {style.color};" />
                </span>
                <span
                  class="block h-7 w-[1.5px]"
                  style="background: {style.color}; opacity: 0.55;"
                ></span>
                <div class="min-w-0">
                  {#if tradeInHref}
                    <!--
                      Whole text block is the link target so any click on
                      the message or the identifier navigates to the car.
                    -->
                    <a
                      href={tradeInHref}
                      class="block group/tradein"
                      title="Ver detalhes do carro recebido na retoma"
                    >
                      <div
                        class="text-[14px] text-[var(--color-text)] truncate group-hover/tradein:text-[#f97316] transition-colors"
                      >
                        {item.message}
                      </div>
                      <div
                        class="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)] mt-0.5 flex items-center gap-2 flex-wrap"
                      >
                        <span>{style.label}</span>
                        {#if tradeInId}
                          <span class="text-[var(--color-text-faint)]">·</span>
                          <span class="tracking-[0.18em] text-[var(--color-text-muted)]">
                            {tradeInId}
                          </span>
                        {/if}
                        <span class="text-[var(--color-text-faint)]">·</span>
                        <span class="text-[#f97316] normal-case tracking-normal">
                          ver viatura →
                        </span>
                      </div>
                    </a>
                  {:else}
                    <div class="text-[14px] text-[var(--color-text)] truncate">
                      {item.message}
                    </div>
                    <div
                      class="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)] mt-0.5 flex items-center gap-2 flex-wrap"
                    >
                      <span>{style.label}</span>
                      {#if isTradeIn && tradeInId}
                        <span class="text-[var(--color-text-faint)]">·</span>
                        <span class="tracking-[0.18em] text-[var(--color-text-muted)]">
                          {tradeInId}
                        </span>
                      {/if}
                    </div>
                  {/if}
                </div>
                <span
                  class="hidden md:flex font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] items-center gap-1.5"
                  title={`Por ${actorLabel}`}
                >
                  <UserIcon class="h-3 w-3 opacity-70" />
                  {actorLabel}
                </span>
                <span
                  class="num-value text-[11px] text-[var(--color-text-faint)] text-right min-w-[60px]"
                >
                  {relativeTime(item.createdAt)}
                </span>
              </li>
            {/each}
          </ul>
        {/each}
      {/if}
    {/await}
  </Panel>
</section>
