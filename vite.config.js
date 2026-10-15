import { defineConfig } from 'vite';

// `base: './'` keeps every asset path relative, so the same build works on
// GitHub Pages (/Dallas/), on Vercel (/) and on any custom domain.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
  },
});
