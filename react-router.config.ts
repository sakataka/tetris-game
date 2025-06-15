import type { Config } from '@react-router/dev/config';

export default {
  // SPA モード - SSR完全無効化 (React 19.1 + React Router 7 互換性問題により)
  ssr: false,

  // SPA モードではプリレンダリングも無効化
  // prerender: [],

  // サーバー設定（SPAモードでは不要）
  // serverBuildFile: 'index.js',
  buildDirectory: './build',

  // アプリケーションディレクトリ
  appDirectory: './src',
} satisfies Config;
