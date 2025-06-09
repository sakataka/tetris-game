/**
 * タイマー修正の直接検証テスト
 * 
 * useTimerAnimationのdeltaTime累積ロジックを
 * 実際のコンポーネント環境で検証する
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';

// useAnimationFrameのモック
vi.mock('../utils/animation/animationManager', () => {
  const mockAnimations = new Map<string, (deltaTime: number) => void>();
  
  return {
    animationManager: {
      registerAnimation: vi.fn((id: string, callback: (deltaTime: number) => void) => {
        mockAnimations.set(id, callback);
      }),
      unregisterAnimation: vi.fn((id: string) => {
        mockAnimations.delete(id);
      }),
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
      stopAll: vi.fn(),
      getStats: vi.fn(() => ({
        totalFrames: 0,
        droppedFrames: 0,
        averageFrameTime: 0,
        activeAnimations: 0,
        isPaused: false,
        isReducedMotion: false,
        globalFPSLimit: 60
      })),
      // テスト用のヘルパー関数
      _getMockAnimations: () => mockAnimations,
      _clearMockAnimations: () => { mockAnimations.clear(); },
      _triggerAnimation: (deltaTime: number) => {
        mockAnimations.forEach(callback => callback(deltaTime));
      }
    }
  };
});

describe('タイマー修正の直接検証', () => {
  let mockAnimationManager: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { animationManager } = await import('../utils/animation/animationManager');
    mockAnimationManager = animationManager;
    mockAnimationManager._clearMockAnimations();
  });

  describe('基本的なタイマー累積ロジック', () => {
    it('1秒間隔で正確に実行される', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      renderHook(() => useTimerAnimation(testCallback, 1000, [testCallback], { enabled: true }));

      // 60fpsで1秒分実行
      for (let i = 0; i < 60; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }

      expect(callCount).toBe(1);
      expect(testCallback).toHaveBeenCalledTimes(1);
    });

    it('短い間隔で連続実行される', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      renderHook(() => useTimerAnimation(testCallback, 100, [testCallback], { enabled: true }));

      // 1秒分実行（100ms間隔なので10回実行予想）
      for (let i = 0; i < 60; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }

      expect(callCount).toBe(10);
      expect(testCallback).toHaveBeenCalledTimes(10);
    });

    it('累積時間のリセット機能', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      const { rerender } = renderHook(
        ({ interval }) => useTimerAnimation(testCallback, interval, [testCallback], { enabled: true }),
        { initialProps: { interval: 500 } }
      );

      // 300ms分実行（まだ発火しない）
      for (let i = 0; i < 18; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }
      expect(callCount).toBe(0);

      // 間隔を200msに変更（累積時間リセット）
      rerender({ interval: 200 });

      // さらに200ms分実行
      for (let i = 0; i < 12; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }

      // 新しい間隔で1回実行される
      expect(callCount).toBe(1);
    });
  });

  describe('ゲーム実用性の確認', () => {
    it('ピース落下シミュレーション（800ms間隔）', () => {
      let dropCount = 0;
      const mockDropPiece = vi.fn(() => dropCount++);

      renderHook(() => useTimerAnimation(mockDropPiece, 800, [mockDropPiece], { enabled: true }));

      // 4秒分実行（約5回落下予想）
      const fourSeconds = 4000;
      const frameInterval = 16.67;
      const frameCount = Math.floor(fourSeconds / frameInterval);

      for (let i = 0; i < frameCount; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(frameInterval);
        });
      }

      expect(dropCount).toBeGreaterThanOrEqual(4);
      expect(dropCount).toBeLessThanOrEqual(6);
    });

    it('レベル上昇時の高速化（1000ms→300ms）', () => {
      let level1Drops = 0;
      let level5Drops = 0;

      const mockLevel1Drop = vi.fn(() => level1Drops++);
      const mockLevel5Drop = vi.fn(() => level5Drops++);

      // レベル1: 1000ms間隔で2秒実行
      const { unmount: unmount1 } = renderHook(() => 
        useTimerAnimation(mockLevel1Drop, 1000, [mockLevel1Drop], { enabled: true })
      );

      for (let i = 0; i < 120; i++) { // 2秒 * 60fps
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }
      unmount1();

      // アニメーションをクリア
      mockAnimationManager._clearMockAnimations();

      // レベル5: 300ms間隔で同じ2秒実行
      renderHook(() => 
        useTimerAnimation(mockLevel5Drop, 300, [mockLevel5Drop], { enabled: true })
      );

      for (let i = 0; i < 120; i++) { // 2秒 * 60fps
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }

      // レベル5がより多く実行される
      expect(level5Drops).toBeGreaterThan(level1Drops * 2);
      expect(level1Drops).toBe(2); // 2000ms / 1000ms = 2回
      expect(level5Drops).toBe(6); // 2000ms / 300ms ≈ 6.67回
    });
  });

  describe('精度とエッジケース', () => {
    it('余剰時間の正確な管理', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      renderHook(() => useTimerAnimation(testCallback, 50, [testCallback], { enabled: true })); // 50ms間隔

      // 正確に50msずつ実行
      for (let i = 0; i < 10; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(50); // 正確に50ms
        });
      }

      expect(callCount).toBe(10);
    });

    it('不規則なdeltaTimeでも安定動作', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      renderHook(() => useTimerAnimation(testCallback, 100, [testCallback], { enabled: true }));

      // 不規則なdeltaTime
      const irregularDeltas = [15, 20, 12, 18, 25, 10, 30, 16];
      let totalTime = 0;

      for (const delta of irregularDeltas) {
        totalTime += delta;
        act(() => {
          mockAnimationManager._triggerAnimation(delta);
        });
      }

      // 合計136msなので1回実行される
      expect(callCount).toBe(1);
      expect(totalTime).toBe(136);
    });

    it('enabled/disabled切り替えの正常動作', () => {
      let callCount = 0;
      const testCallback = vi.fn(() => callCount++);

      const { rerender } = renderHook(
        ({ enabled }) => useTimerAnimation(testCallback, 100, [testCallback], { enabled }),
        { initialProps: { enabled: true } }
      );

      // 有効時に50ms実行
      for (let i = 0; i < 3; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }
      expect(callCount).toBe(0); // まだ100msに達していない

      // 無効化
      rerender({ enabled: false });

      // さらに100ms実行（無効なので実行されない）
      for (let i = 0; i < 6; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }
      expect(callCount).toBe(0);

      // 再有効化
      rerender({ enabled: true });

      // 100ms実行
      for (let i = 0; i < 6; i++) {
        act(() => {
          mockAnimationManager._triggerAnimation(16.67);
        });
      }

      // 再有効化後に実行される
      expect(callCount).toBe(1);
    });
  });
});