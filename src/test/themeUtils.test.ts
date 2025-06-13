/**
 * Tests for theme utility functionality
 *
 * Tests automatic CSS variable generation and cache functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeConfig } from '../types/tetris';
import { getThemePreset } from '../utils/ui/themePresets';
import { applyAnimationSettings, applyThemeToCSS, createCustomTheme } from '../utils/ui/themeUtils';

// DOM environment mock
const mockDocumentElement = {
  style: {
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  },
};

const mockDocument = {
  documentElement: mockDocumentElement,
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
};

// Replace global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('ThemeUtils - Automatic CSS variable generation system', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('applyThemeToCSS - Basic functionality', () => {
    it('should apply basic color variables', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Verify basic color variable settings
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--background',
        cyberpunkTheme.colors.background
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--foreground',
        cyberpunkTheme.colors.foreground
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--accent-primary',
        cyberpunkTheme.colors.primary
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan',
        cyberpunkTheme.colors.primary
      );
    });

    it('should generate transparency variables automatically', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Verify automatic generation of transparency variations
      const transparencyLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90];

      transparencyLevels.forEach((level) => {
        // Primary color (cyan) transparency variations
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-cyan-${level}`,
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );

        // Secondary color (purple) transparency variations
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-purple-${level}`,
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );

        // Tertiary color (yellow) transparency variations
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-yellow-${level}`,
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );

        // Accent color (green) transparency variations
        expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
          `--cyber-green-${level}`,
          expect.stringMatching(/^rgba\(\d+, \d+, \d+, 0\.\d+\)$/)
        );
      });
    });

    it('should apply effect variables correctly', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Verify effect variable settings
      const expectedBlur = cyberpunkTheme.effects.blur;
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--neon-blur-sm',
        `${expectedBlur * 0.5}px`
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--neon-blur-md',
        `${expectedBlur}px`
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--neon-blur-lg',
        `${expectedBlur * 1.5}px`
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--neon-blur-xl',
        `${expectedBlur * 2}px`
      );
    });

    it('should generate hologram background correctly', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Verify hologram background generation
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

  describe('Transparency calculation accuracy', () => {
    it('should generate correct RGBA values for known hex colors', () => {
      const testTheme: ThemeConfig = {
        name: 'Test',
        colors: {
          primary: '#ff0000', // Red
          secondary: '#00ff00', // Green
          tertiary: '#0000ff', // Blue
          accent: '#ffff00', // Yellow
          background: '#000000',
          foreground: '#ffffff',
        },
        effects: { blur: 10, glow: 16, saturation: 1, brightness: 1 },
        accessibility: {
          colorBlindnessType: 'none',
          contrast: 'normal',
          animationIntensity: 'normal',
        },
      };

      applyThemeToCSS(testTheme);

      // Verify 30% transparency of red color
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-30',
        'rgba(255, 0, 0, 0.3)'
      );

      // Verify 50% transparency of green color
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-purple-50',
        'rgba(0, 255, 0, 0.5)'
      );

      // Verify 90% transparency of blue color
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-yellow-90',
        'rgba(0, 0, 255, 0.9)'
      );
    });
  });

  describe('Performance tests', () => {
    it('should call setProperty efficiently for all transparency levels', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Basic variables: 10 (background, foreground, 4×accent, 4×cyber)
      // Transparency variables: 36 (4 colors × 9 levels)
      // Effect variables: 4 (blur)
      // Hologram variables: 2 (bg, border)
      // Total: Expected 52 setProperty calls

      const setPropertyCalls = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(setPropertyCalls).toBeGreaterThanOrEqual(50);
      expect(setPropertyCalls).toBeLessThanOrEqual(60);
    });

    it('should handle multiple theme applications efficiently', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');
      const classicTheme = getThemePreset('classic');

      // Apply themes multiple times
      applyThemeToCSS(cyberpunkTheme);
      vi.clearAllMocks();
      applyThemeToCSS(classicTheme);

      // Verify second application still works correctly
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
      const secondCallCount = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(secondCallCount).toBeGreaterThanOrEqual(50);
    });
  });

  describe('createCustomTheme', () => {
    it('should create custom theme with partial overrides', () => {
      const customTheme = createCustomTheme('cyberpunk', {
        primary: '#ff1493', // Deep pink
      });

      expect(customTheme.name).toBe('Custom');
      expect(customTheme.colors.primary).toBe('#ff1493');
      expect(customTheme.colors.secondary).toBe(getThemePreset('cyberpunk').colors.secondary); // Retain original value
    });

    it('should create custom theme with effect overrides', () => {
      const customTheme = createCustomTheme(
        'cyberpunk',
        {},
        {
          blur: 20,
          glow: 24,
        }
      );

      expect(customTheme.effects.blur).toBe(20);
      expect(customTheme.effects.glow).toBe(24);
      expect(customTheme.effects.saturation).toBe(getThemePreset('cyberpunk').effects.saturation); // Retain original value
    });
  });

  describe('applyAnimationSettings', () => {
    it('should apply animation settings correctly', () => {
      applyAnimationSettings('enhanced');

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--animation-duration',
        '1s'
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--particle-enabled', '1');
    });

    it('should disable animations for reduced motion', () => {
      applyAnimationSettings('none');

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--animation-duration',
        '0s'
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--particle-enabled', '0');
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain backward compatibility with existing CSS variable names', () => {
      const cyberpunkTheme = getThemePreset('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Verify existing CSS variable names are maintained
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan',
        expect.any(String)
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-purple',
        expect.any(String)
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-yellow',
        expect.any(String)
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-green',
        expect.any(String)
      );

      // Verify existing transparency levels are generated
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-10',
        expect.any(String)
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-20',
        expect.any(String)
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-30',
        expect.any(String)
      );
    });
  });
});
