/**
 * Simplified Error Handler
 * Focused on essential error processing for Tetris game
 */

import {
  DEFAULT_ERROR_CONFIG,
  type ErrorConfig,
  type ErrorHandler,
  GameAppError,
} from '../../types/errors';

// Simplified error handler service
class ErrorHandlerService {
  private config: ErrorConfig = DEFAULT_ERROR_CONFIG;
  private errorCallbacks: Set<ErrorHandler> = new Set();

  constructor() {
    this.setupGlobalErrorHandling();
  }

  // Register error callback
  public onError(callback: ErrorHandler): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  // Update configuration
  public updateConfig(newConfig: Partial<ErrorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Simplified error handling
  public handleError(error: Error | GameAppError): void {
    const appError = this.normalizeError(error);

    // Console logging in development
    if (import.meta.env.DEV) {
      console.error(`[${appError.category}] ${appError.message}`, appError);
    }

    // Notify callbacks
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(appError);
      } catch (callbackError) {
        console.error('Error in callback:', callbackError);
      }
    });
  }

  // Convert any error to GameAppError
  private normalizeError(error: Error | GameAppError): GameAppError {
    if (error instanceof GameAppError) {
      return error;
    }

    return new GameAppError(error.message || 'Unknown error', undefined, 'medium', 'game', {
      component: 'ErrorHandler',
    });
  }

  // Global error handling setup
  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled errors
      window.addEventListener('error', (event) => {
        this.handleError(new Error(event.message));
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(String(event.reason)));
      });
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerService();
