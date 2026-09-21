import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,svelte.ts}'],
    environment: 'node',
    globals: false,
  },
});
