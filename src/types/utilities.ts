/**
 * Utility type definitions for improved type safety
 */

// Strict range constraint types
export type NonNegativeNumber = number & { readonly __brand: 'NonNegative' };
export type PositiveNumber = number & { readonly __brand: 'Positive' };
export type PercentageNumber = number & { readonly __brand: 'Percentage' }; // 0-100

// Type-safe factory functions
export const createNonNegativeNumber = (value: number): NonNegativeNumber => {
  if (value < 0) throw new Error(`Value must be non-negative, got ${value}`);
  return value as NonNegativeNumber;
};

export const createPositiveNumber = (value: number): PositiveNumber => {
  if (value <= 0) throw new Error(`Value must be positive, got ${value}`);
  return value as PositiveNumber;
};

export const createPercentageNumber = (value: number): PercentageNumber => {
  if (value < 0 || value > 100) throw new Error(`Value must be between 0-100, got ${value}`);
  return value as PercentageNumber;
};

// Utilities for improving array type safety
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

// Type-safe array checking function
export const isNonEmptyArray = <T>(arr: T[]): arr is NonEmptyArray<T> => {
  return arr.length > 0;
};

// Strict object type definition utilities
export type StrictRecord<K extends string | number | symbol, V> = Record<K, V> & {
  readonly [P in K]: V;
};

// Type-safe utilities for partial updates
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utilities for improving function type safety
export type SafeFunction<TArgs extends readonly unknown[], TReturn> = (...args: TArgs) => TReturn;

export type AsyncSafeFunction<TArgs extends readonly unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

// Type-safe Result type for error handling
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const createSuccess = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const createError = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Type-safe event handlers
export type EventHandler<TEvent = Event> = SafeFunction<[TEvent], void>;
export type AsyncEventHandler<TEvent = Event> = AsyncSafeFunction<[TEvent], void>;

// Type that ensures strict key-value correspondence
export type StrictKeyValuePair<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    readonly key: K;
    readonly value: T[K];
  };
}[keyof T];

// Type-safe enum alternative
export const createEnum = <T extends Record<string, string | number>>(
  obj: T
): Readonly<T> & { readonly values: ReadonlyArray<T[keyof T]> } => {
  const values = Object.values(obj) as T[keyof T][];
  return Object.freeze({
    ...obj,
    values: Object.freeze(values),
  });
};

// Utilities for type guards
export type TypeGuard<T> = (value: unknown) => value is T;

export const createTypeGuard = <T>(predicate: (value: unknown) => boolean): TypeGuard<T> => {
  return (value: unknown): value is T => predicate(value);
};

// Type-safe array operation utilities
export const safeArrayAccess = <T>(array: readonly T[], index: number): T | undefined => {
  return index >= 0 && index < array.length ? array[index] : undefined;
};

export const safeArrayUpdate = <T>(array: readonly T[], index: number, value: T): readonly T[] => {
  if (index < 0 || index >= array.length) {
    throw new Error(`Index ${index} is out of bounds for array of length ${array.length}`);
  }
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
};
