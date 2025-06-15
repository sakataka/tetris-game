import type { Config } from '@react-router/dev/config';

export default {
  // SPA mode - Complete SSR disabling (due to React 19.1 + React Router 7 compatibility issues)
  ssr: false,

  // Disable prerendering in SPA mode as well
  // prerender: [],

  // Server configuration (not needed in SPA mode)
  // serverBuildFile: 'index.js',
  buildDirectory: './dist',

  // Application directory
  appDirectory: './src',
} satisfies Config;
