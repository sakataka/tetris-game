/**
 * Singleton Mixin for unified singleton pattern implementation
 * Provides standardized getInstance() method with proper TypeScript typing
 * and lifecycle management (reset, destroy methods)
 */

// Type for constructor function
type Constructor<T = Record<string, unknown>> = new (...args: any[]) => T;

// Singleton interface with lifecycle methods
export interface ISingleton {
  reset?(): void;
  destroy?(): void;
}

// Singleton state tracking
interface SingletonState<T = unknown> {
  instance: T | null;
  isDestroyed: boolean;
}

// Global registry for singleton instances
const singletonRegistry = new Map<Constructor, SingletonState>();

/**
 * Singleton mixin that adds standardized singleton behavior to any class
 * @param Base - Base class to extend with singleton pattern
 * @returns Extended class with singleton pattern
 */
export function SingletonMixin<TBase extends Constructor>(Base: TBase) {
  return class Singleton extends Base implements ISingleton {
    private static _singletonKey: Constructor;

    constructor(...args: any[]) {
      super(...args);

      // Set the singleton key for this class
      const constructorKey = this.constructor as Constructor;
      if (!Singleton._singletonKey) {
        Singleton._singletonKey = constructorKey;
      }
    }

    /**
     * Get singleton instance with proper typing
     * @returns Singleton instance of the class
     */
    public static getInstance<T extends Singleton>(this: Constructor<T>): T {
      const constructorKey = Singleton as Constructor<T>;

      let state = singletonRegistry.get(constructorKey);
      if (!state) {
        state = { instance: null, isDestroyed: false };
        singletonRegistry.set(constructorKey, state);
      }

      if (!state.instance || state.isDestroyed) {
        state.instance = new constructorKey();
        state.isDestroyed = false;
      }

      // We know instance is not null here due to the check above
      if (!state.instance) {
        throw new Error('Failed to create singleton instance');
      }
      
      return state.instance as T;
    }

    /**
     * Check if singleton instance exists
     * @returns True if instance exists and is not destroyed
     */
    public static hasInstance(this: Constructor): boolean {
      const state = singletonRegistry.get(Singleton);
      return !!(state?.instance && !state.isDestroyed);
    }

    /**
     * Reset singleton instance (calls reset method if available)
     */
    public static resetInstance(this: Constructor): void {
      const state = singletonRegistry.get(Singleton);
      if (state?.instance) {
        // Call reset method if available
        if (typeof (state.instance as any).reset === 'function') {
          (state.instance as any).reset();
        }
      }
    }

    /**
     * Destroy singleton instance (calls destroy method if available)
     */
    public static destroyInstance(this: Constructor): void {
      const state = singletonRegistry.get(Singleton);
      if (state?.instance) {
        // Call destroy method if available
        if (typeof (state.instance as any).destroy === 'function') {
          (state.instance as any).destroy();
        }

        state.instance = null;
        state.isDestroyed = true;
      }
    }

    /**
     * Get all active singleton instances (for debugging)
     * @returns Array of active singleton constructors
     */
    public static getActiveInstances(): Constructor[] {
      const active: Constructor[] = [];
      for (const [constructorKey, state] of singletonRegistry) {
        if (state.instance && !state.isDestroyed) {
          active.push(constructorKey);
        }
      }
      return active;
    }

    /**
     * Clear all singleton instances (useful for testing)
     */
    public static clearAllInstances(): void {
      for (const [, state] of singletonRegistry) {
        if (state.instance && typeof (state.instance as any).destroy === 'function') {
          (state.instance as any).destroy();
        }
        state.instance = null;
        state.isDestroyed = true;
      }
      singletonRegistry.clear();
    }

    /**
     * Optional reset method to be implemented by subclasses
     */
    public reset?(): void;

    /**
     * Optional destroy method to be implemented by subclasses
     */
    public destroy?(): void;
  };
}

/**
 * Base Singleton class using the mixin
 * Can be extended directly for simple singleton implementations
 */
// Base class that can be used for singleton implementations
class BaseClass implements Record<string, unknown> {
  constructor(..._args: any[]) {}
  [key: string]: unknown;
}

export class BaseSingleton extends SingletonMixin(BaseClass) {}

/**
 * Utility type for singleton classes
 */
export type SingletonClass<T> = T & {
  getInstance(): T;
  hasInstance(): boolean;
  resetInstance(): void;
  destroyInstance(): void;
};
