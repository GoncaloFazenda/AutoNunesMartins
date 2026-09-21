<script lang="ts">
  import {
    Activity,
    ArrowRightLeft,
    Car,
    CheckCircle2,
    CircleDollarSign,
    ListPlus,
    PencilLine,
    Receipt,
    Trash2,
    User as UserIcon,
    UserCog,
    UserPlus,
    Wallet,
  } from 'lucide-svelte';
  import Panel from '$lib/components/common/Panel.svelte';
  import PanelHeader from '$lib/components/brand/PanelHeader.svelte';
  import { formatDate } from '$lib/utils/format';
  import type { RecentActivityRow } from '$lib/server/dashboard';
  import type { IconComponent } from '$lib/types/ui';

  interface Props {
    items: RecentActivityRow[];
    /** Header title (default: "Atividade Recente"). Overridden by the tasks
     *  page to read "Atividade de Tarefas" so the panel context is clear. */
    title?: string;
  }

  let { items, title = 'Atividade Recente' }: Props = $props();

  /**
   * Distinct color + icon per activity type so each row reads at a glance.
   * Each entity has its own hue family:
   *   Vehicles  → cyan (#22d3ee)
   *   Sales     → gold (#e6b800)
   *   Customers → violet (#a78bfa)
   *   Tasks     → blue (#5c8def)
   *   Expenses  → amber (#e0a040)
   *   Delete    → red (always — destructive)
   *   Complete  → green (always — positive end-state)
   */
  const STYLE_FOR_TYPE: Record<string, { icon: IconComponent; color: string }> = {
    // Vehicles — cyan
    VEHICLE_ADDED:          { icon: Car,             color: '#22d3ee' },
    VEHICLE_UPDATED:        { icon: PencilLine,      color: '#5eead4' },
    VEHICLE_STATUS_CHANGED: { icon: ArrowRightLeft,  color: '#06b6d4' },
    VEHICLE_DELETED:        { icon: Trash2,          color: 'var(--color-red)' },
    // Sales — gold (money won)
    SALE_CREATED:           { icon: Receipt,         color: '#e6b800' },
    SALE_UPDATED:           { icon: PencilLine,      color: '#f59e0b' },
    TRADE_IN_RECEIVED:      { icon: ArrowRightLeft,  color: '#f97316' },
    // Customers — violet
    CUSTOMER_ADDED:         { icon: UserPlus,        color: '#a78bfa' },
    CUSTOMER_UPDATED:       { icon: UserCog,         color: '#c4b5fd' },
    // Tasks — blue family + green completion
    TASK_CREATED:           { icon: ListPlus,        color: '#5c8def' },
    TASK_STATUS_CHANGED:    { icon: ArrowRightLeft,  color: '#7dd3fc' },
    TASK_COMPLETED:         { icon: CheckCircle2,    color: 'var(--color-success)' },
    // Expenses — amber
    EXPENSE_ADDED:          { icon: Wallet,          color: '#e0a040' },
    EXPENSE_UPDATED:        { icon: CircleDollarSign, color: '#fbbf24' },
  };

  function styleFor(type: string): { icon: IconComponent; color: string } {
    return STYLE_FOR_TYPE[type] ?? { icon: Activity, color: 'var(--color-text-muted)' };
  }

  function hrefFor(row: RecentActivityRow): string | null {
    switch (row.entityType) {
      case 'vehicle':
        return `/viaturas/${row.entityId}`;
      case 'sale':
        return `/vendas/${row.entityId}`;
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
</script>

<Panel>
  <PanelHeader icon={Activity} {title} meta={`${items.length} EVENTOS`} />

  {#if items.length === 0}
    <div
      class="p-8 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-faint)]"
    >
      Sem eventos recentes
    </div>
  {:else}
    <ul class="divide-y divide-[var(--color-border)]">
      {#each items as item (item.id)}
        {@const s = styleFor(item.type)}
        {@const Icon = s.icon}
        {@const href = hrefFor(item)}
        {@const actorLabel = item.actor?.name ?? 'Sistema'}
        <li>
          {#if href}
            <a
              {href}
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-[color-mix(in_oklab,var(--color-red)_5%,transparent)] transition-colors group"
            >
              <Icon class="h-4 w-4 flex-shrink-0" style="color: {s.color};" />
              <span
                class="font-mono text-[10.5px] tabular-nums text-[var(--color-text-faint)] flex-shrink-0 w-10 text-right"
              >
                {relativeTime(item.createdAt)}
              </span>
              <span
                class="text-[13px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors truncate flex-1"
              >
                {item.message}
              </span>
              <span
                class="hidden md:flex font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] flex-shrink-0 items-center gap-1.5"
                title={`Por ${actorLabel}`}
              >
                <UserIcon class="h-3 w-3 opacity-70" />
                {actorLabel}
              </span>
            </a>
          {:else}
            <div class="flex items-center gap-3 px-4 py-2.5">
              <Icon class="h-4 w-4 flex-shrink-0" style="color: {s.color};" />
              <span
                class="font-mono text-[10.5px] tabular-nums text-[var(--color-text-faint)] flex-shrink-0 w-10 text-right"
              >
                {relativeTime(item.createdAt)}
              </span>
              <span class="text-[13px] text-[var(--color-text-muted)] truncate flex-1">
                {item.message}
              </span>
              <span
                class="hidden md:flex font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] flex-shrink-0 items-center gap-1.5"
                title={`Por ${actorLabel}`}
              >
                <UserIcon class="h-3 w-3 opacity-70" />
                {actorLabel}
              </span>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</Panel>
