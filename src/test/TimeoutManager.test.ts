import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimeoutManager, timeoutManager } from '../utils/timing/TimeoutManager';
import { animationManager } from '../utils/animation/animationManager';

// Mock AnimationManager
vi.mock('../utils/animation/animationManager', () => ({
  animationManager: {
    registerAnimation: vi.fn(),
    unregisterAnimation: vi.fn(),
  },
}));

// Mock performance.now
const mockPerformanceNow = vi.fn();
vi.stubGlobal('performance', { now: mockPerformanceNow });

describe('TimeoutManager', () => {
  let manager: TimeoutManager;
  let mockRegisterAnimation: any;
  let mockUnregisterAnimation: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockRegisterAnimation = vi.mocked(animationManager.registerAnimation);
    mockUnregisterAnimation = vi.mocked(animationManager.unregisterAnimation);

    // Reset performance.now to start at 0
    mockPerformanceNow.mockReturnValue(0);

    // Get fresh instance
    manager = TimeoutManager.getInstance();
    manager.clearAllTimeouts(); // Clean slate
  });

  afterEach(() => {
    manager.clearAllTimeouts();
  });

  describe('setTimeout and clearTimeout', () => {
    it('should create a timeout and register with AnimationManager', () => {
      const callback = vi.fn();
      const delay = 1000;

      const timeoutId = manager.setTimeout(callback, delay);

      expect(timeoutId).toMatch(/^timeout-\d+$/);
      expect(mockRegisterAnimation).toHaveBeenCalledWith(
        expect.stringMatching(/^timeout-animation-timeout-\d+$/),
        expect.any(Function),
        {
          fps: 1,
          priority: 'low',
        }
      );
    });

    it('should execute callback when timeout completes', () => {
      const callback = vi.fn();
      const delay = 1000;
      mockPerformanceNow.mockReturnValue(0);

      manager.setTimeout(callback, delay);

      // Get the animation callback that was registered
      const animationCallback = mockRegisterAnimation.mock.calls[0][1];

      // Simulate time passage - callback should not execute yet
      mockPerformanceNow.mockReturnValue(500);
      animationCallback(500);
      expect(callback).not.toHaveBeenCalled();

      // Simulate timeout completion
      mockPerformanceNow.mockReturnValue(1000);
      animationCallback(1000);
      expect(callback).toHaveBeenCalledOnce();
      expect(mockUnregisterAnimation).toHaveBeenCalled();
    });

    it('should clear timeout before execution', () => {
      const callback = vi.fn();
      const delay = 1000;

      const timeoutId = manager.setTimeout(callback, delay);
      manager.clearTimeout(timeoutId);

      expect(mockUnregisterAnimation).toHaveBeenCalled();

      // Get the animation callback and try to execute it
      mockPerformanceNow.mockReturnValue(1000);

      // Callback should not be accessible since timeout was cleared
      // This tests that the timeout was properly removed
      const activeTimeouts = manager.getActiveTimeouts();
      expect(activeTimeouts).toHaveLength(0);
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const delay = 1000;

      manager.setTimeout(errorCallback, delay);
      const animationCallback = mockRegisterAnimation.mock.calls[0][1];

      // Execute callback - should not throw
      mockPerformanceNow.mockReturnValue(1000);
      expect(() => animationCallback(1000)).not.toThrow();
      expect(errorCallback).toHaveBeenCalled();
      expect(mockUnregisterAnimation).toHaveBeenCalled();
    });
  });

  describe('timeout tracking', () => {
    it('should track active timeouts', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      mockPerformanceNow.mockReturnValue(0);

      const timeout1 = manager.setTimeout(callback1, 1000);
      const timeout2 = manager.setTimeout(callback2, 2000);

      const activeTimeouts = manager.getActiveTimeouts();
      expect(activeTimeouts).toHaveLength(2);

      // Check timeout information
      const timeout1Info = activeTimeouts.find((t) => t.id === timeout1);
      const timeout2Info = activeTimeouts.find((t) => t.id === timeout2);

      expect(timeout1Info).toMatchObject({
        duration: 1000,
        remainingTime: 1000,
        startTime: 0,
      });

      expect(timeout2Info).toMatchObject({
        duration: 2000,
        remainingTime: 2000,
        startTime: 0,
      });
    });

    it('should update remaining time correctly', () => {
      const callback = vi.fn();
      mockPerformanceNow.mockReturnValue(0);

      manager.setTimeout(callback, 1000);

      // Advance time
      mockPerformanceNow.mockReturnValue(300);

      const activeTimeouts = manager.getActiveTimeouts();
      expect(activeTimeouts[0]?.remainingTime).toBe(700);
    });

    it('should provide statistics', () => {
      const callback = vi.fn();

      manager.setTimeout(callback, 1000);
      manager.setTimeout(callback, 2000);

      const stats = manager.getStats();
      expect(stats.activeCount).toBe(2);
      expect(stats.totalCreated).toBeGreaterThanOrEqual(2);
    });
  });

  describe('clearAllTimeouts', () => {
    it('should clear all active timeouts', () => {
      const callback = vi.fn();

      manager.setTimeout(callback, 1000);
      manager.setTimeout(callback, 2000);
      manager.setTimeout(callback, 3000);

      expect(manager.getActiveTimeouts()).toHaveLength(3);

      manager.clearAllTimeouts();

      expect(manager.getActiveTimeouts()).toHaveLength(0);
      expect(mockUnregisterAnimation).toHaveBeenCalledTimes(3);
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = TimeoutManager.getInstance();
      const instance2 = TimeoutManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(timeoutManager);
    });
  });

  describe('convenience functions', () => {
    it('should work with unifiedSetTimeout and unifiedClearTimeout', async () => {
      const { unifiedSetTimeout, unifiedClearTimeout } = await import(
        '../utils/timing/TimeoutManager'
      );

      const callback = vi.fn();
      const timeoutId = unifiedSetTimeout(callback, 1000);

      expect(mockRegisterAnimation).toHaveBeenCalled();

      unifiedClearTimeout(timeoutId);

      expect(mockUnregisterAnimation).toHaveBeenCalled();
    });
  });
});
