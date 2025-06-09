/**
 * useAnimationFrame hooks テスト
 * 
 * アニメーションフックの機能とパフォーマンスを検証
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useAnimationFrame, 
  useConditionalAnimation, 
  useHighPerformanceAnimation,
  useThrottledAnimation,
  useDebouncedAnimation 
} from '../utils/animation/useAnimationFrame';

// AnimationManagerのモック
vi.mock('../utils/animation/animationManager', () => ({
  AnimationManager: {
    getInstance: vi.fn(() => ({
      register: vi.fn().mockReturnValue('test-id'),
      unregister: vi.fn().mockReturnValue(true),
      isActive: vi.fn().mockReturnValue(true),
      dispose: vi.fn()
    }))
  }
}));

describe('useAnimationFrame hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useAnimationFrame', () => {
    it('基本的なアニメーションフレームコールバックが動作する', () => {
      const callback = vi.fn();
      const deps = [1, 2, 3];

      renderHook(() => useAnimationFrame(callback, deps));

      expect(callback).toHaveBeenCalledWith(expect.any(Number)); // deltaTime
    });

    it('依存配列が変更された時にアニメーションが再登録される', () => {
      const callback = vi.fn();
      
      const { rerender } = renderHook(
        ({ deps }) => useAnimationFrame(callback, deps),
        { initialProps: { deps: [1, 2] } }
      );

      // 依存配列を変更
      rerender({ deps: [3, 4] });

      // コールバックが新しい依存配列で再実行される
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('enabledオプションでアニメーションの有効/無効を切り替えられる', () => {
      const callback = vi.fn();
      
      const { rerender } = renderHook(
        ({ enabled }) => useAnimationFrame(callback, [], { enabled }),
        { initialProps: { enabled: false } }
      );

      // 無効な状態ではコールバックが呼ばれない
      expect(callback).not.toHaveBeenCalled();

      // 有効にする
      rerender({ enabled: true });

      expect(callback).toHaveBeenCalled();
    });

    it('priorityオプションが正しく適用される', () => {
      const callback = vi.fn();
      const priority = 5;

      renderHook(() => useAnimationFrame(callback, [], { priority }));

      // AnimationManagerのregisterが正しい優先度で呼ばれることを確認
      const { AnimationManager } = require('../utils/animation/animationManager');
      const mockInstance = AnimationManager.getInstance();
      
      expect(mockInstance.register).toHaveBeenCalledWith(
        expect.objectContaining({ priority })
      );
    });
  });

  describe('useConditionalAnimation', () => {
    it('条件がtrueの時のみアニメーションが実行される', () => {
      const callback = vi.fn();
      
      const { rerender } = renderHook(
        ({ condition }) => useConditionalAnimation(callback, [], condition),
        { initialProps: { condition: false } }
      );

      // 条件がfalseの間はコールバックが呼ばれない
      expect(callback).not.toHaveBeenCalled();

      // 条件をtrueに変更
      rerender({ condition: true });

      expect(callback).toHaveBeenCalled();
    });

    it('複雑な条件ロジックが正常に動作する', () => {
      const callback = vi.fn();
      let frameCount = 0;
      
      // 偶数フレームでのみ実行する条件
      const condition = () => ++frameCount % 2 === 0;

      renderHook(() => useConditionalAnimation(callback, [], condition));

      // 複数回の実行をシミュレート
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // 条件に基づいて適切に実行されていることを確認
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('useHighPerformanceAnimation', () => {
    it('高パフォーマンス設定でアニメーションが登録される', () => {
      const callback = vi.fn();

      renderHook(() => useHighPerformanceAnimation(callback, []));

      const { AnimationManager } = require('../utils/animation/animationManager');
      const mockInstance = AnimationManager.getInstance();
      
      expect(mockInstance.register).toHaveBeenCalledWith(
        expect.objectContaining({ 
          priority: 10, // 高優先度
          fpsLimit: 60   // 高FPS
        })
      );
    });

    it('パフォーマンス重視のアニメーションが優先的に実行される', () => {
      const highPerfCallback = vi.fn();
      const normalCallback = vi.fn();

      renderHook(() => useHighPerformanceAnimation(highPerfCallback, []));
      renderHook(() => useAnimationFrame(normalCallback, []));

      // 高パフォーマンスアニメーションの方が高い優先度で登録される
      const { AnimationManager } = require('../utils/animation/animationManager');
      const mockInstance = AnimationManager.getInstance();
      
      const calls = mockInstance.register.mock.calls;
      const highPerfCall = calls.find(call => call[0].priority === 10);
      const normalCall = calls.find(call => call[0].priority === 1);
      
      expect(highPerfCall).toBeDefined();
      expect(normalCall).toBeDefined();
    });
  });

  describe('useThrottledAnimation', () => {
    it('指定された間隔でアニメーションがスロットルされる', () => {
      const callback = vi.fn();
      const throttleMs = 100;

      renderHook(() => useThrottledAnimation(callback, [], throttleMs));

      // 短時間で複数回実行をシミュレート
      act(() => {
        vi.advanceTimersByTime(50);  // 50ms経過
      });

      act(() => {
        vi.advanceTimersByTime(30);  // 80ms経過
      });

      act(() => {
        vi.advanceTimersByTime(30);  // 110ms経過
      });

      // スロットルにより適切な間隔でのみ実行される
      expect(callback).toHaveBeenCalledTimes(2); // 初回 + 100ms後
    });

    it('異なるスロットル間隔が正しく動作する', () => {
      const fastCallback = vi.fn();
      const slowCallback = vi.fn();

      renderHook(() => useThrottledAnimation(fastCallback, [], 50));  // 50ms間隔
      renderHook(() => useThrottledAnimation(slowCallback, [], 200)); // 200ms間隔

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // 異なる間隔で実行される
      expect(fastCallback).toHaveBeenCalledTimes(5); // 0, 50, 100, 150, 200ms
      expect(slowCallback).toHaveBeenCalledTimes(2); // 0, 200ms
    });
  });

  describe('useDebouncedAnimation', () => {
    it('デバウンス機能が正常に動作する', () => {
      const callback = vi.fn();
      const debounceMs = 100;

      const { rerender } = renderHook(
        ({ trigger }) => useDebouncedAnimation(callback, [trigger], debounceMs),
        { initialProps: { trigger: 0 } }
      );

      // 短時間で複数回依存配列を変更
      rerender({ trigger: 1 });
      rerender({ trigger: 2 });
      rerender({ trigger: 3 });

      // デバウンス期間中はコールバックが呼ばれない
      expect(callback).not.toHaveBeenCalled();

      // デバウンス時間経過後に実行される
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('デバウンス期間内の変更はキャンセルされる', () => {
      const callback = vi.fn();
      const debounceMs = 200;

      const { rerender } = renderHook(
        ({ trigger }) => useDebouncedAnimation(callback, [trigger], debounceMs),
        { initialProps: { trigger: 0 } }
      );

      // 最初の変更
      rerender({ trigger: 1 });

      // 50ms後に別の変更（デバウンスリセット）
      act(() => {
        vi.advanceTimersByTime(50);
      });
      rerender({ trigger: 2 });

      // 100ms後に別の変更（デバウンスリセット）
      act(() => {
        vi.advanceTimersByTime(100);
      });
      rerender({ trigger: 3 });

      // 最後の変更から200ms経過
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 最終的に1回だけ実行される
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のアニメーションフックが効率的に動作する', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());

      // 100個のアニメーションフックを同時に使用
      callbacks.forEach((callback, index) => {
        renderHook(() => useAnimationFrame(callback, [index]));
      });

      const { AnimationManager } = require('../utils/animation/animationManager');
      const mockInstance = AnimationManager.getInstance();
      
      // すべてのコールバックが登録される
      expect(mockInstance.register).toHaveBeenCalledTimes(100);
    });

    it('メモリリークなしにアニメーションがクリーンアップされる', () => {
      const callback = vi.fn();

      const { unmount } = renderHook(() => useAnimationFrame(callback, []));

      // アンマウント時にクリーンアップされる
      unmount();

      const { AnimationManager } = require('../utils/animation/animationManager');
      const mockInstance = AnimationManager.getInstance();
      
      expect(mockInstance.unregister).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    it('コールバック内のエラーが適切に処理される', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Animation callback error');
      });

      // エラーをスローするコールバックでもフックが正常に動作する
      expect(() => {
        renderHook(() => useAnimationFrame(errorCallback, []));
      }).not.toThrow();
    });

    it('無効な依存配列でも安全に動作する', () => {
      const callback = vi.fn();

      // 無効な依存配列でもエラーにならない
      expect(() => {
        renderHook(() => useAnimationFrame(callback, null as any));
      }).not.toThrow();

      expect(() => {
        renderHook(() => useAnimationFrame(callback, undefined as any));
      }).not.toThrow();
    });
  });
});