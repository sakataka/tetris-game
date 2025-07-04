/**
 * Unified color conversion and manipulation utility
 *
 * This class provides a comprehensive set of color manipulation functions
 * with consistent API design and optimal performance through caching.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * ColorConverter - Unified color manipulation utility class
 */
export class ColorConverter {
  private static hexToRgbCache = new Map<string, RGB | null>();
  private static rgbToHexCache = new Map<string, string>();

  /**
   * Convert hex color to RGB object
   * @param hex - Hex color string (with or without #)
   * @returns RGB object or null if invalid
   */
  static hexToRgb(hex: string): RGB | null {
    // Check cache first
    if (ColorConverter.hexToRgbCache.has(hex)) {
      const cached = ColorConverter.hexToRgbCache.get(hex);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Remove # if present and validate
    const cleanHex = hex.replace('#', '');
    if (!/^[a-f\d]{6}$/i.test(cleanHex)) {
      ColorConverter.hexToRgbCache.set(hex, null);
      return null;
    }

    const result: RGB = {
      r: Number.parseInt(cleanHex.slice(0, 2), 16),
      g: Number.parseInt(cleanHex.slice(2, 4), 16),
      b: Number.parseInt(cleanHex.slice(4, 6), 16),
    };

    // Cache the result
    ColorConverter.hexToRgbCache.set(hex, result);
    return result;
  }

  /**
   * Convert RGB object to hex string
   * @param rgb - RGB object
   * @returns Hex color string with #
   */
  static rgbToHex(rgb: RGB): string {
    const cacheKey = `${rgb.r},${rgb.g},${rgb.b}`;

    // Check cache first
    if (ColorConverter.rgbToHexCache.has(cacheKey)) {
      const cached = ColorConverter.rgbToHexCache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Clamp values to valid range
    const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
    const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
    const b = Math.max(0, Math.min(255, Math.round(rgb.b)));

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    // Cache the result
    ColorConverter.rgbToHexCache.set(cacheKey, hex);
    return hex;
  }

  /**
   * Convert RGB to HSL
   * @param rgb - RGB object
   * @returns HSL object
   */
  static rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Convert HSL to RGB
   * @param hsl - HSL object
   * @returns RGB object
   */
  static hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    if (s === 0) {
      const gray = Math.round(l * 255);
      return { r: gray, g: gray, b: gray };
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
      let normalizedT = t;
      if (normalizedT < 0) normalizedT += 1;
      if (normalizedT > 1) normalizedT -= 1;
      if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
      if (normalizedT < 1 / 2) return q;
      if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  /**
   * Adjust color brightness
   * @param color - Hex color string
   * @param factor - Brightness factor (0.5 = darker, 1.5 = brighter)
   * @returns Adjusted hex color string
   */
  static adjustBrightness(color: string, factor: number): string {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return color;

    const adjustedRgb: RGB = {
      r: Math.max(0, Math.min(255, Math.round(rgb.r * factor))),
      g: Math.max(0, Math.min(255, Math.round(rgb.g * factor))),
      b: Math.max(0, Math.min(255, Math.round(rgb.b * factor))),
    };

    return ColorConverter.rgbToHex(adjustedRgb);
  }

  /**
   * Adjust color contrast
   * @param color - Hex color string
   * @param factor - Contrast factor (0.5 = lower contrast, 1.5 = higher contrast)
   * @returns Adjusted hex color string
   */
  static adjustContrast(color: string, factor: number): string {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return color;

    const adjustValue = (value: number): number => {
      const normalized = value / 255;
      const adjusted = (normalized - 0.5) * factor + 0.5;
      return Math.max(0, Math.min(255, Math.round(adjusted * 255)));
    };

    const adjustedRgb: RGB = {
      r: adjustValue(rgb.r),
      g: adjustValue(rgb.g),
      b: adjustValue(rgb.b),
    };

    return ColorConverter.rgbToHex(adjustedRgb);
  }

  /**
   * Adjust color saturation
   * @param color - Hex color string
   * @param factor - Saturation factor (0 = grayscale, 1 = original, 2 = more saturated)
   * @returns Adjusted hex color string
   */
  static adjustSaturation(color: string, factor: number): string {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return color;

    const hsl = ColorConverter.rgbToHsl(rgb);
    const adjustedHsl: HSL = {
      ...hsl,
      s: Math.max(0, Math.min(100, hsl.s * factor)),
    };

    const adjustedRgb = ColorConverter.hslToRgb(adjustedHsl);
    return ColorConverter.rgbToHex(adjustedRgb);
  }

  /**
   * Generate transparency variations of a color
   * @param color - Base hex color string
   * @param levels - Array of transparency levels (0-100)
   * @returns Record of transparency variations
   */
  static generateTransparencies(color: string, levels: readonly number[]): Record<string, string> {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return {};

    const transparencies: Record<string, string> = {};

    levels.forEach((level) => {
      const opacity = level / 100;
      transparencies[`${level}`] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    });

    return transparencies;
  }

  /**
   * Create RGBA color string
   * @param color - Hex color string
   * @param alpha - Alpha value (0-1)
   * @returns RGBA color string
   */
  static toRgba(color: string, alpha: number): string {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return color;

    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
  }

  /**
   * Mix two colors
   * @param color1 - First hex color string
   * @param color2 - Second hex color string
   * @param ratio - Mix ratio (0 = color1, 1 = color2, 0.5 = equal mix)
   * @returns Mixed hex color string
   */
  static mix(color1: string, color2: string, ratio: number): string {
    const rgb1 = ColorConverter.hexToRgb(color1);
    const rgb2 = ColorConverter.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const mixedRgb: RGB = {
      r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * clampedRatio),
      g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * clampedRatio),
      b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * clampedRatio),
    };

    return ColorConverter.rgbToHex(mixedRgb);
  }

  /**
   * Calculate relative luminance of a color
   * @param color - Hex color string
   * @returns Relative luminance (0-1)
   */
  static getRelativeLuminance(color: string): number {
    const rgb = ColorConverter.hexToRgb(color);
    if (!rgb) return 0;

    const srgbToLinear = (value: number): number => {
      const normalized = value / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   * @param color1 - First hex color string
   * @param color2 - Second hex color string
   * @returns Contrast ratio (1-21)
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = ColorConverter.getRelativeLuminance(color1);
    const lum2 = ColorConverter.getRelativeLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color meets WCAG contrast requirements
   * @param foreground - Foreground color hex string
   * @param background - Background color hex string
   * @param level - WCAG level ('AA' | 'AAA')
   * @param isLargeText - Whether text is considered large
   * @returns Whether contrast requirement is met
   */
  static meetsWCAGContrast(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText = false
  ): boolean {
    const ratio = ColorConverter.getContrastRatio(foreground, background);

    if (level === 'AAA') {
      return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }

    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Clear all caches (useful for memory management)
   */
  static clearCache(): void {
    ColorConverter.hexToRgbCache.clear();
    ColorConverter.rgbToHexCache.clear();
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  static getCacheStats(): { hexToRgbSize: number; rgbToHexSize: number } {
    return {
      hexToRgbSize: ColorConverter.hexToRgbCache.size,
      rgbToHexSize: ColorConverter.rgbToHexCache.size,
    };
  }
}
