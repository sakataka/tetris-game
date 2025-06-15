/**
 * Unified Error Handler
 *
 * Provides consistent error handling patterns across the application.
 * Consolidates handleError, handleAsyncError, and withErrorHandling patterns.
 */

import { handleError as originalHandleError, BaseAppError } from './errorHandler';
import { log } from '../logging';

/**
 * Unified error handling function that works for both sync and async operations
 */
export function handleError(
  error: Error | BaseAppError | string,
  context?: Record<string, unknown>
): void {
  try {
    // Convert string to Error if needed
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Add context to error if it's a BaseAppError
    if (errorObj instanceof BaseAppError && context) {
      // Create new error with updated context
      const ErrorClass = errorObj.constructor as new (
        message: string,
        context?: Record<string, unknown>
      ) => BaseAppError;
      const updatedError = new ErrorClass(errorObj.message, {
        ...errorObj.context,
        ...context,
      });
      originalHandleError(updatedError);
      return;
    }

    originalHandleError(errorObj);
  } catch (handlingError) {
    // Fallback if error handling itself fails
    log.error('Error handler failed:', {
      component: 'UnifiedErrorHandler',
      metadata: { error: handlingError as Error },
    });
    console.error('Critical error handling failure:', error, handlingError);
  }
}

/**
 * Higher-order function that wraps functions with error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);

      // Handle promise-returning functions
      if (
        result &&
        typeof result === 'object' &&
        'then' in result &&
        typeof result.then === 'function'
      ) {
        return (result as Promise<unknown>).catch((error: Error) => {
          handleError(error, { ...context, functionName: fn.name, args });
          throw error; // Re-throw to maintain promise rejection behavior
        });
      }

      return result;
    } catch (error) {
      handleError(error as Error, { ...context, functionName: fn.name, args });
      throw error; // Re-throw to maintain error propagation
    }
  }) as T;
}

/**
 * Async-specific error handler for promises and async functions
 */
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error as Error, context);
    return null; // Return null instead of throwing for non-critical operations
  }
}

/**
 * Safe async operation that never throws - returns result or null
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: Record<string, unknown>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error as Error, { ...context, type: 'safe_async' });
    return fallback ?? null;
  }
}

/**
 * Retry wrapper for operations that might fail temporarily
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  context?: Record<string, unknown>
): Promise<T> {
  let lastError: Error = new Error('No attempts made');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        handleError(lastError, {
          ...context,
          attempt,
          maxRetries,
          type: 'retry_exhausted',
        });
        throw lastError;
      }

      // Log intermediate failures as warnings
      log.warn(`Attempt ${attempt}/${maxRetries} failed:`, {
        component: 'UnifiedErrorHandler',
        metadata: { error: error as Error, attempt, maxRetries },
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

/**
 * Error boundary helper for specific error types
 */
export function createErrorFilter(
  errorTypes: string[],
  handler: (error: Error) => void = () => {}
) {
  return (error: Error): boolean => {
    const errorMessage = error.message.toLowerCase();
    const shouldHandle = errorTypes.some((type) => errorMessage.includes(type.toLowerCase()));

    if (shouldHandle) {
      handler(error);
    }

    return shouldHandle;
  };
}

/**
 * Debounced error handler to prevent spam from repeated errors
 */
const errorDebounceMap = new Map<string, number>();

export function handleErrorDebounced(
  error: Error | BaseAppError | string,
  context?: Record<string, unknown>,
  debounceMs = 1000
): void {
  const errorKey = typeof error === 'string' ? error : error.message;
  const now = Date.now();
  const lastTime = errorDebounceMap.get(errorKey) || 0;

  if (now - lastTime > debounceMs) {
    errorDebounceMap.set(errorKey, now);
    handleError(error, context);
  }
}

/**
 * Cleanup old debounce entries to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  const cutoff = 5 * 60 * 1000; // 5 minutes

  for (const [key, time] of errorDebounceMap.entries()) {
    if (now - time > cutoff) {
      errorDebounceMap.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
