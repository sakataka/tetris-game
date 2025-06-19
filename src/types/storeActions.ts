/**
 * Generic Store Action Types
 *
 * Consolidates common action patterns used across all stores
 * to reduce duplication and improve type consistency.
 */

// Generic action types for any state
export type ToggleAction<T, K extends keyof T> = T[K] extends boolean ? () => void : never;

export type UpdateAction<T, K extends keyof T> = (value: T[K] | ((current: T[K]) => T[K])) => void;

export type BatchUpdateAction<T> = (updates: Partial<T>) => void;

export type ResetAction = () => void;

export type SetAction<T> = (value: T) => void;

// Generic action creators for common patterns
export interface GenericActions<T> {
  update: <K extends keyof T>(key: K, value: T[K] | ((current: T[K]) => T[K])) => void;
  batchUpdate: (updates: Partial<T>) => void;
  reset: () => void;
  toggle: <K extends keyof T>(key: K) => T[K] extends boolean ? void : never;
}

// Specific action patterns for different data types
export interface BooleanActions {
  toggle: () => void;
  set: (value: boolean) => void;
}

export interface NumberActions {
  set: (value: number) => void;
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  clamp: (min: number, max: number) => void;
}

export interface StringActions {
  set: (value: string) => void;
  clear: () => void;
  append: (text: string) => void;
}

export interface ArrayActions<T> {
  set: (items: T[]) => void;
  add: (item: T) => void;
  remove: (index: number) => void;
  removeBy: (predicate: (item: T) => boolean) => void;
  clear: () => void;
  update: (index: number, item: T) => void;
  move: (fromIndex: number, toIndex: number) => void;
}

export interface ObjectActions<T extends Record<string, unknown>> {
  set: (object: T) => void;
  merge: (updates: Partial<T>) => void;
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  removeField: <K extends keyof T>(key: K) => void;
  clear: () => void;
}

// Store lifecycle actions
export interface StoreLifecycleActions {
  initialize: () => void;
  destroy: () => void;
  reset: () => void;
  persist: () => void;
  restore: () => void;
}

// Async actions for stores with async operations
export interface AsyncActions<T, E = Error> {
  setLoading: (loading: boolean) => void;
  setError: (error: E | null) => void;
  setData: (data: T) => void;
  clear: () => void;
}

// State interface for async operations
export interface AsyncState<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
}

// Generic store interface combining state and actions
export interface GenericStore<T> extends GenericActions<T> {
  state: T;
}

// Persistent store actions
export interface PersistentStoreActions {
  save: () => Promise<void>;
  load: () => Promise<void>;
  clear: () => Promise<void>;
}

// Store with validation
export interface ValidatedStoreActions<T> {
  validate: (value: T) => boolean;
  updateWithValidation: <K extends keyof T>(key: K, value: T[K]) => boolean;
  getValidationErrors: () => string[];
}

// Store subscription actions
export interface SubscriptionActions<T> {
  subscribe: (callback: (state: T) => void) => () => void;
  subscribeToKey: <K extends keyof T>(key: K, callback: (value: T[K]) => void) => () => void;
  notify: () => void;
}

// Undo/Redo actions for stores that need history
export interface HistoryActions<T> {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getHistory: () => T[];
}

// State interface for stores with history
export interface HistoryState<T> {
  present: T;
  past: T[];
  future: T[];
}

// Computed values for stores
export type ComputedValue<T, R> = (state: T) => R;

export interface ComputedActions<T> {
  addComputed: <R>(name: string, computed: ComputedValue<T, R>) => void;
  removeComputed: (name: string) => void;
  getComputed: <R>(name: string) => R | undefined;
}

// Middleware types for stores
export type StoreMiddleware<_T> = (next: (action: unknown) => void) => (action: unknown) => void;

export interface MiddlewareActions<T> {
  addMiddleware: (middleware: StoreMiddleware<T>) => void;
  removeMiddleware: (middleware: StoreMiddleware<T>) => void;
}

// Event-driven store actions
export interface EventActions<_T> {
  emit: (event: string, payload?: unknown) => void;
  on: (event: string, listener: (payload?: unknown) => void) => () => void;
  off: (event: string, listener: (payload?: unknown) => void) => void;
  once: (event: string, listener: (payload?: unknown) => void) => void;
}

// Store composition helpers
export type StoreActions<T> = GenericActions<T> & {
  [K in keyof T]: T[K] extends boolean
    ? BooleanActions
    : T[K] extends number
      ? NumberActions
      : T[K] extends string
        ? StringActions
        : T[K] extends Array<infer U>
          ? ArrayActions<U>
          : T[K] extends Record<string, unknown>
            ? ObjectActions<T[K]>
            : GenericActions<T[K]>;
};

// Utility types for action creators
export type ActionCreator<T extends (...args: unknown[]) => unknown> = T;

export type ActionMap<T extends Record<string, (...args: unknown[]) => unknown>> = {
  [K in keyof T]: ActionCreator<T[K]>;
};

// State selector types
export type StateSelector<T, R = T> = (state: T) => R;

export type StateSelectorMap<T> = {
  [K: string]: StateSelector<T, unknown>;
};

// Hook types for React integration
export type StoreHook<T> = () => T;
export type SelectorHook<T, R> = (selector: StateSelector<T, R>) => R;
export type ActionHook<A> = () => A;

// Store factory types
export type StoreFactory<T, A = GenericActions<T>> = (
  initialState: T,
  actions?: Partial<A>
) => T & A;

export type PersistedStoreFactory<T, A = GenericActions<T>> = (
  initialState: T,
  persistOptions: {
    name: string;
    version?: number;
    storage?: unknown;
  },
  actions?: Partial<A>
) => T & A;
