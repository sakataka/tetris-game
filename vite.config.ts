import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/postcss';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // gzip圧縮
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB以上のファイルのみ圧縮
      filter: /\.(js|css|html|svg|json)$/i,
      deleteOriginFile: false,
    }),
    // brotli圧縮
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10KB以上のファイルのみ圧縮
      filter: /\.(js|css|html|svg|json)$/i,
      deleteOriginFile: false,
    }),
    // Sentry監視（プロダクションのみ） - 一時的に無効化
    // ...(mode === 'production' && process.env['SENTRY_AUTH_TOKEN']
    //   ? [
    //       sentryVitePlugin({
    //         org: process.env['SENTRY_ORG'],
    //         project: process.env['SENTRY_PROJECT'],
    //         authToken: process.env['SENTRY_AUTH_TOKEN'],
    //         // ソースマップ設定
    //         sourcemaps: {
    //           assets: './build/client/**',
    //           ignore: ['node_modules/**'],
    //         },
    //         // Release設定
    //         release: {
    //           name: `tetris-game@${process.env['npm_package_version'] || '1.0.0'}`,
    //         },
    //       }),
    //     ]
    //   : []),
  ],

  // Tailwind CSS v4.1 統合
  css: {
    postcss: {
      plugins: [tailwindcss()],
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
    minify: 'terser',
    sourcemap: false, // ソースマップを無効化
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React関連のベンダーチャンク
          if (id.includes('react-router') || id.includes('@react-router')) {
            return 'react-router';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // UI関連のベンダーチャンク
          if (id.includes('@radix-ui') || id.includes('class-variance-authority')) {
            return 'ui-vendor';
          }
          // i18n関連
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          // ゲームコア（大きなコンポーネント）
          if (
            id.includes('TetrisBoard') ||
            id.includes('GameLogicController') ||
            id.includes('GameLayoutManager')
          ) {
            return 'game-core';
          }
          // パーティクルとアニメーション
          if (id.includes('ParticleCanvas') || id.includes('ParticleEffect')) {
            return 'particle-system';
          }
          // 設定とテーマ関連
          if (
            id.includes('ThemeTabContent') ||
            id.includes('SettingsTabContent') ||
            id.includes('ColorPaletteEditor')
          ) {
            return 'settings';
          }
          // デフォルトは何も返さない（undefinedでViteが自動で決定）
          return undefined;
        },
      },
    },
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
}));
