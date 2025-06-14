'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type {
  AnimationIntensity,
  ColorBlindnessType,
  ColorPalette,
  ContrastLevel,
  ThemeVariant,
} from '../types/tetris';
import { AccessibilitySettingsMemo } from './AccessibilitySettings';
import { ColorPaletteEditorMemo } from './ColorPaletteEditor';
import { ThemeSelectorMemo } from './ThemeSelector';

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
  className = '',
}: ThemeSettingsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'theme' | 'colors' | 'accessibility' | 'effects'>(
    'theme'
  );

  // Event handler (React Compiler will optimize this)
  const handleEffectIntensityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEffectIntensityChange(Number.parseFloat(event.target.value));
  };

  const tabs = [
    { id: 'theme', label: t('themes.preview'), icon: '🎨' },
    { id: 'colors', label: t('colorPalette.title'), icon: '🌈' },
    { id: 'accessibility', label: t('settings.accessibility'), icon: '♿' },
    { id: 'effects', label: t('accessibility.motion'), icon: '✨' },
  ] as const;

  return (
    <div className={`theme-settings ${className}`}>
      {/* Tab navigation */}
      <div
        className={`flex flex-wrap gap-0.5 ${SPACING.PANEL_TITLE_BOTTOM} p-0.5 rounded-lg bg-cyber-cyan-10`}
      >
        {tabs.map((tab) => (
          <button
            type='button'
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 px-2 py-1 rounded-md ${TYPOGRAPHY.BUTTON_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} transition-colors
              ${
                activeTab === tab.id
                  ? 'bg-cyber-cyan text-background'
                  : 'text-cyber-cyan hover:bg-cyber-cyan-20'
              }`}
          >
            <span className='hidden sm:inline'>{tab.icon} </span>
            <span className='truncate'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className='min-h-[200px]'>
        {activeTab === 'theme' && (
          <div className={SPACING.PANEL_INTERNAL}>
            <ThemeSelectorMemo currentTheme={currentTheme} onThemeChange={onThemeChange} />

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={onResetToDefault}
                className={`px-4 py-2 rounded bg-cyber-red-20 border border-cyber-red-30
                           text-cyber-red hover:bg-cyber-red-30 transition-colors ${TYPOGRAPHY.BUTTON_TEXT}`}
              >
                {t('buttons.reset')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <ColorPaletteEditorMemo colors={colors} onColorsChange={onColorsChange} />
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
          <div className={SPACING.PANEL_INTERNAL}>
            {/* Effect intensity */}
            <div>
              <label
                htmlFor='effect-intensity-range'
                className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
              >
                {t('colorPalette.advancedSettings')}: {(effectIntensity * 100).toFixed(0)}%
              </label>
              <input
                id='effect-intensity-range'
                type='range'
                min='0'
                max='2'
                step='0.1'
                value={effectIntensity}
                onChange={handleEffectIntensityChange}
                className='w-full h-2 rounded-lg appearance-none cursor-pointer
                           bg-cyber-cyan-20 slider-thumb'
                style={{
                  background: `linear-gradient(to right, var(--cyber-cyan) 0%, var(--cyber-cyan) ${effectIntensity * 50}%, var(--cyber-cyan-20) ${effectIntensity * 50}%, var(--cyber-cyan-20) 100%)`,
                }}
              />
              <div
                className={`flex justify-between ${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-0.5`}
              >
                <span>{t('accessibility.lowContrast')}</span>
                <span>{t('accessibility.standard')}</span>
                <span>{t('accessibility.highContrast')}</span>
              </div>
              <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
                {t('colorPalette.advancedSettings')}
              </p>
            </div>

            {/* Animation enable/disable */}
            <div>
              <label className='flex items-center space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={animations}
                  onChange={onAnimationsToggle}
                  className='w-4 h-4 accent-cyber-cyan rounded focus:ring-2 focus:ring-cyber-cyan'
                />
                <div>
                  <span
                    className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-cyber-cyan`}
                  >
                    {t('accessibility.fullAnimation')}
                  </span>
                  <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple`}>
                    {t('accessibility.fullAnimation')}
                  </p>
                </div>
              </label>
            </div>

            {/* Effect preview */}
            <div className='p-4 rounded-lg hologram'>
              <div
                className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} mb-3 text-cyber-cyan`}
              >
                {t('colorPalette.preview')}
              </div>
              <div className={SPACING.LOOSE}>
                <div
                  className='p-3 rounded neon-border text-center'
                  style={{
                    filter: `brightness(${0.8 + effectIntensity * 0.4}) saturate(${0.8 + effectIntensity * 0.4})`,
                    animation: animations ? 'pulse 2s infinite' : 'none',
                  }}
                >
                  Neon Effect
                </div>
                <div
                  className='p-3 rounded hologram-purple text-center'
                  style={{
                    backdropFilter: `blur(${5 + effectIntensity * 10}px)`,
                    animation: animations ? 'float 3s ease-in-out infinite' : 'none',
                  }}
                >
                  Hologram + Blur
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

/* Custom slider styles */
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

// Dynamically inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}
