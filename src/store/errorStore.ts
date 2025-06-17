/**
 * Simplified Error Store
 * Essential error management for Tetris game
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_ERROR_CONFIG,
  type ErrorCategory,
  type ErrorConfig,
  type ErrorInfo,
  type ErrorLevel,
} from '../types/errors';

// Simplified error store state
export interface ErrorState {
  // Error collection (limited)
  errors: ErrorInfo[];

  // Configuration
  config: ErrorConfig;

  // UI state
  showErrorPanel: boolean;
  selectedErrorId: string | undefined;

  // Actions
  addError: (error: ErrorInfo) => void;
  dismissError: (errorId: string) => void;
  clearErrors: () => void;
  updateConfig: (config: Partial<ErrorConfig>) => void;
  setShowErrorPanel: (show: boolean) => void;
  setSelectedError: (errorId?: string) => void;

  // Essential selectors
  getErrorsByLevel: (level: ErrorLevel) => ErrorInfo[];
  getErrorsByCategory: (category: ErrorCategory) => ErrorInfo[];
}

// Create the simplified error store
export const useErrorStore = create<ErrorState>()(
  persist(
    (set, get) => ({
      // Initial state
      errors: [],
      config: DEFAULT_ERROR_CONFIG,
      showErrorPanel: false,
      selectedErrorId: undefined,

      // Add error with limit enforcement
      addError: (error: ErrorInfo) =>
        set((state) => {
          const newErrors = [error, ...state.errors];
          // Keep only recent errors within limit
          const limitedErrors = newErrors.slice(0, state.config.maxStoredErrors);
          return { errors: limitedErrors };
        }),

      // Dismiss specific error
      dismissError: (errorId: string) =>
        set((state) => ({
          errors: state.errors.filter((error) => error.id !== errorId),
          selectedErrorId: state.selectedErrorId === errorId ? undefined : state.selectedErrorId,
        })),

      // Clear all errors
      clearErrors: () =>
        set(() => ({
          errors: [],
          selectedErrorId: undefined,
        })),

      // Update configuration
      updateConfig: (newConfig: Partial<ErrorConfig>) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      // Toggle error panel visibility
      setShowErrorPanel: (show: boolean) => set(() => ({ showErrorPanel: show })),

      // Set selected error
      setSelectedError: (errorId?: string) => set(() => ({ selectedErrorId: errorId })),

      // Get errors by level
      getErrorsByLevel: (level: ErrorLevel) =>
        get().errors.filter((error) => error.level === level),

      // Get errors by category
      getErrorsByCategory: (category: ErrorCategory) =>
        get().errors.filter((error) => error.category === category),
    }),
    {
      name: 'tetris-errors',
      partialize: (state) => ({
        config: state.config,
        // Don't persist errors - they're session-only
      }),
    }
  )
);

// Convenience hooks
export const useErrors = () => useErrorStore((state) => state.errors);

export const useErrorStats = () => {
  const errors = useErrorStore((state) => state.errors);

  const stats = {
    total: errors.length,
    byLevel: { low: 0, medium: 0, high: 0 } as Record<ErrorLevel, number>,
    byCategory: { game: 0, audio: 0, ui: 0, storage: 0 } as Record<ErrorCategory, number>,
    recent: errors.slice(0, 5),
    lastErrorTime: errors[0]?.context.timestamp,
  };

  errors.forEach((error) => {
    stats.byLevel[error.level]++;
    stats.byCategory[error.category]++;
  });

  return stats;
};

export const useErrorConfig = () => useErrorStore((state) => state.config);
export const useShowErrorPanel = () => useErrorStore((state) => state.showErrorPanel);
export const useSelectedErrorId = () => useErrorStore((state) => state.selectedErrorId);

// Action hooks
export const useErrorActions = () => ({
  addError: useErrorStore((state) => state.addError),
  dismissError: useErrorStore((state) => state.dismissError),
  clearErrors: useErrorStore((state) => state.clearErrors),
  updateConfig: useErrorStore((state) => state.updateConfig),
  setShowErrorPanel: useErrorStore((state) => state.setShowErrorPanel),
  setSelectedError: useErrorStore((state) => state.setSelectedError),
});

// Selector hooks
export const useErrorSelectors = () => ({
  getErrorsByLevel: useErrorStore((state) => state.getErrorsByLevel),
  getErrorsByCategory: useErrorStore((state) => state.getErrorsByCategory),
});

// Summary hook for quick overview
export const useErrorSummary = () => {
  const errors = useErrorStore((state) => state.errors);
  const hasErrors = errors.length > 0;
  const highPriorityCount = errors.filter((e) => e.level === 'high').length;
  const recentCount = errors.filter(
    (e) => Date.now() - e.context.timestamp < 5 * 60 * 1000 // Last 5 minutes
  ).length;

  return {
    hasErrors,
    totalCount: errors.length,
    highPriorityCount,
    recentCount,
    mostRecentError: errors[0],
  };
};

// Helper hooks for specific error levels
export const useErrorsByLevel = (level: ErrorLevel) =>
  useErrorStore((state) => state.getErrorsByLevel(level));

export const useErrorsByCategory = (category: ErrorCategory) =>
  useErrorStore((state) => state.getErrorsByCategory(category));
