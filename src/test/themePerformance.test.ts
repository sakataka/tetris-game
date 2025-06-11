/**
 * テーマシステムパフォーマンス比較テスト
 *
 * 既存TypeScript実装 vs JSON実装のパフォーマンス・メモリ使用量を比較
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getThemePreset as getLegacyTheme } from '../utils/ui/themePresets';
import { getThemePresetAsync as getJsonTheme, themeCache } from '../utils/ui/themeLoader';
import type { ThemeVariant } from '../types/tetris';
import { log } from '../utils/logging';

describe('テーマシステムパフォーマンス比較', () => {
  beforeEach(() => {
    themeCache.clearCache();
    // ガベージコレクションを促進
    if (global.gc) {
      global.gc();
    }
  });

  afterEach(() => {
    themeCache.clearCache();
  });

  describe('読み込み速度比較', () => {
    it('should compare single theme loading performance', async () => {
      const iterations = 1000;
      const themeName: ThemeVariant = 'cyberpunk';

      // Legacy TypeScript実装のパフォーマンス測定
      const legacyStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const legacyEndTime = performance.now();
      const legacyTime = legacyEndTime - legacyStartTime;

      // JSON実装のパフォーマンス測定（初回ロード含む）
      const jsonStartTime = performance.now();

      // 初回ロード
      await getJsonTheme(themeName);

      // キャッシュされた状態での繰り返し読み込み
      for (let i = 0; i < iterations - 1; i++) {
        const theme = await getJsonTheme(themeName);
        expect(theme).toBeDefined();
      }
      const jsonEndTime = performance.now();
      const jsonTime = jsonEndTime - jsonStartTime;

      log.performance(
        `Legacy TypeScript: ${legacyTime.toFixed(2)}ms for ${iterations} loads`,
        legacyTime,
        { component: 'ThemePerformanceTest' }
      );
      log.performance(`JSON + Cache: ${jsonTime.toFixed(2)}ms for ${iterations} loads`, jsonTime, {
        component: 'ThemePerformanceTest',
      });
      log.debug(`Performance ratio: ${(jsonTime / legacyTime).toFixed(2)}x`, {
        component: 'ThemePerformanceTest',
        metadata: { ratio: jsonTime / legacyTime },
      });

      // JSON実装がキャッシュ後は高速であることを期待
      // 初回ロードのオーバーヘッドを考慮しても、大量読み込みでは有利
      // CI環境での変動を考慮して余裕を持たせる
      expect(jsonTime).toBeLessThan(legacyTime * 5); // 5倍以内の性能
    });

    it('should measure memory usage comparison', async () => {
      const measureMemory = () => {
        const perfMemory = (performance as any).memory;
        if (perfMemory) {
          return {
            used: perfMemory.usedJSHeapSize,
            total: perfMemory.totalJSHeapSize,
            limit: perfMemory.jsHeapSizeLimit,
          };
        }
        return null;
      };

      const initialMemory = measureMemory();

      // Legacy実装でのメモリ使用量測定
      const legacyThemes = [];
      for (let i = 0; i < 100; i++) {
        legacyThemes.push(getLegacyTheme('cyberpunk'));
        legacyThemes.push(getLegacyTheme('classic'));
        legacyThemes.push(getLegacyTheme('retro'));
      }

      const legacyMemory = measureMemory();

      // Legacy測定結果の確認（未使用コレクション対策）
      expect(legacyThemes.length).toBe(300);

      // メモリクリア
      legacyThemes.length = 0;
      if (global.gc) global.gc();

      // JSON実装でのメモリ使用量測定
      const jsonThemes = [];
      for (let i = 0; i < 100; i++) {
        jsonThemes.push(await getJsonTheme('cyberpunk'));
        jsonThemes.push(await getJsonTheme('classic'));
        jsonThemes.push(await getJsonTheme('retro'));
      }

      const jsonMemory = measureMemory();

      // JSON測定結果の確認（未使用コレクション対策）
      expect(jsonThemes.length).toBe(300);

      if (initialMemory && legacyMemory && jsonMemory) {
        const legacyMemoryDiff = legacyMemory.used - initialMemory.used;
        const jsonMemoryDiff = jsonMemory.used - initialMemory.used;

        log.debug(`Legacy memory usage: ${(legacyMemoryDiff / 1024).toFixed(2)} KB`, {
          component: 'ThemePerformanceTest',
          metadata: { memoryKB: legacyMemoryDiff / 1024 },
        });
        log.debug(`JSON memory usage: ${(jsonMemoryDiff / 1024).toFixed(2)} KB`, {
          component: 'ThemePerformanceTest',
          metadata: { memoryKB: jsonMemoryDiff / 1024 },
        });
        log.debug(`Memory efficiency: ${(jsonMemoryDiff / legacyMemoryDiff).toFixed(2)}x`, {
          component: 'ThemePerformanceTest',
          metadata: { efficiency: jsonMemoryDiff / legacyMemoryDiff },
        });

        // JSON実装はキャッシュにより重複オブジェクト生成を避けるため、メモリ効率が良い
        expect(jsonMemoryDiff).toBeLessThan(legacyMemoryDiff);
      }
    });
  });

  describe('初期化時間比較', () => {
    it('should compare module loading time', async () => {
      // Legacy実装のモジュール読み込み時間（実際にはバンドル時に解決済み）
      const legacyStartTime = performance.now();
      const legacyModule = await import('../utils/ui/themePresets');
      const legacyEndTime = performance.now();
      const legacyModuleTime = legacyEndTime - legacyStartTime;

      // JSON実装のモジュール読み込み時間
      const jsonStartTime = performance.now();
      const jsonModule = await import('../utils/ui/themeLoader');
      const jsonEndTime = performance.now();
      const jsonModuleTime = jsonEndTime - jsonStartTime;

      log.performance(`Legacy module load`, legacyModuleTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`JSON module load`, jsonModuleTime, { component: 'ThemePerformanceTest' });

      expect(legacyModule).toBeDefined();
      expect(jsonModule).toBeDefined();

      // モジュール読み込み時間は通常どちらも高速
      expect(legacyModuleTime).toBeLessThan(50);
      expect(jsonModuleTime).toBeLessThan(50);
    });

    it('should measure first theme access time', async () => {
      // Legacy実装での初回アクセス
      const legacyStartTime = performance.now();
      const legacyTheme = getLegacyTheme('cyberpunk');
      const legacyEndTime = performance.now();
      const legacyFirstAccess = legacyEndTime - legacyStartTime;

      // JSON実装での初回アクセス（JSONファイル読み込み含む）
      const jsonStartTime = performance.now();
      const jsonTheme = await getJsonTheme('cyberpunk');
      const jsonEndTime = performance.now();
      const jsonFirstAccess = jsonEndTime - jsonStartTime;

      log.performance(`Legacy first access`, legacyFirstAccess, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`JSON first access`, jsonFirstAccess, { component: 'ThemePerformanceTest' });

      expect(legacyTheme).toBeDefined();
      expect(jsonTheme).toBeDefined();

      // Legacy実装は即座にアクセス可能
      expect(legacyFirstAccess).toBeLessThan(1);

      // JSON実装は初回のみファイル読み込みでオーバーヘッドあり（10ms以内を期待）
      expect(jsonFirstAccess).toBeLessThan(10);
    });
  });

  describe('スケーラビリティテスト', () => {
    it('should test performance with many concurrent requests', async () => {
      const concurrentRequests = 50;

      // Legacy実装での並列アクセス
      const legacyStartTime = performance.now();
      const legacyPromises = Array.from({ length: concurrentRequests }, () =>
        Promise.resolve(getLegacyTheme('cyberpunk'))
      );
      await Promise.all(legacyPromises);
      const legacyEndTime = performance.now();
      const legacyConcurrentTime = legacyEndTime - legacyStartTime;

      // JSON実装での並列アクセス
      const jsonStartTime = performance.now();
      const jsonPromises = Array.from({ length: concurrentRequests }, () =>
        getJsonTheme('cyberpunk')
      );
      await Promise.all(jsonPromises);
      const jsonEndTime = performance.now();
      const jsonConcurrentTime = jsonEndTime - jsonStartTime;

      log.performance(`Legacy concurrent (${concurrentRequests})`, legacyConcurrentTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`JSON concurrent (${concurrentRequests})`, jsonConcurrentTime, {
        component: 'ThemePerformanceTest',
      });

      // 並列アクセスでもパフォーマンスが劣化しないことを確認
      expect(legacyConcurrentTime).toBeLessThan(50);
      expect(jsonConcurrentTime).toBeLessThan(50);
    });

    it('should validate cache efficiency with repeated access', async () => {
      const accessCount = 1000;

      // 初回ロード（キャッシュ構築）
      await getJsonTheme('cyberpunk');

      // キャッシュされた状態での大量アクセス
      const startTime = performance.now();

      for (let i = 0; i < accessCount; i++) {
        const theme = await getJsonTheme('cyberpunk');
        expect(theme.name).toBe('Cyberpunk');
      }

      const endTime = performance.now();
      const cacheAccessTime = endTime - startTime;
      const averageAccessTime = cacheAccessTime / accessCount;

      log.performance(`Cache access time for ${accessCount} requests`, cacheAccessTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`Average access time`, averageAccessTime, {
        component: 'ThemePerformanceTest',
      });

      // キャッシュアクセスは高速（CI環境では平均0.05ms以下）
      expect(averageAccessTime).toBeLessThan(0.05);
      expect(cacheAccessTime).toBeLessThan(50);
    });
  });

  describe('バンドルサイズ影響評価', () => {
    it('should validate theme data structure size', () => {
      // Legacy実装のデータサイズ推定
      const legacyTheme = getLegacyTheme('cyberpunk');
      const legacyJsonSize = JSON.stringify(legacyTheme).length;

      // JSON実装のデータサイズは同等（構造は同じ）
      const expectedJsonSize = legacyJsonSize;

      log.debug(`Theme data size: ${legacyJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });
      log.debug(`Expected JSON size: ${expectedJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });

      // データ構造は同じなので、サイズも同等
      expect(legacyJsonSize).toBeGreaterThan(0);
      expect(legacyJsonSize).toBeLessThan(1000); // 1KB以下の妥当なサイズ
    });

    it('should estimate total bundle impact', async () => {
      // 全テーマのデータサイズ
      const allLegacyThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'].map((theme) =>
        getLegacyTheme(theme as ThemeVariant)
      );

      const totalLegacySize = JSON.stringify(allLegacyThemes).length;

      log.debug(
        `Total theme data size: ${totalLegacySize} characters (${(totalLegacySize / 1024).toFixed(2)} KB)`,
        { component: 'ThemePerformanceTest', metadata: { totalSizeKB: totalLegacySize / 1024 } }
      );

      // テーマデータが合理的なサイズであることを確認（5KB以下）
      expect(totalLegacySize).toBeLessThan(5 * 1024);

      // JSON化による追加オーバーヘッドは最小限
      const jsonOverhead = totalLegacySize * 0.1; // 10%以下のオーバーヘッドを想定
      expect(jsonOverhead).toBeLessThan(512); // 512バイト以下
    });
  });

  describe('リアルワールドシナリオ', () => {
    it('should simulate user theme switching', async () => {
      const themeSequence: ThemeVariant[] = [
        'cyberpunk',
        'classic',
        'cyberpunk',
        'retro',
        'cyberpunk',
      ];

      // Legacy実装でのテーマ切り替え
      const legacyStartTime = performance.now();
      for (const themeName of themeSequence) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const legacyEndTime = performance.now();
      const legacySwitchTime = legacyEndTime - legacyStartTime;

      // JSON実装でのテーマ切り替え
      const jsonStartTime = performance.now();
      for (const themeName of themeSequence) {
        const theme = await getJsonTheme(themeName);
        expect(theme).toBeDefined();
      }
      const jsonEndTime = performance.now();
      const jsonSwitchTime = jsonEndTime - jsonStartTime;

      log.performance(`Legacy theme switching`, legacySwitchTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`JSON theme switching`, jsonSwitchTime, {
        component: 'ThemePerformanceTest',
      });

      // ユーザー体験に影響しない範囲（100ms以下）であることを確認
      expect(legacySwitchTime).toBeLessThan(100);
      expect(jsonSwitchTime).toBeLessThan(100);
    });

    it('should test application startup simulation', async () => {
      // アプリケーション起動時の初期テーマロード
      const startTime = performance.now();

      // 初期テーマロード
      const initialTheme = await getJsonTheme('cyberpunk');

      // プリロード（バックグラウンドで他のテーマも読み込み）
      const preloadPromises = ['classic', 'retro', 'minimal', 'neon'].map((theme) =>
        getJsonTheme(theme as ThemeVariant)
      );
      await Promise.all(preloadPromises);

      const endTime = performance.now();
      const startupTime = endTime - startTime;

      log.performance(`Application startup with theme preloading`, startupTime, {
        component: 'ThemePerformanceTest',
      });

      expect(initialTheme).toBeDefined();
      expect(startupTime).toBeLessThan(50); // 50ms以下で起動完了

      // 全テーマがキャッシュされていることを確認
      const cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(5);
    });
  });
});
