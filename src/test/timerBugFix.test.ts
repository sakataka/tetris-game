/**
 * タイマーバグ修正の検証テスト
 * 
 * 実際に報告されたバグ：
 * 1. 自動でピースが落ちない
 * 2. ピースを消したら、処理が進まなくなる
 * 
 * これらの問題が修正されていることを検証する
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';
import { renderHook, act } from '@testing-library/react';

// AnimationManagerのモック
vi.mock('../utils/animation/animationManager', () => ({
  animationManager: {
    registerAnimation: vi.fn(),
    unregisterAnimation: vi.fn()
  }
}));

describe('タイマーバグ修正検証', () => {
  let mockCallback: ReturnType<typeof vi.fn>;
  let animationFrame: (deltaTime: number) => void;
  let mockAnimationManager: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockCallback = vi.fn();

    // モック化されたAnimationManagerを取得
    const { animationManager } = await import('../utils/animation/animationManager');
    mockAnimationManager = vi.mocked(animationManager);

    // registerAnimationの実装をカスタマイズ
    mockAnimationManager.registerAnimation.mockImplementation((id: string, callback: (deltaTime: number) => void) => {
      animationFrame = callback;
    });
  });

  describe('useTimerAnimation修正テスト', () => {
    it('deltaTime累積による正しいタイマー動作', () => {
      // 1000msごとに実行されるタイマー
      renderHook(() => useTimerAnimation(mockCallback, 1000, [mockCallback], { enabled: true }));

      // 60fps相当のdeltaTime (16.67ms) を60回 = 1秒分
      let totalTime = 0;
      for (let i = 0; i < 60; i++) {
        const deltaTime = 16.67;
        totalTime += deltaTime;
        act(() => {
          if (animationFrame) {
            animationFrame(deltaTime);
          }
        });
      }

      // 1秒経過したので1回実行される
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(totalTime).toBeCloseTo(1000, 0);
    });

    it('短い間隔での連続実行', () => {
      // 100msごとに実行
      renderHook(() => useTimerAnimation(mockCallback, 100, [mockCallback], { enabled: true }));

      // 1秒分のフレーム実行
      for (let i = 0; i < 60; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // 約10回実行される（1000ms / 100ms = 10回）
      expect(mockCallback).toHaveBeenCalledTimes(10);
    });

    it('累積時間リセットの確認', () => {
      let callCount = 0;
      const countingCallback = vi.fn(() => callCount++);

      const { rerender } = renderHook(
        ({ interval }) => useTimerAnimation(countingCallback, interval, [countingCallback], { enabled: true }),
        { initialProps: { interval: 500 } }
      );

      // 300ms分実行（まだ発火しない）
      for (let i = 0; i < 18; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }
      expect(callCount).toBe(0);

      // 間隔を変更（累積時間がリセットされる）
      rerender({ interval: 200 });

      // さらに200ms分実行
      for (let i = 0; i < 12; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // 新しい間隔で発火される
      expect(callCount).toBe(1);
    });
  });

  describe('ゲーム実用性テスト', () => {
    it('ピース自動落下シミュレーション', () => {
      let pieceDropCount = 0;
      const mockDropPiece = vi.fn(() => pieceDropCount++);

      // レベル1相当の800ms間隔
      renderHook(() => useTimerAnimation(mockDropPiece, 800, [mockDropPiece], { enabled: true }));

      // 5秒間のゲームプレイシミュレーション
      const fiveSeconds = 5000;
      const frameInterval = 16.67;
      const frameCount = Math.floor(fiveSeconds / frameInterval);

      for (let i = 0; i < frameCount; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(frameInterval);
          }
        });
      }

      // 5秒間で約6回落下する（5000ms / 800ms ≈ 6.25）
      expect(pieceDropCount).toBeGreaterThanOrEqual(6);
      expect(pieceDropCount).toBeLessThanOrEqual(7);
    });

    it('レベル上昇時の高速化', () => {
      let level1Drops = 0;
      let level5Drops = 0;

      const mockLevel1Drop = vi.fn(() => level1Drops++);
      const mockLevel5Drop = vi.fn(() => level5Drops++);

      // レベル1: 1000ms間隔
      const { unmount: unmount1 } = renderHook(() => 
        useTimerAnimation(mockLevel1Drop, 1000, [mockLevel1Drop], { enabled: true })
      );

      // 3秒実行
      for (let i = 0; i < 180; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }
      unmount1();

      // レベル5: 300ms間隔
      renderHook(() => 
        useTimerAnimation(mockLevel5Drop, 300, [mockLevel5Drop], { enabled: true })
      );

      // 同じ3秒実行
      for (let i = 0; i < 180; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // レベル5が明らかに多く実行される
      expect(level5Drops).toBeGreaterThan(level1Drops * 2);
    });

    it('一時停止・再開の動作', () => {
      let dropCount = 0;
      const mockDrop = vi.fn(() => dropCount++);

      const { rerender } = renderHook(
        ({ enabled }) => useTimerAnimation(mockDrop, 500, [mockDrop], { enabled }),
        { initialProps: { enabled: true } }
      );

      // 1秒実行（2回落下予想）
      for (let i = 0; i < 60; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      const pausedDrops = dropCount;
      expect(pausedDrops).toBe(2);

      // 一時停止
      rerender({ enabled: false });

      // さらに1秒実行（停止中なので増加しない）
      for (let i = 0; i < 60; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      expect(dropCount).toBe(pausedDrops); // 変化なし

      // 再開
      rerender({ enabled: true });

      // さらに1秒実行
      for (let i = 0; i < 60; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // 再開後に追加で落下
      expect(dropCount).toBeGreaterThan(pausedDrops);
    });
  });

  describe('エッジケーステスト', () => {
    it('極小間隔でもクラッシュしない', () => {
      const mockCallback = vi.fn();
      
      // 1msという極小間隔
      renderHook(() => useTimerAnimation(mockCallback, 1, [mockCallback], { enabled: true }));

      // 短時間実行
      for (let i = 0; i < 10; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // クラッシュせず、多数回実行される
      expect(mockCallback).toHaveBeenCalled();
    });

    it('極大間隔での正常動作', () => {
      const mockCallback = vi.fn();
      
      // 10秒という極大間隔
      renderHook(() => useTimerAnimation(mockCallback, 10000, [mockCallback], { enabled: true }));

      // 5秒分実行（まだ発火しない）
      for (let i = 0; i < 300; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // まだ実行されていない
      expect(mockCallback).not.toHaveBeenCalled();

      // さらに5秒実行（合計10秒）
      for (let i = 0; i < 300; i++) {
        act(() => {
          if (animationFrame) {
            animationFrame(16.67);
          }
        });
      }

      // 10秒経過で1回実行
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});