import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    // PORT é definido por ferramentas que precisam de atribuir uma porta
    // livre (ex.: preview do Claude Code); sem ela mantém-se a 5173.
    port: Number(process.env.PORT) || 5173,
  },
});
