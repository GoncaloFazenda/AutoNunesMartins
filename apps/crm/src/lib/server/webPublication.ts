import { fail, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { publicSpecificationsSchema } from '@anm/types';
import { vehiclesApi } from './vehicles';
import { ApiError } from './api';
const schema = z.object({
  price: z
    .string()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
    .refine((v) => Number(v) > 0, 'Indique um preço positivo ou deixe o campo vazio.')
    .nullable(),
  description: z.string().trim().min(1, 'Escreva uma descrição pública.').max(6000),
  photoPaths: z.array(z.string()).max(20),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).nullable(),
  specifications: publicSpecificationsSchema.optional(),
});
export async function webPublicationAction(event: RequestEvent, id: string) {
  if (!/^c[a-z0-9]{24}$/.test(id)) return fail(400, { error: 'Viatura inválida.' });
  const form = await event.request.formData();
  const remove = form.get('operation') === 'remove';
  const parsed = schema.safeParse({
    price: form.get('publicPrice') || null,
    description: form.get('publicDescription'),
    photoPaths: form.getAll('publicPhotoPaths'),
    transmission: form.get('publicTransmission') || null,
    ...(form.has('specificationsPresent') ? { specifications: {
      ...Object.fromEntries(['powerHp', 'engineCc', 'doors', 'seats'].map(key => [key, form.get(key) ? Number(form.get(key)) : null])),
      category: form.get('category') || '',
      color: form.get('color') || '',
      equipment: String(form.get('equipment') || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean),
    } } : {}),
  });
  if (!remove && !parsed.success)
    return fail(400, { error: parsed.error.issues[0]?.message ?? 'Reveja os dados públicos.' });
  if (
    !remove &&
    parsed.success &&
    !parsed.data.photoPaths.length &&
    form.get('confirmWithoutPhoto') !== 'true'
  ) {
    return fail(400, { error: 'Confirme que pretende publicar sem fotografia.' });
  }
  try {
    await vehiclesApi.webPublication(
      event,
      id,
      remove ? { published: false } : { published: true, ...parsed.data! },
    );
    return { webPublicationUpdated: true };
  } catch (err) {
    if (err instanceof ApiError)
      return fail(err.status, {
        error:
          err.status === 403
            ? 'Só um administrador pode alterar a publicação.'
            : err.status === 409
              ? 'A viatura tem de estar disponível ou reservada, sem venda, e as fotografias têm de lhe pertencer. Guarde primeiro as alterações internas.'
              : err.status === 400
                ? 'Confirme preço, descrição e fotografias selecionadas.'
                : 'Não foi possível alterar a publicação. Tente novamente.',
      });
    throw err;
  }
}
