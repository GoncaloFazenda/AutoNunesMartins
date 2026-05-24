<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Activity,
    ArrowRightLeft,
    Car,
    CheckCircle2,
    CircleDollarSign,
    Filter,
    ListPlus,
    PencilLine,
    Receipt,
    Search,
    Trash2,
    User as UserIcon,
    UserCog,
    UserPlus,
    Wallet,
    X,
  } from 'lucide-svelte';
  import ItalicHero from '$lib/components/brand/ItalicHero.svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import { formatDate, formatDateLong } from '$lib/utils/format';
  import type { IconComponent } from '$lib/types/ui';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // ─── Same icon + color map as the dashboard RecentActivityFeed ──────────
  const STYLE_FOR_TYPE: Record<string, { icon: IconComponent; color: string; label: string }> = {
    VEHICLE_ADDED:          { icon: Car,              color: '#22d3ee', label: 'Viatura adicionada' },
    VEHICLE_UPDATED:        { icon: PencilLine,       color: '#5eead4', label: 'Viatura editada' },
    VEHICLE_STATUS_CHANGED: { icon: ArrowRightLeft,   color: '#06b6d4', label: 'Estado de viatura' },
    VEHICLE_DELETED:        { icon: Trash2,           color: 'var(--color-red)', label: 'Viatura eliminada' },
    SALE_CREATED:           { icon: Receipt,          color: '#e6b800', label: 'Venda registada' },
    SALE_UPDATED:           { icon: PencilLine,       color: '#f59e0b', label: 'Venda editada' },
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

  function hrefFor(row: { entityType: string; entityId: string }): string | null {
    switch (row.entityType) {
      case 'vehicle':
        return `/viaturas/${row.entityId}`;
      case 'sale':
        return `/sales/${row.entityId}`;
      case 'customer':
        return `/clientes/${row.entityId}`;
      case 'task':
        return `/tarefas/${row.entityId}/editar`;
      default:
        return null;
    }
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

  // ─── Filter state ──────────────────────────────────────────────────────
  // Initial values come from the URL (so filters are deep-linkable + the
  // back button restores them). Changes are debounced into the URL via goto.
  const initial = data.params;
  let actorId = $state(initial.actorId ?? '');
  let entityType = $state(initial.entityType ?? '');
  // The `type` query param is a comma-separated list; convert to a Set for UI.
  let selectedTypes = $state<Set<string>>(
    new Set((initial.type ?? '').split(',').filter(Boolean)),
  );
  let q = $state(initial.q ?? '');
  let from = $state(initial.from ?? '');
  let to = $state(initial.to ?? '');

  function toggleType(t: string) {
    if (selectedTypes.has(t)) selectedTypes.delete(t);
    else selectedTypes.add(t);
    selectedTypes = new Set(selectedTypes); // trigger reactivity
  }

  function applyFilters() {
    const usp = new URLSearchParams();
    if (actorId) usp.set('actorId', actorId);
    if (entityType) usp.set('entityType', entityType);
    if (selectedTypes.size > 0) usp.set('type', Array.from(selectedTypes).join(','));
    if (q.trim()) usp.set('q', q.trim());
    if (from) usp.set('from', from);
    if (to) usp.set('to', to);
    // Reset to page 1 when filters change
    const qs = usp.toString();
    goto(qs ? `/atividade?${qs}` : '/atividade', { keepFocus: true, noScroll: true });
  }

  function clearFilters() {
    actorId = '';
    entityType = '';
    selectedTypes = new Set();
    q = '';
    from = '';
    to = '';
    goto('/atividade', { keepFocus: true, noScroll: true });
  }

  // Group rows by date header (today / yesterday / specific date) for scannability.
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

  // Build groups [{bucket, rows[]}] from the flat items list, preserving order.
  const groups = $derived.by(() => {
    const out: { bucket: string; rows: typeof data.result.items }[] = [];
    for (const row of data.result.items) {
      const bucket = dateBucket(row.createdAt);
      const last = out[out.length - 1];
      if (last && last.bucket === bucket) last.rows.push(row);
      else out.push({ bucket, rows: [row] });
    }
    return out;
  });

  // Convenience: list of activity types grouped by entity (for the filter chips)
  const TYPE_GROUPS: { label: string; types: string[] }[] = [
    {
      label: 'Viaturas',
      types: ['VEHICLE_ADDED', 'VEHICLE_UPDATED', 'VEHICLE_STATUS_CHANGED', 'VEHICLE_DELETED'],
    },
    { label: 'Vendas', types: ['SALE_CREATED', 'SALE_UPDATED'] },
    { label: 'Clientes', types: ['CUSTOMER_ADDED', 'CUSTOMER_UPDATED'] },
    { label: 'Tarefas', types: ['TASK_CREATED', 'TASK_STATUS_CHANGED', 'TASK_COMPLETED'] },
    { label: 'Despesas', types: ['EXPENSE_ADDED', 'EXPENSE_UPDATED'] },
  ];

  const hasAnyFilter = $derived(
    Boolean(
      actorId
        || entityType
        || selectedTypes.size > 0
        || q.trim()
        || from
        || to,
    ),
  );
</script>

<svelte:head>
  <title>Atividade · Auto Nunes Martins</title>
</svelte:head>

<section class="pb-12 space-y-6">
  <!-- Page header -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 pt-6 md:pt-[28px]">
    <div class="min-w-0">
      <ItalicHero text="Atividade" size="lg" />
      <div
        class="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-red)]"></span>
        <span>Registo · Todas as ações do painel</span>
        <span class="text-[var(--color-text-faint)]">·</span>
        <span><span class="num-value text-[11px]">{data.result.total}</span> eventos</span>
      </div>
    </div>
    {#if hasAnyFilter}
      <button
        type="button"
        onclick={clearFilters}
        class="inline-flex items-center gap-2 px-3 h-9 border border-[color-mix(in_oklab,var(--color-red)_40%,transparent)] text-[var(--color-red)] hover:bg-[color-mix(in_oklab,var(--color-red)_8%,transparent)] font-mono uppercase tracking-[0.12em] text-[11px] transition-colors cursor-pointer"
        style="border-radius: var(--radius-btn);"
      >
        <X class="h-3.5 w-3.5" />
        Limpar filtros
      </button>
    {/if}
  </div>

  <!-- Filters panel -->
  <Panel>
    <PanelHeader icon={Filter} title="Filtros" />
    <div class="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Search -->
      <div class="lg:col-span-4">
        <label
          for="actv-q"
          class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5"
        >
          Pesquisar
        </label>
        <div
          class="relative flex items-center h-10 px-3 border border-[var(--color-border)] focus-within:border-[var(--color-red)] transition-colors"
          style="border-radius: var(--radius-btn);"
        >
          <Search class="h-4 w-4 text-[var(--color-text-faint)] flex-shrink-0" />
          <input
            id="actv-q"
            type="search"
            bind:value={q}
            onkeydown={(e) => e.key === 'Enter' && applyFilters()}
            onblur={applyFilters}
            placeholder="ex: Dacia, IMT, transferência…"
            class="flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
      </div>

      <!-- Actor -->
      <div class="lg:col-span-3">
        <label
          for="actv-actor"
          class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5"
        >
          Utilizador
        </label>
        <select
          id="actv-actor"
          bind:value={actorId}
          onchange={applyFilters}
          class="w-full h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)] cursor-pointer"
          style="border-radius: var(--radius-btn);"
        >
          <option value="">Todos</option>
          {#each data.users as u (u.id)}
            <option value={u.id}>{u.name}</option>
          {/each}
        </select>
      </div>

      <!-- Entity type -->
      <div class="lg:col-span-2">
        <label
          for="actv-entity"
          class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5"
        >
          Entidade
        </label>
        <select
          id="actv-entity"
          bind:value={entityType}
          onchange={applyFilters}
          class="w-full h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)] cursor-pointer"
          style="border-radius: var(--radius-btn);"
        >
          <option value="">Todas</option>
          <option value="vehicle">Viatura</option>
          <option value="sale">Venda</option>
          <option value="customer">Cliente</option>
          <option value="task">Tarefa</option>
          <option value="expense">Despesa</option>
        </select>
      </div>

      <!-- Date range -->
      <div class="lg:col-span-3 grid grid-cols-2 gap-2">
        <div>
          <label
            for="actv-from"
            class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5"
          >
            De
          </label>
          <input
            id="actv-from"
            type="date"
            bind:value={from}
            onchange={applyFilters}
            class="w-full h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          />
        </div>
        <div>
          <label
            for="actv-to"
            class="block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5"
          >
            Até
          </label>
          <input
            id="actv-to"
            type="date"
            bind:value={to}
            onchange={applyFilters}
            class="w-full h-10 px-3 bg-[var(--color-bg-1)] border border-[var(--color-border)] text-[13px] outline-none focus:border-[var(--color-red)]"
            style="border-radius: var(--radius-btn);"
          />
        </div>
      </div>

      <!-- Activity-type chips (grouped per entity) -->
      <div class="lg:col-span-12">
        <div
          class="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2"
        >
          Tipo de ação
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          {#each TYPE_GROUPS as group (group.label)}
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                class="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] pr-1"
              >
                {group.label} ·
              </span>
              {#each group.types as t (t)}
                {@const s = styleFor(t)}
                {@const Icon = s.icon}
                {@const active = selectedTypes.has(t)}
                <button
                  type="button"
                  onclick={() => {
                    toggleType(t);
                    applyFilters();
                  }}
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.12em] transition-colors cursor-pointer {active
                    ? 'border-[color-mix(in_oklab,var(--color-red)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-red)_8%,transparent)] text-[var(--color-text)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]'}"
                  style="border-radius: 3px;"
                  title={s.label}
                >
                  <Icon class="h-3 w-3" style="color: {s.color};" />
                  {s.label}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </Panel>

  <!-- Activity list -->
  <Panel>
    <PanelHeader icon={Activity} title="Eventos" meta={`${data.result.total} TOTAL`} />

    {#if data.result.items.length === 0}
      <EmptyState
        icon={Activity}
        title="Sem eventos"
        description={hasAnyFilter
          ? 'Nenhum evento corresponde aos filtros activos.'
          : 'O registo de atividade está vazio.'}
      />
    {:else}
      {#each groups as group (group.bucket)}
        <!-- Date header -->
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
            {@const s = styleFor(item.type)}
            {@const Icon = s.icon}
            {@const href = hrefFor(item)}
            {@const actorLabel = item.actor?.name ?? 'Sistema'}
            <li>
              {#if href}
                <a
                  {href}
                  class="grid items-center gap-3 md:gap-4 px-5 py-3 grid-cols-[36px_1.5px_1fr_auto] md:grid-cols-[36px_1.5px_1fr_auto_auto] hover:bg-[color-mix(in_oklab,var(--color-red)_4%,transparent)] transition-colors group"
                >
                  <span class="inline-flex items-center justify-center h-9 w-9 rounded-full" style="background: color-mix(in oklab, {s.color} 12%, transparent);">
                    <Icon class="h-4 w-4" style="color: {s.color};" />
                  </span>
                  <span class="block h-7 w-[1.5px]" style="background: {s.color}; opacity: 0.55;"></span>
                  <div class="min-w-0">
                    <div class="text-[14px] text-[var(--color-text)] truncate group-hover:text-[var(--color-red)] transition-colors">
                      {item.message}
                    </div>
                    <div class="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)] mt-0.5">
                      {s.label}
                    </div>
                  </div>
                  <span
                    class="hidden md:flex font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] items-center gap-1.5"
                    title={`Por ${actorLabel}`}
                  >
                    <UserIcon class="h-3 w-3 opacity-70" />
                    {actorLabel}
                  </span>
                  <span class="num-value text-[11px] text-[var(--color-text-faint)] text-right min-w-[60px]">
                    {relativeTime(item.createdAt)}
                  </span>
                </a>
              {:else}
                <div
                  class="grid items-center gap-3 md:gap-4 px-5 py-3 grid-cols-[36px_1.5px_1fr_auto] md:grid-cols-[36px_1.5px_1fr_auto_auto]"
                >
                  <span class="inline-flex items-center justify-center h-9 w-9 rounded-full" style="background: color-mix(in oklab, {s.color} 12%, transparent);">
                    <Icon class="h-4 w-4" style="color: {s.color};" />
                  </span>
                  <span class="block h-7 w-[1.5px]" style="background: {s.color}; opacity: 0.55;"></span>
                  <div class="min-w-0">
                    <div class="text-[14px] text-[var(--color-text)] truncate">
                      {item.message}
                    </div>
                    <div class="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-faint)] mt-0.5">
                      {s.label}
                    </div>
                  </div>
                  <span
                    class="hidden md:flex font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] items-center gap-1.5"
                    title={`Por ${actorLabel}`}
                  >
                    <UserIcon class="h-3 w-3 opacity-70" />
                    {actorLabel}
                  </span>
                  <span class="num-value text-[11px] text-[var(--color-text-faint)] text-right min-w-[60px]">
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/each}

      <Pagination
        currentPage={data.result.page}
        totalPages={data.result.pageCount}
        total={data.result.total}
        pageSize={data.result.pageSize}
      />
    {/if}
  </Panel>
</section>
