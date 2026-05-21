import { Router, type Request, type Response } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../../db.js';
import { getEnv } from '../../env.js';
import { logger } from '../../logger.js';
import { invalidateUsersCache } from '../users.js';

const env = getEnv();
const router = Router();

interface ClerkUserPayload {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

function pickPrimaryEmail(payload: ClerkUserPayload): string | null {
  if (payload.primary_email_address_id) {
    const match = payload.email_addresses.find((e) => e.id === payload.primary_email_address_id);
    if (match) return match.email_address;
  }
  return payload.email_addresses[0]?.email_address ?? null;
}

function fullName(payload: ClerkUserPayload): string {
  const parts = [payload.first_name, payload.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : (pickPrimaryEmail(payload) ?? 'Utilizador');
}

router.post('/', async (req: Request, res: Response) => {
  const svixId = req.header('svix-id');
  const svixTimestamp = req.header('svix-timestamp');
  const svixSignature = req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: 'Missing svix headers' });
    return;
  }

  const payload = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!payload) {
    res.status(400).json({ error: 'Missing raw body' });
    return;
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    event = wh.verify(payload.toString('utf8'), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    logger.warn({ err }, 'Clerk webhook signature verification failed');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  try {
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const email = pickPrimaryEmail(event.data);
      if (!email) {
        logger.warn({ clerkId: event.data.id }, 'Clerk user has no email');
        res.status(200).json({ ok: true, skipped: 'no-email' });
        return;
      }

      const name = fullName(event.data);
      await prisma.user.upsert({
        where: { clerkId: event.data.id },
        update: { email, name },
        create: { clerkId: event.data.id, email, name, role: 'ADMIN' },
      });
      invalidateUsersCache();
      logger.info({ clerkId: event.data.id, type: event.type }, 'Clerk user synced');
    } else {
      logger.debug({ type: event.type }, 'Clerk webhook event ignored');
    }
  } catch (err) {
    logger.error({ err }, 'Clerk webhook processing failed');
    res.status(500).json({ error: 'Processing failed' });
    return;
  }

  res.status(200).json({ ok: true });
});

export default router;
