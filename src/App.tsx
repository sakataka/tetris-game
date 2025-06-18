import { Outlet } from 'react-router';

// Global providers
import ErrorBoundaryWithTranslation from './components/ErrorBoundaryWithTranslation';
import ErrorStoreInitializer from './components/ErrorStoreInitializer';
import ErrorToastAdapter from './components/ErrorToastAdapter';
import I18nProvider from './components/I18nProvider';
import ThemeProvider from './components/providers/ThemeProvider';
import { Toaster } from './components/ui/sonner';

// Font configuration
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';

// Global styles
import './app/globals.css';

export default function App() {
  return (
    <div className='antialiased' style={{fontFamily: 'var(--theme-font-primary)'}}>
      <ThemeProvider>
        <I18nProvider>
          <ErrorBoundaryWithTranslation level='page'>
            <ErrorStoreInitializer />
            <Outlet />
            <ErrorToastAdapter />
            <Toaster />
          </ErrorBoundaryWithTranslation>
        </I18nProvider>
      </ThemeProvider>
    </div>
  );
}
