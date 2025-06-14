import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_ERROR_CONFIG,
  type ErrorCategory,
  type ErrorInfo,
  type ErrorLevel,
  type ErrorReportConfig,
  type ErrorStats,
} from '../types/errors';

// Error store state type definitions
export interface ErrorState {
  // Error collection
  errors: ErrorInfo[];

  // Error statistics
  stats: ErrorStats;

  // Configuration
  config: ErrorReportConfig;

  // UI state
  showErrorPanel: boolean;
  selectedErrorId?: string;

  // Actions
  addError: (error: ErrorInfo) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  clearErrorsByCategory: (category: ErrorCategory) => void;
  markErrorAsResolved: (errorId: string) => void;
  updateConfig: (config: Partial<ErrorReportConfig>) => void;
  setShowErrorPanel: (show: boolean) => void;
  setSelectedError: (errorId?: string) => void;

  // Selectors
  getErrorsByLevel: (level: ErrorLevel) => ErrorInfo[];
  getErrorsByCategory: (category: ErrorCategory) => ErrorInfo[];
  getRecentErrors: (count?: number) => ErrorInfo[];
  getCriticalErrors: () => ErrorInfo[];
  getUnresolvedErrors: () => ErrorInfo[];
}

// Initial statistics data structure
const INITIAL_STATS: ErrorStats = {
  totalErrors: 0,
  errorsByCategory: {
    game: 0,
    audio: 0,
    storage: 0,
    network: 0,
    ui: 0,
    validation: 0,
    system: 0,
    unknown: 0,
  },
  errorsByLevel: {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  },
  recentErrors: [],
};

// Statistics update function with category and level aggregation
const updateStats = (errors: ErrorInfo[]): ErrorStats => {
  const stats: ErrorStats = {
    totalErrors: errors.length,
    errorsByCategory: { ...INITIAL_STATS.errorsByCategory },
    errorsByLevel: { ...INITIAL_STATS.errorsByLevel },
    recentErrors: errors.slice(-10).reverse(),
  };

  if (errors.length > 0) {
    const lastError = errors[errors.length - 1];
    if (lastError) {
      stats.lastErrorTime = lastError.context.timestamp;
    }
  }

  errors.forEach((error) => {
    stats.errorsByCategory[error.category]++;
    stats.errorsByLevel[error.level]++;
  });

  return stats;
};

// Zustand store with persistence for configuration only
export const useErrorStore = create<ErrorState>()(
  persist(
    (set, get) => ({
      errors: [],
      stats: INITIAL_STATS,
      config: DEFAULT_ERROR_CONFIG,
      showErrorPanel: false,

      addError: (error: ErrorInfo) => {
        set((state) => {
          const newErrors = [...state.errors, error];

          // Enforce maximum stored error limit
          if (newErrors.length > state.config.maxStoredErrors) {
            newErrors.shift();
          }

          return {
            errors: newErrors,
            stats: updateStats(newErrors),
          };
        });
      },

      removeError: (errorId: string) => {
        set((state) => {
          const newErrors = state.errors.filter((error) => error.id !== errorId);
          const updates: Partial<ErrorState> = {
            errors: newErrors,
            stats: updateStats(newErrors),
          };

          if (state.selectedErrorId === errorId) {
            delete updates.selectedErrorId;
          }

          return updates;
        });
      },

      clearErrors: () => {
        set({
          errors: [],
          stats: INITIAL_STATS,
        });
      },

      clearErrorsByCategory: (category: ErrorCategory) => {
        set((state) => {
          const newErrors = state.errors.filter((error) => error.category !== category);
          return {
            errors: newErrors,
            stats: updateStats(newErrors),
          };
        });
      },

      markErrorAsResolved: (errorId: string) => {
        // Mark as resolved by removing the error
        get().removeError(errorId);
      },

      updateConfig: (newConfig: Partial<ErrorReportConfig>) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },

      setShowErrorPanel: (show: boolean) => {
        set({ showErrorPanel: show });
      },

      setSelectedError: (errorId?: string) => {
        if (errorId === undefined) {
          set((state) => {
            const { selectedErrorId, ...rest } = state;
            void selectedErrorId; // Explicitly mark as intentionally unused
            return rest;
          });
        } else {
          set({ selectedErrorId: errorId });
        }
      },

      // Selector functions for efficient state access
      getErrorsByLevel: (level: ErrorLevel) => {
        return get().errors.filter((error) => error.level === level);
      },

      getErrorsByCategory: (category: ErrorCategory) => {
        return get().errors.filter((error) => error.category === category);
      },

      getRecentErrors: (count = 5) => {
        return get().errors.slice(-count).reverse();
      },

      getCriticalErrors: () => {
        return get().errors.filter((error) => error.level === 'critical');
      },

      getUnresolvedErrors: () => {
        // All errors are considered unresolved until deleted
        return get().errors;
      },
    }),
    {
      name: 'tetris-error-store',
      version: 1,

      // Filter persisted values (errors are not persisted for privacy)
      partialize: (state) => ({
        config: state.config,
        // Error data not persisted (reset per session for privacy)
      }),

      // Rehydration handling - clear error data on startup
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clear error data and reset statistics on rehydration
          state.errors = [];
          state.stats = INITIAL_STATS;
          state.showErrorPanel = false;
          delete state.selectedErrorId;
        }
      },
    }
  )
);

