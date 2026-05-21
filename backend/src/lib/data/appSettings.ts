import { prisma } from '../../db.js';
import { cache } from './cache.js';

const DEFAULTS = {
  stockAgingDays: 60,
  reminderLookaheadDays: 0,
} as const;

export type SettingKey = keyof typeof DEFAULTS;

const TTL_MS = 60_000; // settings change rarely; 60s of staleness is fine

async function readNumber(key: SettingKey): Promise<number> {
  return cache.wrap(`appSetting:${key}`, TTL_MS, async () => {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (!row) return DEFAULTS[key];
    const v = row.value;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : DEFAULTS[key];
    }
    return DEFAULTS[key];
  });
}

export const appSettings = {
  stockAgingDays: () => readNumber('stockAgingDays'),
  reminderLookaheadDays: () => readNumber('reminderLookaheadDays'),
  /** Call after upserting a setting so the next read is fresh. */
  invalidate: (key: SettingKey) => cache.invalidate(`appSetting:${key}`),
};
