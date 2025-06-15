import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';

// Sentry監視初期化
import { initSentry } from './utils/sentry';

// グローバルスタイル
import './app/globals.css';

import RootRoute from './root';
// Routes
import AboutRoute from './routes/about';
import HomeRoute from './routes/home';
import SettingsRoute from './routes/settings';
import StatisticsRoute from './routes/statistics';
import ThemesRoute from './routes/themes';

// プロダクション環境でSentry初期化
initSentry();

// SPA Router setup
const router = createBrowserRouter([
  {
    path: '/',
    Component: RootRoute,
    children: [
      {
        index: true,
        Component: HomeRoute,
      },
      {
        path: 'about',
        Component: AboutRoute,
      },
      {
        path: 'settings',
        Component: SettingsRoute,
      },
      {
        path: 'statistics',
        Component: StatisticsRoute,
      },
      {
        path: 'themes',
        Component: ThemesRoute,
      },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
