'use client';

import React, { useState, useCallback } from 'react';
import { ThemeSelectorMemo } from './ThemeSelector';
import { ColorPaletteEditorMemo } from './ColorPaletteEditor';
import { AccessibilitySettingsMemo } from './AccessibilitySettings';
import { ThemeVariant, ColorPalette, ColorBlindnessType, ContrastLevel, AnimationIntensity } from '../types/tetris';

interface ThemeSettingsProps {
  currentTheme: ThemeVariant;
  colors: ColorPalette;
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  effectIntensity: number;
  animations: boolean;
  onThemeChange: (theme: ThemeVariant) => void;
  onColorsChange: (colors: Partial<ColorPalette>) => void;
  onAccessibilityChange: (settings: {
    colorBlindnessType?: ColorBlindnessType;
    contrast?: ContrastLevel;
    animationIntensity?: AnimationIntensity;
    reducedMotion?: boolean;
  }) => void;
  onEffectIntensityChange: (intensity: number) => void;
  onAnimationsToggle: () => void;
  onResetToDefault: () => void;
  className?: string;
}

export default function ThemeSettings({
  currentTheme,
  colors,
  colorBlindnessType,
  contrast,
  animationIntensity,
  reducedMotion,
  effectIntensity,
  animations,
  onThemeChange,
  onColorsChange,
  onAccessibilityChange,
  onEffectIntensityChange,
  onAnimationsToggle,
  onResetToDefault,
  className = ''
}: ThemeSettingsProps) {

  const [activeTab, setActiveTab] = useState<'theme' | 'colors' | 'accessibility' | 'effects'>('theme');

  const handleEffectIntensityChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onEffectIntensityChange(parseFloat(event.target.value));
  }, [onEffectIntensityChange]);

  const tabs = [
    { id: 'theme', label: 'テーマ選択', icon: '🎨' },
    { id: 'colors', label: 'カラー設定', icon: '🌈' },
    { id: 'accessibility', label: 'アクセシビリティ', icon: '♿' },
    { id: 'effects', label: 'エフェクト', icon: '✨' }
  ] as const;

  return (
    <div className={`theme-settings ${className}`}>
      {/* タブナビゲーション */}
      <div className="flex flex-wrap gap-1 mb-4 p-1 rounded-lg bg-cyber-cyan-10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab.id 
                ? 'bg-cyber-cyan text-background' 
                : 'text-cyber-cyan hover:bg-cyber-cyan-20'
              }`}
          >
            <span className="hidden sm:inline">{tab.icon} </span>
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[400px]">
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <ThemeSelectorMemo
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
            
            <div className="flex gap-2">
              <button
                onClick={onResetToDefault}
                className="px-4 py-2 rounded bg-cyber-red-20 border border-cyber-red-30
                           text-cyber-red hover:bg-cyber-red-30 transition-colors text-sm"
              >
                すべてリセット
              </button>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <ColorPaletteEditorMemo
            colors={colors}
            onColorsChange={onColorsChange}
          />
        )}

        {activeTab === 'accessibility' && (
          <AccessibilitySettingsMemo
            colorBlindnessType={colorBlindnessType}
            contrast={contrast}
            animationIntensity={animationIntensity}
            reducedMotion={reducedMotion}
            onSettingsChange={onAccessibilityChange}
          />
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            {/* エフェクト強度 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-cyber-cyan">
                エフェクト強度: {(effectIntensity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={effectIntensity}
                onChange={handleEffectIntensityChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer
                           bg-cyber-cyan-20 slider-thumb"
                style={{
                  background: `linear-gradient(to right, var(--cyber-cyan) 0%, var(--cyber-cyan) ${effectIntensity * 50}%, var(--cyber-cyan-20) ${effectIntensity * 50}%, var(--cyber-cyan-20) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-cyber-purple mt-1">
                <span>弱</span>
                <span>標準</span>
                <span>強</span>
              </div>
              <p className="text-xs text-cyber-purple mt-2">
                ネオンエフェクト、ブラー、グローの強度を調整します
              </p>
            </div>

            {/* アニメーション有効/無効 */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={animations}
                  onChange={onAnimationsToggle}
                  className="w-4 h-4 accent-cyber-cyan rounded focus:ring-2 focus:ring-cyber-cyan"
                />
                <div>
                  <span className="text-sm font-medium text-cyber-cyan">
                    アニメーション有効
                  </span>
                  <p className="text-xs text-cyber-purple">
                    浮遊アニメーション、パルス効果等を有効にします
                  </p>
                </div>
              </label>
            </div>

            {/* エフェクトプレビュー */}
            <div className="p-4 rounded-lg hologram">
              <div className="text-sm font-medium mb-3 text-cyber-cyan">エフェクトプレビュー</div>
              <div className="space-y-3">
                <div 
                  className="p-3 rounded neon-border text-center"
                  style={{
                    filter: `brightness(${0.8 + effectIntensity * 0.4}) saturate(${0.8 + effectIntensity * 0.4})`,
                    animation: animations ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  ネオンエフェクト
                </div>
                <div 
                  className="p-3 rounded hologram-purple text-center"
                  style={{
                    backdropFilter: `blur(${5 + effectIntensity * 10}px)`,
                    animation: animations ? 'float 3s ease-in-out infinite' : 'none'
                  }}
                >
                  ホログラム + ブラー
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ThemeSettingsMemo = React.memo(ThemeSettings);

/* カスタムスライダースタイル */
const sliderStyles = `
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--cyber-cyan);
  cursor: pointer;
  border: 2px solid var(--background);
  box-shadow: 0 0 6px var(--cyber-cyan);
}

.slider-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--cyber-cyan);
  cursor: pointer;
  border: 2px solid var(--background);
  box-shadow: 0 0 6px var(--cyber-cyan);
}
`;

// スタイルを動的に注入
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}