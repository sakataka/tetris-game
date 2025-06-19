/**
 * Generic Store Factory
 *
 * Provides common patterns for Zustand stores to reduce redundancy
 * and ensure consistency across all stores.
 */

import type { StateCreator } from 'zustand';

// Generic utility types for store operations
export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type ValueAtPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAtPath<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Generic store base interface
export interface BaseStoreActions<T> {
  // Generic toggle method for boolean values
  toggle: (path: string) => void;

  // Generic update method for any value
  update: (path: string, value: unknown) => void;

  // Generic batch update method
  batchUpdate: (updates: Partial<T>) => void;

  // Reset to initial state
  reset: () => void;
}

// Utility functions for nested object operations
export function getNestedValue<T>(obj: T, path: string): unknown {
  return path
    .split('.')
    .reduce(
      (current: Record<string, unknown>, key: string) => (current as any)?.[key],
      obj as Record<string, unknown>
    );
}

export function setNestedValue<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return obj;

  const target = keys.reduce(
    (current: Record<string, unknown>, key: string) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key] as Record<string, unknown>;
    },
    obj as Record<string, unknown>
  );

  if (target && typeof target === 'object') {
    (target as Record<string, unknown>)[lastKey] = value;
  }

  return obj;
}

// Factory function to create stores with common patterns
export function createStoreWithActions<T extends object>(
  initialState: T,
  customActions: (
    set: (fn: (state: T) => T) => void,
    get: () => T
  ) => Record<string, unknown> = () => ({})
): StateCreator<
  T & BaseStoreActions<T> & Record<string, unknown>,
  [],
  [],
  T & BaseStoreActions<T> & Record<string, unknown>
> {
  return (set, get) => ({
    ...initialState,

    toggle: (path: string) => {
      set((state) => {
        const current = getNestedValue(state, path);
        if (typeof current !== 'boolean') {
          console.warn(`Cannot toggle non-boolean value at path: ${path}`);
          return state;
        }
        const newState = { ...state };
        setNestedValue(newState, path, !current);
        return newState;
      });
    },

    update: (path: string, value: unknown) => {
      set((state) => {
        const newState = { ...state };
        const actualValue =
          typeof value === 'function'
            ? (value as (current: unknown) => unknown)(getNestedValue(state, path))
            : value;
        setNestedValue(newState, path, actualValue);
        return newState;
      });
    },

    batchUpdate: (updates: Partial<T>) => {
      set((state) => ({ ...state, ...updates }));
    },

    reset: () => {
      set(() => ({ ...initialState }));
    },

    ...customActions(set, get),
  });
}

// Specialized factory for stores with persist middleware
export function createPersistedStoreWithActions<T extends object>(
  initialState: T,
  _persistOptions: {
    name: string;
    version?: number;
    storage?: unknown;
  },
  customActions: (
    set: (fn: (state: T) => T) => void,
    get: () => T
  ) => Record<string, unknown> = () => ({})
) {
  return createStoreWithActions(initialState, customActions);
}

// Common validation helpers
export const validators = {
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value),
  isString: (value: unknown): value is string => typeof value === 'string',
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isObject: (value: unknown): value is object => value !== null && typeof value === 'object',
};

// Common action types that can be used across stores
export type ToggleAction<T, K extends keyof T> = T[K] extends boolean ? () => void : never;
export type UpdateAction<T, K extends keyof T> = (value: T[K] | ((current: T[K]) => T[K])) => void;
export type BatchUpdateAction<T> = (updates: Partial<T>) => void;
export type ResetAction = () => void;
