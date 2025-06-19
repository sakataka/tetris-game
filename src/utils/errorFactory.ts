/**
 * Unified Error Factory
 *
 * Centralized error creation and handling system to reduce redundancy
 * and provide consistent error handling across the application.
 */

import type { ErrorCategory, ErrorContext, ErrorLevel, GameAppError } from '@/types/errors';
import { BaseClass, type ISingleton, SingletonMixin } from './patterns/singletonMixin';

// Error type configurations
interface ErrorTypeConfig {
  category: ErrorCategory;
  defaultLevel: ErrorLevel;
  shouldNotify: boolean;
  shouldLog: boolean;
}

// Configuration for different error types
const ERROR_TYPE_CONFIGS: Record<string, ErrorTypeConfig> = {
  game: {
    category: 'game',
    defaultLevel: 'medium',
    shouldNotify: true,
    shouldLog: true,
  },
  audio: {
    category: 'audio',
    defaultLevel: 'low',
    shouldNotify: false, // Audio errors are suppressed for UX
    shouldLog: true,
  },
  ui: {
    category: 'ui',
    defaultLevel: 'medium',
    shouldNotify: true,
    shouldLog: true,
  },
  storage: {
    category: 'storage',
    defaultLevel: 'high',
    shouldNotify: true,
    shouldLog: true,
  },
  network: {
    category: 'game', // Network errors fall under game category
    defaultLevel: 'medium',
    shouldNotify: true,
    shouldLog: true,
  },
} as const;

// Enhanced error metadata interface
interface ErrorMetadata {
  action?: string;
  component?: string;
  stack?: string;
  userAgent?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export class ErrorFactory extends SingletonMixin(class extends BaseClass {}) implements ISingleton {
  private errorHandlers: Map<ErrorCategory, Set<(error: GameAppError) => void>> = new Map();

  constructor() {
    super();
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Initialize handler sets for each category
    Object.values(ERROR_TYPE_CONFIGS).forEach((config) => {
      if (!this.errorHandlers.has(config.category)) {
        this.errorHandlers.set(config.category, new Set());
      }
    });
  }

  /**
   * Create an error with automatic configuration based on type
   */
  public createError(
    type: keyof typeof ERROR_TYPE_CONFIGS,
    message: string,
    options: {
      userMessage?: string;
      level?: ErrorLevel;
      context?: Partial<ErrorContext>;
      metadata?: ErrorMetadata;
      shouldNotify?: boolean;
      shouldLog?: boolean;
    } = {}
  ): GameAppError {
    const config = ERROR_TYPE_CONFIGS[type];
    if (!config) {
      throw new Error(`Unknown error type: ${type}`);
    }

    const {
      userMessage,
      level = config.defaultLevel,
      context = {},
      metadata = {},
      shouldNotify = config.shouldNotify,
      shouldLog = config.shouldLog,
    } = options;

    // Enhanced context with metadata
    const enhancedContext: ErrorContext = {
      component: context.component || 'unknown',
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        type,
        shouldNotify,
        shouldLog,
        userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server',
        ...context.metadata,
      },
    };

    // Import GameAppError class dynamically to avoid circular dependency
    const { GameAppError } = require('@/types/errors');
    const error = new GameAppError(message, userMessage, level, config.category, enhancedContext);

    // Handle the error automatically
    this.handleError(error);

    return error;
  }

