import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';

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

// Debug: Log initialization
console.log('🎮 Tetris Game initializing...', {
  env: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  vite: import.meta.env['VITE_APP_ENV'],
});

// Initialize Sentry in production environment
try {
  initSentry();
  console.log('✅ Sentry initialization complete');
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

console.log('🎯 Router created successfully');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, starting React app...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
  console.log('🚀 React app rendered successfully!');
} catch (error) {
  console.error('❌ React app render failed:', error);
  throw error;
}
