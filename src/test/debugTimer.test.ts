/**
 * Timer operation debug tests
 *
 * Investigating why useTimerAnimation is not working
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerAnimation } from '../utils/animation/useAnimationFrame';
import { log } from '../utils/logging';

describe('Timer operation debug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable detailed console logging
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debug whether useTimerAnimation is actually called', () => {
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

    // Manually send deltaTime
    act(() => {
      log.debug('Triggering manual deltaTime: 120ms', { component: 'DebugTimerTest' });
      // useTimerAnimation uses useAnimationFrame internally
      // Instead of directly manipulating the actual AnimationManager,
      // try a more direct approach
    });

    log.debug(`Final call count: ${callCount}`, { component: 'DebugTimerTest' });
    log.debug(`Mock called times: ${debugCallback.mock.calls.length}`, {
      component: 'DebugTimerTest',
    });
  });

  it('minimal timer logic test', () => {
    // Manually reproduce the core logic of useTimerAnimation
    let accumulatedTime = 0;
    const interval = 100;
    let callCount = 0;

    const mockCallback = () => {
      callCount++;
      log.debug(`Manual timer fired! Call count: ${callCount}`, { component: 'DebugTimerTest' });
    };

    // Manually reproduce useTimerAnimation logic
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

    // Send 120ms (should fire once with 100ms interval)
    simulateTimer(120);

    log.debug(`Expected: 1, Actual: ${callCount}`, { component: 'DebugTimerTest' });
    expect(callCount).toBe(1);
    expect(accumulatedTime).toBe(20); // 120 - 100 = 20ms remaining
  });
});
