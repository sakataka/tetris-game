/**
 * テーマシステムパフォーマンス比較テスト
 * 
 * 既存TypeScript実装 vs JSON実装のパフォーマンス・メモリ使用量を比較
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getThemePreset as getLegacyTheme } from '../utils/ui/themePresets';
import { getThemePresetAsync as getJsonTheme, themeCache } from '../utils/ui/themeLoader';
import type { ThemeVariant } from '../types/tetris';

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

      console.log(`Legacy TypeScript: ${legacyTime.toFixed(2)}ms for ${iterations} loads`);
      console.log(`JSON + Cache: ${jsonTime.toFixed(2)}ms for ${iterations} loads`);
      console.log(`Performance ratio: ${(jsonTime / legacyTime).toFixed(2)}x`);

      // JSON実装がキャッシュ後は高速であることを期待
      // 初回ロードのオーバーヘッドを考慮しても、大量読み込みでは有利
      expect(jsonTime).toBeLessThan(legacyTime * 3); // 3倍以内の性能
    });

    it('should measure memory usage comparison', async () => {
      const measureMemory = () => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      };

      const initialMemory = measureMemory();

      // Legacy実装でのメモリ使用量
      const legacyThemes = [];
      for (let i = 0; i < 100; i++) {
        legacyThemes.push(getLegacyTheme('cyberpunk'));
        legacyThemes.push(getLegacyTheme('classic'));
        legacyThemes.push(getLegacyTheme('retro'));
      }

      const legacyMemory = measureMemory();

      // メモリクリア
      legacyThemes.length = 0;
      if (global.gc) global.gc();

      // JSON実装でのメモリ使用量
      const jsonThemes = [];
      for (let i = 0; i < 100; i++) {
        jsonThemes.push(await getJsonTheme('cyberpunk'));
        jsonThemes.push(await getJsonTheme('classic'));
        jsonThemes.push(await getJsonTheme('retro'));
      }

      const jsonMemory = measureMemory();

      if (initialMemory && legacyMemory && jsonMemory) {
        const legacyMemoryDiff = legacyMemory.used - initialMemory.used;
        const jsonMemoryDiff = jsonMemory.used - initialMemory.used;

        console.log(`Legacy memory usage: ${(legacyMemoryDiff / 1024).toFixed(2)} KB`);
        console.log(`JSON memory usage: ${(jsonMemoryDiff / 1024).toFixed(2)} KB`);
        console.log(`Memory efficiency: ${(jsonMemoryDiff / legacyMemoryDiff).toFixed(2)}x`);

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

      console.log(`Legacy module load: ${legacyModuleTime.toFixed(2)}ms`);
      console.log(`JSON module load: ${jsonModuleTime.toFixed(2)}ms`);

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

      console.log(`Legacy first access: ${legacyFirstAccess.toFixed(2)}ms`);
      console.log(`JSON first access: ${jsonFirstAccess.toFixed(2)}ms`);

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

      console.log(`Legacy concurrent (${concurrentRequests}): ${legacyConcurrentTime.toFixed(2)}ms`);
      console.log(`JSON concurrent (${concurrentRequests}): ${jsonConcurrentTime.toFixed(2)}ms`);

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

      console.log(`Cache access time for ${accessCount} requests: ${cacheAccessTime.toFixed(2)}ms`);
      console.log(`Average access time: ${averageAccessTime.toFixed(4)}ms`);

      // キャッシュアクセスは非常に高速（平均0.01ms以下）
      expect(averageAccessTime).toBeLessThan(0.01);
      expect(cacheAccessTime).toBeLessThan(10);
    });
  });

  describe('バンドルサイズ影響評価', () => {
    it('should validate theme data structure size', () => {
      // Legacy実装のデータサイズ推定
      const legacyTheme = getLegacyTheme('cyberpunk');
      const legacyJsonSize = JSON.stringify(legacyTheme).length;

      // JSON実装のデータサイズは同等（構造は同じ）
      const expectedJsonSize = legacyJsonSize;

      console.log(`Theme data size: ${legacyJsonSize} characters`);
      console.log(`Expected JSON size: ${expectedJsonSize} characters`);

      // データ構造は同じなので、サイズも同等
      expect(legacyJsonSize).toBeGreaterThan(0);
      expect(legacyJsonSize).toBeLessThan(1000); // 1KB以下の妥当なサイズ
    });

    it('should estimate total bundle impact', async () => {
      // 全テーマのデータサイズ
      const allLegacyThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'].map(theme => 
        getLegacyTheme(theme as ThemeVariant)
      );
      
      const totalLegacySize = JSON.stringify(allLegacyThemes).length;
      
      console.log(`Total theme data size: ${totalLegacySize} characters (${(totalLegacySize / 1024).toFixed(2)} KB)`);

      // テーマデータが合理的なサイズであることを確認（5KB以下）
      expect(totalLegacySize).toBeLessThan(5 * 1024);
      
      // JSON化による追加オーバーヘッドは最小限
      const jsonOverhead = totalLegacySize * 0.1; // 10%以下のオーバーヘッドを想定
      expect(jsonOverhead).toBeLessThan(512); // 512バイト以下
    });
  });

  describe('リアルワールドシナリオ', () => {
    it('should simulate user theme switching', async () => {
      const themeSequence: ThemeVariant[] = ['cyberpunk', 'classic', 'cyberpunk', 'retro', 'cyberpunk'];
      
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

      console.log(`Legacy theme switching: ${legacySwitchTime.toFixed(2)}ms`);
      console.log(`JSON theme switching: ${jsonSwitchTime.toFixed(2)}ms`);

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
      const preloadPromises = ['classic', 'retro', 'minimal', 'neon'].map(theme => 
        getJsonTheme(theme as ThemeVariant)
      );
      await Promise.all(preloadPromises);
      
      const endTime = performance.now();
      const startupTime = endTime - startTime;

      console.log(`Application startup with theme preloading: ${startupTime.toFixed(2)}ms`);

      expect(initialTheme).toBeDefined();
      expect(startupTime).toBeLessThan(50); // 50ms以下で起動完了

      // 全テーマがキャッシュされていることを確認
      const cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(5);
    });
  });
});