// Optimized selector functions to prevent unnecessary re-renders
export const useErrors = () => useErrorStore((state) => state.errors);
export const useErrorStats = () => useErrorStore((state) => state.stats);
export const useErrorConfig = () => useErrorStore((state) => state.config);
export const useShowErrorPanel = () => useErrorStore((state) => state.showErrorPanel);
export const useSelectedErrorId = () => useErrorStore((state) => state.selectedErrorId);

// Action functions for error management
export const useErrorActions = () =>
  useErrorStore((state) => ({
    addError: state.addError,
    removeError: state.removeError,
    clearErrors: state.clearErrors,
    clearErrorsByCategory: state.clearErrorsByCategory,
    markErrorAsResolved: state.markErrorAsResolved,
    updateConfig: state.updateConfig,
    setShowErrorPanel: state.setShowErrorPanel,
    setSelectedError: state.setSelectedError,
  }));

// Selector functions for data filtering
export const useErrorSelectors = () =>
  useErrorStore((state) => ({
    getErrorsByLevel: state.getErrorsByLevel,
    getErrorsByCategory: state.getErrorsByCategory,
    getRecentErrors: state.getRecentErrors,
    getCriticalErrors: state.getCriticalErrors,
    getUnresolvedErrors: state.getUnresolvedErrors,
  }));

// Error store and error handler integration
export const initializeErrorStoreIntegration = () => {
  // Connect error handler to error store for centralized error management
  if (typeof window !== 'undefined') {
    import('../utils/data/errorHandler').then(({ errorHandler }) => {
      errorHandler.onError((errorInfo: ErrorInfo) => {
        useErrorStore.getState().addError(errorInfo);
      });
    });
  }
};

// Custom hook: simplified error statistics for UI components
export const useErrorSummary = () => {
  const stats = useErrorStats();

  return {
    totalErrors: stats.totalErrors,
    criticalCount: stats.errorsByLevel.critical,
    errorCount: stats.errorsByLevel.error,
    warningCount: stats.errorsByLevel.warning,
    hasErrors: stats.totalErrors > 0,
    hasCritical: stats.errorsByLevel.critical > 0,
    lastErrorTime: stats.lastErrorTime,
  };
};

// Custom hook: error filtering by severity level
export const useErrorsByLevel = (level: ErrorLevel) => {
  return useErrorStore((state) => state.getErrorsByLevel(level));
};

// Custom hook: error filtering by category type
export const useErrorsByCategory = (category: ErrorCategory) => {
  return useErrorStore((state) => state.getErrorsByCategory(category));
};
