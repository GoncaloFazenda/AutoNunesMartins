// Read-only aggregate diagnostic. Never prints connection strings or vehicle data.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({ log: [] });
try {
  const result = await db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    const columns = await tx.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'Vehicle' AND column_name IN ('webPublished', 'publicSlug', 'publicPrice') ORDER BY column_name`);
    const states = await tx.$queryRawUnsafe(`SELECT status::text AS status, COUNT(*)::int AS count FROM "Vehicle" WHERE status IN ('AVAILABLE', 'RESERVED') GROUP BY status ORDER BY status`);
    const eligible = await tx.$queryRawUnsafe(`SELECT v.status::text AS status, COUNT(*)::int AS count FROM "Vehicle" v WHERE v.status IN ('AVAILABLE', 'RESERVED') AND v."soldDate" IS NULL AND NOT EXISTS (SELECT 1 FROM "Sale" s WHERE s."vehicleId" = v.id) GROUP BY v.status ORDER BY v.status`);
    const unapproved = columns.some(c => c.column_name === 'webPublished') ? await tx.$queryRawUnsafe(`SELECT status::text AS status, COUNT(*)::int AS count FROM "Vehicle" WHERE status IN ('AVAILABLE', 'RESERVED') AND "webPublished" = false GROUP BY status ORDER BY status`) : null;
    return { publicColumns: columns.map(c => c.column_name), states, unsoldCandidates: eligible, unapproved };
  });
  console.log(JSON.stringify(result));
} catch (e) {
  console.error(JSON.stringify({ diagnostic: 'failed', code: e.code ?? e.name }));
  process.exitCode = 1;
} finally { await db.$disconnect(); }
