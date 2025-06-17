import type React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import ErrorBoundary, { withErrorBoundary, useErrorBoundary } from './ErrorBoundary';

// Wrapper component that provides translations to ErrorBoundary
interface ErrorBoundaryWithTranslationProps {
  children: React.ReactNode;
  level?: 'page' | 'component' | 'section';
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Fallback component defined outside to avoid recreating on every render
interface FallbackComponentProps {
  error: Error;
  resetError: () => void;
  retryCount: number;
  maxRetries: number;
  errorId: string | null;
  level: 'page' | 'component' | 'section';
  t: TFunction;
}

const FallbackComponent = ({
  resetError,
  retryCount,
  maxRetries,
  errorId,
  level,
  t,
}: FallbackComponentProps) => {
  if (level === 'page') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-surface via-theme-secondary/50 to-theme-accent/50'>
        <div className='text-center text-white p-8 max-w-md mx-auto'>
          <div className='mb-6'>
            <div className='text-6xl mb-4'>💥</div>
            <h1 className='text-3xl font-bold mb-2 text-theme-error'>{t('errors.systemError')}</h1>
            <p className='text-theme-foreground mb-4'>{t('errors.unexpectedError')}</p>
          </div>

          <div className='space-y-4'>
            {retryCount < maxRetries ? (
              <button
                type='button'
                onClick={resetError}
                className='w-full bg-gradient-to-r from-theme-secondary to-theme-accent hover:from-theme-secondary/80 hover:to-theme-accent/80 
                          text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105'
              >
                {t('errors.retryWithCount', { count: maxRetries - retryCount })}
              </button>
            ) : (
              <button
                type='button'
                onClick={() => window.location.reload()}
                className='w-full bg-gradient-to-r from-theme-error to-theme-error hover:from-theme-error/80 hover:to-theme-error/80 
                          text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105'
              >
                {t('errors.reloadPage')}
              </button>
            )}

            <button
              type='button'
              onClick={() => {
                window.location.href = '/';
              }}
              className='w-full bg-theme-muted hover:bg-theme-muted/80 text-white font-bold py-2 px-4 rounded-lg transition-colors'
            >
              {t('errors.backToHome')}
            </button>
          </div>

          <div className='mt-6 text-xs text-theme-muted'>
            {t('errors.errorId')}: {errorId}
          </div>
        </div>
      </div>
    );
  }
  if (level === 'section') {
    return (
      <div className='hologram neon-border p-6 rounded-lg text-center'>
        <div className='text-theme-warning text-4xl mb-4'>⚠️</div>
        <h3 className='text-lg font-bold text-theme-warning mb-2'>{t('errors.sectionError')}</h3>
        <p className='text-theme-foreground text-sm mb-4'>{t('errors.sectionDisplayError')}</p>

        {retryCount < maxRetries && (
          <button
            type='button'
            onClick={resetError}
            className='bg-gradient-to-r from-theme-warning to-theme-accent hover:from-theme-warning/80 hover:to-theme-accent/80 
                      text-white font-bold py-2 px-4 rounded transition-all duration-300'
          >
            {t('errors.retry')}
          </button>
        )}
      </div>
    );
  }
  // Default 'component' level
  return (
    <div className='p-4 hologram neon-border rounded-lg'>
      <div className='flex items-center space-x-2 text-theme-error'>
        <span className='text-2xl'>⚠️</span>
        <span className='font-bold'>{t('errors.componentError')}</span>
      </div>
      <p className='text-theme-foreground text-sm mt-2'>{t('errors.tryReloading')}</p>
      {retryCount < maxRetries && (
        <button
          type='button'
          onClick={resetError}
          className='mt-3 text-xs text-theme-primary hover:text-theme-secondary transition-colors underline'
        >
          {t('errors.retry')}
        </button>
      )}
    </div>
  );
};

FallbackComponent.displayName = 'ErrorFallback';

export default function ErrorBoundaryWithTranslation({
  children,
  level,
  fallback,
  onError,
}: ErrorBoundaryWithTranslationProps) {
  const { t } = useTranslation();

  // React Compiler will optimize this fallback component creation
  const createTranslatedFallback = () => {
    if (fallback) return fallback;

    // Return a function that will be called by ErrorBoundary to render the fallback
    return (props: {
      error: Error;
      resetError: () => void;
      retryCount: number;
      maxRetries: number;
      errorId: string | null;
    }) => <FallbackComponent {...props} level={level || 'component'} t={t} />;
  };

  const translatedFallback = createTranslatedFallback();

  return (
    <ErrorBoundary
      {...(level ? { level } : {})}
      fallback={translatedFallback}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
}

// Re-export utilities
export { withErrorBoundary, useErrorBoundary };
