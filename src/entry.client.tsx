import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Sentry監視初期化
import { initSentry } from './utils/sentry';

// グローバルスタイル
import './app/globals.css';

// プロダクション環境でSentry初期化
initSentry();

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);
