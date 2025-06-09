import { ThemeConfig, ColorPalette, ThemeVariant, ColorBlindnessType, ContrastLevel } from '../../types/tetris';
import { COLOR_BLIND_PALETTES, getThemePreset } from './themePresets';

/**
 * CSS変数を動的に設定する関数
 */
export function applyThemeToCSS(config: ThemeConfig): void {
  const root = document.documentElement;
  
  // 基本カラー設定
  root.style.setProperty('--background', config.colors.background);
  root.style.setProperty('--foreground', config.colors.foreground);
  root.style.setProperty('--accent-primary', config.colors.primary);
  root.style.setProperty('--accent-secondary', config.colors.secondary);
  root.style.setProperty('--accent-tertiary', config.colors.tertiary);
  
  // サイバーパンクカラーパレット（後方互換性）
  root.style.setProperty('--cyber-cyan', config.colors.primary);
  root.style.setProperty('--cyber-purple', config.colors.secondary);
  root.style.setProperty('--cyber-yellow', config.colors.tertiary);
  root.style.setProperty('--cyber-green', config.colors.accent);
  
  // 透明度バリエーション自動生成
  const transparencyVariables = generateTransparencyVariables(config.colors);
  Object.entries(transparencyVariables).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });
  
  // エフェクト設定
  root.style.setProperty('--neon-blur-sm', `${config.effects.blur * 0.5}px`);
  root.style.setProperty('--neon-blur-md', `${config.effects.blur}px`);
  root.style.setProperty('--neon-blur-lg', `${config.effects.blur * 1.5}px`);
  root.style.setProperty('--neon-blur-xl', `${config.effects.blur * 2}px`);
  
  // ホログラム背景を動的生成
  const hologramBg = `linear-gradient(45deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)`;
  root.style.setProperty('--hologram-bg', hologramBg);
  root.style.setProperty('--hologram-border', `1px solid var(--cyber-cyan-30)`);
}

/**
 * 透明度バリエーション定数
 */
const TRANSPARENCY_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

/**
 * カラー名マッピング（後方互換性保持）
 */
const COLOR_NAME_MAPPING = {
  primary: 'cyan',
  secondary: 'purple', 
  tertiary: 'yellow',
  accent: 'green'
} as const;

/**
 * 透明度バリエーションを自動生成
 */
function generateTransparencyVariables(colors: ColorPalette): Record<string, string> {
  const variables: Record<string, string> = {};
  
  Object.entries(COLOR_NAME_MAPPING).forEach(([colorKey, cssName]) => {
    const hexColor = colors[colorKey as keyof ColorPalette];
    const rgb = hexToRgb(hexColor);
    
    if (rgb) {
      TRANSPARENCY_LEVELS.forEach(level => {
        const varName = `--cyber-${cssName}-${level}`;
        const opacity = level / 100;
        variables[varName] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      });
    }
  });
  
  return variables;
}

/**
 * Hexカラーコードを RGB に変換（キャッシュ機能付き）
 */
const hexToRgbCache = new Map<string, { r: number; g: number; b: number } | null>();

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // キャッシュから取得
  if (hexToRgbCache.has(hex)) {
    return hexToRgbCache.get(hex)!;
  }
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const rgbResult = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
  
  // キャッシュに保存
  hexToRgbCache.set(hex, rgbResult);
  
  return rgbResult;
}

/**
 * 色覚異常に対応したカラーパレットを生成
 */
export function applyColorBlindnessFilter(
  originalColors: ColorPalette,
  colorBlindnessType: ColorBlindnessType
): ColorPalette {
  if (colorBlindnessType === 'none') {
    return originalColors;
  }
  
  const adjustments = COLOR_BLIND_PALETTES[colorBlindnessType];
  return {
    ...originalColors,
    ...adjustments
  };
}

/**
 * コントラストレベルに応じて色を調整
 */
export function adjustColorsForContrast(
  colors: ColorPalette,
  contrastLevel: ContrastLevel
): ColorPalette {
  if (contrastLevel === 'normal') {
    return colors;
  }
  
  const adjustmentFactor = contrastLevel === 'high' ? 1.3 : 0.8;
  
  return {
    ...colors,
    // 実際のコントラスト調整ロジックは後で詳細実装
    primary: adjustColorBrightness(colors.primary, adjustmentFactor),
    secondary: adjustColorBrightness(colors.secondary, adjustmentFactor),
    tertiary: adjustColorBrightness(colors.tertiary, adjustmentFactor)
  };
}

/**
 * 色の明度を調整
 */
function adjustColorBrightness(color: string, factor: number): string {
  // 簡単な実装（後で改善予定）
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const adjust = (value: number) => Math.min(255, Math.max(0, Math.round(value * factor)));
  
  const newR = adjust(rgb.r);
  const newG = adjust(rgb.g);
  const newB = adjust(rgb.b);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// getThemePresetは./themePresetsからインポート済み

/**
 * カスタムテーマを作成
 */
export function createCustomTheme(
  baseTheme: ThemeVariant,
  customColors?: Partial<ColorPalette>,
  customEffects?: Partial<ThemeConfig['effects']>
): ThemeConfig {
  const baseConfig = getThemePreset(baseTheme);
  
  return {
    ...baseConfig,
    name: 'Custom',
    colors: {
      ...baseConfig.colors,
      ...customColors
    },
    effects: {
      ...baseConfig.effects,
      ...customEffects
    }
  };
}

/**
 * アニメーション設定をCSSに適用
 */
export function applyAnimationSettings(intensity: string): void {
  const root = document.documentElement;
  
  switch (intensity) {
    case 'none':
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--particle-enabled', '0');
      break;
    case 'reduced':
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--particle-enabled', '0');
      break;
    case 'normal':
      root.style.setProperty('--animation-duration', '0.6s');
      root.style.setProperty('--particle-enabled', '1');
      break;
    case 'enhanced':
      root.style.setProperty('--animation-duration', '1s');
      root.style.setProperty('--particle-enabled', '1');
      break;
  }
}

/**
 * テーマの初期化
 */
export function initializeTheme(config: ThemeConfig): void {
  applyThemeToCSS(config);
  applyAnimationSettings(config.accessibility.animationIntensity);
  
  // Reduced motionの設定
  if (config.accessibility.animationIntensity === 'none' || 
      config.accessibility.animationIntensity === 'reduced') {
    document.body.classList.add('reduce-motion');
  } else {
    document.body.classList.remove('reduce-motion');
  }
}