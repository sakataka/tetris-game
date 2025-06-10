/**
 * Adaptive FPS Controller with intelligent frame rate management
 * Separates FPS control from rendering logic for better performance optimization
 */

interface FpsControllerConfig {
  targetFps?: number;
  minFps?: number;
  maxFps?: number;
  adaptiveMode?: boolean;
  performanceThreshold?: number;
}

interface FrameInfo {
  timestamp: number;
  deltaTime: number;
  actualFps: number;
  shouldRender: boolean;
  skipReason?: string;
}

export class FpsController {
  private config: Required<FpsControllerConfig>;
  private lastFrameTime = 0;
  private frameInterval: number;
  private frameCount = 0;
  private lastFpsCalculation = 0;
  private currentFps = 0;
  private adaptiveInterval: number;
  private performanceHistory: number[] = [];
  private isThrottling = false;

  constructor(config: FpsControllerConfig = {}) {
    this.config = {
      targetFps: config.targetFps ?? 60,
      minFps: config.minFps ?? 30,
      maxFps: config.maxFps ?? 120,
      adaptiveMode: config.adaptiveMode ?? true,
      performanceThreshold: config.performanceThreshold ?? 50, // milliseconds
    };

    this.frameInterval = 1000 / this.config.targetFps;
    this.adaptiveInterval = this.frameInterval;
  }

  // Check if current frame should be rendered based on FPS control
  shouldRenderFrame(timestamp: number): FrameInfo {
    const deltaTime = timestamp - this.lastFrameTime;
    
    // First frame is always rendered
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
      this.lastFpsCalculation = timestamp;
      return {
        timestamp,
        deltaTime: 0,
        actualFps: this.currentFps,
        shouldRender: true,
      };
    }
    
    // Calculate current FPS
    this.frameCount++;
    if (timestamp - this.lastFpsCalculation >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsCalculation = timestamp;
      
      // Update adaptive interval if enabled
      if (this.config.adaptiveMode) {
        this.updateAdaptiveInterval();
      }
    }

    const frameInfo: FrameInfo = {
      timestamp,
      deltaTime,
      actualFps: this.currentFps,
      shouldRender: false,
    };

    // Check if enough time has passed for next frame
    if (deltaTime < this.adaptiveInterval) {
      frameInfo.shouldRender = false;
      frameInfo.skipReason = `Frame skipped: deltaTime(${deltaTime.toFixed(1)}ms) < interval(${this.adaptiveInterval.toFixed(1)}ms)`;
      return frameInfo;
    }

    // Check if frame rate is too high
    if (this.currentFps > this.config.maxFps) {
      frameInfo.shouldRender = false;
      frameInfo.skipReason = `Frame rate too high: ${this.currentFps}fps > ${this.config.maxFps}fps`;
      return frameInfo;
    }

    this.lastFrameTime = timestamp;
    frameInfo.shouldRender = true;
    return frameInfo;
  }

  // Adaptive interval adjustment based on performance
  private updateAdaptiveInterval(): void {
    // Add current FPS to performance history
    this.performanceHistory.push(this.currentFps);
    
    // Keep only recent history (last 10 measurements)
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    const avgFps = this.performanceHistory.reduce((sum, fps) => sum + fps, 0) / this.performanceHistory.length;
    
    // Adjust interval based on performance
    if (avgFps < this.config.minFps) {
      // Performance is poor, reduce target FPS
      this.adaptiveInterval = Math.min(
        this.adaptiveInterval * 1.1,
        1000 / this.config.minFps
      );
      this.isThrottling = true;
    } else if (avgFps > this.config.targetFps * 1.1 && this.isThrottling) {
      // Performance is good, try to restore target FPS
      this.adaptiveInterval = Math.max(
        this.adaptiveInterval * 0.95,
        this.frameInterval
      );
      
      if (this.adaptiveInterval <= this.frameInterval) {
        this.isThrottling = false;
      }
    }
  }

  // Get current FPS information
  getFpsInfo(): {
    currentFps: number;
    targetFps: number;
    adaptiveInterval: number;
    isThrottling: boolean;
    performanceLevel: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (this.currentFps >= this.config.targetFps * 0.9) {
      performanceLevel = 'excellent';
    } else if (this.currentFps >= this.config.targetFps * 0.75) {
      performanceLevel = 'good';
    } else if (this.currentFps >= this.config.minFps) {
      performanceLevel = 'fair';
    } else {
      performanceLevel = 'poor';
    }

    return {
      currentFps: this.currentFps,
      targetFps: this.config.targetFps,
      adaptiveInterval: this.adaptiveInterval,
      isThrottling: this.isThrottling,
      performanceLevel,
    };
  }

  // Update configuration dynamically
  updateConfig(newConfig: Partial<FpsControllerConfig>): void {
    Object.assign(this.config, newConfig);
    
    if (newConfig.targetFps) {
      this.frameInterval = 1000 / this.config.targetFps;
      if (!this.isThrottling) {
        this.adaptiveInterval = this.frameInterval;
      }
    }
  }

  // Reset controller state
  reset(): void {
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastFpsCalculation = 0;
    this.currentFps = 0;
    this.adaptiveInterval = this.frameInterval;
    this.performanceHistory.length = 0;
    this.isThrottling = false;
  }

  // Create frame rate limiter function for requestAnimationFrame
  createFrameLimiter(callback: (frameInfo: FrameInfo) => void): (timestamp: number) => void {
    return (timestamp: number) => {
      const frameInfo = this.shouldRenderFrame(timestamp);
      callback(frameInfo);
    };
  }

  // Performance recommendations based on current state
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const fpsInfo = this.getFpsInfo();

    if (fpsInfo.performanceLevel === 'poor') {
      recommendations.push('Reduce particle count or enable Canvas renderer');
      recommendations.push('Consider disabling shadows or gradients');
    } else if (fpsInfo.performanceLevel === 'fair') {
      recommendations.push('Performance is acceptable but could be improved');
    }

    if (this.isThrottling) {
      recommendations.push('FPS is being throttled due to performance constraints');
    }

    if (fpsInfo.currentFps > fpsInfo.targetFps * 1.2) {
      recommendations.push('Consider enabling VSync or reducing max FPS limit');
    }

    return recommendations;
  }
}

// Singleton instance for global FPS management
export const globalFpsController = new FpsController({
  targetFps: 60,
  minFps: 30,
  maxFps: 120,
  adaptiveMode: true,
});

export default FpsController;