/**
 * タイマー動作のデバッグテスト
 *
 * useTimerAnimationがなぜ動作しないかを調べる
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';

describe('タイマー動作デバッグ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 詳細なコンソールログを有効化
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('useTimerAnimationが実際に呼び出されるかデバッグ', () => {
    let callCount = 0;
    const debugCallback = vi.fn(() => {
      callCount++;
      console.log(`Timer fired! Call count: ${callCount}`);
    });

    console.log('Starting timer test...');

    const { result } = renderHook(() =>
      useTimerAnimation(debugCallback, 100, [debugCallback], { enabled: true })
    );

    console.log('Hook rendered, result:', result.current);

    // 手動でdeltaTimeを送信
    act(() => {
      console.log('Triggering manual deltaTime: 120ms');
      // useTimerAnimationは内部でuseAnimationFrameを使用している
      // 実際のAnimationManagerを直接操作する代わりに、
      // より直接的なアプローチを試す
    });

    console.log(`Final call count: ${callCount}`);
    console.log(`Mock called times: ${debugCallback.mock.calls.length}`);
  });

  it('最小限のタイマーロジックテスト', () => {
    // useTimerAnimationの核心ロジックを手動で再現
    let accumulatedTime = 0;
    const interval = 100;
    let callCount = 0;

    const mockCallback = () => {
      callCount++;
      console.log(`Manual timer fired! Call count: ${callCount}`);
    };

    // 手動でuseTimerAnimationのロジックを再現
    const simulateTimer = (deltaTime: number) => {
      accumulatedTime += deltaTime;
      console.log(
        `Accumulated time: ${accumulatedTime}, Delta: ${deltaTime}, Interval: ${interval}`
      );

      if (accumulatedTime >= interval) {
        console.log('Interval reached, firing callback');
        mockCallback();
        accumulatedTime = accumulatedTime % interval;
        console.log(`Remaining time: ${accumulatedTime}`);
      }
    };

    // 120msを送信（100ms間隔なので1回発火）
    simulateTimer(120);

    console.log(`Expected: 1, Actual: ${callCount}`);
    expect(callCount).toBe(1);
    expect(accumulatedTime).toBe(20); // 120 - 100 = 20ms残り
  });
});
