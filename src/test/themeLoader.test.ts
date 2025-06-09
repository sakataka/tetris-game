/**
 * JSONベーステーマローダーのテスト
 * 
 * JSON読み込み、型安全性検証、キャッシュ機能、パフォーマンスのテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { themeCache, getThemePresetAsync, getAllThemePresetsAsync, getThemePresetSync } from '../utils/ui/themeLoader';
import type { ThemeVariant, ThemeConfig } from '../types/tetris';

describe('ThemeLoader - JSONベーステーマシステム', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    themeCache.clearCache();
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    themeCache.clearCache();
  });

  describe('JSON読み込み機能', () => {
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
        
        // カラー形式の検証
        expect(theme.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.colors.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.colors.tertiary).toMatch(/^#[0-9a-fA-F]{6}$/);
        
        // エフェクト数値の検証
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
      
      // 各テーマの完整性チェック
      Object.values(allThemes).forEach(theme => {
        expect(theme.name).toBeTruthy();
        expect(Object.keys(theme.colors)).toHaveLength(6);
        expect(Object.keys(theme.effects)).toHaveLength(4);
        expect(Object.keys(theme.accessibility)).toHaveLength(3);
      });
    });
  });

  describe('型安全性検証', () => {
    it('should validate color format correctly', async () => {
      const theme = await getThemePresetAsync('classic');
      
      // Classic テーマの特定値を検証
      expect(theme.colors.primary).toBe('#0066cc');
      expect(theme.colors.secondary).toBe('#cc6600');
      expect(theme.colors.background).toBe('#f5f5f5');
      expect(theme.accessibility.contrast).toBe('high');
      expect(theme.accessibility.animationIntensity).toBe('reduced');
    });

    it('should ensure all required properties exist', async () => {
      const theme = await getThemePresetAsync('minimal');
      
      // 必須プロパティの存在確認
      const requiredColorKeys = ['primary', 'secondary', 'tertiary', 'background', 'foreground', 'accent'];
      const requiredEffectKeys = ['blur', 'glow', 'saturation', 'brightness'];
      const requiredAccessibilityKeys = ['colorBlindnessType', 'contrast', 'animationIntensity'];
      
      requiredColorKeys.forEach(key => {
        expect(theme.colors[key as keyof typeof theme.colors]).toBeDefined();
      });
      
      requiredEffectKeys.forEach(key => {
        expect(theme.effects[key as keyof typeof theme.effects]).toBeDefined();
      });
      
      requiredAccessibilityKeys.forEach(key => {
        expect(theme.accessibility[key as keyof typeof theme.accessibility]).toBeDefined();
      });
    });

    it('should validate accessibility settings', async () => {
      const themes = await getAllThemePresetsAsync();
      
      Object.values(themes).forEach(theme => {
        // colorBlindnessType の有効値チェック
        expect(['none', 'protanopia', 'deuteranopia', 'tritanopia']).toContain(
          theme.accessibility.colorBlindnessType
        );
        
        // contrast の有効値チェック
        expect(['low', 'normal', 'high']).toContain(theme.accessibility.contrast);
        
        // animationIntensity の有効値チェック
        expect(['none', 'reduced', 'normal', 'enhanced']).toContain(
          theme.accessibility.animationIntensity
        );
      });
    });
  });

  describe('キャッシュ機能', () => {
    it('should cache themes after first load', async () => {
      // 初回ロード
      const theme1 = await getThemePresetAsync('neon');
      expect(theme1).toBeDefined();
      
      // キャッシュ統計確認
      let cacheStats = themeCache.getCacheStats();
      expect(cacheStats.size).toBe(1);
      expect(cacheStats.keys).toContain('neon');
      
      // 2回目ロード（キャッシュから）
      const theme2 = await getThemePresetAsync('neon');
      expect(theme2).toEqual(theme1);
      
      // キャッシュサイズが変わらないことを確認
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
      
      // キャッシュにデータがあることを確認
      expect(themeCache.getCacheStats().size).toBe(2);
      
      // キャッシュクリア
      themeCache.clearCache();
      
      // キャッシュが空になったことを確認
      expect(themeCache.getCacheStats().size).toBe(0);
      expect(themeCache.getCacheStats().keys).toHaveLength(0);
    });
  });

  describe('パフォーマンステスト', () => {
    it('should load themes efficiently', async () => {
      const startTime = performance.now();
      
      // 全テーマを順次ロード
      await getThemePresetAsync('cyberpunk');
      await getThemePresetAsync('classic');
      await getThemePresetAsync('retro');
      await getThemePresetAsync('minimal');
      await getThemePresetAsync('neon');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // 100ms以内で全テーマロード完了を期待
      expect(loadTime).toBeLessThan(100);
    });

    it('should demonstrate cache performance benefit', async () => {
      // 初回ロード時間測定
      const startTime1 = performance.now();
      await getThemePresetAsync('cyberpunk');
      const firstLoadTime = performance.now() - startTime1;
      
      // キャッシュからのロード時間測定
      const startTime2 = performance.now();
      await getThemePresetAsync('cyberpunk');
      const cachedLoadTime = performance.now() - startTime2;
      
      // キャッシュからの方が速いことを確認
      expect(cachedLoadTime).toBeLessThan(firstLoadTime);
      expect(cachedLoadTime).toBeLessThan(1); // 1ms以内
    });

    it('should handle concurrent theme loading', async () => {
      const startTime = performance.now();
      
      // 並列でテーマをロード
      const promises = [
        getThemePresetAsync('cyberpunk'),
        getThemePresetAsync('classic'),
        getThemePresetAsync('retro'),
        getThemePresetAsync('minimal'),
        getThemePresetAsync('neon')
      ];
      
      const themes = await Promise.all(promises);
      
      const endTime = performance.now();
      const concurrentLoadTime = endTime - startTime;
      
      // 全テーマが正常にロードされることを確認
      expect(themes).toHaveLength(5);
      themes.forEach(theme => {
        expect(theme).toBeDefined();
        expect(theme.name).toBeTruthy();
      });
      
      // 並列ロードが効率的であることを確認（50ms以内）
      expect(concurrentLoadTime).toBeLessThan(50);
    });
  });

  describe('後方互換性', () => {
    it('should provide sync fallback function', () => {
      // 同期版フォールバック関数の動作確認
      const fallbackTheme = getThemePresetSync('cyberpunk');
      
      expect(fallbackTheme).toBeDefined();
      expect(fallbackTheme.name).toBe('Default');
      expect(fallbackTheme.colors).toBeDefined();
      expect(fallbackTheme.effects).toBeDefined();
      expect(fallbackTheme.accessibility).toBeDefined();
    });

    it('should maintain interface compatibility', async () => {
      const theme = await getThemePresetAsync('retro');
      
      // 既存のThemeConfig型との互換性確認
      const requiredProperties: (keyof ThemeConfig)[] = ['name', 'colors', 'effects', 'accessibility'];
      
      requiredProperties.forEach(prop => {
        expect(theme[prop]).toBeDefined();
      });
      
      // 戻り値の型が正確であることを確認
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.colors).toBe('object');
      expect(typeof theme.effects).toBe('object');
      expect(typeof theme.accessibility).toBe('object');
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle invalid theme names', async () => {
      await expect(
        getThemePresetAsync('invalid' as ThemeVariant)
      ).rejects.toThrow("Theme 'invalid' not found in presets");
    });

    it('should validate theme data structure', async () => {
      // 正常なテーマの検証（エラーが発生しないことを確認）
      await expect(getThemePresetAsync('cyberpunk')).resolves.toBeDefined();
      await expect(getThemePresetAsync('classic')).resolves.toBeDefined();
      await expect(getThemePresetAsync('retro')).resolves.toBeDefined();
      await expect(getThemePresetAsync('minimal')).resolves.toBeDefined();
      await expect(getThemePresetAsync('neon')).resolves.toBeDefined();
    });
  });

  describe('メモリ使用量', () => {
    it('should maintain reasonable cache size', async () => {
      // 全テーマをロード
      await getAllThemePresetsAsync();
      
      const cacheStats = themeCache.getCacheStats();
      
      // 5つのテーマがキャッシュされていることを確認
      expect(cacheStats.size).toBe(5);
      expect(cacheStats.keys).toHaveLength(5);
      
      // 予想されるテーマ名がすべて含まれていることを確認
      const expectedThemes = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];
      expectedThemes.forEach(themeName => {
        expect(cacheStats.keys).toContain(themeName);
      });
    });
  });
});