/**
 * ColorConverter utility tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ColorConverter } from '../utils/ui/colorConverter';

describe('ColorConverter', () => {
  beforeEach(() => {
    // Clear cache before each test
    ColorConverter.clearCache();
  });

  describe('hexToRgb', () => {
    it('should convert valid hex colors to RGB', () => {
      expect(ColorConverter.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(ColorConverter.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(ColorConverter.hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(ColorConverter.hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(ColorConverter.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hex colors without # prefix', () => {
      expect(ColorConverter.hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(ColorConverter.hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex colors', () => {
      expect(ColorConverter.hexToRgb('#gggggg')).toBeNull();
      expect(ColorConverter.hexToRgb('#fff')).toBeNull();
      expect(ColorConverter.hexToRgb('invalid')).toBeNull();
      expect(ColorConverter.hexToRgb('')).toBeNull();
    });

    it('should use cache for repeated conversions', () => {
      const color = '#ff0000';
      const result1 = ColorConverter.hexToRgb(color);
      const result2 = ColorConverter.hexToRgb(color);
      
      expect(result1).toEqual(result2);
      expect(ColorConverter.getCacheStats().hexToRgbSize).toBe(1);
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB objects to hex strings', () => {
      expect(ColorConverter.rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(ColorConverter.rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(ColorConverter.rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
      expect(ColorConverter.rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      expect(ColorConverter.rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    });

    it('should clamp values to valid range', () => {
      expect(ColorConverter.rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
      expect(ColorConverter.rgbToHex({ r: 255.7, g: 127.3, b: 63.9 })).toBe('#ff7f40');
    });

    it('should use cache for repeated conversions', () => {
      const rgb = { r: 255, g: 0, b: 0 };
      const result1 = ColorConverter.rgbToHex(rgb);
      const result2 = ColorConverter.rgbToHex(rgb);
      
      expect(result1).toEqual(result2);
      expect(ColorConverter.getCacheStats().rgbToHexSize).toBe(1);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain color integrity through hex->RGB->hex conversion', () => {
      const originalColors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#808080'];
      
      originalColors.forEach(color => {
        const rgb = ColorConverter.hexToRgb(color);
        expect(rgb).not.toBeNull();
        const backToHex = ColorConverter.rgbToHex(rgb!);
        expect(backToHex).toBe(color);
      });
    });
  });

  describe('adjustBrightness', () => {
    it('should brighten colors correctly', () => {
      const darkGray = '#808080';
      const brighter = ColorConverter.adjustBrightness(darkGray, 1.5);
      const brighterRgb = ColorConverter.hexToRgb(brighter);
      const originalRgb = ColorConverter.hexToRgb(darkGray);
      
      expect(brighterRgb).not.toBeNull();
      expect(originalRgb).not.toBeNull();
      expect(brighterRgb!.r).toBeGreaterThan(originalRgb!.r);
    });

    it('should darken colors correctly', () => {
      const lightGray = '#c0c0c0';
      const darker = ColorConverter.adjustBrightness(lightGray, 0.5);
      const darkerRgb = ColorConverter.hexToRgb(darker);
      const originalRgb = ColorConverter.hexToRgb(lightGray);
      
      expect(darkerRgb).not.toBeNull();
      expect(originalRgb).not.toBeNull();
      expect(darkerRgb!.r).toBeLessThan(originalRgb!.r);
    });

    it('should clamp values to valid range', () => {
      const white = '#ffffff';
      const brighter = ColorConverter.adjustBrightness(white, 2.0);
      expect(brighter).toBe('#ffffff'); // Should remain white
      
      const black = '#000000';
      const darker = ColorConverter.adjustBrightness(black, 0.5);
      expect(darker).toBe('#000000'); // Should remain black
    });

    it('should return original color for invalid input', () => {
      expect(ColorConverter.adjustBrightness('invalid', 1.5)).toBe('invalid');
    });
  });

  describe('adjustContrast', () => {
    it('should increase contrast correctly', () => {
      const gray = '#808080';
      const highContrast = ColorConverter.adjustContrast(gray, 1.5);
      
      // With higher contrast, mid-gray should move away from middle (127.5 normalized)
      // Let's test with a more distinct color
      const darkColor = '#606060';
      const contrastAdjusted = ColorConverter.adjustContrast(darkColor, 1.5);
      expect(contrastAdjusted).not.toBe(darkColor);
    });

    it('should decrease contrast correctly', () => {
      const darkColor = '#404040';
      const lowContrast = ColorConverter.adjustContrast(darkColor, 0.5);
      const lowContrastRgb = ColorConverter.hexToRgb(lowContrast);
      const originalRgb = ColorConverter.hexToRgb(darkColor);
      
      expect(lowContrastRgb).not.toBeNull();
      expect(originalRgb).not.toBeNull();
      // Lower contrast should move closer to middle gray
      expect(lowContrastRgb!.r).toBeGreaterThan(originalRgb!.r);
    });
  });

  describe('generateTransparencies', () => {
    it('should generate correct transparency variations', () => {
      const color = '#ff0000';
      const levels = [10, 50, 90] as const;
      const transparencies = ColorConverter.generateTransparencies(color, levels);
      
      expect(transparencies['10']).toBe('rgba(255, 0, 0, 0.1)');
      expect(transparencies['50']).toBe('rgba(255, 0, 0, 0.5)');
      expect(transparencies['90']).toBe('rgba(255, 0, 0, 0.9)');
    });

    it('should return empty object for invalid color', () => {
      const transparencies = ColorConverter.generateTransparencies('invalid', [10, 50]);
      expect(transparencies).toEqual({});
    });
  });

  describe('toRgba', () => {
    it('should create RGBA color strings', () => {
      expect(ColorConverter.toRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(ColorConverter.toRgba('#00ff00', 0.8)).toBe('rgba(0, 255, 0, 0.8)');
    });

    it('should clamp alpha values', () => {
      expect(ColorConverter.toRgba('#ff0000', 1.5)).toBe('rgba(255, 0, 0, 1)');
      expect(ColorConverter.toRgba('#ff0000', -0.5)).toBe('rgba(255, 0, 0, 0)');
    });

    it('should return original color for invalid input', () => {
      expect(ColorConverter.toRgba('invalid', 0.5)).toBe('invalid');
    });
  });

  describe('mix', () => {
    it('should mix two colors correctly', () => {
      const red = '#ff0000';
      const blue = '#0000ff';
      
      // Equal mix should produce purple
      const equal = ColorConverter.mix(red, blue, 0.5);
      const equalRgb = ColorConverter.hexToRgb(equal);
      expect(equalRgb).toEqual({ r: 128, g: 0, b: 128 });
      
      // Ratio 0 should return first color
      expect(ColorConverter.mix(red, blue, 0)).toBe(red);
      
      // Ratio 1 should return second color
      expect(ColorConverter.mix(red, blue, 1)).toBe(blue);
    });

    it('should clamp ratio to valid range', () => {
      const red = '#ff0000';
      const blue = '#0000ff';
      
      expect(ColorConverter.mix(red, blue, -0.5)).toBe(red);
      expect(ColorConverter.mix(red, blue, 1.5)).toBe(blue);
    });
  });

  describe('WCAG contrast', () => {
    it('should calculate contrast ratios correctly', () => {
      const white = '#ffffff';
      const black = '#000000';
      
      const ratio = ColorConverter.getContrastRatio(black, white);
      expect(ratio).toBeCloseTo(21, 1); // Maximum contrast ratio
    });

    it('should check WCAG compliance correctly', () => {
      const white = '#ffffff';
      const black = '#000000';
      
      // Black on white should meet all requirements
      expect(ColorConverter.meetsWCAGContrast(black, white, 'AA', false)).toBe(true);
      expect(ColorConverter.meetsWCAGContrast(black, white, 'AAA', false)).toBe(true);
      expect(ColorConverter.meetsWCAGContrast(black, white, 'AA', true)).toBe(true);
      expect(ColorConverter.meetsWCAGContrast(black, white, 'AAA', true)).toBe(true);
    });

    it('should fail WCAG compliance for low contrast', () => {
      const lightGray = '#cccccc';
      const white = '#ffffff';
      
      // Light gray on white should fail most requirements
      expect(ColorConverter.meetsWCAGContrast(lightGray, white, 'AA', false)).toBe(false);
      expect(ColorConverter.meetsWCAGContrast(lightGray, white, 'AAA', false)).toBe(false);
    });
  });

  describe('HSL conversion', () => {
    it('should convert RGB to HSL correctly', () => {
      // Test known color conversions
      const red = { r: 255, g: 0, b: 0 };
      const redHsl = ColorConverter.rgbToHsl(red);
      expect(redHsl.h).toBe(0);
      expect(redHsl.s).toBe(100);
      expect(redHsl.l).toBe(50);

      const white = { r: 255, g: 255, b: 255 };
      const whiteHsl = ColorConverter.rgbToHsl(white);
      expect(whiteHsl.l).toBe(100);
      expect(whiteHsl.s).toBe(0);
    });

    it('should convert HSL to RGB correctly', () => {
      const redHsl = { h: 0, s: 100, l: 50 };
      const redRgb = ColorConverter.hslToRgb(redHsl);
      expect(redRgb.r).toBe(255);
      expect(redRgb.g).toBe(0);
      expect(redRgb.b).toBe(0);
    });
  });

  describe('adjustSaturation', () => {
    it('should adjust color saturation', () => {
      const red = '#ff0000';
      
      // Desaturate should move toward gray
      const desaturated = ColorConverter.adjustSaturation(red, 0.5);
      expect(desaturated).not.toBe(red);
      
      // Full desaturation should create gray
      const gray = ColorConverter.adjustSaturation(red, 0);
      const grayRgb = ColorConverter.hexToRgb(gray);
      expect(grayRgb!.r).toBe(grayRgb!.g);
      expect(grayRgb!.g).toBe(grayRgb!.b);
    });

    it('should handle invalid colors gracefully', () => {
      expect(ColorConverter.adjustSaturation('invalid', 0.5)).toBe('invalid');
    });
  });

  describe('cache management', () => {
    it('should track cache statistics', () => {
      ColorConverter.hexToRgb('#ff0000');
      ColorConverter.rgbToHex({ r: 0, g: 255, b: 0 });
      
      const stats = ColorConverter.getCacheStats();
      expect(stats.hexToRgbSize).toBe(1);
      expect(stats.rgbToHexSize).toBe(1);
    });

    it('should clear cache correctly', () => {
      ColorConverter.hexToRgb('#ff0000');
      ColorConverter.rgbToHex({ r: 0, g: 255, b: 0 });
      
      ColorConverter.clearCache();
      
      const stats = ColorConverter.getCacheStats();
      expect(stats.hexToRgbSize).toBe(0);
      expect(stats.rgbToHexSize).toBe(0);
    });
  });
});