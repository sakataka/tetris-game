/**
 * Advanced Animation Queue System
 *
 * Provides intelligent frame budget management and priority-based scheduling
 * to optimize animation performance and prevent frame drops.
 */

import { log } from '@/utils/logging/logger';

export type AnimationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueuedAnimation {
  id: string;
  callback: FrameRequestCallback;
  priority: AnimationPriority;
  fps: number;
  lastExecutionTime: number;
  estimatedDuration: number;
  averageExecutionTime: number;
  executionCount: number;
}

export interface FrameBudget {
  total: number;
  remaining: number;
  priorityAllocations: Record<AnimationPriority, number>;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  budgetUtilization: number;
  queuedAnimations: number;
  droppedFrames: number;
  lastFrameTimestamp: number;
}

/**
 * Advanced Animation Queue with Frame Budget Management
 */
export class AnimationQueue {
  private animationMap = new Map<string, QueuedAnimation>();
  private executionQueue: QueuedAnimation[] = [];
  private masterRequestId: number | null = null;
  private isRunning = false;

  // Frame budget configuration (in milliseconds)
  private readonly frameBudgetConfig: FrameBudget = {
    total: 16.67, // 60fps target
    remaining: 16.67,
    priorityAllocations: {
      critical: 8, // 48% of budget - game logic, user input
      high: 5, // 30% of budget - important UI animations
      normal: 2.67, // 16% of budget - general animations
      low: 1, // 6% of budget - decorative effects
    },
  };

