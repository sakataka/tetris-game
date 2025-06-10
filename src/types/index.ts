/**
 * Centralized type exports
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

// Error types (excluding GameError which is already exported from tetris)
export type { AudioError, BaseAppError } from './errors';

// New type safety types
export * from './branded';
export * from './guards';
export * from './events';
export * from './components';
export * from './generics';
