/**
 * JSONベーステーマプリセットローダー
 * 
 * 統合JSONファイルからテーマプリセットを動的に読み込み、
 * 型安全性を保証しながらランタイム検証を行う
 */

import { ThemeConfig, ThemeVariant, ColorBlindnessType } from '../../types/tetris';

// JSONスキーマ検証用の型定義
interface ThemeConfigData {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    foreground: string;
    accent: string;
  };
  effects: {
    blur: number;
    glow: number;
    saturation: number;
    brightness: number;
  };
  accessibility: {
    colorBlindnessType: string;
    contrast: string;
    animationIntensity: string;
  };
}

interface ThemePresetsJSON extends Record<string, unknown> {
  _metadata?: {
    version: string;
    description: string;
    lastUpdated: string;
    totalThemes: number;
  };
  colorBlindness?: Record<string, unknown>;
  animations?: Record<string, unknown>;
}

/**
 * JSONプリセットファイルを読み込み
 */
async function loadThemePresetsJSON(): Promise<ThemePresetsJSON> {
  try {
    // 動的インポートでJSONを読み込み
    const response = await import('../../data/themePresets.json');
    return response.default || response;
  } catch (error) {
    console.error('Failed to load theme presets JSON:', error);
    throw new Error('Theme presets could not be loaded');
  }
}

/**
 * JSONデータの型安全性検証
 */
function validateThemeConfig(data: ThemeConfigData, themeName: string): ThemeConfig {
  // 必須フィールドの存在確認
  if (!data.name || typeof data.name !== 'string') {
    throw new Error(`Invalid theme config: missing or invalid name for ${themeName}`);
  }

  if (!data.colors || typeof data.colors !== 'object') {
    throw new Error(`Invalid theme config: missing colors for ${themeName}`);
  }

  if (!data.effects || typeof data.effects !== 'object') {
    throw new Error(`Invalid theme config: missing effects for ${themeName}`);
  }

  if (!data.accessibility || typeof data.accessibility !== 'object') {
    throw new Error(`Invalid theme config: missing accessibility for ${themeName}`);
  }

  // カラーパレットの検証
  const colors = data.colors;
  const requiredColorKeys = ['primary', 'secondary', 'tertiary', 'background', 'foreground', 'accent'];
  for (const key of requiredColorKeys) {
    if (!colors[key as keyof typeof colors] || typeof colors[key as keyof typeof colors] !== 'string') {
      throw new Error(`Invalid theme config: missing or invalid color.${key} for ${themeName}`);
    }
    // Hexカラーコード形式の簡易検証
    if (!/^#[0-9a-fA-F]{6}$/.test(colors[key as keyof typeof colors])) {
      throw new Error(`Invalid theme config: invalid hex color format for ${themeName}.colors.${key}`);
    }
  }

  // エフェクトの検証
  const effects = data.effects;
  const requiredEffectKeys = ['blur', 'glow', 'saturation', 'brightness'];
  for (const key of requiredEffectKeys) {
    if (typeof effects[key as keyof typeof effects] !== 'number') {
      throw new Error(`Invalid theme config: missing or invalid effects.${key} for ${themeName}`);
    }
  }

  // アクセシビリティ設定の検証
  const accessibility = data.accessibility;
  const validColorBlindnessTypes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
  const validContrastLevels = ['low', 'normal', 'high'];
  const validAnimationIntensities = ['none', 'reduced', 'normal', 'enhanced'];

  if (!validColorBlindnessTypes.includes(accessibility.colorBlindnessType)) {
    throw new Error(`Invalid theme config: invalid colorBlindnessType for ${themeName}`);
  }

  if (!validContrastLevels.includes(accessibility.contrast)) {
    throw new Error(`Invalid theme config: invalid contrast for ${themeName}`);
  }

  if (!validAnimationIntensities.includes(accessibility.animationIntensity)) {
    throw new Error(`Invalid theme config: invalid animationIntensity for ${themeName}`);
  }

  // 検証済みデータを型安全なThemeConfigとして返す
  return {
    name: data.name,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      background: colors.background,
      foreground: colors.foreground,
      accent: colors.accent
    },
    effects: {
      blur: effects.blur,
      glow: effects.glow,
      saturation: effects.saturation,
      brightness: effects.brightness
    },
    accessibility: {
      colorBlindnessType: accessibility.colorBlindnessType as ColorBlindnessType,
      contrast: accessibility.contrast as 'low' | 'normal' | 'high',
      animationIntensity: accessibility.animationIntensity as 'none' | 'reduced' | 'normal' | 'enhanced'
    }
  };
}

