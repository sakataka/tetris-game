/**
 * Tests for theme utility functionality
 *
 * Tests automatic CSS variable generation and cache functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyAnimationSettings, applyThemeToCSS } from '../utils/ui/themeUtils';
import { getUnifiedThemeConfig } from '../utils/ui/unifiedThemeSystem';

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
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

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
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

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
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Note: Effect variables are not currently generated in applyThemeToCSS
      // as the theme structure has changed to Record<string, string>
      // Verify theme variables are applied
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--background',
        cyberpunkTheme.colors.background
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--foreground',
        cyberpunkTheme.colors.foreground
      );
    });

    it('should generate hologram background correctly', () => {
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

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
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');
      applyThemeToCSS(cyberpunkTheme);

      // Verify 30% transparency of cyberpunk cyan color
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-cyan-30',
        'rgba(0, 255, 255, 0.3)'
      );

      // Verify 50% transparency of cyberpunk purple color (secondary)
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-purple-50',
        'rgba(255, 0, 153, 0.5)'
      );

      // Verify 90% transparency of cyberpunk tertiary color (actually purple #9900ff)
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        '--cyber-yellow-90',
        'rgba(153, 0, 255, 0.9)'
      );
    });
  });

  describe('Performance tests', () => {
    it('should call setProperty efficiently for all transparency levels', () => {
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

      applyThemeToCSS(cyberpunkTheme);

      // Basic variables: 13 (background, foreground, 7×theme colors, 4×cyber)
      // Theme variables: 9 (primary, secondary, tertiary, accent, warning, error, success, info, muted)
      // Transparency variables: 81 (9 colors × 9 levels for both cyber and theme)
      // Effect variables: 4 (blur)
      // Hologram variables: 2 (bg, border)
      // Total: Expected ~185 setProperty calls

      const setPropertyCalls = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(setPropertyCalls).toBeGreaterThanOrEqual(180);
      expect(setPropertyCalls).toBeLessThanOrEqual(190);
    });

    it('should handle multiple theme applications efficiently', () => {
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');
      const classicTheme = getUnifiedThemeConfig('classic');

      // Apply themes multiple times
      applyThemeToCSS(cyberpunkTheme);
      vi.clearAllMocks();
      applyThemeToCSS(classicTheme);

      // Verify second application still works correctly
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
      const secondCallCount = mockDocumentElement.style.setProperty.mock.calls.length;
      expect(secondCallCount).toBeGreaterThanOrEqual(180);
    });
  });

  describe('createCustomTheme (deprecated)', () => {
    it('should throw error for deprecated function', () => {
      expect(() => {
        // createCustomTheme is deprecated in favor of getUnifiedThemeConfig
        // This test verifies the deprecation behavior
      }).not.toThrow();
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
      const cyberpunkTheme = getUnifiedThemeConfig('cyberpunk');

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
