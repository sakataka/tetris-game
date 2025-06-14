import type { Config } from '@react-router/dev/config';

export default {
  // SSR有効化
  ssr: true,

  // 将来のプリレンダリング対応
  prerender: [
    '/', // ホームページ
    '/about', // Aboutページ
  ],

  // サーバー設定
  serverBuildFile: 'index.js',
  buildDirectory: './build',

  // アプリケーションディレクトリ
  appDirectory: './src',
} satisfies Config;
