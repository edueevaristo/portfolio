import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 650,
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'motion';
          if (id.includes('node_modules/lenis')) return 'scroll';
        },
      },
    },
  },
});
