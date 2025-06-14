import { expect, test } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // First Contentful Paint (FCP) 測定
    const fcpMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      });
    });

    expect(fcpMetric).toBeLessThan(1800); // 1.8秒以下（Good: <1.8s）

    // Largest Contentful Paint (LCP) 測定
    const lcpMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            resolve(lastEntry.startTime);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // 5秒後にタイムアウト
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });

    if (lcpMetric > 0) {
      expect(lcpMetric).toBeLessThan(2500); // 2.5秒以下（Good: <2.5s）
    }

    // Cumulative Layout Shift (CLS) 測定
    const clsMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });

        // 3秒後に測定終了
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    expect(clsMetric).toBeLessThan(0.1); // 0.1以下（Good: <0.1）
  });

  test('should load game interface within performance budget', async ({ page }) => {
    const startTime = Date.now();

    // ゲーム画面の要素が表示されるまでの時間を測定
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
    await expect(page.locator('[data-testid="score"]')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // ゲーム画面が2秒以内に表示される
    expect(loadTime).toBeLessThan(2000);
  });

  test('should maintain responsive performance during gameplay', async ({ page }) => {
    // ゲーム開始時のメモリ使用量
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 60秒間の連続ゲームプレイシミュレーション
    const playDuration = 60 * 1000; // 60秒
    const startTime = Date.now();

    await page.focus('body');

    const frameStats = [];

    while (Date.now() - startTime < playDuration) {
      const frameStart = Date.now();

      // ゲーム操作
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);

      const frameEnd = Date.now();
      frameStats.push(frameEnd - frameStart);
    }

    // 最終メモリ使用量
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // パフォーマンス検証
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      expect(memoryIncrease).toBeLessThan(100); // 100MB以下の増加
    }

    // フレーム時間の平均が100ms以下
    const avgFrameTime = frameStats.reduce((a, b) => a + b, 0) / frameStats.length;
    expect(avgFrameTime).toBeLessThan(100);

    // ゲームが正常に動作している
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('should handle multiple tab switching performance', async ({ context, page }) => {
    // 複数タブを開いてパフォーマンスへの影響を測定
    const tabs = [];

    for (let i = 0; i < 3; i++) {
      const newTab = await context.newPage();
      await newTab.goto('/');
      await newTab.waitForLoadState('networkidle');
      tabs.push(newTab);
    }

    // 各タブでゲーム操作を実行
    for (const tab of tabs) {
      await tab.focus('body');
      await tab.keyboard.press('Space');
      await tab.waitForTimeout(100);
    }

    // メインタブのパフォーマンスチェック
    await page.bringToFront();
    await page.focus('body');

    const performanceStart = Date.now();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    const performanceEnd = Date.now();

    const responseTime = performanceEnd - performanceStart;
    expect(responseTime).toBeLessThan(100); // 100ms以内の応答

    // タブのクリーンアップ
    for (const tab of tabs) {
      await tab.close();
    }
  });

  test('should measure bundle loading performance', async ({ page }) => {
    // ネットワークリソースの監視
    const resources: Array<{ url: string; size: number; duration: number }> = [];

    page.on('response', async (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        const _request = response.request();
        const timing = response.request().timing();

        resources.push({
          url: response.url(),
          size: await response
            .body()
            .then((buffer) => buffer.length)
            .catch(() => 0),
          duration: timing?.responseEnd ? timing.responseEnd - timing.responseStart : 0,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // バンドルサイズ検証
    const jsResources = resources.filter((r) => r.url.includes('.js'));
    const maxJsSize = Math.max(...jsResources.map((r) => r.size));

    // 最大JSファイルが250KB以下
    expect(maxJsSize).toBeLessThan(250 * 1024);

    // CSSファイルサイズ検証
    const cssResources = resources.filter((r) => r.url.includes('.css'));
    const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);

    // 合計CSSサイズが150KB以下
    expect(totalCssSize).toBeLessThan(150 * 1024);

    // リソース読み込み時間検証
    const slowResources = resources.filter((r) => r.duration > 1000);
    expect(slowResources.length).toBe(0); // 1秒以上かかるリソースなし
  });

  test('should maintain performance with settings changes', async ({ page }) => {
    // 設定変更時のパフォーマンス影響測定

    // 初期パフォーマンス測定
    const initialStart = Date.now();
    await page.keyboard.press('Space');
    const initialEnd = Date.now();
    const initialResponse = initialEnd - initialStart;

    // テーマ変更
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="theme-selector"]');
    await page.locator('[data-value="purple"]').click();
    await page.waitForTimeout(500);

    // 言語変更
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // ゲームタブに戻る
    await page.click('[data-testid="game-tab"]');
    await page.waitForTimeout(500);

    // 変更後のパフォーマンス測定
    await page.focus('body');
    const afterStart = Date.now();
    await page.keyboard.press('Space');
    const afterEnd = Date.now();
    const afterResponse = afterEnd - afterStart;

    // パフォーマンス劣化が50%以下
    const performanceDegradation = (afterResponse - initialResponse) / initialResponse;
    expect(performanceDegradation).toBeLessThan(0.5);

    // UI要素が正常に表示される
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="score"]')).toBeVisible();
  });
});
