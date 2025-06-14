/**
 * JSON-based theme loader tests
 *
 * Tests for JSON loading, type safety validation, cache functionality, and performance
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ThemeConfig, ThemeVariant } from '../types/tetris';
import {
  getAllThemePresetsAsync,
  getThemePresetAsync,
  getThemePresetSync,
  themeCache,
} from '../utils/ui/themeLoader';

describe('ThemeLoader - JSON-based theme system', () => {
  beforeEach(() => {
    // Clear cache before each test
    themeCache.clearCache();
  });

  afterEach(() => {
    // Post-test cleanup
    themeCache.clearCache();
  });

  describe('JSON loading functionality', () => {
    it('should load cyberpunk theme from JSON', async () => {
      const theme = await getThemePresetAsync('cyberpunk');

      expect(theme).toBeDefined();
      expect(theme.name).toBe('Cyberpunk');
      expect(theme.colors.primary).toBe('#00ffff');
      expect(theme.colors.secondary).toBe('#ff00ff');
      expect(theme.colors.tertiary).toBe('#ffff00');
      expect(theme.effects.blur).toBe(10);
      expect(theme.effects.glow).toBe(16);
      expect(theme.accessibility.animationIntensity).toBe('enhanced');
    });

    it('should load all theme variants correctly', async () => {
      const themeVariants: ThemeVariant[] = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];

      for (const variant of themeVariants) {
        const theme = await getThemePresetAsync(variant);

        expect(theme).toBeDefined();
        expect(theme.name).toBeTruthy();
        expect(theme.colors).toBeDefined();
        expect(theme.effects).toBeDefined();
        expect(theme.accessibility).toBeDefined();

        // Validate color format
        expect(theme.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.colors.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.colors.tertiary).toMatch(/^#[0-9a-fA-F]{6}$/);

        // Validate effect values
        expect(typeof theme.effects.blur).toBe('number');
        expect(typeof theme.effects.glow).toBe('number');
        expect(theme.effects.saturation).toBeGreaterThan(0);
        expect(theme.effects.brightness).toBeGreaterThan(0);
      }
    });

    it('should load all themes at once efficiently', async () => {
      const allThemes = await getAllThemePresetsAsync();

      expect(Object.keys(allThemes)).toHaveLength(5);
      expect(allThemes.cyberpunk).toBeDefined();
      expect(allThemes.classic).toBeDefined();
      expect(allThemes.retro).toBeDefined();
      expect(allThemes.minimal).toBeDefined();
      expect(allThemes.neon).toBeDefined();

      // Check integrity of each theme
      Object.values(allThemes).forEach((theme) => {
        expect(theme.name).toBeTruthy();
        expect(Object.keys(theme.colors)).toHaveLength(6);
        expect(Object.keys(theme.effects)).toHaveLength(4);
        expect(Object.keys(theme.accessibility)).toHaveLength(3);
      });
    });
  });

  describe('Type safety validation', () => {
    it('should validate color format correctly', async () => {
      const theme = await getThemePresetAsync('classic');

      // Validate Classic theme specific values
      expect(theme.colors.primary).toBe('#0066cc');
      expect(theme.colors.secondary).toBe('#cc6600');
      expect(theme.colors.background).toBe('#f5f5f5');
      expect(theme.accessibility.contrast).toBe('high');
      expect(theme.accessibility.animationIntensity).toBe('reduced');
    });

    it('should ensure all required properties exist', async () => {
      const theme = await getThemePresetAsync('minimal');

      // Verify existence of required properties
      const requiredColorKeys = [
        'primary',
        'secondary',
        'tertiary',
        'background',
        'foreground',
        'accent',
      ];
      const requiredEffectKeys = ['blur', 'glow', 'saturation', 'brightness'];
      const requiredAccessibilityKeys = ['colorBlindnessType', 'contrast', 'animationIntensity'];

      requiredColorKeys.forEach((key) => {
        expect(theme.colors[key as keyof typeof theme.colors]).toBeDefined();
      });

      requiredEffectKeys.forEach((key) => {
        expect(theme.effects[key as keyof typeof theme.effects]).toBeDefined();
      });

      requiredAccessibilityKeys.forEach((key) => {
        expect(theme.accessibility[key as keyof typeof theme.accessibility]).toBeDefined();
      });
    });

    it('should validate accessibility settings', async () => {
      const themes = await getAllThemePresetsAsync();

      Object.values(themes).forEach((theme) => {
        // Check valid values for colorBlindnessType
        expect(['none', 'protanopia', 'deuteranopia', 'tritanopia']).toContain(
          theme.accessibility.colorBlindnessType
        );

        // Check valid values for contrast
        expect(['low', 'normal', 'high']).toContain(theme.accessibility.contrast);

        // Check valid values for animationIntensity
        expect(['none', 'reduced', 'normal', 'enhanced']).toContain(
          theme.accessibility.animationIntensity
        );
      });
    });
  });

  describe('Cache functionality', () => {
    it('should cache themes after first load', async () => {
      // First load
      const theme1 = await getThemePresetAsync('neon');
      expect(theme1).toBeDefined();

      // Verify cache statistics
      let cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(1);
      expect(cacheStats.keys).toContain('neon');

      // Second load (from cache)
      const theme2 = await getThemePresetAsync('neon');
      expect(theme2).toEqual(theme1);

      // Verify cache size does not change
      cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(1);
    });

    it('should cache multiple themes independently', async () => {
      await getThemePresetAsync('cyberpunk');
      await getThemePresetAsync('retro');

      const cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(2);
      expect(cacheStats.keys).toContain('cyberpunk');
      expect(cacheStats.keys).toContain('retro');
    });

    it('should clear cache correctly', async () => {
      await getThemePresetAsync('classic');
      await getThemePresetAsync('minimal');

      // Verify data exists in cache
      expect(themeCache.getCacheStats().size).toBe(2);

      // Clear cache
      themeCache.clearCache();

      // Verify cache is empty
      expect(themeCache.getCacheStats().size).toBe(0);
      expect(themeCache.getCacheStats().keys).toHaveLength(0);
    });
  });

  describe('Performance tests', () => {
    it('should load themes efficiently', async () => {
      const startTime = performance.now();

      // Load all themes sequentially
      await getThemePresetAsync('cyberpunk');
      await getThemePresetAsync('classic');
      await getThemePresetAsync('retro');
      await getThemePresetAsync('minimal');
      await getThemePresetAsync('neon');

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Expect all themes to load within 100ms
      expect(loadTime).toBeLessThan(100);
    });

    it('should demonstrate cache performance benefit', async () => {
      // Measure first load time
      const startTime1 = performance.now();
      await getThemePresetAsync('cyberpunk');
      const firstLoadTime = performance.now() - startTime1;

      // Measure cache load time
      const startTime2 = performance.now();
      await getThemePresetAsync('cyberpunk');
      const cachedLoadTime = performance.now() - startTime2;

      // Verify cache is faster
      expect(cachedLoadTime).toBeLessThan(firstLoadTime);
      expect(cachedLoadTime).toBeLessThan(1); // Within 1ms
    });

    it('should handle concurrent theme loading', async () => {
      const startTime = performance.now();

      // Load themes in parallel
      const promises = [
        getThemePresetAsync('cyberpunk'),
        getThemePresetAsync('classic'),
        getThemePresetAsync('retro'),
        getThemePresetAsync('minimal'),
        getThemePresetAsync('neon'),
      ];

      const themes = await Promise.all(promises);

      const endTime = performance.now();
      const concurrentLoadTime = endTime - startTime;

      // Verify all themes load correctly
      expect(themes).toHaveLength(5);
      themes.forEach((theme) => {
        expect(theme).toBeDefined();
        expect(theme.name).toBeTruthy();
      });

      // Verify parallel loading is efficient (within 50ms)
      expect(concurrentLoadTime).toBeLessThan(50);
    });
  });

  describe('Backward compatibility', () => {
    it('should provide sync fallback function', () => {
      // Verify sync fallback function operation
      const fallbackTheme = getThemePresetSync('cyberpunk');

      expect(fallbackTheme).toBeDefined();
      expect(fallbackTheme.name).toBe('Default');
      expect(fallbackTheme.colors).toBeDefined();
      expect(fallbackTheme.effects).toBeDefined();
      expect(fallbackTheme.accessibility).toBeDefined();
    });

    it('should maintain interface compatibility', async () => {
      const theme = await getThemePresetAsync('retro');

      // Verify compatibility with existing ThemeConfig type
      const requiredProperties: (keyof ThemeConfig)[] = [
        'name',
        'colors',
        'effects',
        'accessibility',
      ];

      requiredProperties.forEach((prop) => {
        expect(theme[prop]).toBeDefined();
      });

      // Verify return value type is correct
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.colors).toBe('object');
      expect(typeof theme.effects).toBe('object');
      expect(typeof theme.accessibility).toBe('object');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid theme names', async () => {
      await expect(getThemePresetAsync('invalid' as ThemeVariant)).rejects.toThrow(
        "Theme 'invalid' not found in presets"
      );
    });

    it('should validate theme data structure', async () => {
      // Validate normal themes (verify no errors occur)
      await expect(getThemePresetAsync('cyberpunk')).resolves.toBeDefined();
      await expect(getThemePresetAsync('classic')).resolves.toBeDefined();
      await expect(getThemePresetAsync('retro')).resolves.toBeDefined();
      await expect(getThemePresetAsync('minimal')).resolves.toBeDefined();
      await expect(getThemePresetAsync('neon')).resolves.toBeDefined();
    });
  });

  describe('Memory usage', () => {
    it('should maintain reasonable cache size', async () => {
      // Load all themes
      await getAllThemePresetsAsync();

      const cacheStats = themeCache.getCacheStats();

      // Verify 5 themes are cached
      expect(cacheStats.size).toBe(5);
      expect(cacheStats.keys).toHaveLength(5);

      // Verify all expected theme names are included
      const expectedThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];
      expectedThemes.forEach((themeName) => {
        expect(cacheStats.keys).toContain(themeName);
      });
    });
  });
});
