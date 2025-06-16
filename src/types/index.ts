/**
 * Centralized type exports
 * Updated test comment for Lefthook verification
 */

// Core game types
export * from './tetris';

// Utility types (avoiding conflicts with generics.ts)
export type {
  NonNegativeNumber,
  PositiveNumber,
  PercentageNumber,
  createNonNegativeNumber,
  createPositiveNumber,
  createPercentageNumber,
  NonEmptyArray,
  ReadonlyNonEmptyArray,
  isNonEmptyArray,
  StrictRecord,
  SafeFunction,
  AsyncSafeFunction,
  Result,
  createSuccess,
  createError,
  EventHandler,
  AsyncEventHandler,
  StrictKeyValuePair,
  createEnum,
  TypeGuard,
  createTypeGuard,
  safeArrayAccess,
  safeArrayUpdate,
} from './utilities';

// Error types (selective export to avoid conflicts)
export {
  type ErrorLevel,
  type ErrorCategory,
  type ErrorContext,
  type ErrorInfo,
  GameAppError,
  createGameError,
  createAudioError,
  createUIError,
  createStorageError,
  type ErrorHandler,
  type ErrorAction as ErrorStoreAction, // Rename to avoid conflict with generics.ts
  type ErrorConfig,
  DEFAULT_ERROR_CONFIG,
  ERROR_LEVEL_PRIORITY,
} from './errors';

// New type safety types
export * from './branded';
export * from './guards';
export * from './events';
export * from './components';
export * from './generics';
