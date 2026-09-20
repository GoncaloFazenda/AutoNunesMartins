import type { PrismaClient } from '@prisma/client';
import { emitActivity } from '../data/activity.js';
import {
  isApprovedPhotoPath,
  makePublicSlug,
  SLUG_SUFFIX_LENGTHS,
  type WebPublication,
} from '../domain/publicVehicle.js';

export class WebPublicationError extends Error {
  constructor(
    public readonly status: 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

/** The only web publication write path. CRM availability alone never opts in. */
export async function setWebPublication(
  db: PrismaClient,
  id: string,
  input: WebPublication,
  actorId: string | null,
) {
  let suffixIndex = 0;
  // A concurrent first publication must re-read a winning persisted slug,
  // never overwrite it using an earlier snapshot of the vehicle's title.
  for (let attempt = 0; attempt < 8; attempt++) {
    const suffixLength = SLUG_SUFFIX_LENGTHS[suffixIndex];
    if (suffixLength === undefined) break;
    try {
      return await db.$transaction(
        async (tx) => {
          const vehicle = await tx.vehicle.findUnique({
            where: { id },
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              status: true,
              soldDate: true,
              photos: true,
              publicSlug: true,
              sale: { select: { id: true } },
            },
          });
          if (!vehicle) throw new WebPublicationError(404, 'Vehicle not found');
          if (input.published) {
            if (!input.description?.trim()) {
              throw new WebPublicationError(409, 'Uma descrição pública é obrigatória.');
            }
            if (
              !['AVAILABLE', 'RESERVED'].includes(vehicle.status) ||
              vehicle.soldDate ||
              vehicle.sale
            ) {
              throw new WebPublicationError(
                409,
                'Only unsold available or reserved vehicles can be published',
              );
            }
            if (
              input.photoPaths.some(
                (path) => !vehicle.photos.includes(path) || !isApprovedPhotoPath(id, path),
              )
            ) {
              throw new WebPublicationError(
                409,
                'Photos must be approved images belonging to this vehicle',
              );
            }
          }
          const slug =
            vehicle.publicSlug ?? (input.published ? makePublicSlug(vehicle, suffixLength) : null);
          const updated = await tx.vehicle.update({
            where: { id },
            data: input.published
              ? {
                  webPublished: true,
                  publicSlug: slug,
                  publicPrice: input.price,
                  publicDescription: input.description,
                  publicPhotoPaths: input.photoPaths,
                  publicTransmission: input.transmission,
                }
              : { webPublished: false },
            select: { webPublished: true, publicSlug: true },
          });
          await emitActivity(tx, {
            actorId,
            type: 'VEHICLE_UPDATED',
            entityType: 'vehicle',
            entityId: id,
            message: input.published ? 'Publicação web aprovada' : 'Publicação web desativada',
            metadata: { webPublished: input.published },
          });
          return { published: updated.webPublished, slug: updated.publicSlug };
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      const dbError = error as { code?: string; meta?: { target?: unknown } };
      if (dbError.code === 'P2034') continue;
      // Unique index enforces the final guarantee. Retry using a longer ID hash.
      if (
        dbError.code !== 'P2002' ||
        !JSON.stringify(dbError.meta?.target ?? '').includes('publicSlug')
      )
        throw error;
      suffixIndex++;
    }
  }
  throw new WebPublicationError(409, 'Publication conflict; retry the request');
}
