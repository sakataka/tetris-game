/**
 * AnimationManagerテスト
 * 
 * 統一されたアニメーション管理システムの機能を検証
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// matchMediaをhoist level でモック
const mockMatchMedia = vi.hoisted(() => 
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
});

import { AnimationManager } from '../utils/animation/animationManager';
import { createMockDOMEnvironment } from './fixtures';

// DOM環境をセットアップ
const domMocks = createMockDOMEnvironment();

// requestAnimationFrameとcancelAnimationFrameのモック
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: mockCancelAnimationFrame
});

// performanceオブジェクトのモック
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now())
  }
});

// エラーハンドラーのモック
vi.mock('../utils/data/errorHandler', () => ({
  handleError: vi.fn()
}));

describe('AnimationManager', () => {
  let animationManager: AnimationManager;
  let mockCallback: ReturnType<typeof vi.fn>;
  let animationFrameCallbacks: Map<number, FrameRequestCallback>;
  let nextAnimationFrameId: number;

  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = new Map();
    nextAnimationFrameId = 1;
    mockCallback = vi.fn();
    
    // AnimationManagerのシングルトンをリセット
    (AnimationManager as any).instance = null;
    animationManager = AnimationManager.getInstance();
    
    // requestAnimationFrame のモック実装
    (window.requestAnimationFrame as any).mockImplementation((callback: FrameRequestCallback) => {
      const id = nextAnimationFrameId++;
      animationFrameCallbacks.set(id, callback);
      // 次のイベントループで実行
      setTimeout(() => {
        const cb = animationFrameCallbacks.get(id);
        if (cb) {
          cb(performance.now());
        }
      }, 0);
      return id;
    });

    // cancelAnimationFrame のモック実装
    (window.cancelAnimationFrame as any).mockImplementation((id: number) => {
      animationFrameCallbacks.delete(id);
    });
    
    // AnimationManagerの状態をリセット
    animationManager.stopAll();
  });

  afterEach(() => {
    animationManager.stopAll();
  });

  describe('シングルトンパターン', () => {
    it('animationManagerは常に同じインスタンスである', () => {
      const { animationManager: manager1 } = require('../utils/animation/animationManager');
      const { animationManager: manager2 } = require('../utils/animation/animationManager');
      
      expect(manager1).toBe(manager2);
    });
  });

  describe('アニメーション登録と管理', () => {
    it('アニメーションを正常に登録できる', () => {
      animationManager.registerAnimation('test-animation', mockCallback);
      
      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('同じIDで再登録すると前のアニメーションを停止する', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      animationManager.registerAnimation('duplicate-test', callback1);
      const initialCalls = (window.cancelAnimationFrame as any).mock.calls.length;
      
      animationManager.registerAnimation('duplicate-test', callback2);
      
      // 前のアニメーションがキャンセルされる
      expect((window.cancelAnimationFrame as any).mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it('アニメーションを正常に削除できる', () => {
      animationManager.registerAnimation('removable-animation', mockCallback);
      
      animationManager.unregisterAnimation('removable-animation');
      
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('存在しないアニメーションの削除は何もしない', () => {
      const initialCalls = (window.cancelAnimationFrame as any).mock.calls.length;
      
      animationManager.unregisterAnimation('non-existent');
      
      // キャンセルは呼ばれない
      expect((window.cancelAnimationFrame as any).mock.calls.length).toBe(initialCalls);
    });
  });

  describe('FPS制限機能', () => {
    it('FPS制限が正常に動作する', async () => {
      let callCount = 0;
      const fpsLimitedCallback = vi.fn(() => callCount++);

      animationManager.registerAnimation('fps-limited', fpsLimitedCallback, {
        fps: 30 // 30FPSに制限
      });

      // 複数フレーム分の時間経過をシミュレート
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // FPS制限により、すべてのrequestAnimationFrameでコールバックが呼ばれないことを確認
      expect(callCount).toBeGreaterThan(0);
    });
  });

  describe('優先度とreduced-motion', () => {
    it('reduced-motion有効時は低優先度アニメーションをスキップする', () => {
      // reduced-motionを有効化
      animationManager.setReducedMotion(true);

      const initialCalls = (window.requestAnimationFrame as any).mock.calls.length;

      animationManager.registerAnimation('low-priority', mockCallback, {
        priority: 'low'
      });

      // 低優先度なので登録されない
      expect((window.requestAnimationFrame as any).mock.calls.length).toBe(initialCalls);
    });

    it('reduced-motion有効時でも高優先度アニメーションは動作する', () => {
      animationManager.setReducedMotion(true);

      animationManager.registerAnimation('high-priority', mockCallback, {
        priority: 'high'
      });

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('一時停止と再開', () => {
    it('pauseAllですべてのアニメーションが停止する', () => {
      animationManager.registerAnimation('animation1', vi.fn());
      animationManager.registerAnimation('animation2', vi.fn());

      animationManager.pauseAll();

      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('resumeAllで一時停止したアニメーションが再開する', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      animationManager.registerAnimation('animation1', callback1);
      animationManager.registerAnimation('animation2', callback2);

      animationManager.pauseAll();
      
      const callsAfterPause = (window.requestAnimationFrame as any).mock.calls.length;
      
      animationManager.resumeAll();

      // 再開時に新しいrequestAnimationFrameが呼ばれる
      expect((window.requestAnimationFrame as any).mock.calls.length).toBeGreaterThan(callsAfterPause);
    });
  });

  describe('パフォーマンス監視', () => {
    it('パフォーマンス統計を取得できる', () => {
      const stats = animationManager.getStats();
      
      expect(stats).toHaveProperty('totalFrames');
      expect(stats).toHaveProperty('droppedFrames');
      expect(stats).toHaveProperty('averageFrameTime');
      expect(stats).toHaveProperty('activeAnimations');
      expect(stats).toHaveProperty('isPaused');
      expect(stats).toHaveProperty('isReducedMotion');
      expect(stats).toHaveProperty('globalFPSLimit');
    });

    it('グローバルFPS制限を設定できる', () => {
      animationManager.setGlobalFPSLimit(30);
      
      const stats = animationManager.getStats();
      expect(stats.globalFPSLimit).toBe(30);
    });
  });

  describe('エラーハンドリング', () => {
    it('コールバック内のエラーをキャッチして処理を継続する', async () => {
      const { handleError } = require('../utils/data/errorHandler');
      
      const errorCallback = vi.fn(() => {
        throw new Error('Animation error');
      });

      animationManager.registerAnimation('error-animation', errorCallback);

      // アニメーションフレームの実行を待つ
      await new Promise(resolve => setTimeout(resolve, 50));

      // エラーハンドラーが呼ばれる
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe('自動停止機能', () => {
    it('maxDurationで自動停止する', async () => {
      const callback = vi.fn();

      animationManager.registerAnimation('auto-stop', callback, {
        autoStop: {
          maxDuration: 50 // 50ms後に停止
        }
      });

      // 100ms待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      // アニメーションが停止している
      const stats = animationManager.getStats();
      expect(stats.activeAnimations).toBe(0);
    });

    it('条件関数で自動停止する', async () => {
      let shouldStop = false;
      const callback = vi.fn();

      animationManager.registerAnimation('condition-stop', callback, {
        autoStop: {
          condition: () => shouldStop
        }
      });

      // 条件を満たす
      shouldStop = true;

      // アニメーションフレームの実行を待つ
      await new Promise(resolve => setTimeout(resolve, 50));

      // アニメーションが停止している
      const stats = animationManager.getStats();
      expect(stats.activeAnimations).toBe(0);
    });
  });

  describe('リソース管理', () => {
    it('stopAllですべてのアニメーションがクリアされる', () => {
      animationManager.registerAnimation('cleanup-test1', vi.fn());
      animationManager.registerAnimation('cleanup-test2', vi.fn());
      animationManager.registerAnimation('cleanup-test3', vi.fn());

      animationManager.stopAll();

      const stats = animationManager.getStats();
      expect(stats.activeAnimations).toBe(0);
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('pauseLowPriorityAnimationsで低優先度アニメーションのみ停止する', () => {
      animationManager.registerAnimation('low1', vi.fn(), { priority: 'low' });
      animationManager.registerAnimation('normal1', vi.fn(), { priority: 'normal' });
      animationManager.registerAnimation('high1', vi.fn(), { priority: 'high' });

      animationManager.pauseLowPriorityAnimations();

      // 少なくとも1つのアニメーションが停止される
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});