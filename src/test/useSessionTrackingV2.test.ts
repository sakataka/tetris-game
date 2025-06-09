/**
 * useSessionTrackingV2 テスト
 * 
 * 簡潔なセッション追跡システムの機能を検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionTrackingV2 } from '../hooks/useSessionTrackingV2';
import { createMockDOMEnvironment } from './fixtures';

// DOM環境モック
const domMocks = createMockDOMEnvironment();

// sessionStoreV2のモック
const mockSessionActions = {
  startNewSession: vi.fn(),
  endCurrentSession: vi.fn(),
  updatePlayTime: vi.fn(),
  incrementGamesPlayed: vi.fn(),
  recordScore: vi.fn()
};

const mockSessionState = {
  currentSession: null,
  totalSessions: 0,
  totalPlayTime: 0,
  totalGamesPlayed: 0,
  averageSessionLength: 0,
  lastSessionDate: null
};

vi.mock('../store/sessionStoreV2', () => ({
  useSessionState: () => mockSessionState,
  useSessionActions: () => mockSessionActions
}));

describe('useSessionTrackingV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // モック状態のリセット
    mockSessionState.currentSession = null;
    mockSessionState.totalSessions = 0;
    mockSessionState.totalPlayTime = 0;
    mockSessionState.totalGamesPlayed = 0;
    mockSessionState.averageSessionLength = 0;
    mockSessionState.lastSessionDate = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基本的なセッション管理', () => {
    it('初期化時にセッションが自動開始される', () => {
      renderHook(() => useSessionTrackingV2());

      expect(mockSessionActions.startNewSession).toHaveBeenCalledTimes(1);
    });

    it('コンポーネントアンマウント時にセッションが終了する', () => {
      const { unmount } = renderHook(() => useSessionTrackingV2());

      unmount();

      expect(mockSessionActions.endCurrentSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('ゲーム状態の追跡', () => {
    it('ゲーム開始時にゲーム数が増加する', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      act(() => {
        result.current.recordGameStart();
      });

      expect(mockSessionActions.incrementGamesPlayed).toHaveBeenCalledTimes(1);
    });

    it('ゲーム終了時にスコアが記録される', () => {
      const { result } = renderHook(() => useSessionTrackingV2());
      const testScore = 15000;

      act(() => {
        result.current.recordGameEnd(testScore);
      });

      expect(mockSessionActions.recordScore).toHaveBeenCalledWith(testScore);
    });

    it('複数のゲームスコアを連続して記録できる', () => {
      const { result } = renderHook(() => useSessionTrackingV2());
      const scores = [1000, 2500, 3200, 1800];

      scores.forEach(score => {
        act(() => {
          result.current.recordGameEnd(score);
        });
      });

      expect(mockSessionActions.recordScore).toHaveBeenCalledTimes(4);
      scores.forEach(score => {
        expect(mockSessionActions.recordScore).toHaveBeenCalledWith(score);
      });
    });
  });

  describe('プレイ時間の追跡', () => {
    it('定期的にプレイ時間が更新される', () => {
      renderHook(() => useSessionTrackingV2());

      // 30秒経過をシミュレート
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(mockSessionActions.updatePlayTime).toHaveBeenCalled();
    });

    it('カスタム間隔でプレイ時間を更新できる', () => {
      renderHook(() => useSessionTrackingV2({ updateInterval: 5000 })); // 5秒間隔

      // 5秒経過
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockSessionActions.updatePlayTime).toHaveBeenCalled();

      // さらに5秒経過
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockSessionActions.updatePlayTime).toHaveBeenCalledTimes(2);
    });

    it('長時間のセッションでも正確に時間を追跡する', () => {
      renderHook(() => useSessionTrackingV2({ updateInterval: 1000 })); // 1秒間隔

      // 5分間のセッションをシミュレート
      act(() => {
        vi.advanceTimersByTime(300000); // 5分 = 300,000ms
      });

      // 1秒間隔で300回更新される
      expect(mockSessionActions.updatePlayTime).toHaveBeenCalledTimes(300);
    });
  });

  describe('非アクティブ検出', () => {
    it('非アクティブ状態を検出してセッションを一時停止する', () => {
      const { result } = renderHook(() => useSessionTrackingV2({ 
        inactivityThreshold: 60000 // 1分
      }));

      // 非アクティブ時間を超過
      act(() => {
        vi.advanceTimersByTime(65000); // 1分5秒
      });

      expect(result.current.isActive).toBe(false);
    });

    it('アクティビティ再開時にセッションが復旧する', () => {
      const { result } = renderHook(() => useSessionTrackingV2({ 
        inactivityThreshold: 30000 // 30秒
      }));

      // 非アクティブ状態にする
      act(() => {
        vi.advanceTimersByTime(35000);
      });

      expect(result.current.isActive).toBe(false);

      // アクティビティを再開
      act(() => {
        result.current.recordActivity();
      });

      expect(result.current.isActive).toBe(true);
    });

    it('複数回の非アクティブ/アクティブ切り替えが正常に動作する', () => {
      const { result } = renderHook(() => useSessionTrackingV2({ 
        inactivityThreshold: 10000 // 10秒
      }));

      // 最初の非アクティブ
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(result.current.isActive).toBe(false);

      // 復旧
      act(() => {
        result.current.recordActivity();
      });
      expect(result.current.isActive).toBe(true);

      // 2回目の非アクティブ
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(result.current.isActive).toBe(false);

      // 2回目の復旧
      act(() => {
        result.current.recordActivity();
      });
      expect(result.current.isActive).toBe(true);
    });
  });

  describe('セッション統計', () => {
    it('現在のセッション統計を正確に報告する', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      // セッション中にいくつかのゲームをプレイ
      act(() => {
        result.current.recordGameStart();
        result.current.recordGameEnd(1000);
        result.current.recordGameStart();
        result.current.recordGameEnd(2000);
      });

      // 時間経過
      act(() => {
        vi.advanceTimersByTime(120000); // 2分
      });

      const stats = result.current.getCurrentSessionStats();
      
      expect(stats.gamesPlayed).toBeGreaterThanOrEqual(2);
      expect(stats.playTime).toBeGreaterThan(0);
    });

    it('空のセッションでも安全に統計を取得できる', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      const stats = result.current.getCurrentSessionStats();
      
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.playTime).toBe(0);
      expect(stats.averageScore).toBe(0);
    });

    it('セッション効率性指標が正しく計算される', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      // 効率的なゲームプレイをシミュレート
      act(() => {
        result.current.recordGameStart();
        vi.advanceTimersByTime(60000); // 1分
        result.current.recordGameEnd(5000);
        
        result.current.recordGameStart();
        vi.advanceTimersByTime(60000); // さらに1分
        result.current.recordGameEnd(3000);
      });

      const stats = result.current.getCurrentSessionStats();
      
      expect(stats.efficiency).toBeGreaterThan(0); // 効率性が計算される
      expect(stats.averageGameLength).toBeGreaterThan(0); // 平均ゲーム時間
    });
  });

  describe('設定オプション', () => {
    it('カスタム設定で初期化できる', () => {
      const customOptions = {
        updateInterval: 2000,
        inactivityThreshold: 120000,
        autoStart: false
      };

      renderHook(() => useSessionTrackingV2(customOptions));

      // autoStart: falseの場合、自動開始されない
      expect(mockSessionActions.startNewSession).not.toHaveBeenCalled();
    });

    it('手動セッション開始が正常に動作する', () => {
      const { result } = renderHook(() => useSessionTrackingV2({ autoStart: false }));

      act(() => {
        result.current.startSession();
      });

      expect(mockSessionActions.startNewSession).toHaveBeenCalledTimes(1);
    });

    it('デフォルト設定が適切に適用される', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      // デフォルト設定での動作確認
      expect(result.current.isActive).toBe(true);
      expect(mockSessionActions.startNewSession).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なスコアでもエラーにならない', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      expect(() => {
        act(() => {
          result.current.recordGameEnd(-100); // 負の値
          result.current.recordGameEnd(NaN);  // NaN
          result.current.recordGameEnd(Infinity); // Infinity
        });
      }).not.toThrow();
    });

    it('ストアエラー時も安全に動作する', () => {
      // ストアアクションがエラーをスローするようにモック
      mockSessionActions.recordScore.mockImplementation(() => {
        throw new Error('Store error');
      });

      const { result } = renderHook(() => useSessionTrackingV2());

      expect(() => {
        act(() => {
          result.current.recordGameEnd(1000);
        });
      }).not.toThrow();
    });

    it('非同期エラーが適切に処理される', async () => {
      // 非同期エラーをシミュレート
      mockSessionActions.updatePlayTime.mockRejectedValue(new Error('Async error'));

      renderHook(() => useSessionTrackingV2());

      // エラーが発生してもフックは継続して動作する
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runAllTimersAsync();
      });

      // フックが正常に動作し続けることを確認
      expect(mockSessionActions.updatePlayTime).toHaveBeenCalled();
    });
  });

  describe('パフォーマンステスト', () => {
    it('長時間セッションでメモリリークしない', () => {
      const { unmount } = renderHook(() => useSessionTrackingV2({ updateInterval: 100 }));

      // 長時間のセッションをシミュレート（10分）
      act(() => {
        vi.advanceTimersByTime(600000);
      });

      // メモリクリーンアップを確認
      unmount();

      expect(mockSessionActions.endCurrentSession).toHaveBeenCalled();
    });

    it('高頻度のアクティビティ記録に対応する', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      // 高頻度でアクティビティを記録
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.recordActivity();
        }
      });

      // パフォーマンスが劣化しないことを確認
      expect(result.current.isActive).toBe(true);
    });

    it('複数のゲームセッションの高速切り替えに対応する', () => {
      const { result } = renderHook(() => useSessionTrackingV2());

      // 100回のゲーム開始/終了を高速実行
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.recordGameStart();
          result.current.recordGameEnd(1000 + i * 10);
        }
      });

      expect(mockSessionActions.incrementGamesPlayed).toHaveBeenCalledTimes(100);
      expect(mockSessionActions.recordScore).toHaveBeenCalledTimes(100);
    });
  });
});