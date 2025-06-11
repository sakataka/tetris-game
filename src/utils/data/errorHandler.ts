/**
 * Error Handling Utilities
 * Provides unified error processing and logging functionality
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
  ValidationError,
} from '../../types/errors';
import { log } from '../logging';

// Singleton class for error handler
class ErrorHandlerService {
  private config: ErrorReportConfig = DEFAULT_ERROR_CONFIG;
  private errorHistory: ErrorInfo[] = [];
  private errorHandlers: Map<ErrorCategory, ErrorHandler> = new Map();
  private onErrorCallbacks: Set<(error: ErrorInfo) => void> = new Set();

  constructor() {
    this.initializeDefaultHandlers();
    this.setupGlobalErrorHandling();
  }

  // Update configuration
  public updateConfig(newConfig: Partial<ErrorReportConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Register error handler
  public registerHandler(category: ErrorCategory, handler: ErrorHandler): void {
    this.errorHandlers.set(category, handler);
  }

  // Register callback for error occurrence
  public onError(callback: (error: ErrorInfo) => void): () => void {
    this.onErrorCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.onErrorCallbacks.delete(callback);
    };
  }

  // Main error handling function
  public handleError(error: Error | BaseAppError): ErrorHandlingResult {
    const appError = this.normalizeError(error);
    const errorInfo = appError.toErrorInfo();

    // Add to error history
    this.addToHistory(errorInfo);

    // Console log output
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorInfo);
    }

    // Execute registered callbacks
    this.notifyCallbacks(errorInfo);

    // Execute category-specific handler
    const handler = this.errorHandlers.get(errorInfo.category);
    let result: ErrorHandlingResult = {
      handled: false,
    };

    if (this.config.enableUserNotifications) {
      result.userNotification = {
        message: appError.userMessage || errorInfo.message,
        level: errorInfo.level,
        duration: this.getNotificationDuration(errorInfo.level),
      };
    }

    if (handler) {
      try {
        result = handler(appError);
      } catch (handlerError) {
        log.error('Error in error handler', {
          component: 'ErrorHandler',
          metadata: { handlerError },
        });
      }
    }

    // Automatic reporting of critical errors
    if (this.config.autoReportCritical && errorInfo.level === 'critical') {
      this.reportCriticalError(errorInfo);
    }

    return result;
  }

  // Asynchronous error handling
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

  // Error handling during function execution
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
            log.error('Error in fallback function', {
              component: 'ErrorHandler',
              metadata: { fallbackError },
            });
          }
        }

        if (!appError.recoverable) {
          throw appError;
        }

        return null;
      }
    };
  }

  // Get error statistics
  public getErrorStats() {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsByLevel: {} as Record<ErrorLevel, number>,
      recentErrors: this.errorHistory.slice(-10),
      lastErrorTime:
        this.errorHistory.length > 0
          ? this.errorHistory[this.errorHistory.length - 1]?.context.timestamp
          : undefined,
    };

    // Aggregation by category and level
    this.errorHistory.forEach((error) => {
      stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsByLevel[error.level] = (stats.errorsByLevel[error.level] || 0) + 1;
    });

    return stats;
  }

  // Clear error history
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  // Mark specific error as resolved
  public resolveError(errorId: string): boolean {
    const index = this.errorHistory.findIndex((error) => error.id === errorId);
    if (index !== -1) {
      this.errorHistory.splice(index, 1);
      return true;
    }
    return false;
  }

  // Private methods

  private normalizeError(
    error: Error | BaseAppError,
    context: Partial<{ component: string; action: string }> = {}
  ): BaseAppError {
    if (error instanceof BaseAppError) {
      return error;
    }

    // Convert general Error to BaseAppError
    if (error.name === 'TypeError') {
      return new ValidationError(error.message, context, { cause: error });
    }

    if (error.name === 'ReferenceError') {
      return new SystemError(error.message, context, { cause: error });
    }

    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return new NetworkError(error.message, context, { cause: error });
    }

    // Process as GameError by default
    return new GameError(error.message, context, { cause: error });
  }

  private addToHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);

    // Limit history size
    if (this.errorHistory.length > this.config.maxStoredErrors) {
      this.errorHistory.shift();
    }
  }

  private logToConsole(errorInfo: ErrorInfo): void {
    const logLevel = this.getConsoleLogLevel(errorInfo.level);
    const logMessage = `[${errorInfo.level.toUpperCase()}] ${errorInfo.category}/${errorInfo.id}: ${errorInfo.message}`;

    console[logLevel](logMessage, {
      context: errorInfo.context,
      stack: this.config.enableStackTrace ? errorInfo.stack : undefined,
    });
  }

  private getConsoleLogLevel(level: ErrorLevel): 'log' | 'warn' | 'error' {
    switch (level) {
      case 'info':
        return 'log';
      case 'warning':
        return 'warn';
      case 'error':
      case 'critical':
        return 'error';
      default:
        return 'log';
    }
  }

  private getNotificationDuration(level: ErrorLevel): number {
    switch (level) {
      case 'info':
        return 3000;
      case 'warning':
        return 5000;
      case 'error':
        return 7000;
      case 'critical':
        return 10000;
      default:
        return 5000;
    }
  }

  private notifyCallbacks(errorInfo: ErrorInfo): void {
    this.onErrorCallbacks.forEach((callback) => {
      try {
        callback(errorInfo);
      } catch (callbackError) {
        log.error('Error in error callback', {
          component: 'ErrorHandler',
          metadata: { callbackError },
        });
      }
    });
  }

  private reportCriticalError(errorInfo: ErrorInfo): void {
    // Future implementation for reporting to external services
    log.error('CRITICAL ERROR REPORT', {
      component: 'ErrorHandler',
      action: 'reportCriticalError',
      metadata: {
        id: errorInfo.id,
        message: errorInfo.message,
        context: errorInfo.context,
        stack: errorInfo.stack,
        timestamp: new Date(errorInfo.context.timestamp).toISOString(),
      },
    });
  }

  private initializeDefaultHandlers(): void {
    // Game error handler
    this.registerHandler(
      'game',
      (error: BaseAppError): ErrorHandlingResult => ({
        handled: true,
        retry: error.retryable,
        fallback: () => {
          // Reset game state, etc.
          log.info('Game error fallback executed', {
            component: 'ErrorHandler',
            action: 'gameErrorFallback',
          });
        },
      })
    );

    // Audio error handler
    this.registerHandler(
      'audio',
      (): ErrorHandlingResult => ({
        handled: true,
        retry: true, // Audio is usually retryable
        userNotification: {
          message: 'Audio playback failed. Please try again later.',
          level: 'warning',
          duration: 3000,
        },
      })
    );

    // Storage error handler
    this.registerHandler(
      'storage',
      (): ErrorHandlingResult => ({
        handled: true,
        retry: false,
        userNotification: {
          message: 'Data save failed. Please check your browser settings.',
          level: 'warning',
          duration: 5000,
        },
      })
    );

    // Network error handler
    this.registerHandler(
      'network',
      (): ErrorHandlingResult => ({
        handled: true,
        retry: true,
        userNotification: {
          message: 'Network error occurred. Please check your connection.',
          level: 'error',
          duration: 5000,
        },
      })
    );
  }

  private setupGlobalErrorHandling(): void {
    // Catch global unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const error = new SystemError(`Unhandled Promise Rejection: ${event.reason}`, {
          action: 'unhandledrejection',
        });
        this.handleError(error);
      });

      // Catch global errors
      window.addEventListener('error', (event) => {
        const error = new SystemError(event.message, {
          action: 'global_error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
        this.handleError(error);
      });
    }
  }
}

// Singleton instance
export const errorHandler = new ErrorHandlerService();

// Convenient function exports
export const handleError = errorHandler.handleError.bind(errorHandler);
export const handleAsyncError = errorHandler.handleAsyncError.bind(errorHandler);
export const withErrorHandling = errorHandler.withErrorHandling.bind(errorHandler);
export const onError = errorHandler.onError.bind(errorHandler);
export const getErrorStats = errorHandler.getErrorStats.bind(errorHandler);

// Re-export error classes
export {
  BaseAppError,
  GameError,
  AudioError,
  StorageError,
  NetworkError,
  UIError,
  ValidationError,
  SystemError,
} from '../../types/errors';