  /**
   * Handle an error based on its configuration
   */
  public handleError(error: GameAppError): void {
    const shouldLog = (error.context.metadata?.['shouldLog'] as boolean) ?? true;
    // const _shouldNotify = (error.context.metadata?.['shouldNotify'] as boolean) ?? true;

    // Log error if configured
    if (shouldLog) {
      this.logError(error);
    }

    // Notify handlers for this category
    const handlers = this.errorHandlers.get(error.category);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(error);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      });
    }

    // Additional handling based on category
    this.handleByCategoryRules(error);
  }

  /**
   * Add error handler for specific category
   */
  public addHandler(category: ErrorCategory, handler: (error: GameAppError) => void): void {
    if (!this.errorHandlers.has(category)) {
      this.errorHandlers.set(category, new Set());
    }
    this.errorHandlers.get(category)?.add(handler);
  }

  /**
   * Remove error handler for specific category
   */
  public removeHandler(category: ErrorCategory, handler: (error: GameAppError) => void): void {
    const handlers = this.errorHandlers.get(category);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Batch create multiple errors
   */
  public createErrors(
    errors: Array<{
      type: keyof typeof ERROR_TYPE_CONFIGS;
      message: string;
      options?: Parameters<ErrorFactory['createError']>[2];
    }>
  ): GameAppError[] {
    return errors.map(({ type, message, options }) => this.createError(type, message, options));
  }

  /**
   * Create error from unknown error object
   */
  public createFromUnknown(
    unknownError: unknown,
    type: keyof typeof ERROR_TYPE_CONFIGS = 'game',
    context?: Partial<ErrorContext>
  ): GameAppError {
    let message = 'Unknown error occurred';
    let stack: string | undefined;

    if (unknownError instanceof Error) {
      message = unknownError.message;
      stack = unknownError.stack;
    } else if (typeof unknownError === 'string') {
      message = unknownError;
    } else if (unknownError && typeof unknownError === 'object') {
      message = JSON.stringify(unknownError);
    }

    return this.createError(type, message, {
      ...(context && { context }),
      metadata: { ...(stack && { stack }), originalError: unknownError },
    });
  }

  private logError(error: GameAppError): void {
    const logLevel = this.getLogLevel(error.level);
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`;

    if (typeof console !== 'undefined') {
      console[logLevel](logMessage, {
        id: error.id,
        level: error.level,
        context: error.context,
        userMessage: error.userMessage,
        stack: error.stack,
      });
    }
  }

  private getLogLevel(errorLevel: ErrorLevel): 'log' | 'warn' | 'error' {
    switch (errorLevel) {
      case 'low':
        return 'log';
      case 'medium':
        return 'warn';
      case 'high':
        return 'error';
      default:
        return 'log';
    }
  }

  private handleByCategoryRules(error: GameAppError): void {
    switch (error.category) {
      case 'audio':
        // Audio errors are handled silently in production
        if (process.env['NODE_ENV'] === 'production') {
          // Don't show to user, already logged
        }
        break;

      case 'storage':
        // Storage errors might need special recovery
        this.handleStorageError(error);
        break;

      case 'game':
        // Game errors might need game state recovery
        this.handleGameError(error);
        break;

      case 'ui':
        // UI errors need user notification
        this.handleUIError(error);
        break;
    }
  }

  private handleStorageError(_error: GameAppError): void {
    // Storage error recovery logic could go here
    // For example, clear corrupted localStorage data
  }

  private handleGameError(_error: GameAppError): void {
    // Game error recovery logic could go here
    // For example, reset game state if critical error
  }

  private handleUIError(_error: GameAppError): void {
    // UI error recovery logic could go here
    // For example, show fallback UI
  }

  /**
   * Reset singleton state (implements ISingleton)
   */
  public override reset(): void {
    this.errorHandlers.clear();
    this.initializeHandlers();
  }

  /**
   * Clean up all resources (implements ISingleton)
   */
  public override destroy(): void {
    this.errorHandlers.clear();
  }
}

// Convenience functions that use the singleton
export const errorFactory = ErrorFactory.getInstance();

// Backwards compatibility functions (simplified)
export const createGameError = (
  message: string,
  context?: Partial<ErrorContext>,
  userMessage?: string
) =>
  errorFactory.createError('game', message, {
    ...(context && { context }),
    ...(userMessage && { userMessage }),
  });

export const createAudioError = (
  message: string,
  context?: Partial<ErrorContext>,
  userMessage?: string
) =>
  errorFactory.createError('audio', message, {
    ...(context && { context }),
    ...(userMessage && { userMessage }),
  });

export const createUIError = (
  message: string,
  context?: Partial<ErrorContext>,
  userMessage?: string
) =>
  errorFactory.createError('ui', message, {
    ...(context && { context }),
    ...(userMessage && { userMessage }),
  });

export const createStorageError = (
  message: string,
  context?: Partial<ErrorContext>,
  userMessage?: string
) =>
  errorFactory.createError('storage', message, {
    ...(context && { context }),
    ...(userMessage && { userMessage }),
  });

// Enhanced error creation functions
export const createNetworkError = (
  message: string,
  context?: Partial<ErrorContext>,
  userMessage?: string
) =>
  errorFactory.createError('network', message, {
    ...(context && { context }),
    ...(userMessage && { userMessage }),
  });

export const createFromUnknown = (
  unknownError: unknown,
  type: keyof typeof ERROR_TYPE_CONFIGS = 'game',
  context?: Partial<ErrorContext>
) => errorFactory.createFromUnknown(unknownError, type, context);

// Error handler management
export const addErrorHandler = (category: ErrorCategory, handler: (error: GameAppError) => void) =>
  errorFactory.addHandler(category, handler);

export const removeErrorHandler = (
  category: ErrorCategory,
  handler: (error: GameAppError) => void
) => errorFactory.removeHandler(category, handler);
