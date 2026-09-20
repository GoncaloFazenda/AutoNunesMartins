import { Router, type Response } from 'express';
import { prisma } from '../db.js';
import { appSettings } from '../lib/data/appSettings.js';
import { cache } from '../lib/data/cache.js';
import { requireUser, type AuthedRequest } from '../middleware/clerk.js';

const router = Router();

const MS_PER_DAY = 86_400_000;
const NOTIFICATIONS_TTL_MS = 60_000;

function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}
function endOfToday(): Date {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  return t;
}

interface Payload {
  alerts: {
    stockAged: number;
    tasksDueOrOverdue: number;
    remindersToday: number;
    /** Viaturas em DRAFT — preço por definir (ver dashboardService.SmartAlerts). */
    draftVehicles: number;
  };
  total: number;
  recent: Array<{
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    message: string;
    createdAt: string;
    actor: { id: string; name: string } | null;
  }>;
}

async function buildNotifications(actorId: string): Promise<Payload> {
  const now = new Date();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const thresholdDays = await appSettings.stockAgingDays();
  const cutoff = new Date(now.getTime() - thresholdDays * MS_PER_DAY);

  const [stockAged, tasksDueOrOverdue, remindersToday, draftVehicles, recent] = await Promise.all([
    prisma.vehicle.count({
      where: { status: 'AVAILABLE', acquisitionDate: { lt: cutoff } },
    }),
    prisma.task.count({
      where: {
        status: { not: 'DONE' },
        OR: [{ assigneeId: null }, { assigneeId: actorId }],
        AND: [
          {
            OR: [
              { dueDate: { gte: todayStart, lte: todayEnd } },
              { dueDate: { lt: todayStart } },
            ],
          },
        ],
      },
    }),
    prisma.task.count({
      where: {
        status: { not: 'DONE' },
        OR: [{ assigneeId: null }, { assigneeId: actorId }],
        reminderDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.vehicle.count({ where: { status: 'DRAFT' } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { actor: { select: { id: true, name: true } } },
    }),
  ]);

  const alerts = { stockAged, tasksDueOrOverdue, remindersToday, draftVehicles };
  const total = stockAged + tasksDueOrOverdue + remindersToday + draftVehicles;

  return {
    alerts,
    total,
    recent: recent.map((r) => ({
      id: r.id,
      type: r.type,
      entityType: r.entityType,
      entityId: r.entityId,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      actor: r.actor ? { id: r.actor.id, name: r.actor.name } : null,
    })),
  };
}

router.get('/', requireUser, async (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const actorId = req.user.id;
  const payload = await cache.wrap(`notifications:${actorId}`, NOTIFICATIONS_TTL_MS, () =>
    buildNotifications(actorId),
  );
  res.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
  res.json(payload);
});

export default router;
