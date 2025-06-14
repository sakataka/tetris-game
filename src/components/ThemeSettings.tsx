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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/ui/cn';

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
  const handleEffectIntensityChange = (value: number[]) => {
    onEffectIntensityChange(value[0] ?? 1);
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
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 min-w-0',
              TYPOGRAPHY.BUTTON_TEXT,
              TYPOGRAPHY.BODY_WEIGHT,
              activeTab === tab.id
                ? 'bg-cyber-cyan text-background hover:bg-cyber-cyan/90'
                : 'border-transparent text-cyber-cyan hover:bg-cyber-cyan-20 hover:text-cyber-cyan'
            )}
          >
            <span className='hidden sm:inline'>{tab.icon} </span>
            <span className='truncate'>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <div className='min-h-[200px]'>
        {activeTab === 'theme' && (
          <div className={SPACING.PANEL_INTERNAL}>
            <ThemeSelectorMemo currentTheme={currentTheme} onThemeChange={onThemeChange} />

            <div className='flex gap-2'>
              <Button
                variant='destructive'
                onClick={onResetToDefault}
                className={cn(
                  'bg-cyber-red-20 border border-cyber-red-30 text-cyber-red',
                  'hover:bg-cyber-red-30 hover:text-cyber-red',
                  TYPOGRAPHY.BUTTON_TEXT
                )}
              >
                {t('buttons.reset')}
              </Button>
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
              <Slider
                id='effect-intensity-range'
                value={[effectIntensity]}
                onValueChange={handleEffectIntensityChange}
                min={0}
                max={2}
                step={0.1}
                className={cn(
                  'w-full',
                  '[&>span[data-slot=slider-track]]:bg-cyber-cyan-20',
                  '[&>span[data-slot=slider-range]]:bg-cyber-cyan',
                  '[&>span[data-slot=slider-thumb]]:border-cyber-cyan [&>span[data-slot=slider-thumb]]:bg-cyber-cyan',
                  '[&>span[data-slot=slider-thumb]]:shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                )}
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
              <div className='flex items-center space-x-3'>
                <Switch
                  id='animations-switch'
                  checked={animations}
                  onCheckedChange={() => onAnimationsToggle()}
                  className={cn(
                    'data-[state=checked]:bg-cyber-cyan data-[state=unchecked]:bg-gray-600',
                    'border-2 data-[state=checked]:border-cyber-cyan data-[state=unchecked]:border-gray-500'
                  )}
                  aria-label={t('accessibility.fullAnimation')}
                />
                <label htmlFor='animations-switch' className='cursor-pointer'>
                  <span
                    className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-cyber-cyan`}
                  >
                    {t('accessibility.fullAnimation')}
                  </span>
                  <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple`}>
                    {t('accessibility.fullAnimation')}
                  </p>
                </label>
              </div>
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
