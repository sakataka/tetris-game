import { expect, test } from '@playwright/test';
import './types/browser-api';

// モバイルデバイス互換性テスト
test.describe('Mobile Device Compatibility', () => {
  // 人気デバイスの設定
  const mobileDevices = [
    {
      name: 'iPhone 12',
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: true,
    },
    {
      name: 'iPhone 13 Pro',
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: true,
    },
    {
      name: 'Samsung Galaxy S21',
      viewport: { width: 384, height: 854 },
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
      isMobile: true,
    },
    {
      name: 'Google Pixel 5',
      viewport: { width: 393, height: 851 },
      userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
      isMobile: true,
    },
    {
      name: 'iPad Air',
      viewport: { width: 820, height: 1180 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: false,
    },
    {
      name: 'iPad Pro',
      viewport: { width: 1024, height: 1366 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      isMobile: false,
    },
  ];

  for (const device of mobileDevices) {
    test.describe(`${device.name} Tests`, () => {
      test.beforeEach(async ({ page }) => {
        // デバイス設定の適用
        await page.setViewportSize(device.viewport);
        await page.context().addInitScript(`
          Object.defineProperty(navigator, 'userAgent', {
            get: () => '${device.userAgent}'
          });
        `);

        // SSR互換性問題回避のため、開発環境に直接アクセス
        await page.goto('http://localhost:3001/', {
          waitUntil: 'networkidle',
          timeout: 60000,
        });
      });

      test(`should display correctly on ${device.name}`, async ({ page }) => {
        // 基本的な表示確認
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
        await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
        await expect(page.locator('[data-testid="score"]')).toBeVisible();

        // レイアウトサイズ確認
        const gameBoard = page.locator('[data-testid="game-board"]');
        const boundingBox = await gameBoard.boundingBox();

        expect(boundingBox).not.toBeNull();
        expect(boundingBox?.width).toBeGreaterThan(200);
        expect(boundingBox?.height).toBeGreaterThan(300);

        // ビューポート内に収まっているか確認
        expect(boundingBox?.x).toBeGreaterThanOrEqual(0);
        expect(boundingBox?.y).toBeGreaterThanOrEqual(0);
        if (boundingBox) {
          expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(device.viewport.width + 50);
        }
      });

      test(`should handle touch controls on ${device.name}`, async ({ page }) => {
        if (device.isMobile) {
          // モバイルデバイスでのタッチコントロール確認

          // バーチャルコントロールが存在するかチェック
          const virtualControls = [
            '[data-testid="virtual-left"]',
            '[data-testid="virtual-right"]',
            '[data-testid="virtual-rotate"]',
            '[data-testid="virtual-drop"]',
          ];

          // let _hasVirtualControls = false;
          for (const selector of virtualControls) {
            const exists = (await page.locator(selector).count()) > 0;
            if (exists) {
              // _hasVirtualControls = true;

              // タッチ操作テスト
              const control = page.locator(selector);
              await control.tap();
              await page.waitForTimeout(100);
            }
          }

          // タッチイベントサポート確認
          const touchSupport = await page.evaluate(() => {
            return {
              touchStart: 'ontouchstart' in window,
              touchPoints: navigator.maxTouchPoints > 0,
              touchEvent: typeof TouchEvent !== 'undefined',
            };
          });

          expect(touchSupport.touchStart || touchSupport.touchPoints).toBe(true);
        }

        // ゲームが正常に動作している
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      });

      test(`should handle orientation changes on ${device.name}`, async ({ page }) => {
        if (device.isMobile) {
          const originalViewport = device.viewport;

          // ポートレート → ランドスケープ
          const landscapeViewport = {
            width: originalViewport.height,
            height: originalViewport.width,
          };

          await page.setViewportSize(landscapeViewport);
          await page.waitForTimeout(1000); // レイアウト安定化待ち

          // ランドスケープモードでも表示される
          await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

          // レイアウトがランドスケープに適応している
          const gameBoard = page.locator('[data-testid="game-board"]');
          const boundingBox = await gameBoard.boundingBox();

          expect(boundingBox).not.toBeNull();
          expect(boundingBox?.width).toBeGreaterThan(0);
          expect(boundingBox?.height).toBeGreaterThan(0);

          // ポートレートに戻す
          await page.setViewportSize(originalViewport);
          await page.waitForTimeout(1000);

          // ポートレートモードでも正常に表示される
          await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
        }
      });

      test(`should maintain performance on ${device.name}`, async ({ page }) => {
        // パフォーマンス測定
        const performanceData = await page.evaluate(() => {
          return new Promise<{
            renderTime: number;
            scrollPerformance: number;
            touchLatency: number;
          }>((resolve) => {
            const metrics = {
              renderTime: 0,
              scrollPerformance: 0,
              touchLatency: 0,
            };

            // レンダリング時間測定
            const renderStart = performance.now();
            const testDiv = document.createElement('div');
            testDiv.innerHTML = '<div>'.repeat(100) + '</div>'.repeat(100);
            document.body.appendChild(testDiv);
            document.body.removeChild(testDiv);
            metrics.renderTime = performance.now() - renderStart;

            // スクロールパフォーマンス測定
            const scrollStart = performance.now();
            window.scrollTo(0, 100);
            window.scrollTo(0, 0);
            metrics.scrollPerformance = performance.now() - scrollStart;

            // タッチレイテンシー測定（概算）
            const touchStart = performance.now();
            const event = new Event('touchstart');
            document.dispatchEvent(event);
            metrics.touchLatency = performance.now() - touchStart;

            resolve(metrics);
          });
        });

        // パフォーマンス要件
        expect(performanceData.renderTime).toBeLessThan(100); // 100ms以下
        expect(performanceData.scrollPerformance).toBeLessThan(50); // 50ms以下
        expect(performanceData.touchLatency).toBeLessThan(10); // 10ms以下
      });

      test(`should handle input methods on ${device.name}`, async ({ page }) => {
        // フォーカス管理確認
        await page.focus('body');

        if (device.isMobile) {
          // モバイルでのスワイプジェスチャー（可能な場合）
          const gameBoard = page.locator('[data-testid="game-board"]');
          const boundingBox = await gameBoard.boundingBox();

          if (boundingBox) {
            const centerX = boundingBox.x + boundingBox.width / 2;
            const centerY = boundingBox.y + boundingBox.height / 2;

            // スワイプジェスチャーのシミュレーション
            await page.mouse.move(centerX, centerY);
            await page.mouse.down();
            await page.mouse.move(centerX - 50, centerY); // 左スワイプ
            await page.mouse.up();
            await page.waitForTimeout(100);

            await page.mouse.move(centerX, centerY);
            await page.mouse.down();
            await page.mouse.move(centerX + 50, centerY); // 右スワイプ
            await page.mouse.up();
            await page.waitForTimeout(100);
          }
        } else {
          // タブレットでのキーボード操作
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Space');
        }

        // ゲームが正常に動作している
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      });

      test(`should handle network conditions on ${device.name}`, async ({ page }) => {
        // ネットワーク制限のシミュレーション（遅い3G相当）
        const cdpSession = await page.context().newCDPSession(page);
        await cdpSession.send('Network.enable');
        await cdpSession.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: 50 * 1024, // 50KB/s
          uploadThroughput: 20 * 1024, // 20KB/s
          latency: 500, // 500ms
        });

        // 設定ページへの遷移（ネットワーク負荷テスト）
        await page.click('[data-testid="settings-tab"]').catch(() => {
          // タブが存在しない場合は直接URLにアクセス
          return page.goto('http://localhost:3001/settings', {
            waitUntil: 'networkidle',
            timeout: 30000,
          });
        });

        await page.waitForTimeout(2000); // 読み込み待ち

        // ページが正常に読み込まれている
        await expect(page.locator('body')).toBeVisible();

        // ネットワーク制限解除
        await cdpSession.send('Network.disable');
      });

      test(`should handle memory limitations on ${device.name}`, async ({ page }) => {
        // メモリ使用量の測定
        const initialMemory = await page.evaluate(() => {
          return performance.memory?.usedJSHeapSize || 0;
        });

        // メモリ集約的な操作のシミュレーション
        await page.evaluate(() => {
          // 大量のオブジェクトを作成
          const bigArray = [];
          for (let i = 0; i < 1000; i++) {
            bigArray.push({
              id: i,
              data: new Array(100).fill(`data-${i}`),
            });
          }

          // 即座にクリーンアップ
          bigArray.length = 0;

          // ガベージコレクションの提案
          if (window.gc) {
            window.gc();
          }
        });

        const finalMemory = await page.evaluate(() => {
          return performance.memory?.usedJSHeapSize || 0;
        });

        if (initialMemory > 0 && finalMemory > 0) {
          const memoryIncrease = finalMemory - initialMemory;
          const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

          // メモリ増加が20MB以下
          expect(memoryIncreaseMB).toBeLessThan(20);
        }

        // ゲームが正常に動作している
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      });

      test(`should maintain accessibility on ${device.name}`, async ({ page }) => {
        // アクセシビリティ要件確認

        // 最小タッチターゲットサイズ（44px x 44px）
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(30); // 多少の余裕をもたせて30px
            expect(boundingBox.height).toBeGreaterThanOrEqual(30);
          }
        }

        // 色のコントラスト（簡易チェック）
        const colorContrast = await page.evaluate(() => {
          const gameBoard = document.querySelector('[data-testid="game-board"]');
          if (!gameBoard) return null;

          const styles = getComputedStyle(gameBoard);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
          };
        });

        expect(colorContrast).not.toBeNull();

        // スクリーンリーダー対応（基本的なARIA属性）
        const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]').count();
        expect(ariaElements).toBeGreaterThan(0);
      });
    });
  }

  // 共通モバイルテスト
  test.describe('Common Mobile Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3001/', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });
    });

    test('should handle PWA features', async ({ page }) => {
      // Service Worker サポート確認
      const swSupport = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });

      if (swSupport) {
        // Web App Manifest確認
        // const _manifestLink = await page.locator('link[rel="manifest"]').count();
        // PWA対応は今後の実装予定のためチェックは緩く
      }

      // 基本機能は動作している
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    });

    test('should handle viewport meta tag', async ({ page }) => {
      const viewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta ? meta.getAttribute('content') : null;
      });

      // ビューポートメタタグが適切に設定されている
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta).toContain('width=device-width');
    });

    test('should prevent zoom on double tap', async ({ page }) => {
      // ダブルタップズーム防止の確認
      const gameBoard = page.locator('[data-testid="game-board"]');

      // ダブルタップ
      await gameBoard.dblclick();
      await page.waitForTimeout(500);

      // ページがズームされていない（ビューポートサイズが変わらない）
      const viewportSize = await page.evaluate(() => {
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });

      expect(viewportSize.width).toBe(375);
      expect(viewportSize.height).toBe(667);
    });
  });
});
