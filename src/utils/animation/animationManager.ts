/**
 * Unified Animation Management System
 *
 * Integrates previously scattered requestAnimationFrame management,
 * providing a centralized animation manager that improves performance and maintainability.
 * Now uses the advanced AnimationQueue system for better frame budget management.
 */

import { ENV_CONFIG } from '@/config/environment';
import { PERFORMANCE_LIMITS } from '@/constants/performance';
import { INTERVALS } from '@/constants/timing';
import { log } from '@/utils/logging';
import { BaseClass, type ISingleton, SingletonMixin } from '@/utils/patterns/singletonMixin';
import { type AnimationPriority, AnimationQueue } from './animationQueue';

export interface AnimationOptions {
  /** Target FPS (default: 60) */
  fps?: number;
  /** Animation priority (affects execution order and budget allocation) */
  priority?: AnimationPriority;
  /** Auto-stop conditions */
  autoStop?: {
    /** Maximum execution time (milliseconds) */
    maxDuration?: number;
    /** Condition function (stops when true) */
    condition?: () => boolean;
  };
  /** Estimated execution duration for budget planning (milliseconds) */
  estimatedDuration?: number;
}

interface ActiveAnimation {
  id: string;
  callback: FrameRequestCallback;
  options: {
    fps: number;
    priority: AnimationPriority;
    estimatedDuration: number;
    autoStop: {
      maxDuration: number;
      condition: () => boolean;
    };
  };
  startTime: number;
  autoStopChecked?: boolean;
}

/**
 * Enhanced Animation Manager with Queue-Based Optimization
 *
 * Features:
 * - Advanced frame budget management via AnimationQueue
 * - Priority-based execution with intelligent scheduling
 * - Performance monitoring and auto-optimization
 * - Graceful degradation under performance pressure
 * - Debug statistics and metrics
 */
