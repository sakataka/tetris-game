import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
// Global providers
import ErrorBoundaryWithTranslation from './components/ErrorBoundaryWithTranslation';
import ErrorStoreInitializer from './components/ErrorStoreInitializer';
import ErrorToastAdapter from './components/ErrorToastAdapter';
import I18nProvider from './components/I18nProvider';
import { Toaster } from './components/ui/sonner';
import type { MetaFunction } from './types/route';

// Font configuration (React Router compatible)
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';

// Global styles
import './app/globals.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'Cyberpunk Tetris Game' },
    {
      name: 'description',
      content: 'Production-ready cyberpunk-themed Tetris game with advanced features',
    },
    {
      name: 'keywords',
      content: 'tetris, game, cyberpunk, puzzle, react, javascript',
    },
  ];
};

export default function Root() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        {/* Performance optimization hints */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='dns-prefetch' href='https://fonts.googleapis.com' />

        {/* Preload critical fonts */}
        <link
          rel='preload'
          href='/assets/geist-sans-latin-400-normal-gapTbOY8.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          href='/assets/geist-mono-latin-400-normal-LC9RFr9I.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />

        {/* PWA manifest (for future implementation) */}
        <link rel='manifest' href='/manifest.json' />

        {/* Theme color for mobile browsers */}
        <meta name='theme-color' content='#0a0a0a' />

        {/* Security headers */}
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />

        <Meta />
        <Links />
      </head>
      <body className='antialiased' style={{ fontFamily: 'var(--theme-font-primary)' }}>
        <I18nProvider>
          <ErrorBoundaryWithTranslation level='page'>
            <ErrorStoreInitializer />
            <Outlet />
            <ErrorToastAdapter />
            <Toaster />
          </ErrorBoundaryWithTranslation>
        </I18nProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <html lang='en'>
      <head>
        <title>Application Error</title>
        <Meta />
        <Links />
      </head>
      <body className='antialiased' style={{ fontFamily: 'var(--theme-font-primary)' }}>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-theme-error mb-4'>Application Error</h1>
            <p className='text-theme-foreground'>Something went wrong. Please refresh the page.</p>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
