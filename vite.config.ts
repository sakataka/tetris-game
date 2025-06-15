import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  // Entry point configuration
  root: '.',
  publicDir: 'public',

  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tsconfigPaths(),
    // gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Compress files larger than 10KB only
      filter: /\.(js|css|html|svg|json)$/i,
      deleteOriginFile: false,
    }),
    // brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Compress files larger than 10KB only
      filter: /\.(js|css|html|svg|json)$/i,
      deleteOriginFile: false,
    }),
    // Sentry monitoring (production only) - temporarily disabled
    // ...(mode === 'production' && process.env['SENTRY_AUTH_TOKEN']
    //   ? [
    //       sentryVitePlugin({
    //         org: process.env['SENTRY_ORG'],
    //         project: process.env['SENTRY_PROJECT'],
    //         authToken: process.env['SENTRY_AUTH_TOKEN'],
    //         // Source map configuration
    //         sourcemaps: {
    //           assets: './build/client/**',
    //           ignore: ['node_modules/**'],
    //         },
    //         // Release configuration
    //         release: {
    //           name: `tetris-game@${process.env['npm_package_version'] || '1.0.0'}`,
    //         },
    //       }),
    //     ]
    //   : []),
  ],

  // Tailwind CSS v4.1 integration
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },

  // Development server optimization
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true,
    },
  },

  // Build optimization
  build: {
    target: 'ES2024',
    minify: 'terser',
    sourcemap: false, // Disable source maps
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
          // React-related vendor chunk (React Router and React in same chunk)
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('react-router') ||
            id.includes('@react-router')
          ) {
            return 'react-vendor';
          }
          // UI-related vendor chunk
          if (id.includes('@radix-ui') || id.includes('class-variance-authority')) {
            return 'ui-vendor';
          }
          // i18n related
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          // Game core (large components)
          if (
            id.includes('TetrisBoard') ||
            id.includes('GameLogicController') ||
            id.includes('GameLayoutManager')
          ) {
            return 'game-core';
          }
          // Particles and animations
          if (id.includes('ParticleCanvas') || id.includes('ParticleEffect')) {
            return 'particle-system';
          }
          // Settings and theme related
          if (
            id.includes('ThemeTabContent') ||
            id.includes('SettingsTabContent') ||
            id.includes('ColorPaletteEditor')
          ) {
            return 'settings';
          }
          // Return nothing by default (undefined lets Vite decide automatically)
          return undefined;
        },
      },
    },
  },

  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },

  // React Compiler optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'react-router'],
  },
}));
