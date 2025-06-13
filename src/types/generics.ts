/**
 * Generic Type Constraints and Utilities
 *
 * Advanced TypeScript patterns for type safety and flexibility
 */

// Constrained generic types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Deep partial type
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Deep readonly type
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

// Pick required keys
export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Pick optional keys
export type PickOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Strict property types
export type StrictPropertyTypes<T> = {
  [K in keyof T]-?: T[K];
};

// Function type constraints
export type AnyFunction = (...args: unknown[]) => unknown;
export type VoidFunction = () => void;
export type AsyncFunction<T = void> = () => Promise<T>;
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;

// Callback type constraints
export type Callback<T = void> = (error: Error | null, result?: T) => void;
export type EventCallback<T extends Event> = (event: T) => void;
export type StateCallback<T> = (prevState: T, nextState: T) => void;

// Promise type utilities
export type PromiseValue<T> = T extends Promise<infer U> ? U : never;
export type AsyncReturnType<T extends AsyncFunction> = T extends AsyncFunction<infer U> ? U : never;

// Array type utilities
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

// Object type utilities
export type ObjectKeys<T> = T extends object ? keyof T : never;
export type ObjectValues<T> = T extends object ? T[keyof T] : never;
export type ObjectEntries<T> = T extends object ? [keyof T, T[keyof T]][] : never;

// Discriminated union helpers
export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V>
  ? T
  : never;

// Type guard helpers
export type TypeGuard<T> = (value: unknown) => value is T;
export type TypeAssertion<T> = (value: unknown) => asserts value is T;

// Store type constraints
export interface StoreState {
  readonly version: number;
  readonly lastUpdated: number;
}

export interface StoreActions<S extends StoreState> {
  setState: (updates: Partial<S>) => void;
  resetState: () => void;
}

export type Store<S extends StoreState, A extends StoreActions<S>> = S & A;

// Selector type constraints
export type Selector<S, R> = (state: S) => R;
export type ParametricSelector<S, P, R> = (state: S, params: P) => R;
export type MemoizedSelector<S, R> = Selector<S, R> & {
  recomputations: () => number;
  resetRecomputations: () => void;
};

// Action type constraints
export interface Action<T = string> {
  type: T;
}

export interface PayloadAction<T = string, P = unknown> extends Action<T> {
  payload: P;
}

export interface ErrorAction<T = string> extends Action<T> {
  error: true;
  payload: Error;
}

export type AnyAction = Action<string>;

// Middleware type constraints
export type Middleware<S = unknown, A extends Action = AnyAction> = (
  store: MiddlewareAPI<S, A>
) => (next: Dispatch<A>) => (action: A) => unknown;

export interface MiddlewareAPI<S = unknown, A extends Action = AnyAction> {
  dispatch: Dispatch<A>;
  getState: () => S;
}

export type Dispatch<A extends Action = AnyAction> = (action: A) => A;

// React component type constraints
export type PropsWithChildren<P = Record<string, unknown>> = P & { children?: React.ReactNode };
export type PropsWithClassName<P = Record<string, unknown>> = P & { className?: string };
export type PropsWithStyle<P = Record<string, unknown>> = P & { style?: React.CSSProperties };

// Event handler type constraints
export type FormEventHandler<T = Element> = React.FormEventHandler<T>;
export type ChangeEventHandler<T = Element> = React.ChangeEventHandler<T>;
export type MouseEventHandler<T = Element> = React.MouseEventHandler<T>;
export type KeyboardEventHandler<T = Element> = React.KeyboardEventHandler<T>;
export type TouchEventHandler<T = Element> = React.TouchEventHandler<T>;

// Validation type constraints
export type Validator<T> = (value: T) => ValidationResult;
export type AsyncValidator<T> = (value: T) => Promise<ValidationResult>;

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// API type constraints
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: Error };

export type ApiRequest<P = unknown> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  params?: P;
  headers?: Record<string, string>;
};

// Branded type utilities
export type Brand<K, T> = K & { __brand: T };
export type Branded<T, B> = T & { __brand: B };

// Opaque type utilities
export type Opaque<K, T> = K & { __opaque: T };

// Nominal type utilities
export type Nominal<T, K> = T & { __nominal: K };

// Type assertion utilities
export function assertType<T>(value: T): T {
  return value;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// Type narrowing utilities
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Array type guard utilities
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return value.length > 0;
}

// Object type guard utilities
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<K extends PropertyKey>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// Function type guard utilities
export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function';
}

export function isAsyncFunction(value: unknown): value is AsyncFunction {
  return isFunction(value) && value.constructor.name === 'AsyncFunction';
}
