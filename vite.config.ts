import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],

  // Tailwind CSS v4.1 統合
  css: {
    postcss: {
      plugins: [require('@tailwindcss/postcss')()],
    },
  },

  // 開発サーバー最適化
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true,
    },
  },

  // ビルド最適化
  build: {
    target: 'ES2024',
  },

  // テスト設定
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },

  // React Compiler 最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'react-router'],
  },
});
