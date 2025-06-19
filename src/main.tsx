import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

// Sentry monitoring initialization
import { initSentry } from './utils/sentry';

// Global styles
import './app/globals.css';

import App from './App';
// Routes
import AboutRoute from './routes/about';
import HomeRoute from './routes/home';
import SettingsRoute from './routes/settings';
import StatisticsRoute from './routes/statistics';
import ThemesRoute from './routes/themes';

// Initialize Sentry in production environment
try {
  initSentry();
} catch (error) {
  console.error('❌ Sentry initialization failed:', error);
}

// SPA Router setup
const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
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
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
} catch (error) {
  console.error('❌ React app render failed:', error);
  throw error;
}
