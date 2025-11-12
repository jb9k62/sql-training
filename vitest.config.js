import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/setup/test-setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run tests sequentially to avoid database conflicts
    threads: false,
    // Watch mode settings
    watchExclude: ['**/data/**', '**/node_modules/**']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@exercises': fileURLToPath(new URL('./exercises', import.meta.url))
    }
  }
});