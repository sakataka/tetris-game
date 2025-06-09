/**
 * パフォーマンス監視ユーティリティ
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
    this.logInterval = config.logInterval || 1000; // 1秒間隔
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

    // フレーム時間を記録
    this.frameTimes.push(deltaTime);
    this.renderTimes.push(renderTime);

    // サンプルサイズを超えた場合、古いデータを削除
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
      this.renderTimes.shift();
    }

    this.lastTime = now;

    const metrics = this.getMetrics(particleCount);

    // 定期的にログ出力
    if (now - this.lastLogTime > this.logInterval) {
      this.logMetrics(metrics);
      this.lastLogTime = now;
    }

    return metrics;
  }

  private getMetrics(particleCount: number): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.length > 0 
      ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length 
      : 0;
    
    const avgRenderTime = this.renderTimes.length > 0
      ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
      : 0;

    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    const metrics: PerformanceMetrics = {
      fps: Math.round(fps * 10) / 10,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      renderTime: Math.round(avgRenderTime * 100) / 100,
      particleCount
    };

    // メモリ使用量の監視（対応ブラウザのみ）
    if (this.enableMemoryMonitoring && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory?.usedJSHeapSize) {
        metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100; // MB
      }
    }

    return metrics;
  }

  private logMetrics(metrics: PerformanceMetrics): void {
    const logData = {
      FPS: metrics.fps,
      'Frame Time': `${metrics.frameTime}ms`,
      'Render Time': `${metrics.renderTime}ms`,
      'Particles': metrics.particleCount
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

  // FPS警告レベルの判定
  getPerformanceLevel(fps: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (fps >= 55) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'fair';
    return 'poor';
  }

  // パフォーマンス推奨事項
  getRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push('フレームレートが低下しています。パーティクル数を減らすことを検討してください。');
    }

    if (metrics.renderTime > 16) {
      recommendations.push('レンダリング時間が長すぎます。Canvas APIの使用を検討してください。');
    }

    if (metrics.particleCount > 100) {
      recommendations.push('パーティクル数が多すぎます。オブジェクトプールの最適化を検討してください。');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      recommendations.push('メモリ使用量が多いです。不要なオブジェクトの解放を確認してください。');
    }

    return recommendations;
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor({
  sampleSize: 60,
  enableMemoryMonitoring: true,
  logInterval: 5000
});

export default PerformanceMonitor;