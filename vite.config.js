import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    // Three is an interaction-gated lazy chunk (about 152 KB gzip), not initial JS.
    chunkSizeWarningLimit: 650,
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'motion';
          if (id.includes('node_modules/lenis')) return 'scroll';
        },
      },
    },
  },
});
