/**
 * Unified Animation Management System
 *
 * Integrates previously scattered requestAnimationFrame management,
 * providing a centralized animation manager that improves performance and maintainability
 */

import { PERFORMANCE_LIMITS } from '../../constants/performance';
import { INTERVALS } from '../../constants/timing';
import { log } from '../logging';
import { ENV_CONFIG } from '../../config/environment';

export interface AnimationOptions {
  /** Target FPS (default: 60) */
  fps?: number;
  /** Animation priority (high priority continues even at low FPS) */
  priority?: 'low' | 'normal' | 'high';
  /** Auto-stop conditions */
  autoStop?: {
    /** Maximum execution time (milliseconds) */
    maxDuration?: number;
    /** Condition function (stops when true) */
    condition?: () => boolean;
  };
}

interface ActiveAnimation {
  id: string;
  callback: FrameRequestCallback;
  options: Required<AnimationOptions>;
  requestId: number;
  startTime: number;
  lastFrameTime: number;
  frameCount: number;
}

/**
 * Singleton Animation Manager
 *
 * Features:
 * - Unified requestAnimationFrame management
 * - FPS limiting and priority-based execution control
 * - Performance monitoring and auto-optimization
 * - Debug statistics
 */
export class AnimationManager {
  private static instance: AnimationManager;
  private activeAnimations = new Map<string, ActiveAnimation>();
  private isPaused = false;
  private isReducedMotion = false;
  private globalFPSLimit = 60;
  private performanceThreshold = PERFORMANCE_LIMITS.PERFORMANCE_THRESHOLD_MS;

  // Performance statistics
  private stats = {
    totalFrames: 0,
    droppedFrames: 0,
    averageFrameTime: 0,
    lastPerformanceCheck: 0,
  };

  private constructor() {
    this.initializeSettings();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
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
      const fullOptions: Required<AnimationOptions> = {
        fps: options.fps ?? this.globalFPSLimit,
        priority: options.priority ?? 'normal',
        autoStop: {
          maxDuration: options.autoStop?.maxDuration ?? Number.POSITIVE_INFINITY,
          condition: options.autoStop?.condition ?? (() => false),
        },
      };

      // Skip low priority animations when reduced-motion is enabled
      if (this.isReducedMotion && fullOptions.priority === 'low') {
        return;
      }

      const animation: ActiveAnimation = {
        id,
        callback,
        options: fullOptions,
        requestId: 0,
        startTime: performance.now(),
        lastFrameTime: 0,
        frameCount: 0,
      };

      // Animation execution loop
      const animate = (currentTime: number) => {
        if (this.isPaused || !this.activeAnimations.has(id)) {
          return;
        }

        const targetInterval = 1000 / fullOptions.fps;
        const deltaTime = currentTime - animation.lastFrameTime;

        // FPS limit check (first frame or interval elapsed)
        if (animation.lastFrameTime === 0 || deltaTime >= targetInterval) {
          // Auto-stop condition check
          const elapsed = currentTime - animation.startTime;
          const maxDuration = fullOptions.autoStop.maxDuration ?? Number.POSITIVE_INFINITY;
          if (elapsed >= maxDuration || fullOptions.autoStop.condition?.()) {
            this.unregisterAnimation(id);
            return;
          }

          try {
            callback(currentTime);
            animation.frameCount++;
            animation.lastFrameTime = currentTime;

            // Update performance statistics
            this.updatePerformanceStats(deltaTime);
          } catch (error) {
            log.warn('Animation callback error', {
              component: 'AnimationManager',
              metadata: { animationId: id, error },
            });
            this.unregisterAnimation(id);
            return;
          }
        }

        animation.requestId = requestAnimationFrame(animate);
      };

      animation.requestId = requestAnimationFrame(animate);
      this.activeAnimations.set(id, animation);
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
      cancelAnimationFrame(animation.requestId);
      this.activeAnimations.delete(id);
    }
  }

  /**
   * Pause all animations
   */
  public pauseAll(): void {
    this.isPaused = true;
    this.activeAnimations.forEach((animation) => {
      cancelAnimationFrame(animation.requestId);
    });
  }

  /**
   * Resume all animations
   */
  public resumeAll(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.activeAnimations.forEach((animation, id) => {
      // Start new requestAnimationFrame on resume
      this.registerAnimation(id, animation.callback, animation.options);
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
    this.activeAnimations.forEach((animation) => {
      cancelAnimationFrame(animation.requestId);
    });
    this.activeAnimations.clear();
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
  }

  /**
   * Get debug statistics
   */
  public getStats() {
    return {
      ...this.stats,
      activeAnimations: this.activeAnimations.size,
      isPaused: this.isPaused,
      isReducedMotion: this.isReducedMotion,
      globalFPSLimit: this.globalFPSLimit,
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
   * Update performance statistics
   */
  private updatePerformanceStats(frameTime: number): void {
    this.stats.totalFrames++;

    if (frameTime > this.performanceThreshold * 2) {
      this.stats.droppedFrames++;
    }

    // Calculate frame time with moving average
    this.stats.averageFrameTime = this.stats.averageFrameTime * 0.9 + frameTime * 0.1;
  }

  /**
   * Performance check and auto-optimization
   */
  private checkPerformance(): void {
    const now = performance.now();
    if (now - this.stats.lastPerformanceCheck < INTERVALS.PERFORMANCE_CHECK) return;

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
