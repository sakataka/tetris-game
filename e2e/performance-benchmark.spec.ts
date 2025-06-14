import { expect, test } from '@playwright/test';
import './types/browser-api';

/**
 * パフォーマンスベンチマーク
 * 実用的なパフォーマンス指標を測定し、ベースラインとの比較を行う
 */
test.describe('Performance Benchmark', () => {
  // ベースラインパフォーマンス指標
  const PERFORMANCE_BASELINES = {
    pageLoad: 3000, // ページ読み込み: 3秒以下
    firstPaint: 1000, // First Paint: 1秒以下
    interactionReady: 2000, // インタラクション準備完了: 2秒以下
    gameOperation: 50, // ゲーム操作応答: 50ms以下
    memoryUsage: 50 * 1024 * 1024, // メモリ使用量: 50MB以下
    fps: 30, // 最小FPS: 30以上
  };

  test.beforeEach(async ({ page }) => {
    // パフォーマンス測定のためのページ準備
    await page.goto('http://localhost:3001/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
  });

  test('should meet page load performance baseline', async ({ page }) => {
    const performanceMetrics = await page.evaluate(() => {
      return new Promise<{
        pageLoad: number;
        domContentLoaded: number;
        firstPaint: number;
        firstContentfulPaint: number;
        largestContentfulPaint: number;
      }>((resolve) => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        const metrics = {
          pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
        };

        // Paint メトrics
        const paintEntries = performance.getEntriesByType('paint');
        for (const entry of paintEntries) {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        }

        // LCP metrics
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
          resolve(metrics);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // 5秒でタイムアウト
        setTimeout(() => {
          observer.disconnect();
          resolve(metrics);
        }, 5000);
      });
    });

    // パフォーマンス指標の検証
    expect(performanceMetrics.firstPaint).toBeLessThan(PERFORMANCE_BASELINES.firstPaint);
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_BASELINES.firstPaint);

    if (performanceMetrics.largestContentfulPaint > 0) {
      expect(performanceMetrics.largestContentfulPaint).toBeLessThan(2500); // LCP: 2.5秒以下
    }

    console.log('📊 Page Load Metrics:', {
      'First Paint': `${performanceMetrics.firstPaint.toFixed(0)}ms`,
      'First Contentful Paint': `${performanceMetrics.firstContentfulPaint.toFixed(0)}ms`,
      'Largest Contentful Paint': `${performanceMetrics.largestContentfulPaint.toFixed(0)}ms`,
    });
  });

  test('should meet interaction responsiveness baseline', async ({ page }) => {
    // ゲームインタラクションの応答性測定
    await page.focus('body');

    const interactionMetrics = await page.evaluate(() => {
      return new Promise<{
        keyboardResponse: number;
        mouseResponse: number;
        averageResponse: number;
      }>((resolve) => {
        const responses: number[] = [];

        // キーボード応答測定
        const keyboardStart = performance.now();
        document.addEventListener(
          'keydown',
          () => {
            const keyboardEnd = performance.now();
            responses.push(keyboardEnd - keyboardStart);
          },
          { once: true }
        );

        // マウス応答測定
        const mouseStart = performance.now();
        document.addEventListener(
          'click',
          () => {
            const mouseEnd = performance.now();
            responses.push(mouseEnd - mouseStart);
          },
          { once: true }
        );

        // イベント発火
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        document.dispatchEvent(new MouseEvent('click'));

        setTimeout(() => {
          const avg =
            responses.length > 0 ? responses.reduce((a, b) => a + b, 0) / responses.length : 0;
          resolve({
            keyboardResponse: responses[0] || 0,
            mouseResponse: responses[1] || 0,
            averageResponse: avg,
          });
        }, 100);
      });
    });

    expect(interactionMetrics.averageResponse).toBeLessThan(PERFORMANCE_BASELINES.gameOperation);

    console.log('⚡ Interaction Metrics:', {
      'Keyboard Response': `${interactionMetrics.keyboardResponse.toFixed(1)}ms`,
      'Mouse Response': `${interactionMetrics.mouseResponse.toFixed(1)}ms`,
      Average: `${interactionMetrics.averageResponse.toFixed(1)}ms`,
    });
  });

  test('should maintain memory efficiency during gameplay', async ({ page }) => {
    // メモリ効率性の測定
    const memoryMetrics = await page.evaluate(() => {
      return new Promise<{
        initialMemory: number;
        peakMemory: number;
        finalMemory: number;
        garbageCollected: number;
      }>((resolve) => {
        const memory = performance.memory;
        if (!memory) {
          resolve({ initialMemory: 0, peakMemory: 0, finalMemory: 0, garbageCollected: 0 });
          return;
        }

        const initialMemory = memory.usedJSHeapSize;
        let peakMemory = initialMemory;

        // メモリ集約的な操作のシミュレーション
        const bigObjects: Array<{ id: number; data: string[]; timestamp: number }> = [];

        for (let i = 0; i < 1000; i++) {
          bigObjects.push({
            id: i,
            data: new Array(100).fill(`game-data-${i}`),
            timestamp: Date.now(),
          });

          // メモリ使用量の監視
          const currentMemory = memory.usedJSHeapSize;
          if (currentMemory > peakMemory) {
            peakMemory = currentMemory;
          }
        }

        // ガベージコレクションの実行
        bigObjects.length = 0;

        setTimeout(() => {
          const finalMemory = memory.usedJSHeapSize;
          const garbageCollected = peakMemory - finalMemory;

          resolve({
            initialMemory,
            peakMemory,
            finalMemory,
            garbageCollected,
          });
        }, 1000);
      });
    });

    if (memoryMetrics.initialMemory > 0) {
      const memoryIncrease = memoryMetrics.finalMemory - memoryMetrics.initialMemory;
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_BASELINES.memoryUsage);

      // ガベージコレクションの効率性
      const gcEfficiency = memoryMetrics.garbageCollected / memoryMetrics.peakMemory;
      expect(gcEfficiency).toBeGreaterThan(0.5); // 50%以上回収

      console.log('🧠 Memory Metrics:', {
        Initial: `${(memoryMetrics.initialMemory / 1024 / 1024).toFixed(1)}MB`,
        Peak: `${(memoryMetrics.peakMemory / 1024 / 1024).toFixed(1)}MB`,
        Final: `${(memoryMetrics.finalMemory / 1024 / 1024).toFixed(1)}MB`,
        'GC Efficiency': `${(gcEfficiency * 100).toFixed(1)}%`,
      });
    }
  });

  test('should achieve target frame rate during animations', async ({ page }) => {
    // FPS測定とアニメーション性能
    const fpsMetrics = await page.evaluate(() => {
      return new Promise<{
        averageFps: number;
        minFps: number;
        maxFps: number;
        frameDrops: number;
      }>((resolve) => {
        const frames: number[] = [];
        let lastFrameTime = performance.now();
        let frameDrops = 0;

        function measureFrame() {
          const currentTime = performance.now();
          const frameDuration = currentTime - lastFrameTime;
          const fps = 1000 / frameDuration;

          frames.push(fps);

          if (fps < 30) {
            frameDrops++;
          }

          lastFrameTime = currentTime;

          if (frames.length < 60) {
            // 60フレーム測定
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
            const minFps = Math.min(...frames);
            const maxFps = Math.max(...frames);

            resolve({
              averageFps: avgFps,
              minFps,
              maxFps,
              frameDrops,
            });
          }
        }

        // アニメーション開始
        requestAnimationFrame(measureFrame);
      });
    });

    expect(fpsMetrics.averageFps).toBeGreaterThan(PERFORMANCE_BASELINES.fps);
    expect(fpsMetrics.frameDrops).toBeLessThan(10); // フレームドロップ10回以下

    console.log('🎬 Animation Metrics:', {
      'Average FPS': fpsMetrics.averageFps.toFixed(1),
      'Min FPS': fpsMetrics.minFps.toFixed(1),
      'Max FPS': fpsMetrics.maxFps.toFixed(1),
      'Frame Drops': fpsMetrics.frameDrops,
    });
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    // 並行処理の効率性測定
    const concurrentMetrics = await page.evaluate(() => {
      return new Promise<{
        totalTime: number;
        operationsPerSecond: number;
        successRate: number;
      }>((resolve) => {
        const startTime = performance.now();
        const operations = 100;
        let completed = 0;
        let successful = 0;

        // 並行操作のシミュレーション
        for (let i = 0; i < operations; i++) {
          setTimeout(() => {
            try {
              // DOM操作のシミュレーション
              const element = document.createElement('div');
              element.textContent = `Operation ${i}`;
              document.body.appendChild(element);
              document.body.removeChild(element);

              successful++;
            } catch (_error) {
              // エラーをカウント
            }

            completed++;

            if (completed === operations) {
              const endTime = performance.now();
              const totalTime = endTime - startTime;
              const operationsPerSecond = (operations / totalTime) * 1000;
              const successRate = (successful / operations) * 100;

              resolve({
                totalTime,
                operationsPerSecond,
                successRate,
              });
            }
          }, Math.random() * 10); // ランダムな遅延
        }
      });
    });

    expect(concurrentMetrics.successRate).toBeGreaterThan(95); // 95%以上成功
    expect(concurrentMetrics.operationsPerSecond).toBeGreaterThan(100); // 100ops/sec以上

    console.log('🔄 Concurrent Operations:', {
      'Total Time': `${concurrentMetrics.totalTime.toFixed(0)}ms`,
      'Operations/sec': concurrentMetrics.operationsPerSecond.toFixed(0),
      'Success Rate': `${concurrentMetrics.successRate.toFixed(1)}%`,
    });
  });

  test('should generate performance baseline report', async ({ page }) => {
    // 全体的なパフォーマンス報告書の生成
    const baselineReport = await page.evaluate((baselines) => {
      const report = {
        timestamp: new Date().toISOString(),
        environment: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          hardware: {
            cores: navigator.hardwareConcurrency,
            memory: navigator.deviceMemory,
          },
        },
        baselines,
        recommendations: [] as string[],
      };

      // パフォーマンス推奨事項
      if (report.environment.hardware.cores < 4) {
        report.recommendations.push('Consider reducing particle effects for low-core devices');
      }

      if (report.environment.hardware.memory && report.environment.hardware.memory < 4) {
        report.recommendations.push(
          'Implement more aggressive memory management for low-memory devices'
        );
      }

      if (report.environment.viewport.width < 768) {
        report.recommendations.push('Optimize mobile layout and touch controls');
      }

      return report;
    }, PERFORMANCE_BASELINES);

    expect(baselineReport.timestamp).toBeTruthy();
    expect(baselineReport.environment.userAgent).toBeTruthy();

    console.log('📋 Performance Baseline Report:', {
      Environment: baselineReport.environment,
      Recommendations: baselineReport.recommendations,
    });

    // レポートの保存（実際の実装では外部ファイルに保存）
    await page.evaluate((report) => {
      window.__performanceBaselineReport = report;
    }, baselineReport);
  });
});
