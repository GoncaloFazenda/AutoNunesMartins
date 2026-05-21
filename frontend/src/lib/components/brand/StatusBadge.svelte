<script lang="ts">
  import type { VehicleStatus, Priority, DeliveryStatus } from '@anm/types';

  type StatusKind = VehicleStatus | Priority | DeliveryStatus;

  interface Props {
    status: StatusKind;
    label?: string;
  }

  let { status, label }: Props = $props();

  const VEHICLE_LABELS: Record<VehicleStatus, string> = {
    AVAILABLE: 'Disponível',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
    DELIVERED: 'Entregue',
    DOCS_PENDING: 'Docs Pendentes',
  };

  const PRIORITY_LABELS: Record<Priority, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
    PENDING: 'Pendente',
    SCHEDULED: 'Agendada',
    DELIVERED: 'Entregue',
  };

  const STYLES: Record<StatusKind, { bg: string; fg: string }> = {
    AVAILABLE: { bg: 'color-mix(in oklab, var(--color-success) 18%, transparent)', fg: 'var(--color-success)' },
    RESERVED: { bg: 'color-mix(in oklab, var(--color-warning) 18%, transparent)', fg: 'var(--color-warning)' },
    SOLD: { bg: 'color-mix(in oklab, var(--color-text-muted) 22%, transparent)', fg: 'var(--color-text)' },
    DELIVERED: { bg: 'color-mix(in oklab, var(--color-info) 18%, transparent)', fg: 'var(--color-info)' },
    DOCS_PENDING: { bg: 'color-mix(in oklab, var(--color-red) 18%, transparent)', fg: 'var(--color-red)' },
    LOW: { bg: 'color-mix(in oklab, var(--color-text-muted) 16%, transparent)', fg: 'var(--color-text-muted)' },
    MEDIUM: { bg: 'color-mix(in oklab, var(--color-info) 18%, transparent)', fg: 'var(--color-info)' },
    HIGH: { bg: 'color-mix(in oklab, var(--color-warning) 18%, transparent)', fg: 'var(--color-warning)' },
    URGENT: { bg: 'color-mix(in oklab, var(--color-red) 22%, transparent)', fg: 'var(--color-red)' },
    PENDING: { bg: 'color-mix(in oklab, var(--color-warning) 18%, transparent)', fg: 'var(--color-warning)' },
    SCHEDULED: { bg: 'color-mix(in oklab, var(--color-info) 18%, transparent)', fg: 'var(--color-info)' },
  };

  function resolveLabel(s: StatusKind): string {
    if (s in VEHICLE_LABELS) return VEHICLE_LABELS[s as VehicleStatus];
    if (s in PRIORITY_LABELS) return PRIORITY_LABELS[s as Priority];
    if (s in DELIVERY_LABELS) return DELIVERY_LABELS[s as DeliveryStatus];
    return s;
  }

  const style = $derived(STYLES[status]);
  const displayLabel = $derived(label ?? resolveLabel(status));
</script>

<span
  class="inline-flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-1"
  style="background: {style.bg}; color: {style.fg};"
>
  {displayLabel}
</span>
