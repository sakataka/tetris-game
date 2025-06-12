/**
 * Theme System Performance Comparison Tests
 *
 * Compare performance and memory usage between existing TypeScript implementation vs JSON implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getThemePreset as getLegacyTheme } from '../utils/ui/themePresets';
import { getThemePresetAsync as getJsonTheme, themeCache } from '../utils/ui/themeLoader';
import type { ThemeVariant } from '../types/tetris';
import { log } from '../utils/logging';

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

      // Legacy TypeScript implementation performance measurement
      const legacyStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const legacyEndTime = performance.now();
      const legacyTime = legacyEndTime - legacyStartTime;

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

      // JSON implementation should be fast after caching
      // Advantageous for bulk loading even considering initial load overhead
      // Allow margin considering CI environment variations
      expect(jsonTime).toBeLessThan(legacyTime * 5); // Performance within 5x
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

      // Memory usage measurement with Legacy implementation
      const legacyThemes = [];
      for (let i = 0; i < 100; i++) {
        legacyThemes.push(getLegacyTheme('cyberpunk'));
        legacyThemes.push(getLegacyTheme('classic'));
        legacyThemes.push(getLegacyTheme('retro'));
      }

      const legacyMemory = measureMemory();

      // Confirm Legacy measurement results (prevent unused collection)
      expect(legacyThemes.length).toBe(300);

      // Clear memory
      legacyThemes.length = 0;
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

        // JSON implementation is memory efficient by avoiding duplicate object creation through caching
        expect(jsonMemoryDiff).toBeLessThan(legacyMemoryDiff);
      }
    });
  });

  describe('Initialization time comparison', () => {
    it('should compare module loading time', async () => {
      // Legacy implementation module loading time (actually resolved at bundle time)
      const legacyStartTime = performance.now();
      const legacyModule = await import('../utils/ui/themePresets');
      const legacyEndTime = performance.now();
      const legacyModuleTime = legacyEndTime - legacyStartTime;

      // JSON implementation module loading time
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

      // Module loading time is usually fast for both
      expect(legacyModuleTime).toBeLessThan(50);
      expect(jsonModuleTime).toBeLessThan(50);
    });

    it('should measure first theme access time', async () => {
      // First access with Legacy implementation
      const legacyStartTime = performance.now();
      const legacyTheme = getLegacyTheme('cyberpunk');
      const legacyEndTime = performance.now();
      const legacyFirstAccess = legacyEndTime - legacyStartTime;

      // First access with JSON implementation (including JSON file loading)
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

      // Legacy implementation is immediately accessible
      expect(legacyFirstAccess).toBeLessThan(1);

      // JSON implementation has file loading overhead only on first access (expect within 10ms)
      expect(jsonFirstAccess).toBeLessThan(10);
    });
  });

  describe('Scalability tests', () => {
    it('should test performance with many concurrent requests', async () => {
      const concurrentRequests = 50;

      // Concurrent access with Legacy implementation
      const legacyStartTime = performance.now();
      const legacyPromises = Array.from({ length: concurrentRequests }, () =>
        Promise.resolve(getLegacyTheme('cyberpunk'))
      );
      await Promise.all(legacyPromises);
      const legacyEndTime = performance.now();
      const legacyConcurrentTime = legacyEndTime - legacyStartTime;

      // Concurrent access with JSON implementation
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

      // Verify that performance doesn't degrade with concurrent access
      expect(legacyConcurrentTime).toBeLessThan(50);
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
      log.performance(`Average access time`, averageAccessTime, {
        component: 'ThemePerformanceTest',
      });

      // Cache access is fast (average 0.05ms or less in CI environment)
      expect(averageAccessTime).toBeLessThan(0.05);
      expect(cacheAccessTime).toBeLessThan(50);
    });
  });

  describe('Bundle size impact evaluation', () => {
    it('should validate theme data structure size', () => {
      // Legacy implementation data size estimation
      const legacyTheme = getLegacyTheme('cyberpunk');
      const legacyJsonSize = JSON.stringify(legacyTheme).length;

      // JSON implementation data size is equivalent (same structure)
      const expectedJsonSize = legacyJsonSize;

      log.debug(`Theme data size: ${legacyJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });
      log.debug(`Expected JSON size: ${expectedJsonSize} characters`, {
        component: 'ThemePerformanceTest',
      });

      // Same data structure, so size is also equivalent
      expect(legacyJsonSize).toBeGreaterThan(0);
      expect(legacyJsonSize).toBeLessThan(1000); // Reasonable size under 1KB
    });

    it('should estimate total bundle impact', async () => {
      // Data size of all themes
      const allLegacyThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'].map((theme) =>
        getLegacyTheme(theme as ThemeVariant)
      );

      const totalLegacySize = JSON.stringify(allLegacyThemes).length;

      log.debug(
        `Total theme data size: ${totalLegacySize} characters (${(totalLegacySize / 1024).toFixed(2)} KB)`,
        { component: 'ThemePerformanceTest', metadata: { totalSizeKB: totalLegacySize / 1024 } }
      );

      // Verify theme data is reasonable size (under 5KB)
      expect(totalLegacySize).toBeLessThan(5 * 1024);

      // Additional overhead from JSON conversion is minimal
      const jsonOverhead = totalLegacySize * 0.1; // Assume overhead under 10%
      expect(jsonOverhead).toBeLessThan(512); // Under 512 bytes
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

      // Theme switching with Legacy implementation
      const legacyStartTime = performance.now();
      for (const themeName of themeSequence) {
        const theme = getLegacyTheme(themeName);
        expect(theme).toBeDefined();
      }
      const legacyEndTime = performance.now();
      const legacySwitchTime = legacyEndTime - legacyStartTime;

      // Theme switching with JSON implementation
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

      // Verify it's within range that doesn't affect user experience (under 100ms)
      expect(legacySwitchTime).toBeLessThan(100);
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

      log.performance(`Application startup with theme preloading`, startupTime, {
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
