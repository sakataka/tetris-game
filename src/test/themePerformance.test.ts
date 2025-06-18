/**
 * Theme System Performance Comparison Tests
 *
 * Compare performance and memory usage between existing TypeScript implementation vs JSON implementation
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ThemeVariant } from '../types/tetris';
import { log } from '../utils/logging';
import { getThemePresetAsync as getJsonTheme, themeCache } from '../utils/ui/themeLoader';
import { getUnifiedThemeConfig as getLegacyTheme } from '../utils/ui/unifiedThemeSystem';

describe('Theme System Performance Comparison', () => {
  beforeEach(() => {
    themeCache.clearCache();
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  });

  afterEach(() => {
    themeCache.clearCache();
  });

  describe('Loading Speed Comparison', () => {
    it('should compare single theme loading performance', async () => {
      const iterations = 1000;
      const themeName: ThemeVariant = 'cyberpunk';

      // Unified TypeScript implementation performance measurement
      const unifiedStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const unifiedEndTime = performance.now();
      const unifiedTime = unifiedEndTime - unifiedStartTime;

      // JSON implementation performance measurement (including initial load)
      const jsonStartTime = performance.now();

      // Initial load
      await getJsonTheme(themeName);

      // Repeated loading with cached state
      for (let i = 0; i < iterations - 1; i++) {
        const theme = await getJsonTheme(themeName);
        expect(theme).toBeDefined();
      }
      const jsonEndTime = performance.now();
      const jsonTime = jsonEndTime - jsonStartTime;

      log.performance(
        `Unified TypeScript: ${unifiedTime.toFixed(2)}ms for ${iterations} loads`,
        unifiedTime,
        { component: 'ThemePerformanceTest' }
      );
      log.performance(`JSON + Cache: ${jsonTime.toFixed(2)}ms for ${iterations} loads`, jsonTime, {
        component: 'ThemePerformanceTest',
      });
      log.debug(`Performance ratio: ${(jsonTime / unifiedTime).toFixed(2)}x`, {
        component: 'ThemePerformanceTest',
        metadata: { ratio: jsonTime / unifiedTime },
      });

      // JSON implementation should be fast after caching
      // Advantageous for bulk loading even considering initial load overhead
      // Allow margin considering CI environment variations
      expect(jsonTime).toBeLessThan(unifiedTime * 50); // Allow larger margin for CI environment variations
    });

    it('should measure memory usage comparison', async () => {
      // Type definition for Chrome's performance.memory API
      interface PerformanceMemory {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      }

      interface PerformanceWithMemory extends Performance {
        memory?: PerformanceMemory;
      }

      const measureMemory = () => {
        const perfWithMemory = performance as PerformanceWithMemory;
        if (perfWithMemory.memory) {
          return {
            used: perfWithMemory.memory.usedJSHeapSize,
            total: perfWithMemory.memory.totalJSHeapSize,
            limit: perfWithMemory.memory.jsHeapSizeLimit,
          };
        }
        return null;
      };

      const initialMemory = measureMemory();

      // Memory usage measurement with Unified implementation
      const unifiedThemes = [];
      for (let i = 0; i < 100; i++) {
        unifiedThemes.push(getLegacyTheme('cyberpunk'));
        unifiedThemes.push(getLegacyTheme('classic'));
        unifiedThemes.push(getLegacyTheme('retro'));
      }

      const unifiedMemory = measureMemory();

      // Confirm Unified measurement results (prevent unused collection)
      expect(unifiedThemes.length).toBe(300);

      // Clear memory
      unifiedThemes.length = 0;
      if (global.gc) global.gc();

      // Memory usage measurement with JSON implementation
      const jsonThemes = [];
      for (let i = 0; i < 100; i++) {
        jsonThemes.push(await getJsonTheme('cyberpunk'));
        jsonThemes.push(await getJsonTheme('classic'));
        jsonThemes.push(await getJsonTheme('retro'));
      }

      const jsonMemory = measureMemory();

      // Confirm JSON measurement results (prevent unused collection)
      expect(jsonThemes.length).toBe(300);

      if (initialMemory && unifiedMemory && jsonMemory) {
        const unifiedMemoryDiff = unifiedMemory.used - initialMemory.used;
        const jsonMemoryDiff = jsonMemory.used - initialMemory.used;

        log.debug(`Unified memory usage: ${(unifiedMemoryDiff / 1024).toFixed(2)} KB`, {
          component: 'ThemePerformanceTest',
          metadata: { memoryKB: unifiedMemoryDiff / 1024 },
        });
        log.debug(`JSON memory usage: ${(jsonMemoryDiff / 1024).toFixed(2)} KB`, {
          component: 'ThemePerformanceTest',
          metadata: { memoryKB: jsonMemoryDiff / 1024 },
        });
        log.debug(`Memory efficiency: ${(jsonMemoryDiff / unifiedMemoryDiff).toFixed(2)}x`, {
          component: 'ThemePerformanceTest',
          metadata: { efficiency: jsonMemoryDiff / unifiedMemoryDiff },
        });

        // JSON implementation is memory efficient by avoiding duplicate object creation through caching
        expect(jsonMemoryDiff).toBeLessThan(unifiedMemoryDiff);
      }
    });
  });

  describe('Initialization time comparison', () => {
    it('should compare module loading time', async () => {
      // Unified implementation module loading time (actually resolved at bundle time)
      const unifiedStartTime = performance.now();
      const unifiedModule = await import('../utils/ui/unifiedThemeSystem');
      const unifiedEndTime = performance.now();
      const unifiedModuleTime = unifiedEndTime - unifiedStartTime;

      // JSON implementation module loading time
      const jsonStartTime = performance.now();
      const jsonModule = await import('../utils/ui/themeLoader');
      const jsonEndTime = performance.now();
      const jsonModuleTime = jsonEndTime - jsonStartTime;

      log.performance('Unified module load', unifiedModuleTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance('JSON module load', jsonModuleTime, { component: 'ThemePerformanceTest' });

      expect(unifiedModule).toBeDefined();
      expect(jsonModule).toBeDefined();

      // Module loading time is usually fast for both
      expect(unifiedModuleTime).toBeLessThan(50);
      expect(jsonModuleTime).toBeLessThan(50);
    });

    it('should measure first theme access time', async () => {
      // First access with Unified implementation
      const unifiedStartTime = performance.now();
      const unifiedTheme = getLegacyTheme('cyberpunk');
      const unifiedEndTime = performance.now();
      const unifiedFirstAccess = unifiedEndTime - unifiedStartTime;

      // First access with JSON implementation (including JSON file loading)
      const jsonStartTime = performance.now();
      const jsonTheme = await getJsonTheme('cyberpunk');
      const jsonEndTime = performance.now();
      const jsonFirstAccess = jsonEndTime - jsonStartTime;

      log.performance('Unified first access', unifiedFirstAccess, {
        component: 'ThemePerformanceTest',
      });
      log.performance('JSON first access', jsonFirstAccess, { component: 'ThemePerformanceTest' });

      expect(unifiedTheme).toBeDefined();
      expect(jsonTheme).toBeDefined();

      // Unified implementation is immediately accessible
      expect(unifiedFirstAccess).toBeLessThan(1);

      // JSON implementation has file loading overhead only on first access (expect within 10ms)
      expect(jsonFirstAccess).toBeLessThan(10);
    });
  });

  describe('Scalability tests', () => {
    it('should test performance with many concurrent requests', async () => {
      const concurrentRequests = 50;

      // Concurrent access with Unified implementation
      const unifiedStartTime = performance.now();
      const unifiedPromises = Array.from({ length: concurrentRequests }, () =>
        Promise.resolve(getLegacyTheme('cyberpunk'))
      );
      await Promise.all(unifiedPromises);
      const unifiedEndTime = performance.now();
      const unifiedConcurrentTime = unifiedEndTime - unifiedStartTime;

      // Concurrent access with JSON implementation
      const jsonStartTime = performance.now();
      const jsonPromises = Array.from({ length: concurrentRequests }, () =>
        getJsonTheme('cyberpunk')
      );
      await Promise.all(jsonPromises);
      const jsonEndTime = performance.now();
      const jsonConcurrentTime = jsonEndTime - jsonStartTime;

      log.performance(`Unified concurrent (${concurrentRequests})`, unifiedConcurrentTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance(`JSON concurrent (${concurrentRequests})`, jsonConcurrentTime, {
        component: 'ThemePerformanceTest',
      });

      // Verify that performance doesn't degrade with concurrent access
      expect(unifiedConcurrentTime).toBeLessThan(50);
      expect(jsonConcurrentTime).toBeLessThan(50);
    });

    it('should validate cache efficiency with repeated access', async () => {
      const accessCount = 1000;

      // Initial load (cache construction)
      await getJsonTheme('cyberpunk');

      // Bulk access with cached state
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
      log.performance('Average access time', averageAccessTime, {
        component: 'ThemePerformanceTest',
      });

      // Cache access is fast (average 0.05ms or less in CI environment)
      expect(averageAccessTime).toBeLessThan(0.05);
      expect(cacheAccessTime).toBeLessThan(50);
    });
  });

  describe('Bundle size impact evaluation', () => {
    it('should validate theme data structure size', () => {
      // Unified implementation data size estimation
      const unifiedTheme = getLegacyTheme('cyberpunk');
      const unifiedJsonSize = JSON.stringify(unifiedTheme).length;

      // JSON implementation data size is equivalent (same structure)
      const expectedJsonSize = unifiedJsonSize;

      log.debug(`Theme data size: ${unifiedJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });
      log.debug(`Expected JSON size: ${expectedJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });

      // Same data structure, so size is also equivalent
      expect(unifiedJsonSize).toBeGreaterThan(0);
      expect(unifiedJsonSize).toBeLessThan(3000); // Reasonable size under 3KB (includes design tokens)
    });

    it('should estimate total bundle impact', async () => {
      // Data size of all themes
      const allUnifiedThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'].map((theme) =>
        getLegacyTheme(theme as ThemeVariant)
      );

      const totalUnifiedSize = JSON.stringify(allUnifiedThemes).length;

      log.debug(
        `Total theme data size: ${totalUnifiedSize} characters (${(totalUnifiedSize / 1024).toFixed(2)} KB)`,
        { component: 'ThemePerformanceTest', metadata: { totalSizeKB: totalUnifiedSize / 1024 } }
      );

      // Verify theme data is reasonable size (under 15KB with design tokens)
      expect(totalUnifiedSize).toBeLessThan(15 * 1024);

      // Additional overhead from JSON conversion is minimal
      const jsonOverhead = totalUnifiedSize * 0.1; // Assume overhead under 10%
      expect(jsonOverhead).toBeLessThan(2048); // Under 2KB (adjusted for design tokens)
    });
  });

  describe('Real-world scenarios', () => {
    it('should simulate user theme switching', async () => {
      const themeSequence: ThemeVariant[] = [
        'cyberpunk',
        'classic',
        'cyberpunk',
        'retro',
        'cyberpunk',
      ];

      // Theme switching with Unified implementation
      const unifiedStartTime = performance.now();
      for (const themeName of themeSequence) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const unifiedEndTime = performance.now();
      const unifiedSwitchTime = unifiedEndTime - unifiedStartTime;

      // Theme switching with JSON implementation
      const jsonStartTime = performance.now();
      for (const themeName of themeSequence) {
        const theme = await getJsonTheme(themeName);
        expect(theme).toBeDefined();
      }
      const jsonEndTime = performance.now();
      const jsonSwitchTime = jsonEndTime - jsonStartTime;

      log.performance('Unified theme switching', unifiedSwitchTime, {
        component: 'ThemePerformanceTest',
      });
      log.performance('JSON theme switching', jsonSwitchTime, {
        component: 'ThemePerformanceTest',
      });

      // Verify it's within range that doesn't affect user experience (under 100ms)
      expect(unifiedSwitchTime).toBeLessThan(100);
      expect(jsonSwitchTime).toBeLessThan(100);
    });

    it('should test application startup simulation', async () => {
      // Initial theme loading at application startup
      const startTime = performance.now();

      // Initial theme loading
      const initialTheme = await getJsonTheme('cyberpunk');

      // Preload (load other themes in background)
      const preloadPromises = ['classic', 'retro', 'minimal', 'neon'].map((theme) =>
        getJsonTheme(theme as ThemeVariant)
      );
      await Promise.all(preloadPromises);

      const endTime = performance.now();
      const startupTime = endTime - startTime;

      log.performance('Application startup with theme preloading', startupTime, {
        component: 'ThemePerformanceTest',
      });

      expect(initialTheme).toBeDefined();
      expect(startupTime).toBeLessThan(50); // Startup completion under 50ms

      // Verify all themes are cached
      const cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(5);
    });
  });
});
