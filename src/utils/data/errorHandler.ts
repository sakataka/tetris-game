/**
 * エラーハンドリングユーティリティ
 * 統一されたエラー処理とロギング機能を提供
 */

import { 
  BaseAppError, 
  ErrorInfo, 
  ErrorHandler, 
  ErrorHandlingResult, 
  ErrorLevel, 
  ErrorCategory,
  DEFAULT_ERROR_CONFIG,
  ErrorReportConfig,
  GameError,
  NetworkError,
  SystemError,
  ValidationError
} from '../types/errors';

// エラーハンドラーのシングルトンクラス
class ErrorHandlerService {
  private config: ErrorReportConfig = DEFAULT_ERROR_CONFIG;
  private errorHistory: ErrorInfo[] = [];
  private errorHandlers: Map<ErrorCategory, ErrorHandler> = new Map();
  private onErrorCallbacks: Set<(error: ErrorInfo) => void> = new Set();

  constructor() {
    this.initializeDefaultHandlers();
    this.setupGlobalErrorHandling();
  }

  // 設定の更新
  public updateConfig(newConfig: Partial<ErrorReportConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // エラーハンドラーの登録
  public registerHandler(category: ErrorCategory, handler: ErrorHandler): void {
    this.errorHandlers.set(category, handler);
  }

  // エラー発生時のコールバック登録
  public onError(callback: (error: ErrorInfo) => void): () => void {
    this.onErrorCallbacks.add(callback);
    
    // アンサブスクライブ関数を返す
    return () => {
      this.onErrorCallbacks.delete(callback);
    };
  }

  // メインエラーハンドリング関数
  public handleError(error: Error | BaseAppError): ErrorHandlingResult {
    const appError = this.normalizeError(error);
    const errorInfo = appError.toErrorInfo();

    // エラー履歴に追加
    this.addToHistory(errorInfo);

    // コンソールログ出力
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorInfo);
    }

    // 登録されたコールバックを実行
    this.notifyCallbacks(errorInfo);

    // カテゴリ別ハンドラーを実行
    const handler = this.errorHandlers.get(errorInfo.category);
    let result: ErrorHandlingResult = {
      handled: false,
      userNotification: this.config.enableUserNotifications ? {
        message: appError.userMessage || errorInfo.message,
        level: errorInfo.level,
        duration: this.getNotificationDuration(errorInfo.level)
      } : undefined
    };

    if (handler) {
      try {
        result = handler(appError);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    // クリティカルエラーの自動レポート
    if (this.config.autoReportCritical && errorInfo.level === 'critical') {
      this.reportCriticalError(errorInfo);
    }

    return result;
  }

  // 非同期エラーハンドリング
  public async handleAsyncError(
    asyncFn: () => Promise<unknown>,
    context: Partial<{ component: string; action: string }> = {}
  ): Promise<unknown> {
    try {
      return await asyncFn();
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      const appError = this.normalizeError(errorInstance, context);
      this.handleError(appError);
      
      if (!appError.recoverable) {
        throw appError;
      }
      
      return null;
    }
  }

  // 関数実行時のエラーハンドリング
  public withErrorHandling<T extends unknown[], R>(
    fn: (...args: T) => R,
    context: Partial<{ component: string; action: string }> = {}
  ): (...args: T) => R | null {
    return (...args: T): R | null => {
      try {
        return fn(...args);
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        const appError = this.normalizeError(errorInstance, context);
        const result = this.handleError(appError);
        
        if (result.fallback) {
          try {
            return result.fallback() as R;
          } catch (fallbackError) {
            console.error('Error in fallback function:', fallbackError);
          }
        }
        
        if (!appError.recoverable) {
          throw appError;
        }
        
        return null;
      }
    };
  }

  // エラー統計の取得
  public getErrorStats() {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsByLevel: {} as Record<ErrorLevel, number>,
      recentErrors: this.errorHistory.slice(-10),
      lastErrorTime: this.errorHistory.length > 0 ? 
        this.errorHistory[this.errorHistory.length - 1].context.timestamp : undefined
    };

    // カテゴリ別とレベル別の集計
    this.errorHistory.forEach(error => {
      stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsByLevel[error.level] = (stats.errorsByLevel[error.level] || 0) + 1;
    });

    return stats;
  }

  // エラー履歴のクリア
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  // 特定エラーの解決マーク
  public resolveError(errorId: string): boolean {
    const index = this.errorHistory.findIndex(error => error.id === errorId);
    if (index !== -1) {
      this.errorHistory.splice(index, 1);
      return true;
    }
    return false;
  }

  // プライベートメソッド群

