import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Pin runtime so local Node 24 doesn't trip the Vercel adapter's check.
    // Vercel itself supports nodejs22.x for serverless functions.
    adapter: adapter({ runtime: 'nodejs22.x' }),
    alias: {
      $components: 'src/lib/components',
      $lib: 'src/lib',
    },
  },
};

export default config;
