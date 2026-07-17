import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` precisa ser o nome do repositório quando publicado no GitHub Pages
// (ex.: https://usuario.github.io/hanami/ -> base: '/hanami/').
// Definido via variável de ambiente para funcionar em qualquer repositório,
// sem precisar editar este arquivo. Veja .github/workflows/ci-cd.yml.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: { port: 5173 },
  build: { outDir: 'dist' }
});
