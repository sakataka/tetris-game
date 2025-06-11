/**
 * Performance Monitoring Utilities
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
  particleCount: number;
}

interface PerformanceConfig {
  sampleSize?: number;
  enableMemoryMonitoring?: boolean;
  logInterval?: number;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private sampleSize: number;
  private enableMemoryMonitoring: boolean;
  private logInterval: number;
  private lastLogTime = 0;
  private renderStartTime = 0;

  constructor(config: PerformanceConfig = {}) {
    this.sampleSize = config.sampleSize || 60;
    this.enableMemoryMonitoring = config.enableMemoryMonitoring ?? true;
    this.logInterval = config.logInterval || 1000; // 1-second interval
  }

  startFrame(): void {
    this.renderStartTime = performance.now();
  }

  endFrame(particleCount: number = 0): PerformanceMetrics {
    const now = performance.now();
    const renderTime = now - this.renderStartTime;

    if (this.lastTime === 0) {
      this.lastTime = now;
      return this.getMetrics(particleCount);
    }

    const deltaTime = now - this.lastTime;
    this.frameCount++;

    // Record frame time
    this.frameTimes.push(deltaTime);
    this.renderTimes.push(renderTime);

    // Remove old data when sample size is exceeded
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
      this.renderTimes.shift();
    }

    this.lastTime = now;

    const metrics = this.getMetrics(particleCount);

    // Periodic log output
    if (now - this.lastLogTime > this.logInterval) {
      this.logMetrics(metrics);
      this.lastLogTime = now;
    }

    return metrics;
  }

  private getMetrics(particleCount: number): PerformanceMetrics {
    const avgFrameTime =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length
        : 0;

    const avgRenderTime =
      this.renderTimes.length > 0
        ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
        : 0;

    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    const metrics: PerformanceMetrics = {
      fps: Math.round(fps * 10) / 10,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      renderTime: Math.round(avgRenderTime * 100) / 100,
      particleCount,
    };

    // Memory usage monitoring (supported browsers only)
    if (this.enableMemoryMonitoring && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory?.usedJSHeapSize) {
        metrics.memoryUsage = Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100; // MB
      }
    }

    return metrics;
  }

  private logMetrics(metrics: PerformanceMetrics): void {
    const logData = {
      FPS: metrics.fps,
      'Frame Time': `${metrics.frameTime}ms`,
      'Render Time': `${metrics.renderTime}ms`,
      Particles: metrics.particleCount,
    };

    if (metrics.memoryUsage !== undefined) {
      (logData as typeof logData & { Memory: string })['Memory'] = `${metrics.memoryUsage}MB`;
    }

    console.group('🚀 Performance Metrics');
    console.table(logData);
    console.groupEnd();
  }

  getAverageMetrics(): PerformanceMetrics | null {
    if (this.frameTimes.length === 0) return null;
    return this.getMetrics(0);
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = 0;
    this.frameTimes = [];
    this.renderTimes = [];
    this.lastLogTime = 0;
  }

  // Determine FPS warning level
  getPerformanceLevel(fps: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'fair';
    return 'poor';
  }

  // Performance recommendations
  getRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push('Frame rate is low. Consider reducing the number of particles.');
    }

    if (metrics.renderTime > 16) {
      recommendations.push('Rendering time is too long. Consider using Canvas API.');
    }

    if (metrics.particleCount > 100) {
      recommendations.push('Too many particles. Consider optimizing object pool.');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      recommendations.push('High memory usage. Check for unnecessary object releases.');
    }

    return recommendations;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor({
  sampleSize: 60,
  enableMemoryMonitoring: true,
  logInterval: 5000,
});

export default PerformanceMonitor;
