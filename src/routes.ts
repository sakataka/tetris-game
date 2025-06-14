import type { RouteConfig } from '@react-router/dev/routes';

export default [
  {
    path: '/',
    file: './routes/home.tsx',
  },
  {
    path: '/settings',
    file: './routes/settings.tsx',
  },
  {
    path: '/statistics',
    file: './routes/statistics.tsx',
  },
  {
    path: '/themes',
    file: './routes/themes.tsx',
  },
  {
    path: '/about',
    file: './routes/about.tsx',
  },
] satisfies RouteConfig;