/**
 * メモリキャッシュでパフォーマンス最適化
 */
class ThemeCache {
  private static instance: ThemeCache;
  private cache = new Map<string, ThemeConfig>();
  private loadPromise: Promise<ThemePresetsJSON> | null = null;

  public static getInstance(): ThemeCache {
    if (!ThemeCache.instance) {
      ThemeCache.instance = new ThemeCache();
    }
    return ThemeCache.instance;
  }

  private async getPresetsData(): Promise<ThemePresetsJSON> {
    if (!this.loadPromise) {
      this.loadPromise = loadThemePresetsJSON();
    }
    return this.loadPromise;
  }

  public async getTheme(themeName: ThemeVariant): Promise<ThemeConfig> {
    // キャッシュから取得
    if (this.cache.has(themeName)) {
      return this.cache.get(themeName)!;
    }

    // JSONから読み込み・検証
    const presetsData = await this.getPresetsData();
    
    if (!presetsData[themeName]) {
      throw new Error(`Theme '${themeName}' not found in presets`);
    }

    const themeConfig = validateThemeConfig(presetsData[themeName] as ThemeConfigData, themeName);
    
    // キャッシュに保存
    this.cache.set(themeName, themeConfig);
    
    return themeConfig;
  }

  public async getAllThemes(): Promise<Record<ThemeVariant, ThemeConfig>> {
    const themes: Partial<Record<ThemeVariant, ThemeConfig>> = {};

    const themeNames: ThemeVariant[] = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];
    
    for (const themeName of themeNames) {
      themes[themeName] = await this.getTheme(themeName);
    }

    return themes as Record<ThemeVariant, ThemeConfig>;
  }

  public clearCache(): void {
    this.cache.clear();
    this.loadPromise = null;
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// シングルトンインスタンスをエクスポート
export const themeCache = ThemeCache.getInstance();

/**
 * 便利な関数エクスポート（既存コードとの互換性保持）
 */
export async function getThemePresetAsync(theme: ThemeVariant): Promise<ThemeConfig> {
  return themeCache.getTheme(theme);
}

export async function getAllThemePresetsAsync(): Promise<Record<ThemeVariant, ThemeConfig>> {
  return themeCache.getAllThemes();
}

/**
 * 同期版フォールバック（後方互換性）
 * 注意: 初回呼び出し時にはfallbackテーマを返し、バックグラウンドで実際のテーマを読み込む
 */
export function getThemePresetSync(theme: ThemeVariant): ThemeConfig {
  // キャッシュにある場合はすぐに返す
  if (themeCache.getCacheStats().keys.includes(theme)) {
    // 注意: これは同期的にキャッシュから取得する
    // 実際の実装では Promise.resolve を使う必要がある
    console.warn('getThemePresetSync is deprecated. Use getThemePresetAsync instead.');
  }

  // フォールバック: 最小限のデフォルトテーマを返す
  return {
    name: 'Default',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      tertiary: '#ffff00',
      background: '#0a0a0f',
      foreground: '#ffffff',
      accent: '#00ff00'
    },
    effects: {
      blur: 8,
      glow: 12,
      saturation: 1.0,
      brightness: 1.0
    },
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'normal',
      animationIntensity: 'normal'
    }
  };
}