/**
 * タイマー動作のデバッグテスト
 *
 * useTimerAnimationがなぜ動作しないかを調べる
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';
import { log } from '../utils/logging';

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
      log.debug(`Timer fired! Call count: ${callCount}`, { component: 'DebugTimerTest' });
    });

    log.debug('Starting timer test...', { component: 'DebugTimerTest' });

    const { result } = renderHook(() =>
      useTimerAnimation(debugCallback, 100, [debugCallback], { enabled: true })
    );

    log.debug('Hook rendered', {
      component: 'DebugTimerTest',
      metadata: { result: result.current },
    });

    // 手動でdeltaTimeを送信
    act(() => {
      log.debug('Triggering manual deltaTime: 120ms', { component: 'DebugTimerTest' });
      // useTimerAnimationは内部でuseAnimationFrameを使用している
      // 実際のAnimationManagerを直接操作する代わりに、
      // より直接的なアプローチを試す
    });

    log.debug(`Final call count: ${callCount}`, { component: 'DebugTimerTest' });
    log.debug(`Mock called times: ${debugCallback.mock.calls.length}`, {
      component: 'DebugTimerTest',
    });
  });

  it('最小限のタイマーロジックテスト', () => {
    // useTimerAnimationの核心ロジックを手動で再現
    let accumulatedTime = 0;
    const interval = 100;
    let callCount = 0;

    const mockCallback = () => {
      callCount++;
      log.debug(`Manual timer fired! Call count: ${callCount}`, { component: 'DebugTimerTest' });
    };

    // 手動でuseTimerAnimationのロジックを再現
    const simulateTimer = (deltaTime: number) => {
      accumulatedTime += deltaTime;
      log.debug(
        `Accumulated time: ${accumulatedTime}, Delta: ${deltaTime}, Interval: ${interval}`,
        { component: 'DebugTimerTest' }
      );

      if (accumulatedTime >= interval) {
        log.debug('Interval reached, firing callback', { component: 'DebugTimerTest' });
        mockCallback();
        accumulatedTime = accumulatedTime % interval;
        log.debug(`Remaining time: ${accumulatedTime}`, { component: 'DebugTimerTest' });
      }
    };

    // 120msを送信（100ms間隔なので1回発火）
    simulateTimer(120);

    log.debug(`Expected: 1, Actual: ${callCount}`, { component: 'DebugTimerTest' });
    expect(callCount).toBe(1);
    expect(accumulatedTime).toBe(20); // 120 - 100 = 20ms残り
  });
});
