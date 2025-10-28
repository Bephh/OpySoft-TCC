// FrontEnd/vite.config.js (VERSÃO PRONTA PARA PRODUÇÃO)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // A seção 'server' e 'proxy' é removida, pois só é usada no desenvolvimento local.
});