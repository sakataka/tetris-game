/**
 * テーマユーティリティ機能のテスト
 * 
 * CSS変数自動生成とキャッシュ機能の動作確認
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyThemeToCSS, createCustomTheme, applyAnimationSettings } from '../utils/themeUtils';
import { getThemePreset } from '../utils/themePresets';
import type { ThemeConfig } from '../types/tetris';

// DOM環境のモック
const mockDocumentElement = {
  style: {
    setProperty: vi.fn(),
    removeProperty: vi.fn()
  }
};

const mockDocument = {
  documentElement: mockDocumentElement,
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  }
};

// グローバルdocumentを置き換え
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

describe('ThemeUtils - CSS変数自動生成システム', () => {
  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
  });

  describe('applyThemeToCSS - 基本機能', () => {
    it('should apply basic color variables', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // 基本カラー変数の設定確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--background', cyberpunkTheme.colors.background);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--foreground', cyberpunkTheme.colors.foreground);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--accent-primary', cyberpunkTheme.colors.primary);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-cyan', cyberpunkTheme.colors.primary);
    });

    it('should generate transparency variables automatically', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // 透明度バリエーションの自動生成確認
      const transparencyLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      
      transparencyLevels.forEach(level => {
        // Primary色（cyan）の透明度バリエーション
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-cyan-${level}`, 
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );
        
        // Secondary色（purple）の透明度バリエーション
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-purple-${level}`, 
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );
        
        // Tertiary色（yellow）の透明度バリエーション
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-yellow-${level}`, 
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );
        
        // Accent色（green）の透明度バリエーション
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-green-${level}`, 
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );
      });
    });

    it('should apply effect variables correctly', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // エフェクト変数の設定確認
      const expectedBlur = cyberpunkTheme.effects.blur;
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--neon-blur-sm', `${expectedBlur * 0.5}px`);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--neon-blur-md', `${expectedBlur}px`);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--neon-blur-lg', `${expectedBlur * 1.5}px`);
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--neon-blur-xl', `${expectedBlur * 2}px`);
    });

    it('should generate hologram background correctly', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // ホログラム背景の生成確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--hologram-bg',
        'linear-gradient(45deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)'
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--hologram-border',
        '1px solid var(--cyber-cyan-30)'
      );
    });
  });

  describe('透明度計算の正確性', () => {
    it('should generate correct RGBA values for known hex colors', () => {
      const testTheme: ThemeConfig = {
        name: 'Test',
        colors: {
          primary: '#ff0000',   // 赤
          secondary: '#00ff00', // 緑
          tertiary: '#0000ff',  // 青
          accent: '#ffff00',    // 黄
          background: '#000000',
          foreground: '#ffffff'
        },
        effects: { blur: 10, glow: 16, saturation: 1, brightness: 1 },
        accessibility: { colorBlindnessType: 'none', contrast: 'normal', animationIntensity: 'normal' }
      };
      
      applyThemeToCSS(testTheme);
      
      // 赤色の30%透明度確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-30',
        'rgba(255, 0, 0, 0.3)'
      );
      
      // 緑色の50%透明度確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-purple-50',
        'rgba(0, 255, 0, 0.5)'
      );
      
      // 青色の90%透明度確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-yellow-90',
        'rgba(0, 0, 255, 0.9)'
      );
    });
  });

  describe('パフォーマンステスト', () => {
    it('should call setProperty efficiently for all transparency levels', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // 基本変数: 10個 (background, foreground, 4×accent, 4×cyber)
      // 透明度変数: 36個 (4色 × 9レベル)
      // エフェクト変数: 4個 (blur)
      // ホログラム変数: 2個 (bg, border)
      // 合計: 52個のsetProperty呼び出し予想
      
      const setPropertyCalls = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(setPropertyCalls).toBeGreaterThanOrEqual(50);
      expect(setPropertyCalls).toBeLessThanOrEqual(60);
    });

    it('should handle multiple theme applications efficiently', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      const classicTheme = getThemePreset('classic');
      
      // 複数回テーマ適用
      applyThemeToCSS(cyberpunkTheme);
      vi.clearAllMocks();
      applyThemeToCSS(classicTheme);
      
      // 2回目の適用でも正常に動作することを確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
      const secondCallCount = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(secondCallCount).toBeGreaterThanOrEqual(50);
    });
  });

  describe('createCustomTheme', () => {
    it('should create custom theme with partial overrides', () => {
      const customTheme = createCustomTheme('cyberpunk', {
        primary: '#ff1493' // デイープピンク
      });
      
      expect(customTheme.name).toBe('Custom');
      expect(customTheme.colors.primary).toBe('#ff1493');
      expect(customTheme.colors.secondary).toBe(getThemePreset('cyberpunk').colors.secondary); // 元の値を保持
    });

    it('should create custom theme with effect overrides', () => {
      const customTheme = createCustomTheme('cyberpunk', {}, {
        blur: 20,
        glow: 24
      });
      
      expect(customTheme.effects.blur).toBe(20);
      expect(customTheme.effects.glow).toBe(24);
      expect(customTheme.effects.saturation).toBe(getThemePreset('cyberpunk').effects.saturation); // 元の値を保持
    });
  });

  describe('applyAnimationSettings', () => {
    it('should apply animation settings correctly', () => {
      applyAnimationSettings('enhanced');
      
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--animation-duration', '1s');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--particle-enabled', '1');
    });

    it('should disable animations for reduced motion', () => {
      applyAnimationSettings('none');
      
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--animation-duration', '0s');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--particle-enabled', '0');
    });
  });

  describe('後方互換性', () => {
    it('should maintain backward compatibility with existing CSS variable names', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      
      applyThemeToCSS(cyberpunkTheme);
      
      // 既存のCSS変数名が維持されていることを確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-cyan', expect.any(String));
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-purple', expect.any(String));
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-yellow', expect.any(String));
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-green', expect.any(String));
      
      // 既存の透明度レベルが生成されていることを確認
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-cyan-10', expect.any(String));
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-cyan-20', expect.any(String));
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--cyber-cyan-30', expect.any(String));
    });
  });
});