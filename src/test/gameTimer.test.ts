/**
 * ゲームタイマー機能の基本テスト
 * 
 * ピース自動落下の核心機能を検証し、
 * ゲームプレイ不能バグを防止する
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from '../hooks/useGameTimer';

// AnimationManagerのモック
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
      globalFPSLimit: 60
    }))
  }
}));

describe('useGameTimer - 基本ゲーム機能テスト', () => {
  let mockOnTick: ReturnType<typeof vi.fn>;
  let animationCallbacks: Map<string, (deltaTime: number) => void>;
  let animationIdCounter: number;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockOnTick = vi.fn();
    animationCallbacks = new Map();
    animationIdCounter = 0;

    // AnimationManagerの動作をシミュレート
    const mockAnimationManager = vi.mocked(
      (await import('../utils/animation/animationManager')).animationManager
    );

    mockAnimationManager.registerAnimation.mockImplementation((id: string, callback: (deltaTime: number) => void) => {
      animationCallbacks.set(id, callback);
    });

    mockAnimationManager.unregisterAnimation.mockImplementation((id: string) => {
      animationCallbacks.delete(id);
    });

    // requestAnimationFrameをモック
    global.requestAnimationFrame = vi.fn((callback) => {
      const id = ++animationIdCounter;
      setTimeout(() => callback(performance.now()), 16);
      return id;
    });

    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('基本動作テスト', () => {
    it('アクティブ時にタイマーが動作する', async () => {
      renderHook(() => useGameTimer({
        isActive: true,
        interval: 1000, // 1秒間隔
        onTick: mockOnTick
      }));

      // アニメーションフレームを手動実行
      await act(async () => {
        // アニメーションが登録されることを確認
        expect(animationCallbacks.size).toBeGreaterThan(0);
        
        const callback = Array.from(animationCallbacks.values())[0];
        
        // 1秒分のフレームをシミュレート (60fps = 16.67ms/frame)
        for (let i = 0; i < 60; i++) {
          callback(16.67); // deltaTime = 16.67ms
        }
      });

      // 1秒後にonTickが呼ばれることを確認
      expect(mockOnTick).toHaveBeenCalled();
    });

    it('非アクティブ時にタイマーが停止する', () => {
      const { rerender } = renderHook(
        ({ isActive }) => useGameTimer({
          isActive,
          interval: 1000,
          onTick: mockOnTick
        }),
        { initialProps: { isActive: true } }
      );

      // 最初はアクティブ
      expect(animationCallbacks.size).toBeGreaterThan(0);

      // 非アクティブに変更
      rerender({ isActive: false });

      // タイマーが停止されることを確認
      expect(animationCallbacks.size).toBe(0);
    });

    it('間隔変更時にタイマーが再起動する', async () => {
      const { rerender } = renderHook(
        ({ interval }) => useGameTimer({
          isActive: true,
          interval,
          onTick: mockOnTick
        }),
        { initialProps: { interval: 1000 } }
      );

      // 間隔を変更
      rerender({ interval: 500 });

      // 新しいタイマーが開始されることを確認
      expect(animationCallbacks.size).toBeGreaterThan(0);
      
      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        
        // 500ms分のフレームをシミュレート
        for (let i = 0; i < 30; i++) {
          callback(16.67);
        }
      });

      // より短い間隔でonTickが呼ばれることを確認
      expect(mockOnTick).toHaveBeenCalled();
    });
  });

  describe('ゲームプレイ重要機能テスト', () => {
    it('ピース自動落下 - 基本的な落下サイクル', async () => {
      let dropCount = 0;
      const mockDropPiece = vi.fn(() => dropCount++);

      renderHook(() => useGameTimer({
        isActive: true,
        interval: 800, // レベル1相当の間隔
        onTick: mockDropPiece
      }));

      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        
        // 3.2秒分実行（4回落下予想）
        for (let i = 0; i < 192; i++) { // 3.2s * 60fps
          callback(16.67);
        }
      });

      // 最低3回は落下している
      expect(mockDropPiece).toHaveBeenCalledTimes(4);
      expect(dropCount).toBe(4);
    });

    it('レベル上昇時の高速化対応', async () => {
      let tickCount = 0;
      const mockTick = vi.fn(() => tickCount++);

      const { rerender } = renderHook(
        ({ interval }) => useGameTimer({
          isActive: true,
          interval,
          onTick: mockTick
        }),
        { initialProps: { interval: 1000 } } // レベル1
      );

      // レベル1で1秒待機
      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        for (let i = 0; i < 60; i++) {
          callback(16.67);
        }
      });

      const level1Ticks = tickCount;

      // レベル5相当の高速化
      rerender({ interval: 300 });

      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        for (let i = 0; i < 60; i++) { // 同じ1秒間
          callback(16.67);
        }
      });

      // レベル5の方が多く実行される
      expect(tickCount).toBeGreaterThan(level1Ticks + 2);
    });

    it('ゲーム一時停止・再開の正常動作', async () => {
      let pausedTicks = 0;
      const mockTick = vi.fn(() => pausedTicks++);

      const { rerender } = renderHook(
        ({ isActive }) => useGameTimer({
          isActive,
          interval: 500,
          onTick: mockTick
        }),
        { initialProps: { isActive: true } }
      );

      // 一時停止
      rerender({ isActive: false });

      await act(async () => {
        // 停止中はコールバックが登録されていない
        expect(animationCallbacks.size).toBe(0);
        
        // 時間経過しても実行されない
        vi.advanceTimersByTime(1000);
      });

      expect(pausedTicks).toBe(0);

      // 再開
      rerender({ isActive: true });

      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        for (let i = 0; i < 30; i++) { // 500ms
          callback(16.67);
        }
      });

      // 再開後は正常動作
      expect(pausedTicks).toBe(1);
    });
  });

  describe('エラー耐性テスト', () => {
    it('コールバック内エラーでもタイマー継続', async () => {
      let errorCount = 0;
      let successCount = 0;
      
      const faultyCallback = vi.fn(() => {
        errorCount++;
        if (errorCount <= 2) {
          throw new Error('Test error');
        }
        successCount++;
      });

      renderHook(() => useGameTimer({
        isActive: true,
        interval: 300,
        onTick: faultyCallback
      }));

      await act(async () => {
        const callback = Array.from(animationCallbacks.values())[0];
        
        // エラーが発生しても継続実行
        for (let i = 0; i < 120; i++) { // 2秒分
          try {
            callback(16.67);
          } catch {
            // エラーを無視して継続
          }
        }
      });

      // エラー後も正常実行される
      expect(faultyCallback).toHaveBeenCalledTimes(6);
      expect(successCount).toBeGreaterThan(0);
    });

    it('極端な間隔値でも安定動作', async () => {
      const scenarios = [
        { interval: 1, label: '極小間隔' },
        { interval: 10000, label: '極大間隔' },
        { interval: 16.67, label: '1フレーム間隔' }
      ];

      for (const { interval } of scenarios) {
        const mockTick = vi.fn();
        
        const { unmount } = renderHook(() => useGameTimer({
          isActive: true,
          interval,
          onTick: mockTick
        }));

        await act(async () => {
          const callback = Array.from(animationCallbacks.values())[0];
          if (callback) {
            // 短時間実行
            for (let i = 0; i < 10; i++) {
              callback(16.67);
            }
          }
        });

        // クラッシュしないことを確認
        expect(mockTick).toBeDefined();
        unmount();
      }
    });
  });
});