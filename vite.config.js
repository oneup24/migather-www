import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The base path the site is served from. '/' locally; a sub-path when it is
  // published under a project site (e.g. /migather-www/site/). The router
  // reads this too — see the basename in src/App.jsx.
  base: process.env.SITE_BASE || '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
