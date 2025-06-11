'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { UIError } from '../types/errors';
import { errorHandler } from '../utils/data';
import { DEFAULT_VALUES, GAME_TIMING } from '../constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'section';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private readonly maxRetries = DEFAULT_VALUES.ERROR_LIMITS.MAX_RETRIES;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Create custom error object
    const appError = new UIError(
      error.message,
      {
        component: this.props.level || 'unknown',
        action: 'component_render',
        additionalData: {
          componentStack: errorInfo.componentStack,
          errorBoundaryLevel: this.props.level,
        },
      },
      {
        recoverable: this.state.retryCount < this.maxRetries,
        retryable: true,
        userMessage: 'コンポーネントの表示でエラーが発生しました',
        cause: error,
      }
    );

    // Process with error handler
    errorHandler.handleError(appError);

    // Update state
    this.setState({
      errorId: appError.id,
    });

    // Execute external error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Reload entire page for critical level errors
    if (this.props.level === 'page' && this.state.retryCount >= this.maxRetries) {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, GAME_TIMING.ERROR_RELOAD_DELAY);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    });
  };

  private renderErrorFallback() {
    const { fallback, level } = this.props;

    // When custom fallback is provided
    if (fallback) {
      return fallback;
    }

    // Display based on error level
    if (level === 'page') {
      return this.renderPageError();
    } else if (level === 'section') {
      return this.renderSectionError();
    } else {
      return this.renderComponentError();
    }
  }

  private renderPageError() {
    const { retryCount } = this.state;

    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'>
        <div className='text-center text-white p-8 max-w-md mx-auto'>
          <div className='mb-6'>
            <div className='text-6xl mb-4'>💥</div>
            <h1 className='text-3xl font-bold mb-2 text-red-400'>システムエラー</h1>
            <p className='text-gray-300 mb-4'>
              申し訳ございません。予期しないエラーが発生しました。
            </p>
          </div>

          <div className='space-y-4'>
            {retryCount < this.maxRetries ? (
              <button
                onClick={this.handleRetry}
                className='w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 
                          text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105'
              >
                再試行 ({this.maxRetries - retryCount}回まで)
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className='w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 
                          text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105'
              >
                ページを再読み込み
              </button>
            )}

            <button
              onClick={() => (window.location.href = '/')}
              className='w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors'
            >
              ホームに戻る
            </button>
          </div>

          <div className='mt-6 text-xs text-gray-400'>エラーID: {this.state.errorId}</div>
        </div>
      </div>
    );
  }

  private renderSectionError() {
    const { retryCount } = this.state;

    return (
      <div className='hologram neon-border p-6 rounded-lg text-center'>
        <div className='text-yellow-400 text-4xl mb-4'>⚠️</div>
        <h3 className='text-lg font-bold text-yellow-400 mb-2'>セクションエラー</h3>
        <p className='text-gray-300 text-sm mb-4'>この部分の表示中にエラーが発生しました</p>

        {retryCount < this.maxRetries && (
          <button
            onClick={this.handleRetry}
            className='bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 
                      text-white font-bold py-2 px-4 rounded transition-all duration-300'
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  private renderComponentError() {
    return (
      <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center'>
        <div className='text-red-400 text-2xl mb-2'>🔧</div>
        <p className='text-red-300 text-sm mb-2'>コンポーネントエラー</p>
        {this.state.retryCount < this.maxRetries && (
          <button
            onClick={this.handleRetry}
            className='bg-red-500 hover:bg-red-400 text-white text-xs py-1 px-3 rounded transition-colors'
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Error boundary for hooks
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error when set to be caught by Error Boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

export default ErrorBoundary;
