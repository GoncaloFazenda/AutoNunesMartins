import type { NextFunction, Request, Response } from 'express';
import {
  clerkMiddleware as baseClerkMiddleware,
  createClerkClient,
  getAuth,
} from '@clerk/express';
import { prisma } from '../db.js';
import { getEnv } from '../env.js';
import { logger } from '../logger.js';

const env = getEnv();

export const clerkMiddleware = baseClerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
});

export interface AuthedRequest extends Request {
  user?: { id: string; clerkId: string; email: string; name: string; role: 'ADMIN' };
}

interface ClerkUserShape {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  primaryEmailAddressId?: string | null;
  emailAddresses?: { id: string; emailAddress: string }[];
}

function pickEmail(u: ClerkUserShape): string | null {
  if (!u.emailAddresses?.length) return null;
  if (u.primaryEmailAddressId) {
    const match = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId);
    if (match) return match.emailAddress;
  }
  return u.emailAddresses[0]?.emailAddress ?? null;
}

function pickName(u: ClerkUserShape, fallbackEmail: string): string {
  const fullName = u.fullName ?? [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return fullName || fallbackEmail.split('@')[0] || 'Utilizador';
}

/**
 * Ensures every authenticated Clerk user has a matching User row in Postgres.
 * Called on every authenticated request — cheap because it's a single indexed lookup
 * (clerkId is UNIQUE) and we only hit the Clerk API when provisioning a brand-new user.
 */
export async function requireUser(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let user = await prisma.user.findUnique({ where: { clerkId: auth.userId } });

  if (!user) {
    try {
      const clerkUser = (await clerkClient.users.getUser(auth.userId)) as ClerkUserShape;
      const email = pickEmail(clerkUser);
      if (!email) {
        logger.warn({ clerkId: auth.userId }, 'Cannot provision user: no email on Clerk profile');
        res.status(403).json({ error: 'No email on Clerk profile.' });
        return;
      }
      const name = pickName(clerkUser, email);

      // Upsert in case a concurrent request raced us, or the webhook already fired.
      user = await prisma.user.upsert({
        where: { clerkId: auth.userId },
        update: {},
        create: { clerkId: auth.userId, email, name, role: 'ADMIN' },
      });
      logger.info({ clerkId: auth.userId, userId: user.id }, 'User auto-provisioned from Clerk');
    } catch (err) {
      logger.error({ err, clerkId: auth.userId }, 'Failed to auto-provision user');
      res.status(500).json({ error: 'Failed to provision user.' });
      return;
    }
  }

  req.user = {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  next();
}
