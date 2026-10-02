import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
vi.mock('$env/static/public', () => ({ PUBLIC_BACKEND_URL: 'http://backend.test' }));
vi.mock('./vehicles', () => ({ vehiclesApi: { webPublication: vi.fn() } }));
import { vehiclesApi } from './vehicles';
import { webPublicationAction } from './webPublication';
const id = 'clabcdefghijklmnopqrstuvw';
function event(values: Record<string, string | string[]>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values))
    for (const item of Array.isArray(value) ? value : [value]) form.append(key, item);
  return {
    request: new Request('http://localhost/viaturas/nova?/webPublication', {
      method: 'POST',
      body: form,
    }),
  } as RequestEvent;
}
afterEach(() => vi.clearAllMocks());
describe('Shared create/edit publication action', () => {
  it('requires explicit confirmation for publication without photos from either flow', async () => {
    const result = await webPublicationAction(
      event({ operation: 'publish', publicPrice: '10000', publicDescription: 'Factual' }),
      id,
    );
    expect(result).toHaveProperty('status', 400);
    expect(vehiclesApi.webPublication).not.toHaveBeenCalled();
  });
  it('allows confirmed publication with no photo and unknown price', async () => {
    await webPublicationAction(
      event({
        operation: 'publish',
        publicPrice: '',
        publicDescription: 'Factual',
        confirmWithoutPhoto: 'true',
      }),
      id,
    );
    expect(vehiclesApi.webPublication).toHaveBeenCalledWith(expect.anything(), id, {
      published: true,
      price: null,
      description: 'Factual',
      photoPaths: [],
      transmission: null,
    });
  });
  it('sends only explicitly approved public fields to the authenticated ADMIN API', async () => {
    await webPublicationAction(
      event({
        operation: 'publish',
        publicPrice: '10000.25',
        publicDescription: 'Factual',
        publicPhotoPaths: ['approved-photo'],
        privateNotes: 'PRIVATE',
        publicTransmission: '',
      }),
      id,
    );
    expect(vehiclesApi.webPublication).toHaveBeenCalledWith(expect.anything(), id, {
      published: true,
      price: '10000.25',
      description: 'Factual',
      photoPaths: ['approved-photo'],
      transmission: null,
    });
  });
  it('unpublishes without requiring content or changing internal status', async () => {
    await webPublicationAction(event({ operation: 'remove', status: 'SOLD' }), id);
    expect(vehiclesApi.webPublication).toHaveBeenCalledWith(expect.anything(), id, {
      published: false,
    });
  });
  it('rejects malformed identifiers', async () => {
    expect(await webPublicationAction(event({ operation: 'remove' }), '../secret')).toHaveProperty(
      'status',
      400,
    );
    expect(vehiclesApi.webPublication).not.toHaveBeenCalled();
  });
});

describe('confirmed public specifications', () => {
 it('parses optional form values and forwards only approved details',async()=>{
  await webPublicationAction(event({operation:'publish',publicPrice:'17141.78',publicDescription:'Confirmed description',confirmWithoutPhoto:'true',specificationsPresent:'true',powerHp:'110',engineCc:'999',seats:'7',doors:'5',category:'Familiar',color:'Cinza',equipment:'Ar condicionado\nBluetooth',privateNotes:'PRIVATE'}),id);
  expect(vehiclesApi.webPublication).toHaveBeenCalledWith(expect.anything(),id,expect.objectContaining({specifications:{powerHp:110,engineCc:999,seats:7,doors:5,category:'Familiar',color:'Cinza',equipment:['Ar condicionado','Bluetooth']}}));
 });
 it('rejects invalid numeric characteristics without saving',async()=>{
  const result=await webPublicationAction(event({operation:'publish',publicPrice:'17141.78',publicDescription:'Confirmed',confirmWithoutPhoto:'true',specificationsPresent:'true',powerHp:'-2'}),id);
  expect(result).toHaveProperty('status',400);expect(vehiclesApi.webPublication).not.toHaveBeenCalled();
 });
});