export class AnimationManager
  extends SingletonMixin(class extends BaseClass {})
  implements ISingleton
{
  private animationQueue: AnimationQueue;
  private activeAnimations = new Map<string, ActiveAnimation>();
  private isPaused = false;
  private isReducedMotion = false;
  private globalFPSLimit = 60;
  // private performanceThreshold = PERFORMANCE_LIMITS.PERFORMANCE_THRESHOLD_MS;

  // Performance statistics
  private stats = {
    totalFrames: 0,
    droppedFrames: 0,
    averageFrameTime: 0,
    lastPerformanceCheck: performance.now(),
  };

  constructor() {
    super();
    this.animationQueue = new AnimationQueue();
    this.initializeSettings();
    this.startPerformanceMonitoring();
  }

  /**
   * Register and start animation execution
   */
  public registerAnimation(
    id: string,
    callback: FrameRequestCallback,
    options: AnimationOptions = {}
  ): void {
    try {
      // Stop existing animation if present
      if (this.activeAnimations.has(id)) {
        this.unregisterAnimation(id);
      }

      // Set default option values
      const fullOptions = {
        fps: options.fps ?? this.globalFPSLimit,
        priority: options.priority ?? ('normal' as AnimationPriority),
        estimatedDuration: options.estimatedDuration ?? 1,
        autoStop: {
          maxDuration: options.autoStop?.maxDuration ?? Number.POSITIVE_INFINITY,
          condition: options.autoStop?.condition ?? (() => false),
        },
      };

      // Skip low priority animations when reduced-motion is enabled
      if (this.isReducedMotion && fullOptions.priority === 'low') {
        return;
      }

      // Create wrapped callback with auto-stop logic
      const wrappedCallback: FrameRequestCallback = (timestamp) => {
        const animation = this.activeAnimations.get(id);
        if (!animation) return;

        // Check auto-stop conditions
        const elapsed = timestamp - animation.startTime;
        if (elapsed >= fullOptions.autoStop.maxDuration || fullOptions.autoStop.condition()) {
          this.unregisterAnimation(id);
          return;
        }

        // Execute original callback
        callback(timestamp);
      };

      const animation: ActiveAnimation = {
        id,
        callback: wrappedCallback,
        options: fullOptions,
        startTime: performance.now(),
      };

      // Store animation reference
      this.activeAnimations.set(id, animation);

      // Add animation to the queue for optimized execution
      this.animationQueue.addAnimation(id, wrappedCallback, {
        priority: fullOptions.priority,
        fps: fullOptions.fps,
        estimatedDuration: fullOptions.estimatedDuration,
      });

      log.debug('Animation registered', {
        component: 'AnimationManager',
        metadata: {
          id,
          priority: fullOptions.priority,
          fps: fullOptions.fps,
          totalAnimations: this.activeAnimations.size,
        },
      });
    } catch (error) {
      log.warn('Failed to register animation', {
        component: 'AnimationManager',
        metadata: { animationId: id, error },
      });
    }
  }

  /**
   * Unregister animation
   */
  public unregisterAnimation(id: string): void {
    const animation = this.activeAnimations.get(id);
    if (animation) {
      // Remove from queue and local tracking
      this.animationQueue.removeAnimation(id);
      this.activeAnimations.delete(id);

      log.debug('Animation unregistered', {
        component: 'AnimationManager',
        metadata: { id, remainingAnimations: this.activeAnimations.size },
      });
    }
  }

  /**
   * Pause all animations
   */
  public pauseAll(): void {
    this.isPaused = true;
    this.animationQueue.stop();

    log.debug('All animations paused', {
      component: 'AnimationManager',
      metadata: { totalAnimations: this.activeAnimations.size },
    });
  }

  /**
   * Resume all animations
   */
  public resumeAll(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.animationQueue.start();

    log.debug('All animations resumed', {
      component: 'AnimationManager',
      metadata: { totalAnimations: this.activeAnimations.size },
    });
  }

  /**
   * Stop low priority animations (performance optimization)
   */
  public pauseLowPriorityAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      if (animation.options.priority === 'low') {
        this.unregisterAnimation(id);
      }
    });
  }

  /**
   * Force stop all animations
   */
  public stopAll(): void {
    // Remove all animations from the queue
    this.animationQueue.clear();
    this.activeAnimations.clear();

    log.debug('All animations stopped', {
      component: 'AnimationManager',
      metadata: { totalAnimations: 0 },
    });
  }

  /**
   * Update accessibility settings
   */
  public setReducedMotion(enabled: boolean): void {
    this.isReducedMotion = enabled;
    if (enabled) {
      this.pauseLowPriorityAnimations();
    }
  }

  /**
   * Set global FPS limit
   */
  public setGlobalFPSLimit(fps: number): void {
    this.globalFPSLimit = Math.max(1, Math.min(120, fps));
    // Update the animation queue's frame budget accordingly
    this.animationQueue.updateFrameBudget(this.globalFPSLimit);
  }

  /**
   * Get comprehensive statistics including AnimationQueue metrics
   */
  public getStats() {
    const queueStats = this.animationQueue.getQueueStatistics();
    const queueMetrics = this.animationQueue.getPerformanceMetrics();

    return {
      // AnimationManager stats
      ...this.stats,
      activeAnimations: this.activeAnimations.size,
      isPaused: this.isPaused,
      isReducedMotion: this.isReducedMotion,
      globalFPSLimit: this.globalFPSLimit,

      // AnimationQueue stats
      queue: {
        totalAnimations: queueStats.totalAnimations,
        animationsByPriority: queueStats.animationsByPriority,
        averageExecutionTimes: queueStats.averageExecutionTimes,

        // Performance metrics from queue
        fps: queueMetrics.fps,
        frameTime: queueMetrics.frameTime,
        budgetUtilization: queueMetrics.budgetUtilization,
        queuedAnimations: queueMetrics.queuedAnimations,
        droppedFrames: queueMetrics.droppedFrames,
        lastFrameTimestamp: queueMetrics.lastFrameTimestamp,
      },
    };
  }

  /**
   * Load initial settings
   */
  private initializeSettings(): void {
    // Detect prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = mediaQuery.matches;

      // Monitor setting changes
      mediaQuery.addEventListener('change', (e) => {
        this.setReducedMotion(e.matches);
      });
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Performance check at regular intervals
    setInterval(() => {
      this.checkPerformance();
    }, INTERVALS.PERFORMANCE_CHECK);
  }

  /**
   * Update performance statistics from AnimationQueue metrics
   */
  private updatePerformanceStats(): void {
    const queueMetrics = this.animationQueue.getPerformanceMetrics();

    // Sync stats with queue metrics
    this.stats.totalFrames = Math.max(
      this.stats.totalFrames,
      queueMetrics.droppedFrames + Math.floor(queueMetrics.lastFrameTimestamp / 16.67)
    );
    this.stats.droppedFrames = queueMetrics.droppedFrames;
    this.stats.averageFrameTime = queueMetrics.frameTime;
  }

  /**
   * Performance check and auto-optimization
   */
  private checkPerformance(): void {
    const now = performance.now();
    if (now - this.stats.lastPerformanceCheck < INTERVALS.PERFORMANCE_CHECK) return;

    // Update performance stats from AnimationQueue
    this.updatePerformanceStats();

    const dropRate =
      this.stats.totalFrames > 0 ? this.stats.droppedFrames / this.stats.totalFrames : 0;

    // Auto-optimize when frame drop rate exceeds threshold (but not in development with limited frames)
    if (dropRate > PERFORMANCE_LIMITS.FRAME_DROP_THRESHOLD && this.stats.totalFrames > 60) {
      // Only log performance warnings in production or when there are significant samples
      if (ENV_CONFIG.IS_PRODUCTION || this.stats.totalFrames > 300) {
        log.warn(`High frame drop rate (${(dropRate * 100).toFixed(1)}%). Optimizing...`, {
          component: 'AnimationManager',
          action: 'checkPerformance',
          metadata: {
            dropRate,
            totalFrames: this.stats.totalFrames,
            droppedFrames: this.stats.droppedFrames,
          },
        });
      }

      this.pauseLowPriorityAnimations();

      // Lower global FPS limit
      if (this.globalFPSLimit > PERFORMANCE_LIMITS.MIN_FPS_LIMIT) {
        this.setGlobalFPSLimit(this.globalFPSLimit - PERFORMANCE_LIMITS.FPS_REDUCTION_STEP);
      }
    }

    this.stats.lastPerformanceCheck = now;
  }

  /**
   * Reset singleton state (implements ISingleton)
   */
  public override reset(): void {
    this.stopAll();
    this.resetPerformanceStats();
    this.isPaused = false;
    this.isReducedMotion = false;
    this.globalFPSLimit = 60;
  }

  /**
   * Clean up all resources (implements ISingleton)
   */
  public override destroy(): void {
    this.stopAll();
    // AnimationQueue cleanup is handled by stopAll()
  }

  /**
   * Reset performance statistics (useful for development)
   */
  public resetPerformanceStats(): void {
    this.stats = {
      totalFrames: 0,
      droppedFrames: 0,
      averageFrameTime: 0,
      lastPerformanceCheck: performance.now(),
    };
  }
}

// Export singleton instance
export const animationManager = AnimationManager.getInstance();