  // Performance tracking
  private performanceMetrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 0,
    budgetUtilization: 0,
    queuedAnimations: 0,
    droppedFrames: 0,
    lastFrameTimestamp: 0,
  };

  // Execution time tracking for optimization
  private readonly executionHistory: number[] = [];
  private readonly maxHistorySize = 10;

  constructor() {
    this.bindMethods();
  }

  private bindMethods(): void {
    this.executeFrame = this.executeFrame.bind(this);
  }

  /**
   * Add animation to the queue with priority scheduling
   */
  public addAnimation(
    id: string,
    callback: FrameRequestCallback,
    options: {
      priority?: AnimationPriority;
      fps?: number;
      estimatedDuration?: number;
    } = {}
  ): void {
    const animation: QueuedAnimation = {
      id,
      callback,
      priority: options.priority || 'normal',
      fps: options.fps || 60,
      lastExecutionTime: 0,
      estimatedDuration: options.estimatedDuration || 1, // 1ms default
      averageExecutionTime: 1,
      executionCount: 0,
    };

    this.animationMap.set(id, animation);
    this.rebuildExecutionQueue();

    if (!this.isRunning) {
      this.start();
    }

    log.debug('Animation added to queue', {
      component: 'AnimationQueue',
      metadata: {
        id,
        priority: animation.priority,
        queueSize: this.animationMap.size,
      },
    });
  }

  /**
   * Remove animation from queue
   */
  public removeAnimation(id: string): boolean {
    const removed = this.animationMap.delete(id);
    if (removed) {
      this.rebuildExecutionQueue();

      if (this.animationMap.size === 0) {
        this.stop();
      }

      log.debug('Animation removed from queue', {
        component: 'AnimationQueue',
        metadata: { id, queueSize: this.animationMap.size },
      });
    }
    return removed;
  }

  /**
   * Start the master animation loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.performanceMetrics.lastFrameTimestamp = performance.now();
    this.scheduleNextFrame();

    log.debug('Animation queue started', {
      component: 'AnimationQueue',
      metadata: { queueSize: this.animationMap.size },
    });
  }

  /**
   * Stop the master animation loop
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.masterRequestId !== null) {
      cancelAnimationFrame(this.masterRequestId);
      this.masterRequestId = null;
    }

    log.debug('Animation queue stopped', {
      component: 'AnimationQueue',
      metadata: { finalQueueSize: this.animationMap.size },
    });
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update frame budget based on performance
   */
  public updateFrameBudget(targetFps: number): void {
    const newBudget = 1000 / targetFps;
    this.frameBudgetConfig.total = newBudget;
    this.frameBudgetConfig.remaining = newBudget;

    // Redistribute priority allocations proportionally
    const totalRatio = 0.48 + 0.3 + 0.16 + 0.06; // critical + high + normal + low
    this.frameBudgetConfig.priorityAllocations.critical = newBudget * (0.48 / totalRatio);
    this.frameBudgetConfig.priorityAllocations.high = newBudget * (0.3 / totalRatio);
    this.frameBudgetConfig.priorityAllocations.normal = newBudget * (0.16 / totalRatio);
    this.frameBudgetConfig.priorityAllocations.low = newBudget * (0.06 / totalRatio);

    log.debug('Frame budget updated', {
      component: 'AnimationQueue',
      metadata: { targetFps, newBudget, allocations: this.frameBudgetConfig.priorityAllocations },
    });
  }

  /**
   * Rebuild execution queue with priority ordering
   */
  private rebuildExecutionQueue(): void {
    this.executionQueue = Array.from(this.animationMap.values()).sort((a, b) => {
      const priorityOrder: Record<AnimationPriority, number> = {
        critical: 0,
        high: 1,
        normal: 2,
        low: 3,
      };

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Secondary sort by average execution time (faster first)
      return a.averageExecutionTime - b.averageExecutionTime;
    });

    this.performanceMetrics.queuedAnimations = this.executionQueue.length;
  }

  /**
   * Schedule next animation frame
   */
  private scheduleNextFrame(): void {
    if (!this.isRunning) return;
    this.masterRequestId = requestAnimationFrame(this.executeFrame);
  }

  /**
   * Execute animation frame with budget management
   */
  private executeFrame(timestamp: number): void {
    const frameStartTime = performance.now();
    const deltaTime = timestamp - this.performanceMetrics.lastFrameTimestamp;

    // Update FPS calculation
    this.updateFPSMetrics(deltaTime);

    // Reset frame budget
    this.frameBudgetConfig.remaining = this.frameBudgetConfig.total;

    // Execute animations by priority with budget constraints
    this.executeAnimationsByPriority(timestamp);

    // Track frame execution time
    const frameExecutionTime = performance.now() - frameStartTime;
    this.updateExecutionMetrics(frameExecutionTime);

    this.performanceMetrics.lastFrameTimestamp = timestamp;
    this.scheduleNextFrame();
  }

  /**
   * Execute animations by priority with budget allocation
   */
  private executeAnimationsByPriority(timestamp: number): void {
    const priorities: AnimationPriority[] = ['critical', 'high', 'normal', 'low'];
    let _totalExecuted = 0;

    for (const priority of priorities) {
      const budgetForPriority = this.frameBudgetConfig.priorityAllocations[priority];
      const priorityAnimations = this.executionQueue.filter((anim) => anim.priority === priority);

      let priorityBudgetUsed = 0;

      for (const animation of priorityAnimations) {
        // Check if we should execute this animation (FPS throttling)
        if (!this.shouldExecuteAnimation(animation, timestamp)) {
          continue;
        }

        // Check if we have budget remaining
        if (priorityBudgetUsed + animation.estimatedDuration > budgetForPriority) {
          this.performanceMetrics.droppedFrames++;
          continue;
        }

        // Execute animation and measure time
        const executionStart = performance.now();
        try {
          animation.callback(timestamp);
          _totalExecuted++;
        } catch (error) {
          log.warn('Animation execution failed', {
            component: 'AnimationQueue',
            metadata: { animationId: animation.id, error },
          });
        }

        const executionTime = performance.now() - executionStart;
        this.updateAnimationMetrics(animation, executionTime);

        priorityBudgetUsed += executionTime;
        this.frameBudgetConfig.remaining -= executionTime;

        // Break if we've exceeded the total frame budget
        if (this.frameBudgetConfig.remaining <= 0) {
          break;
        }
      }

      // Break if we've exceeded the total frame budget
      if (this.frameBudgetConfig.remaining <= 0) {
        break;
      }
    }

    // Update budget utilization metric
    this.performanceMetrics.budgetUtilization =
      (this.frameBudgetConfig.total - this.frameBudgetConfig.remaining) /
      this.frameBudgetConfig.total;
  }

  /**
   * Check if animation should execute based on FPS throttling
   */
  private shouldExecuteAnimation(animation: QueuedAnimation, timestamp: number): boolean {
    const targetInterval = 1000 / animation.fps;
    const timeSinceLastExecution = timestamp - animation.lastExecutionTime;

    return animation.lastExecutionTime === 0 || timeSinceLastExecution >= targetInterval;
  }

  /**
   * Update animation-specific metrics
   */
  private updateAnimationMetrics(animation: QueuedAnimation, executionTime: number): void {
    animation.lastExecutionTime = performance.now();
    animation.executionCount++;

    // Update rolling average execution time
    if (animation.executionCount === 1) {
      animation.averageExecutionTime = executionTime;
    } else {
      animation.averageExecutionTime = animation.averageExecutionTime * 0.8 + executionTime * 0.2;
    }

    // Update estimated duration for future budget planning
    animation.estimatedDuration = Math.max(1, animation.averageExecutionTime * 1.2); // 20% buffer
  }

  /**
   * Update FPS metrics
   */
  private updateFPSMetrics(deltaTime: number): void {
    if (deltaTime > 0) {
      const currentFps = 1000 / deltaTime;
      // Rolling average FPS calculation
      this.performanceMetrics.fps = this.performanceMetrics.fps * 0.9 + currentFps * 0.1;
    }
  }

  /**
   * Update execution time metrics
   */
  private updateExecutionMetrics(frameTime: number): void {
    this.executionHistory.push(frameTime);

    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }

    // Calculate average frame time
    this.performanceMetrics.frameTime =
      this.executionHistory.reduce((sum, time) => sum + time, 0) / this.executionHistory.length;
  }

  /**
   * Get queue statistics for debugging
   */
  public getQueueStatistics(): {
    totalAnimations: number;
    animationsByPriority: Record<AnimationPriority, number>;
    averageExecutionTimes: Record<string, number>;
    performanceMetrics: PerformanceMetrics;
  } {
    const animationsByPriority: Record<AnimationPriority, number> = {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
    };

    const averageExecutionTimes: Record<string, number> = {};

    for (const animation of this.animationMap.values()) {
      animationsByPriority[animation.priority]++;
      averageExecutionTimes[animation.id] = animation.averageExecutionTime;
    }

    return {
      totalAnimations: this.animationMap.size,
      animationsByPriority,
      averageExecutionTimes,
      performanceMetrics: this.getPerformanceMetrics(),
    };
  }

  /**
   * Clear all animations and stop the queue
   */
  public clear(): void {
    this.animationMap.clear();
    this.executionQueue = [];
    this.stop();

    log.debug('Animation queue cleared', {
      component: 'AnimationQueue',
    });
  }
}
