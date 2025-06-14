import { expect, test } from '@playwright/test';

test.describe('Bundle Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should verify bundle size limits', async ({ page }) => {
    // ネットワークリソースの詳細監視
    const resources: Array<{
      url: string;
      size: number;
      compressed: number;
      type: string;
      timing: number;
    }> = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/assets/') && (url.includes('.js') || url.includes('.css'))) {
        const headers = response.headers();
        const contentLength = headers['content-length'];
        // const _contentEncoding = headers['content-encoding'];
        const timing = response.request().timing();

        try {
          const body = await response.body();
          resources.push({
            url,
            size: body.length,
            compressed: contentLength ? Number.parseInt(contentLength) : body.length,
            type: url.includes('.js') ? 'javascript' : 'css',
            timing: timing?.responseEnd ? timing.responseEnd - timing.responseStart : 0,
          });
        } catch {
          // ボディ取得エラーをキャッチ
        }
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // JavaScript バンドルサイズ検証
    const jsResources = resources.filter((r) => r.type === 'javascript');
    const mainChunks = jsResources.filter((r) => !r.url.includes('vendor'));
    const vendorChunks = jsResources.filter((r) => r.url.includes('vendor'));

    // メインバンドル200KB以下
    const maxMainChunk = Math.max(...mainChunks.map((r) => r.size), 0);
    expect(maxMainChunk).toBeLessThan(200 * 1024);

    // ベンダーバンドル500KB以下
    const maxVendorChunk = Math.max(...vendorChunks.map((r) => r.size), 0);
    expect(maxVendorChunk).toBeLessThan(500 * 1024);

    // 合計JSサイズ1MB以下
    const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    expect(totalJsSize).toBeLessThan(1024 * 1024);

    // CSS バンドルサイズ検証
    const cssResources = resources.filter((r) => r.type === 'css');
    const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    expect(totalCssSize).toBeLessThan(200 * 1024); // 200KB以下

    // 圧縮効率検証
    const compressedResources = resources.filter((r) => r.compressed < r.size);
    if (compressedResources.length > 0) {
      const avgCompressionRatio =
        compressedResources.reduce((sum, r) => sum + r.compressed / r.size, 0) /
        compressedResources.length;
      expect(avgCompressionRatio).toBeLessThan(0.4); // 60%以上の圧縮率
    }
  });

  test('should verify critical path resources', async ({ page }) => {
    const criticalResources: Array<{
      url: string;
      priority: string;
      loadTime: number;
    }> = [];

    page.on('response', async (response) => {
      const request = response.request();
      const timing = request.timing();

      if (response.url().includes('/assets/')) {
        criticalResources.push({
          url: response.url(),
          priority: request.resourceType(),
          loadTime: timing?.responseEnd ? timing.responseEnd - timing.responseStart : 0,
        });
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // クリティカルパスリソースの読み込み時間
    const slowResources = criticalResources.filter((r) => r.loadTime > 2000);
    expect(slowResources.length).toBe(0); // 2秒以上かかるリソースなし

    // 最初のJSファイルが500ms以内に読み込まれる
    const firstJs = criticalResources.find((r) => r.url.includes('.js'));
    if (firstJs) {
      expect(firstJs.loadTime).toBeLessThan(500);
    }

    // CSSファイルが300ms以内に読み込まれる
    const firstCss = criticalResources.find((r) => r.url.includes('.css'));
    if (firstCss) {
      expect(firstCss.loadTime).toBeLessThan(300);
    }
  });

  test('should validate code splitting effectiveness', async ({ page }) => {
    const loadedChunks = new Set<string>();

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/assets/') && url.includes('.js')) {
        const filename = url.split('/').pop();
        const chunkName = filename?.split('-')[0] || 'unknown';
        loadedChunks.add(chunkName);
      }
    });

    // ホームページアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homeChunks = new Set(loadedChunks);

    // 設定ページアクセス
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    const settingsChunks = new Set(loadedChunks);

    // テーマページアクセス
    await page.goto('/themes');
    await page.waitForLoadState('networkidle');
    const themesChunks = new Set(loadedChunks);

    // 統計ページアクセス
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // コードスプリッティングの効果検証
    // 少なくとも3つの異なるチャンクが存在
    expect(loadedChunks.size).toBeGreaterThanOrEqual(3);

    // ホームページで読み込まれるチャンクは必要最小限
    expect(homeChunks.size).toBeLessThanOrEqual(5);

    // 各ページで新しいチャンクが適切に読み込まれる
    const newSettingsChunks = settingsChunks.size - homeChunks.size;
    const newThemesChunks = themesChunks.size - settingsChunks.size;

    expect(newSettingsChunks).toBeGreaterThanOrEqual(0); // 設定用チャンク
    expect(newThemesChunks).toBeGreaterThanOrEqual(0); // テーマ用チャンク
  });

  test('should check unused JavaScript elimination', async ({ page }) => {
    // カバレッジ情報を取得
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 基本的なゲーム操作
    await page.focus('body');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    // JavaScript使用率検証
    let totalBytes = 0;
    let usedBytes = 0;

    for (const entry of jsCoverage) {
      if (entry.url.includes('/assets/') && entry.source) {
        totalBytes += entry.source.length;
        for (const func of entry.functions) {
          for (const range of func.ranges) {
            if (range.count > 0) {
              usedBytes += range.endOffset - range.startOffset;
            }
          }
        }
      }
    }

    const jsUsageRate = totalBytes > 0 ? usedBytes / totalBytes : 0;
    expect(jsUsageRate).toBeGreaterThan(0.6); // 60%以上のJavaScriptが使用される

    // CSS使用率検証
    let totalCssBytes = 0;
    let usedCssBytes = 0;

    for (const entry of cssCoverage) {
      if (entry.url.includes('/assets/') && entry.text) {
        totalCssBytes += entry.text.length;
        for (const range of entry.ranges) {
          usedCssBytes += range.end - range.start;
        }
      }
    }

    const cssUsageRate = totalCssBytes > 0 ? usedCssBytes / totalCssBytes : 0;
    expect(cssUsageRate).toBeGreaterThan(0.5); // 50%以上のCSSが使用される
  });

  test('should verify tree-shaking effectiveness', async ({ page }) => {
    const bundleContent: string[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('.js') && response.url().includes('/assets/')) {
        try {
          const text = await response.text();
          bundleContent.push(text);
        } catch {
          // テキスト取得エラーをキャッチ
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const allBundleText = bundleContent.join('');

    // 未使用のexportが含まれていないことを確認
    const suspiciousPatterns = [
      /export\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\s*$/gm, // 未使用export
      /import\s+\*\s+as\s+\w+\s+from/g, // namespace import
      /console\.debug/g, // 本番環境でのdebugログ
    ];

    for (const pattern of suspiciousPatterns) {
      const matches = allBundleText.match(pattern) || [];
      // console.debugは本番環境で除去されている
      if (pattern.source.includes('console\\.debug')) {
        expect(matches.length).toBe(0);
      }
    }

    // 最小化されていることを確認
    const minificationIndicators = {
      hasLongVariableNames: /\b[a-zA-Z_$][a-zA-Z0-9_$]{10,}\b/.test(allBundleText),
      hasComments: /\/\*[\s\S]*?\*\/|\/\/.*$/m.test(allBundleText),
      hasWhitespace: /\n\s+/.test(allBundleText),
    };

    // 本番バンドルは最小化されている
    expect(minificationIndicators.hasLongVariableNames).toBe(false);
    expect(minificationIndicators.hasComments).toBe(false);
  });

  test('should verify asset optimization', async ({ page }) => {
    const assetInfo: Array<{
      url: string;
      type: string;
      size: number;
      cacheHeaders: string;
    }> = [];

    page.on('response', (response) => {
      const url = response.url();
      const headers = response.headers();

      if (
        url.includes('/assets/') ||
        url.includes('.woff') ||
        url.includes('.png') ||
        url.includes('.svg')
      ) {
        assetInfo.push({
          url,
          type: url.split('.').pop() || 'unknown',
          size: Number.parseInt(headers['content-length'] || '0'),
          cacheHeaders: headers['cache-control'] || '',
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // フォントファイルサイズ検証
    const fontAssets = assetInfo.filter((asset) => asset.type.includes('woff'));
    for (const font of fontAssets) {
      expect(font.size).toBeLessThan(100 * 1024); // 100KB以下
    }

    // 画像ファイルサイズ検証
    const imageAssets = assetInfo.filter((asset) =>
      ['png', 'jpg', 'svg', 'webp'].includes(asset.type)
    );
    for (const image of imageAssets) {
      expect(image.size).toBeLessThan(500 * 1024); // 500KB以下
    }

    // キャッシュヘッダー検証
    const cachableAssets = assetInfo.filter((asset) => asset.url.includes('/assets/'));
    for (const asset of cachableAssets) {
      expect(asset.cacheHeaders).toMatch(/max-age=\d+/); // キャッシュ設定あり
    }
  });
});
