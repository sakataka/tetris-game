import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ErrorInfo, 
  ErrorLevel, 
  ErrorCategory,
  ErrorStats,
  ErrorReportConfig,
  DEFAULT_ERROR_CONFIG
} from '../types/errors';

// エラーストアの状態型定義
export interface ErrorState {
  // エラー一覧
  errors: ErrorInfo[];
  
  // エラー統計
  stats: ErrorStats;
  
  // 設定
  config: ErrorReportConfig;
  
  // UI状態
  showErrorPanel: boolean;
  selectedErrorId?: string;
  
  // アクション
  addError: (error: ErrorInfo) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  clearErrorsByCategory: (category: ErrorCategory) => void;
  markErrorAsResolved: (errorId: string) => void;
  updateConfig: (config: Partial<ErrorReportConfig>) => void;
  setShowErrorPanel: (show: boolean) => void;
  setSelectedError: (errorId?: string) => void;
  
  // セレクター
  getErrorsByLevel: (level: ErrorLevel) => ErrorInfo[];
  getErrorsByCategory: (category: ErrorCategory) => ErrorInfo[];
  getRecentErrors: (count?: number) => ErrorInfo[];
  getCriticalErrors: () => ErrorInfo[];
  getUnresolvedErrors: () => ErrorInfo[];
}

// 初期統計データ
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
    unknown: 0
  },
  errorsByLevel: {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0
  },
  recentErrors: [],
  lastErrorTime: undefined
};

// 統計の更新関数
const updateStats = (errors: ErrorInfo[]): ErrorStats => {
  const stats: ErrorStats = {
    totalErrors: errors.length,
    errorsByCategory: { ...INITIAL_STATS.errorsByCategory },
    errorsByLevel: { ...INITIAL_STATS.errorsByLevel },
    recentErrors: errors.slice(-10).reverse(),
    lastErrorTime: errors.length > 0 ? errors[errors.length - 1].context.timestamp : undefined
  };

  errors.forEach(error => {
    stats.errorsByCategory[error.category]++;
    stats.errorsByLevel[error.level]++;
  });

  return stats;
};

// Zustandストア
export const useErrorStore = create<ErrorState>()(
  persist(
    (set, get) => ({
      errors: [],
      stats: INITIAL_STATS,
      config: DEFAULT_ERROR_CONFIG,
      showErrorPanel: false,
      selectedErrorId: undefined,

      addError: (error: ErrorInfo) => {
        set(state => {
          const newErrors = [...state.errors, error];
          
          // 最大保存数の制限
          if (newErrors.length > state.config.maxStoredErrors) {
            newErrors.shift();
          }
          
          return {
            errors: newErrors,
            stats: updateStats(newErrors)
          };
        });
      },

      removeError: (errorId: string) => {
        set(state => {
          const newErrors = state.errors.filter(error => error.id !== errorId);
          return {
            errors: newErrors,
            stats: updateStats(newErrors),
            selectedErrorId: state.selectedErrorId === errorId ? undefined : state.selectedErrorId
          };
        });
      },

      clearErrors: () => {
        set({
          errors: [],
          stats: INITIAL_STATS,
          selectedErrorId: undefined
        });
      },

      clearErrorsByCategory: (category: ErrorCategory) => {
        set(state => {
          const newErrors = state.errors.filter(error => error.category !== category);
          return {
            errors: newErrors,
            stats: updateStats(newErrors)
          };
        });
      },

      markErrorAsResolved: (errorId: string) => {
        // エラーを削除することで解決とする
        get().removeError(errorId);
      },

      updateConfig: (newConfig: Partial<ErrorReportConfig>) => {
        set(state => ({
          config: { ...state.config, ...newConfig }
        }));
      },

      setShowErrorPanel: (show: boolean) => {
        set({ showErrorPanel: show });
      },

      setSelectedError: (errorId?: string) => {
        set({ selectedErrorId: errorId });
      },

      // セレクター関数
      getErrorsByLevel: (level: ErrorLevel) => {
        return get().errors.filter(error => error.level === level);
      },

      getErrorsByCategory: (category: ErrorCategory) => {
        return get().errors.filter(error => error.category === category);
      },

      getRecentErrors: (count: number = 5) => {
        return get().errors.slice(-count).reverse();
      },

      getCriticalErrors: () => {
        return get().errors.filter(error => error.level === 'critical');
      },

      getUnresolvedErrors: () => {
        // すべてのエラーが未解決として扱われる（削除されるまで）
        return get().errors;
      }
    }),
    {
      name: 'tetris-error-store',
      version: 1,
      
      // ストレージに保存する値をフィルタリング（エラーは永続化しない）
      partialize: (state) => ({
        config: state.config,
        // エラーデータは永続化しない（セッション毎にリセット）
      }),
      
      // 復元時の処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 復元時はエラーデータをクリアして統計を初期化
          state.errors = [];
          state.stats = INITIAL_STATS;
          state.showErrorPanel = false;
          state.selectedErrorId = undefined;
        }
      }
    }
  )
);

// セレクター関数（パフォーマンス最適化）
export const useErrors = () => useErrorStore(state => state.errors);
export const useErrorStats = () => useErrorStore(state => state.stats);
export const useErrorConfig = () => useErrorStore(state => state.config);
export const useShowErrorPanel = () => useErrorStore(state => state.showErrorPanel);
export const useSelectedErrorId = () => useErrorStore(state => state.selectedErrorId);

// アクション関数
export const useErrorActions = () => useErrorStore(state => ({
  addError: state.addError,
  removeError: state.removeError,
  clearErrors: state.clearErrors,
  clearErrorsByCategory: state.clearErrorsByCategory,
  markErrorAsResolved: state.markErrorAsResolved,
  updateConfig: state.updateConfig,
  setShowErrorPanel: state.setShowErrorPanel,
  setSelectedError: state.setSelectedError
}));

// セレクター関数
export const useErrorSelectors = () => useErrorStore(state => ({
  getErrorsByLevel: state.getErrorsByLevel,
  getErrorsByCategory: state.getErrorsByCategory,
  getRecentErrors: state.getRecentErrors,
  getCriticalErrors: state.getCriticalErrors,
  getUnresolvedErrors: state.getUnresolvedErrors
}));

// エラーストアとエラーハンドラーの連携
export const initializeErrorStoreIntegration = () => {
  // エラーハンドラーからエラーストアにエラーを追加
  if (typeof window !== 'undefined') {
    import('../utils/errorHandler').then(({ errorHandler }) => {
      errorHandler.onError((errorInfo: ErrorInfo) => {
        useErrorStore.getState().addError(errorInfo);
      });
    });
  }
};

// カスタムフック：エラー統計の簡易表示
export const useErrorSummary = () => {
  const stats = useErrorStats();
  
  return {
    totalErrors: stats.totalErrors,
    criticalCount: stats.errorsByLevel.critical,
    errorCount: stats.errorsByLevel.error,
    warningCount: stats.errorsByLevel.warning,
    hasErrors: stats.totalErrors > 0,
    hasCritical: stats.errorsByLevel.critical > 0,
    lastErrorTime: stats.lastErrorTime
  };
};

// カスタムフック：エラーレベル別フィルタリング
export const useErrorsByLevel = (level: ErrorLevel) => {
  return useErrorStore(state => state.getErrorsByLevel(level));
};

// カスタムフック：エラーカテゴリ別フィルタリング
export const useErrorsByCategory = (category: ErrorCategory) => {
  return useErrorStore(state => state.getErrorsByCategory(category));
};