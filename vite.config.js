import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Duas páginas no mesmo site: a agenda da Luiza (raiz) e a escala do restaurante.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        escala: resolve(import.meta.dirname, 'escala-armazem-111/index.html'),
      },
    },
  },
});
