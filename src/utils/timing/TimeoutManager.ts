/**
 * Unified Timeout Management System
 *
 * Provides setTimeout/clearTimeout functionality using AnimationManager
 * for consistency with the unified timer system while maintaining
 * appropriate behavior for long-duration timeouts.
 */

import { animationManager } from '../animation/animationManager';
import { log } from '../logging';

interface ManagedTimeout {
  callback: () => void;
  animationId: string;
  endTime: number;
  startTime: number;
  duration: number;
}

/**
 * Singleton Timeout Manager
 *
 * Features:
 * - Unified timeout management using AnimationManager
 * - Support for long-duration timeouts (minutes/hours)
 * - Automatic cleanup and memory management
 * - Debug logging for timeout tracking
 */
export class TimeoutManager {
  private static instance: TimeoutManager;
  private timeouts = new Map<string, ManagedTimeout>();
  private nextId = 1;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  /**
   * Set a timeout using AnimationManager
   * @param callback Function to execute after delay
   * @param delay Delay in milliseconds
   * @returns Timeout ID for later cancellation
   */
  public setTimeout(callback: () => void, delay: number): string {
    const timeoutId = `timeout-${this.nextId++}`;
    const startTime = performance.now();
    const endTime = startTime + delay;

    const animationId = `timeout-animation-${timeoutId}`;

    // Create animation callback that checks for timeout completion
    const timeoutCallback = (currentTime: number) => {
      if (currentTime >= endTime) {
        // Timeout completed - execute callback and cleanup
        try {
          callback();
        } catch (error) {
          log.error('Error in timeout callback', {
            component: 'TimeoutManager',
            metadata: { error, timeoutId },
          });
        } finally {
          this.clearTimeout(timeoutId);
        }
      }
      // Animation continues until timeout is reached or cleared
    };

    // Register with AnimationManager
    animationManager.registerAnimation(animationId, timeoutCallback, {
      fps: 1, // Check once per second for efficiency
      priority: 'low', // Timeouts are low priority
    });

    // Store timeout information
    this.timeouts.set(timeoutId, {
      callback,
      animationId,
      endTime,
      startTime,
      duration: delay,
    });

    log.debug(`Timeout set: ${timeoutId} (${delay}ms)`, {
      component: 'TimeoutManager',
      metadata: { timeoutId, delay, endTime },
    });

    return timeoutId;
  }

  /**
   * Clear a timeout
   * @param timeoutId ID returned by setTimeout
   */
  public clearTimeout(timeoutId: string): void {
    const timeout = this.timeouts.get(timeoutId);
    if (!timeout) {
      return; // Timeout already cleared or doesn't exist
    }

    // Unregister from AnimationManager
    animationManager.unregisterAnimation(timeout.animationId);

    // Remove from our tracking
    this.timeouts.delete(timeoutId);

    log.debug(`Timeout cleared: ${timeoutId}`, {
      component: 'TimeoutManager',
      metadata: {
        timeoutId,
        wasCompleted: false,
        remainingTime: timeout.endTime - performance.now(),
      },
    });
  }

  /**
   * Get information about active timeouts (for debugging)
   */
  public getActiveTimeouts(): Array<{
    id: string;
    duration: number;
    remainingTime: number;
    startTime: number;
  }> {
    const currentTime = performance.now();
    return Array.from(this.timeouts.entries()).map(([id, timeout]) => ({
      id,
      duration: timeout.duration,
      remainingTime: Math.max(0, timeout.endTime - currentTime),
      startTime: timeout.startTime,
    }));
  }

  /**
   * Clear all active timeouts (for cleanup/testing)
   */
  public clearAllTimeouts(): void {
    const timeoutIds = Array.from(this.timeouts.keys());
    timeoutIds.forEach((id) => this.clearTimeout(id));

    log.debug(`Cleared all timeouts: ${timeoutIds.length} timeouts`, {
      component: 'TimeoutManager',
      metadata: { clearedCount: timeoutIds.length },
    });
  }

  /**
   * Get timeout statistics
   */
  public getStats(): {
    activeCount: number;
    totalCreated: number;
  } {
    return {
      activeCount: this.timeouts.size,
      totalCreated: this.nextId - 1,
    };
  }
}

// Singleton instance for global timeout management
export const timeoutManager = TimeoutManager.getInstance();

// Convenience functions that match native setTimeout/clearTimeout API
export const unifiedSetTimeout = (callback: () => void, delay: number): string => {
  return timeoutManager.setTimeout(callback, delay);
};

export const unifiedClearTimeout = (timeoutId: string): void => {
  timeoutManager.clearTimeout(timeoutId);
};

export default TimeoutManager;
