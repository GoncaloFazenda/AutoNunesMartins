-- Add WEEKLY to the Recurrence enum so tasks can recur every 7 days.
-- Postgres requires ALTER TYPE ADD VALUE outside a transaction block, which
-- prisma migrate handles by running each statement standalone.
ALTER TYPE "Recurrence" ADD VALUE 'WEEKLY';
