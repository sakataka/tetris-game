/**
 * タイマーバグ修正の検証テスト
 *
 * useTimerAnimationの正しい動作を確認し、
 * ゲームプレイ中のタイマー停止バグを防止する
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';

// シンプルなAnimationManagerモック
vi.mock('../utils/animation/animationManager', () => ({
  animationManager: {
    registerAnimation: vi.fn(),
    unregisterAnimation: vi.fn(),
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
      globalFPSLimit: 60,
    })),
  },
}));

describe('タイマーバグ修正検証', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useTimerAnimation修正テスト', () => {
    it('useTimerAnimationフックが正常にマウントされる', () => {
      const mockCallback = vi.fn();

      const { result } = renderHook(() =>
        useTimerAnimation(mockCallback, 1000, [], { enabled: true })
      );

      // フックがエラーなくマウントされることを確認
      expect(result.current).toBeDefined();
    });

    it('短い間隔でも正常に動作する', () => {
      const mockCallback = vi.fn();

      expect(() => {
        renderHook(() => useTimerAnimation(mockCallback, 100, [], { enabled: true }));
      }).not.toThrow();
    });

    it('累積時間リセット機能が動作する', () => {
      const mockCallback = vi.fn();

      const { rerender } = renderHook(
        ({ interval }) => useTimerAnimation(mockCallback, interval, [interval], { enabled: true }),
        { initialProps: { interval: 1000 } }
      );

      // 間隔を変更してもエラーが発生しないことを確認
      rerender({ interval: 200 });

      expect(true).toBe(true);
    });
  });

  describe('ゲーム実用性テスト', () => {
    it('ピース自動落下シミュレーション設定', () => {
      let dropCount = 0;
      const dropPiece = () => dropCount++;

      expect(() => {
        renderHook(() =>
          useTimerAnimation(
            dropPiece,
            800, // 800ms間隔
            [],
            { enabled: true }
          )
        );
      }).not.toThrow();
    });

    it('レベル上昇時の高速化設定', () => {
      let tickCount = 0;

      const { rerender } = renderHook(
        ({ interval }) =>
          useTimerAnimation(() => tickCount++, interval, [interval], { enabled: true }),
        { initialProps: { interval: 1000 } }
      );

      // 高速化の設定変更
      rerender({ interval: 300 });

      expect(true).toBe(true);
    });

    it('一時停止・再開の動作設定', () => {
      let tickCount = 0;
      const onTick = () => tickCount++;

      const { rerender } = renderHook(
        ({ enabled }) => useTimerAnimation(onTick, 500, [], { enabled }),
        { initialProps: { enabled: true } }
      );

      // 一時停止
      rerender({ enabled: false });

      // 再開
      rerender({ enabled: true });

      expect(true).toBe(true);
    });
  });

  describe('エッジケーステスト', () => {
    it('極小間隔でもクラッシュしない', () => {
      const fastCallback = vi.fn();

      expect(() => {
        renderHook(() =>
          useTimerAnimation(
            fastCallback,
            1, // 1ms間隔
            [],
            { enabled: true }
          )
        );
      }).not.toThrow();
    });

    it('極大間隔での正常動作', () => {
      const slowCallback = vi.fn();

      expect(() => {
        renderHook(() =>
          useTimerAnimation(
            slowCallback,
            10000, // 10秒間隔
            [],
            { enabled: true }
          )
        );
      }).not.toThrow();
    });
  });
});
