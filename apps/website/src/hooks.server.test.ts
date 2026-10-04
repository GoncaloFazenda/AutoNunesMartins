import { beforeEach, expect, it, vi } from 'vitest';
const { env } = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock('$env/dynamic/private', () => ({ env }));
import { handle } from './hooks.server';
const run = () => handle({ event: {}, resolve: async () => new Response('public HTML') } as unknown as Parameters<typeof handle>[0]);
beforeEach(() => { for (const key of Object.keys(env)) delete env[key]; });
it('keeps public production pages eligible for indexing', async () => {
  env.VERCEL_ENV = 'production';
  expect((await run()).headers.get('X-Robots-Tag')).toBeNull();
});
it('protects Vercel previews regardless of page metadata', async () => {
  env.VERCEL_ENV = 'preview';
  expect((await run()).headers.get('X-Robots-Tag')).toBe('noindex, follow');
});
it('supports a simple protection flag for other staging hosts', async () => {
  env.SITE_NOINDEX = 'true';
  expect((await run()).headers.get('X-Robots-Tag')).toBe('noindex, follow');
});
