/**
 * Sentry Error Tracking & Performance Monitoring
 * Error tracking and performance monitoring in production environment
 */

import * as Sentry from '@sentry/react';
import type React from 'react';

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  tracesSampleRate: number;
  profilesSampleRate: number;
  integrations?: Parameters<typeof Sentry.init>[0]['integrations'];
  beforeSend?: (event: Sentry.ErrorEvent, hint: Sentry.EventHint) => Sentry.ErrorEvent | null;
}

/**
 * Sentry initialization configuration
 */
export function initSentry(config?: Partial<SentryConfig>): void {
  // Enable Sentry only in production environment
  const isProduction = import.meta.env.PROD;
  const dsn = import.meta.env['VITE_SENTRY_DSN'];

  if (!dsn || !isProduction) {
    console.log('🔍 Sentry disabled in development mode');
    return;
  }

  const defaultConfig = {
    dsn,
    environment: import.meta.env.PROD ? 'production' : 'development',
    tracesSampleRate: Number.parseFloat(import.meta.env['VITE_SENTRY_TRACES_SAMPLE_RATE'] || '0.1'),
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend: (event: Sentry.ErrorEvent, _hint: Sentry.EventHint) => {
      // Do not send events in development or local environments
      if (
        event.server_name?.includes('localhost') ||
        event.server_name?.includes('127.0.0.1') ||
        event.server_name?.includes('dev')
      ) {
        return null;
      }

      // Filtering game-specific errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'AudioContextError' && error.value?.includes('user gesture')) {
          // Ignore audio errors that require user gesture
          return null;
        }
      }

      return event;
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Create Sentry config with proper typing
  const sentryConfig = {
    dsn: finalConfig.dsn,
    environment: finalConfig.environment,
    tracesSampleRate: finalConfig.tracesSampleRate,
    beforeSend: finalConfig.beforeSend,
    ...(finalConfig.profilesSampleRate !== undefined && {
      profilesSampleRate: finalConfig.profilesSampleRate,
    }),
    ...(finalConfig.integrations && { integrations: finalConfig.integrations }),
  };

  Sentry.init(sentryConfig);

  console.log('🔍 Sentry initialized for production monitoring');
}

/**
 * Game-specific error tracking
 */
export const GameSentry = {
  /**
   * Record game errors
   */
  captureGameError: (error: Error, context?: Record<string, unknown>) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'game');
      if (context) {
        scope.setContext('game_context', context);
      }
      Sentry.captureException(error);
    });
  },

  /**
   * Record audio errors
   */
  captureAudioError: (error: Error, strategy?: string) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'audio');
      scope.setTag('audio_strategy', strategy || 'unknown');
      Sentry.captureException(error);
    });
  },

  /**
   * Record performance issues
   */
  capturePerformanceIssue: (message: string, context?: Record<string, unknown>) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'performance');
      if (context) {
        scope.setContext('performance_context', context);
      }
      Sentry.captureMessage(message, 'warning');
    });
  },

  /**
   * User feedback
   */
  captureUserFeedback: (name: string, email: string, comments: string) => {
    try {
      // Use Sentry's feedback functionality
      Sentry.captureFeedback({
        name,
        email,
        message: comments,
      });
    } catch {
      // Fallback: send as normal message
      Sentry.captureMessage(`User Feedback: ${comments}`, 'info');
    }
  },

  /**
   * Custom performance measurement
   */
  measurePerformance: <T>(name: string, operation: () => T): T => {
    return Sentry.startSpan(
      {
        name,
        op: 'function',
      },
      (span) => {
        try {
          const result = operation();
          span?.setStatus({ code: 1, message: 'ok' }); // OK
          return result;
        } catch (error) {
          span?.setStatus({
            code: 2,
            message: error instanceof Error ? error.message : String(error),
          }); // ERROR
          throw error;
        }
      }
    );
  },

  /**
   * Set user information
   */
  setUser: (user: { id: string; username?: string; email?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * Set game session information
   */
  setGameSession: (sessionId: string, gameMode?: string) => {
    Sentry.setTag('session_id', sessionId);
    if (gameMode) {
      Sentry.setTag('game_mode', gameMode);
    }
  },
};

// React Error Boundary with Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// HOC for component performance monitoring
export function withSentryProfiling<P extends object>(
  Component: React.ComponentType<P>,
  name?: string
): React.ComponentType<P> {
  const componentName = name || Component.displayName || Component.name || 'Component';

  return Sentry.withProfiler(Component, {
    name: componentName,
    includeRender: true,
    includeUpdates: true,
  });
}
