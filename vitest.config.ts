import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    include: ['src/test/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'build', 'dist', '.react-router'],
    reporters: ['default'],
    outputFile: {
      junit: './test-results.xml',
    },
    coverage: {
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
