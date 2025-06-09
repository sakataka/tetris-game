/**
 * errorStore テスト
 * 
 * 統一エラー管理システムの機能を検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { createMockDOMEnvironment } from './fixtures';
import type { ErrorInfo, ErrorLevel, ErrorCategory } from '../types/errors';

// DOM環境モック
const domMocks = createMockDOMEnvironment();

// 実際のストアをインポート
import { useErrorStore } from '../store/errorStore';

describe('errorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // ストアを初期状態にリセット
    act(() => {
      useErrorStore.getState().clearErrors();
    });
  });

  describe('基本的なエラー管理', () => {
    it('エラーを正常に追加できる', () => {
      const testError: ErrorInfo = {
        id: 'test-error-1',
        message: 'Test error',
        level: 'error',
        category: 'system',
        context: {
          timestamp: Date.now(),
          component: 'TestComponent'
        },
        recoverable: true,
        retryable: false
      };

      act(() => {
        useErrorStore.getState().addError(testError);
      });

      const state = useErrorStore.getState();
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0].message).toBe('Test error');
      expect(state.errors[0].level).toBe('error');
    });

    it('複数のエラーを管理できる', () => {
      const errors: ErrorInfo[] = [
        {
          id: '1',
          message: 'Error 1',
          level: 'error',
          category: 'game',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: '2',
          message: 'Warning 1',
          level: 'warning',
          category: 'ui',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: '3',
          message: 'Info 1',
          level: 'info',
          category: 'system',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        }
      ];

      errors.forEach(error => {
        act(() => {
          useErrorStore.getState().addError(error);
        });
      });

      const state = useErrorStore.getState();
      expect(state.errors).toHaveLength(3);
    });

    it('エラーを個別に削除できる', () => {
      const error1: ErrorInfo = {
        id: 'remove-1',
        message: 'Error to remove',
        level: 'error',
        category: 'system',
        context: { timestamp: Date.now() },
        recoverable: true,
        retryable: false
      };

      const error2: ErrorInfo = {
        id: 'keep-1',
        message: 'Error to keep',
        level: 'error',
        category: 'system',
        context: { timestamp: Date.now() },
        recoverable: true,
        retryable: false
      };

      act(() => {
        useErrorStore.getState().addError(error1);
        useErrorStore.getState().addError(error2);
      });

      act(() => {
        useErrorStore.getState().removeError('remove-1');
      });

      const state = useErrorStore.getState();
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0].id).toBe('keep-1');
    });

    it('すべてのエラーをクリアできる', () => {
      // 複数のエラーを追加
      for (let i = 0; i < 5; i++) {
        act(() => {
          useErrorStore.getState().addError({
            id: `error-${i}`,
            message: `Error ${i}`,
            level: 'error',
            category: 'system',
            context: { timestamp: Date.now() },
            recoverable: true,
            retryable: false
          });
        });
      }

      expect(useErrorStore.getState().errors).toHaveLength(5);

      act(() => {
        useErrorStore.getState().clearErrors();
      });

      expect(useErrorStore.getState().errors).toHaveLength(0);
    });
  });

  describe('エラーのフィルタリング', () => {
    beforeEach(() => {
      // テスト用のエラーセットを作成
      const testErrors: ErrorInfo[] = [
        {
          id: 'critical-1',
          message: 'Critical error',
          level: 'critical',
          category: 'system',
          context: { timestamp: Date.now() },
          recoverable: false,
          retryable: false
        },
        {
          id: 'error-1',
          message: 'Normal error',
          level: 'error',
          category: 'game',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: true
        },
        {
          id: 'warning-1',
          message: 'Warning message',
          level: 'warning',
          category: 'audio',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        }
      ];

      testErrors.forEach(error => {
        act(() => {
          useErrorStore.getState().addError(error);
        });
      });
    });

    it('レベル別にエラーを取得できる', () => {
      const criticalErrors = useErrorStore.getState().getErrorsByLevel('critical');
      const normalErrors = useErrorStore.getState().getErrorsByLevel('error');
      const warnings = useErrorStore.getState().getErrorsByLevel('warning');

      expect(criticalErrors).toHaveLength(1);
      expect(normalErrors).toHaveLength(1);
      expect(warnings).toHaveLength(1);
    });

    it('カテゴリ別にエラーを取得できる', () => {
      const systemErrors = useErrorStore.getState().getErrorsByCategory('system');
      const gameErrors = useErrorStore.getState().getErrorsByCategory('game');
      const audioErrors = useErrorStore.getState().getErrorsByCategory('audio');

      expect(systemErrors).toHaveLength(1);
      expect(gameErrors).toHaveLength(1);
      expect(audioErrors).toHaveLength(1);
    });

    it('重要なエラーのみを取得できる', () => {
      const criticalErrors = useErrorStore.getState().getCriticalErrors();
      
      expect(criticalErrors).toHaveLength(1);
      expect(criticalErrors[0].level).toBe('critical');
    });

    it('最近のエラーを取得できる', () => {
      const recentErrors = useErrorStore.getState().getRecentErrors(2);
      
      expect(recentErrors).toHaveLength(2);
      // 新しい順に返される
      expect(recentErrors[0].id).toBe('warning-1');
      expect(recentErrors[1].id).toBe('error-1');
    });
  });

  describe('エラー統計', () => {
    it('エラー統計が正しく計算される', () => {
      const errors: ErrorInfo[] = [
        {
          id: '1',
          message: 'Error 1',
          level: 'error',
          category: 'game',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: '2',
          message: 'Error 2',
          level: 'error',
          category: 'audio',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: '3',
          message: 'Warning 1',
          level: 'warning',
          category: 'ui',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        }
      ];

      errors.forEach(error => {
        act(() => {
          useErrorStore.getState().addError(error);
        });
      });

      const stats = useErrorStore.getState().stats;
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByLevel.error).toBe(2);
      expect(stats.errorsByLevel.warning).toBe(1);
      expect(stats.errorsByCategory.game).toBe(1);
      expect(stats.errorsByCategory.audio).toBe(1);
      expect(stats.errorsByCategory.ui).toBe(1);
    });

    it('エラークリア後に統計がリセットされる', () => {
      // エラーを追加
      act(() => {
        useErrorStore.getState().addError({
          id: 'stat-test',
          message: 'Test error',
          level: 'error',
          category: 'system',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        });
      });

      expect(useErrorStore.getState().stats.totalErrors).toBe(1);

      act(() => {
        useErrorStore.getState().clearErrors();
      });

      const stats = useErrorStore.getState().stats;
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByLevel.error).toBe(0);
    });
  });

  describe('カテゴリ別エラークリア', () => {
    it('特定カテゴリのエラーのみクリアできる', () => {
      const errors: ErrorInfo[] = [
        {
          id: 'game-1',
          message: 'Game error',
          level: 'error',
          category: 'game',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: 'audio-1',
          message: 'Audio error',
          level: 'error',
          category: 'audio',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        },
        {
          id: 'game-2',
          message: 'Another game error',
          level: 'error',
          category: 'game',
          context: { timestamp: Date.now() },
          recoverable: true,
          retryable: false
        }
      ];

      errors.forEach(error => {
        act(() => {
          useErrorStore.getState().addError(error);
        });
      });

      act(() => {
        useErrorStore.getState().clearErrorsByCategory('game');
      });

      const state = useErrorStore.getState();
      expect(state.errors).toHaveLength(1);
      expect(state.errors[0].category).toBe('audio');
    });
  });

  describe('エラーパネルUI管理', () => {
    it('エラーパネルの表示状態を管理できる', () => {
      expect(useErrorStore.getState().showErrorPanel).toBe(false);

      act(() => {
        useErrorStore.getState().setShowErrorPanel(true);
      });

      expect(useErrorStore.getState().showErrorPanel).toBe(true);

      act(() => {
        useErrorStore.getState().setShowErrorPanel(false);
      });

      expect(useErrorStore.getState().showErrorPanel).toBe(false);
    });

    it('選択されたエラーIDを管理できる', () => {
      expect(useErrorStore.getState().selectedErrorId).toBeUndefined();

      act(() => {
        useErrorStore.getState().setSelectedError('error-123');
      });

      expect(useErrorStore.getState().selectedErrorId).toBe('error-123');

      act(() => {
        useErrorStore.getState().setSelectedError(undefined);
      });

      expect(useErrorStore.getState().selectedErrorId).toBeUndefined();
    });
  });

  describe('設定管理', () => {
    it('エラー設定を更新できる', () => {
      const initialConfig = useErrorStore.getState().config;
      
      act(() => {
        useErrorStore.getState().updateConfig({
          maxStoredErrors: 50,
          autoCleanupInterval: 60000
        });
      });

      const updatedConfig = useErrorStore.getState().config;
      expect(updatedConfig.maxStoredErrors).toBe(50);
      expect(updatedConfig.autoCleanupInterval).toBe(60000);
    });
  });

  describe('最大保存数制限', () => {
    it('maxStoredErrorsを超えた場合、古いエラーから削除される', () => {
      // 設定を小さくする
      act(() => {
        useErrorStore.getState().updateConfig({ maxStoredErrors: 3 });
      });

      // 4つのエラーを追加
      for (let i = 0; i < 4; i++) {
        act(() => {
          useErrorStore.getState().addError({
            id: `limited-${i}`,
            message: `Error ${i}`,
            level: 'error',
            category: 'system',
            context: { timestamp: Date.now() + i }, // 順序を保証
            recoverable: true,
            retryable: false
          });
        });
      }

      const state = useErrorStore.getState();
      expect(state.errors).toHaveLength(3);
      expect(state.errors[0].id).toBe('limited-1'); // 最初のエラーが削除される
      expect(state.errors[2].id).toBe('limited-3'); // 最新のエラーが残る
    });
  });
});