  private normalizeError(
    error: Error | BaseAppError, 
    context: Partial<{ component: string; action: string }> = {}
  ): BaseAppError {
    if (error instanceof BaseAppError) {
      return error;
    }

    // 一般的なErrorをBaseAppErrorに変換
    if (error.name === 'TypeError') {
      return new ValidationError(error.message, context, { cause: error });
    }
    
    if (error.name === 'ReferenceError') {
      return new SystemError(error.message, context, { cause: error });
    }
    
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return new NetworkError(error.message, context, { cause: error });
    }

    // デフォルトはGameErrorとして処理
    return new GameError(error.message, context, { cause: error });
  }

  private addToHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);
    
    // 履歴サイズの制限
    if (this.errorHistory.length > this.config.maxStoredErrors) {
      this.errorHistory.shift();
    }
  }

  private logToConsole(errorInfo: ErrorInfo): void {
    const logLevel = this.getConsoleLogLevel(errorInfo.level);
    const logMessage = `[${errorInfo.level.toUpperCase()}] ${errorInfo.category}/${errorInfo.id}: ${errorInfo.message}`;
    
    console[logLevel](logMessage, {
      context: errorInfo.context,
      stack: this.config.enableStackTrace ? errorInfo.stack : undefined
    });
  }

  private getConsoleLogLevel(level: ErrorLevel): 'log' | 'warn' | 'error' {
    switch (level) {
      case 'info': return 'log';
      case 'warning': return 'warn';
      case 'error':
      case 'critical': return 'error';
      default: return 'log';
    }
  }

  private getNotificationDuration(level: ErrorLevel): number {
    switch (level) {
      case 'info': return 3000;
      case 'warning': return 5000;
      case 'error': return 7000;
      case 'critical': return 10000;
      default: return 5000;
    }
  }

  private notifyCallbacks(errorInfo: ErrorInfo): void {
    this.onErrorCallbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  private reportCriticalError(errorInfo: ErrorInfo): void {
    // 将来的に外部サービスへのレポート機能を実装
    console.error('CRITICAL ERROR REPORT:', {
      id: errorInfo.id,
      message: errorInfo.message,
      context: errorInfo.context,
      stack: errorInfo.stack,
      timestamp: new Date(errorInfo.context.timestamp).toISOString()
    });
  }

  private initializeDefaultHandlers(): void {
    // ゲームエラーハンドラー
    this.registerHandler('game', (error: BaseAppError): ErrorHandlingResult => ({
      handled: true,
      retry: error.retryable,
      fallback: () => {
        // ゲーム状態のリセットなど
        console.log('Game error fallback executed');
      }
    }));

    // 音声エラーハンドラー
    this.registerHandler('audio', (): ErrorHandlingResult => ({
      handled: true,
      retry: true, // 音声は通常リトライ可能
      userNotification: {
        message: '音声の再生に失敗しました。しばらく後にお試しください。',
        level: 'warning',
        duration: 3000
      }
    }));

    // ストレージエラーハンドラー
    this.registerHandler('storage', (): ErrorHandlingResult => ({
      handled: true,
      retry: false,
      userNotification: {
        message: 'データの保存に失敗しました。ブラウザの設定をご確認ください。',
        level: 'warning',
        duration: 5000
      }
    }));

    // ネットワークエラーハンドラー
    this.registerHandler('network', (): ErrorHandlingResult => ({
      handled: true,
      retry: true,
      userNotification: {
        message: 'ネットワークエラーが発生しました。接続を確認してください。',
        level: 'error',
        duration: 5000
      }
    }));
  }

  private setupGlobalErrorHandling(): void {
    // グローバルなunhandled promise rejectionをキャッチ
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const error = new SystemError(
          `Unhandled Promise Rejection: ${event.reason}`,
          { action: 'unhandledrejection' }
        );
        this.handleError(error);
      });

      // グローバルエラーをキャッチ
      window.addEventListener('error', (event) => {
        const error = new SystemError(
          event.message,
          { 
            action: 'global_error',
            additionalData: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          }
        );
        this.handleError(error);
      });
    }
  }
}

// シングルトンインスタンス
export const errorHandler = new ErrorHandlerService();

// 便利な関数エクスポート
export const handleError = errorHandler.handleError.bind(errorHandler);
export const handleAsyncError = errorHandler.handleAsyncError.bind(errorHandler);
export const withErrorHandling = errorHandler.withErrorHandling.bind(errorHandler);
export const onError = errorHandler.onError.bind(errorHandler);
export const getErrorStats = errorHandler.getErrorStats.bind(errorHandler);

// エラークラスのre-export
export {
  BaseAppError,
  GameError,
  AudioError,
  StorageError,
  NetworkError,
  UIError,
  ValidationError,
  SystemError
} from '../types/errors';