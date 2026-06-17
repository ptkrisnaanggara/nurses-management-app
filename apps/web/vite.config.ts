/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Bundle the shared package from source so Vite/Rollup resolves its
      // named (enum) exports directly, avoiding CJS `export *` interop issues.
      '@nurses/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
