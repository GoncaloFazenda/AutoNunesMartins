import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const eurFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 0,
});

export function formatEUR(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return eurFormatter.format(n);
}

export function formatInt(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return numberFormatter.format(n);
}

export function formatKm(value: number | string | null | undefined): string {
  const f = formatInt(value);
  return f === '—' ? f : `${f} km`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'dd/MM/yyyy', { locale: pt });
}

/** "QUI · 30 ABR 2026" — uppercase mono date header. */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, "EEE '·' dd MMM yyyy", { locale: pt }).toUpperCase().replace(/\./g, '');
}

export function formatGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return 'Boa noite';
  if (h < 13) return 'Bom dia';
  if (h < 20) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Compact value formatter for KPI cards. Returns `{ value, suffix }` so the
 * card can render the suffix in a smaller / dimmer style.
 *
 *   formatCompactEUR("248500")  → { value: "€248", suffix: "k" }
 *   formatCompactEUR("1500000") → { value: "€1.5", suffix: "M" }
 *   formatCompactEUR("420")     → { value: "€420", suffix: undefined }
 */
export function formatCompactEUR(input: number | string | null | undefined): { value: string; suffix?: string } {
  if (input === null || input === undefined || input === '') return { value: '—' };
  const n = typeof input === 'string' ? Number(input) : input;
  if (!Number.isFinite(n)) return { value: '—' };
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    const m = (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1);
    return { value: `€${m}`, suffix: 'M' };
  }
  if (abs >= 1_000) {
    return { value: `€${sign}${Math.round(abs / 1000)}`, suffix: 'k' };
  }
  return { value: `€${Math.round(n)}`, suffix: undefined };
}

/** Same shape as formatCompactEUR but for plain counts (no euro sign). */
export function formatCompactInt(
  input: number | null | undefined,
  unitSuffix?: string,
): { value: string; suffix?: string } {
  if (input === null || input === undefined || !Number.isFinite(input)) return { value: '—' };
  if (Math.abs(input) >= 1_000) {
    return { value: (input / 1000).toFixed(1), suffix: 'k' + (unitSuffix ? ' ' + unitSuffix : '') };
  }
  return { value: String(Math.round(input)), suffix: unitSuffix };
}
