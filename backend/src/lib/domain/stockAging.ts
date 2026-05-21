import type { VehicleStatus } from '@anm/types';

export interface AgingCheckInput {
  status: VehicleStatus;
  acquisitionDate: Date;
  thresholdDays: number;
  now?: Date;
}

const MS_PER_DAY = 86_400_000;

export function isStockAged(input: AgingCheckInput): boolean {
  if (input.status !== 'AVAILABLE') return false;
  const now = input.now ?? new Date();
  const ageMs = now.getTime() - input.acquisitionDate.getTime();
  return ageMs > input.thresholdDays * MS_PER_DAY;
}

export function daysInStock(acquisitionDate: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - acquisitionDate.getTime();
  return Math.floor(ageMs / MS_PER_DAY);
}
