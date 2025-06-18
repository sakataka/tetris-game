/**
 * Centralized type exports
 */

// New type safety types
export * from './branded';
export * from './components';

// Error types (selective export to avoid conflicts)
export {
  createAudioError,
  createGameError,
  createStorageError,
  createUIError,
  DEFAULT_ERROR_CONFIG,
  ERROR_LEVEL_PRIORITY,
  type ErrorAction as ErrorStoreAction, // Rename to avoid conflict with generics.ts
  type ErrorCategory,
  type ErrorConfig,
  type ErrorContext,
  type ErrorHandler,
  type ErrorInfo,
  type ErrorLevel,
  GameAppError,
} from './errors';
export * from './events';
export * from './generics';
// Note: guards was removed as part of theme system simplification
// Core game types
export * from './tetris';
// Utility types (avoiding conflicts with generics.ts)
export type {
  AsyncEventHandler,
  AsyncSafeFunction,
  createEnum,
  createError,
  createNonNegativeNumber,
  createPercentageNumber,
  createPositiveNumber,
  createSuccess,
  createTypeGuard,
  EventHandler,
  isNonEmptyArray,
  NonEmptyArray,
  NonNegativeNumber,
  PercentageNumber,
  PositiveNumber,
  ReadonlyNonEmptyArray,
  Result,
  SafeFunction,
  StrictKeyValuePair,
  StrictRecord,
  safeArrayAccess,
  safeArrayUpdate,
  TypeGuard,
} from './utilities';
