import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { appSettings, type SettingKey as AppSettingKey } from '../lib/data/appSettings.js';
import { cache } from '../lib/data/cache.js';
import { emitActivity } from '../lib/data/activity.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';
import { param } from '../lib/http.js';

const router = Router();

/**
 * Whitelist of admin-editable settings. Each entry describes:
 *   - the storage key
 *   - the label (UI hint)
 *   - the zod schema for the value
 *   - a reader that returns the current effective value
 */
const SETTINGS_REGISTRY = {
  stockAgingDays: {
    label: 'Limite de stock antigo (dias)',
    schema: z.coerce.number().int().min(1).max(365),
    read: () => appSettings.stockAgingDays(),
    description: 'Viaturas disponíveis acima deste número de dias aparecem nos alertas inteligentes.',
  },
} as const;

type SettingKey = keyof typeof SETTINGS_REGISTRY;

function isKnownKey(k: string): k is SettingKey {
  return k in SETTINGS_REGISTRY;
}

router.get('/', requireUser, async (_req: AuthedRequest, res: Response) => {
  const entries = await Promise.all(
    (Object.keys(SETTINGS_REGISTRY) as SettingKey[]).map(async (key) => {
      const def = SETTINGS_REGISTRY[key];
      const value = await def.read();
      return { key, label: def.label, description: def.description, value };
    }),
  );
  res.json({ items: entries });
});

router.put('/:key', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const key = param(req, 'key');
  if (!isKnownKey(key)) {
    res.status(404).json({ error: `Setting "${key}" não existe ou não é editável.` });
    return;
  }

  const def = SETTINGS_REGISTRY[key];
  const parsed = def.schema.safeParse(
    typeof req.body === 'object' && req.body !== null
      ? (req.body as { value?: unknown }).value
      : undefined,
  );
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? 'Valor inválido',
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.appSetting.upsert({
      where: { key },
      update: { value: parsed.data },
      create: { key, value: parsed.data },
    });
    await emitActivity(tx, {
      actorId: req.user!.id,
      type: 'EXPENSE_UPDATED', // reusing — no SETTINGS_UPDATED in our enum
      entityType: 'expense',
      entityId: key,
      message: `Definição actualizada: ${def.label} = ${parsed.data}`,
      metadata: { setting: key, value: parsed.data },
    });
  });

  // Bust the appSetting cache + any dashboard caches that depend on it.
  appSettings.invalidate(key as AppSettingKey);
  cache.clearPrefix('dashboard:');
  cache.clearPrefix('notifications:');

  res.json({ ok: true, value: parsed.data });
});

export default router;
