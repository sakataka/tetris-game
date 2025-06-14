import { expect, test } from '@playwright/test';
import './types/browser-api';

// ブラウザ互換性テスト
test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // SSR互換性問題回避のため、開発環境に直接アクセス
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 60000 });
  });

  // Chromium系ブラウザテスト
  test.describe('Chromium Browsers', () => {
    test('should work correctly in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chromium specific test');

      // ゲーム基本機能確認
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
      await expect(page.locator('[data-testid="score"]')).toBeVisible();

      // キーボード操作確認
      await page.focus('body');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Space');

      // スコア表示確認
      await expect(page.locator('[data-testid="score"]')).toBeVisible();

      // JavaScript高度機能確認（ES2024機能）
      const modernJsSupport = await page.evaluate(() => {
        try {
          // Array.prototype.toSpliced (ES2023)
          const arr = [1, 2, 3];
          const result = arr.toSpliced?.(1, 1, 999) || [];

          // Object.groupBy (ES2024提案)
          const supported = typeof Array.prototype.toSpliced === 'function';

          return { modernJs: supported, toSpliced: result.length === 3 };
        } catch {
          return { modernJs: false, toSpliced: false };
        }
      });

      expect(modernJsSupport.modernJs).toBe(true);
    });

    test('should handle WebGL support in Chrome', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chromium specific test');

      const webglSupport = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return {
          webgl: !!gl,
          webgl2: !!canvas.getContext('webgl2'),
        };
      });

      expect(webglSupport.webgl).toBe(true);
    });
  });

  // Firefox互換性テスト
  test.describe('Firefox Compatibility', () => {
    test('should work correctly in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox specific test');

      // Firefox特有の機能確認
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Firefox CSS Grid対応確認
      const cssGridSupport = await page.evaluate(() => {
        return CSS.supports('display', 'grid');
      });
      expect(cssGridSupport).toBe(true);

      // Firefox Canvas performance
      const canvasPerformance = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const start = performance.now();

        // 100個の矩形を描画
        for (let i = 0; i < 100; i++) {
          ctx?.fillRect(i, i, 10, 10);
        }

        const end = performance.now();
        return end - start;
      });

      expect(canvasPerformance).toBeLessThan(100); // 100ms以下
    });
  });

  // Safari/WebKit互換性テスト
  test.describe('Safari/WebKit Compatibility', () => {
    test('should work correctly in Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'WebKit specific test');

      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Safari CSS Custom Properties対応確認
      const cssCustomPropertiesSupport = await page.evaluate(() => {
        return CSS.supports('color', 'var(--test-color)');
      });
      expect(cssCustomPropertiesSupport).toBe(true);

      // Safari Web API対応確認
      const webApiSupport = await page.evaluate(() => {
        return {
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          indexedDB: typeof indexedDB !== 'undefined',
          webWorkers: typeof Worker !== 'undefined',
        };
      });

      expect(webApiSupport.localStorage).toBe(true);
      expect(webApiSupport.sessionStorage).toBe(true);
    });
  });

  // 共通互換性テスト
  test.describe('Universal Browser Features', () => {
    test('should handle CSS Grid Layout consistently', async ({ page }) => {
      const gridSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        return getComputedStyle(testElement).display === 'grid';
      });

      expect(gridSupport).toBe(true);
    });

    test('should handle Flexbox Layout consistently', async ({ page }) => {
      const flexSupport = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.display = 'flex';
        return getComputedStyle(testElement).display === 'flex';
      });

      expect(flexSupport).toBe(true);
    });

    test('should handle ES6+ features consistently', async ({ page }) => {
      const es6Support = await page.evaluate(() => {
        try {
          // Arrow functions
          const arrow = () => true;

          // Template literals
          const template = 'test';

          // Destructuring
          const [a] = [1];

          // Promises
          const promiseSupport = typeof Promise !== 'undefined';

          // async/await
          const asyncSupport = (async () => true).constructor.name === 'AsyncFunction';

          return {
            arrow: arrow(),
            template: template === 'test',
            destructuring: a === 1,
            promises: promiseSupport,
            asyncAwait: asyncSupport,
          };
        } catch {
          return {
            arrow: false,
            template: false,
            destructuring: false,
            promises: false,
            asyncAwait: false,
          };
        }
      });

      expect(es6Support.arrow).toBe(true);
      expect(es6Support.template).toBe(true);
      expect(es6Support.destructuring).toBe(true);
      expect(es6Support.promises).toBe(true);
      expect(es6Support.asyncAwait).toBe(true);
    });

    test('should handle audio context consistently', async ({ page }) => {
      const audioSupport = await page.evaluate(() => {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioContext();
          ctx.close();
          return {
            webAudio: true,
            audioContext: typeof AudioContext !== 'undefined',
          };
        } catch {
          return {
            webAudio: false,
            audioContext: false,
          };
        }
      });

      // 少なくとも一つのオーディオAPIがサポートされている
      expect(audioSupport.webAudio || audioSupport.audioContext).toBe(true);
    });

    test('should handle responsive design breakpoints', async ({ page }) => {
      const breakpoints = [
        { width: 320, height: 568, name: 'mobile-small' },
        { width: 375, height: 667, name: 'mobile-medium' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'tablet-landscape' },
        { width: 1440, height: 900, name: 'desktop' },
        { width: 1920, height: 1080, name: 'desktop-large' },
      ];

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.waitForTimeout(500); // レイアウト安定化待ち

        // ゲームボードが表示される
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

        // レスポンシブレイアウトチェック
        const layoutInfo = await page.evaluate(() => {
          const gameBoard = document.querySelector('[data-testid="game-board"]');
          if (!gameBoard) return null;

          const rect = gameBoard.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            isVisible: rect.width > 0 && rect.height > 0,
          };
        });

        expect(layoutInfo?.isVisible).toBe(true);
        expect(layoutInfo?.width).toBeGreaterThan(200); // 最小幅確保
        expect(layoutInfo?.height).toBeGreaterThan(400); // 最小高さ確保
      }
    });

    test('should handle touch events on mobile browsers', async ({ page }) => {
      // モバイルデバイスのエミュレーション
      await page.setViewportSize({ width: 375, height: 667 });

      const touchSupport = await page.evaluate(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      });

      if (touchSupport) {
        // バーチャルコントロールの確認
        const virtualControls = page.locator('[data-testid="virtual-controls"]');

        // モバイル用コントロールが表示される可能性がある
        const controlsVisible = await virtualControls.isVisible().catch(() => false);

        if (controlsVisible) {
          // タッチイベントテスト
          await virtualControls.tap();
        }
      }

      // タッチサポートの有無に関わらず、ゲームは動作する
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    });

    test('should handle keyboard navigation accessibility', async ({ page }) => {
      // タブナビゲーション確認
      await page.focus('body');

      // Tab キーでナビゲーション
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // フォーカス可能な要素の確認
      const focusableElements = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        return Array.from(focusable).length;
      });

      expect(focusableElements).toBeGreaterThan(0);

      // キーボードゲーム操作
      await page.focus('body');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');

      // ゲームが応答している
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    });
  });

  // パフォーマンス比較テスト
  test.describe('Cross-Browser Performance', () => {
    test('should maintain consistent performance across browsers', async ({ page }) => {
      const performanceMetrics = await page.evaluate(() => {
        return new Promise<{
          browserName: string;
          renderTime: number;
          memoryUsage: number;
        }>((resolve) => {
          const start = performance.now();

          // 100個のDOM要素を作成・削除
          const elements = [];
          for (let i = 0; i < 100; i++) {
            const div = document.createElement('div');
            div.textContent = `Element ${i}`;
            document.body.appendChild(div);
            elements.push(div);
          }

          // 削除
          elements.forEach((el) => el.remove());

          const end = performance.now();
          const renderTime = end - start;

          const memoryUsage = performance.memory?.usedJSHeapSize || 0;

          resolve({
            browserName: navigator.userAgent,
            renderTime,
            memoryUsage,
          });
        });
      });

      // 基本的なパフォーマンス要件
      expect(performanceMetrics.renderTime).toBeLessThan(50); // 50ms以下

      if (performanceMetrics.memoryUsage > 0) {
        expect(performanceMetrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB以下
      }
    });
  });
});
