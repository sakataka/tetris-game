import type { Config } from '@react-router/dev/config';

export default {
  // SSR有効化
  ssr: true,

  // プリレンダリング設定（静的ページのパフォーマンス向上）
  prerender: [
    '/', // ホームページ
    '/about', // Aboutページ
    '/settings', // 設定ページ
    '/statistics', // 統計ページ
    '/themes', // テーマページ
  ],

  // サーバー設定
  serverBuildFile: 'index.js',
  buildDirectory: './build',

  // アプリケーションディレクトリ
  appDirectory: './src',
} satisfies Config;
