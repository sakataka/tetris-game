/**
 * Sentry Error Tracking & Performance Monitoring
 * プロダクション環境でのエラー追跡とパフォーマンス監視
 */

import * as Sentry from '@sentry/react';
import type React from 'react';

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  tracesSampleRate: number;
  profilesSampleRate: number;
  integrations?: any[];
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
}

/**
 * Sentry初期化設定
 */
export function initSentry(config?: Partial<SentryConfig>): void {
  // プロダクション環境でのみSentryを有効化
  const isProduction = process.env['NODE_ENV'] === 'production';
  const dsn = process.env['VITE_SENTRY_DSN'] || process.env['SENTRY_DSN'];

  if (!dsn || !isProduction) {
    console.log('🔍 Sentry disabled in development mode');
    return;
  }

  const defaultConfig = {
    dsn,
    environment: (process.env['NODE_ENV'] as any) || 'production',
    tracesSampleRate: Number.parseFloat(process.env['VITE_SENTRY_TRACES_SAMPLE_RATE'] || '0.1'),
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend: (event: any) => {
      // 開発環境やローカル環境ではイベントを送信しない
      if (
        event.server_name?.includes('localhost') ||
        event.server_name?.includes('127.0.0.1') ||
        event.server_name?.includes('dev')
      ) {
        return null;
      }

      // ゲーム特有のエラーのフィルタリング
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'AudioContextError' && error.value?.includes('user gesture')) {
          // ユーザージェスチャーが必要なオーディオエラーは無視
          return null;
        }
      }

      return event;
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  Sentry.init(finalConfig);

  console.log('🔍 Sentry initialized for production monitoring');
}

/**
 * ゲーム特有のエラー追跡
 */
export const GameSentry = {
  /**
   * ゲームエラーの記録
   */
  captureGameError: (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'game');
      if (context) {
        scope.setContext('game_context', context);
      }
      Sentry.captureException(error);
    });
  },

  /**
   * オーディオエラーの記録
   */
  captureAudioError: (error: Error, strategy?: string) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'audio');
      scope.setTag('audio_strategy', strategy || 'unknown');
      Sentry.captureException(error);
    });
  },

  /**
   * パフォーマンス問題の記録
   */
  capturePerformanceIssue: (message: string, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'performance');
      if (context) {
        scope.setContext('performance_context', context);
      }
      Sentry.captureMessage(message, 'warning');
    });
  },

  /**
   * ユーザーフィードバック
   */
  captureUserFeedback: (name: string, email: string, comments: string) => {
    try {
      // Sentryのフィードバック機能を利用
      Sentry.captureFeedback({
        name,
        email,
        message: comments,
      });
    } catch (_error) {
      // フォールバック：通常のメッセージとして送信
      Sentry.captureMessage(`User Feedback: ${comments}`, 'info');
    }
  },

  /**
   * カスタムパフォーマンス測定
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
          span?.setStatus({ code: 1 }); // OK
          return result;
        } catch (error) {
          span?.setStatus({ code: 2, message: String(error) }); // ERROR
          throw error;
        }
      }
    );
  },

  /**
   * ユーザー情報の設定
   */
  setUser: (user: { id: string; username?: string; email?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * ゲームセッション情報の設定
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
