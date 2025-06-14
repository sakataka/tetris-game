'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type { AnimationIntensity, ColorBlindnessType, ContrastLevel } from '../types/tetris';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { cn } from '@/utils/ui/cn';

interface AccessibilitySettingsProps {
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  onSettingsChange: (settings: {
    colorBlindnessType?: ColorBlindnessType;
    contrast?: ContrastLevel;
    animationIntensity?: AnimationIntensity;
    reducedMotion?: boolean;
  }) => void;
  className?: string;
}

export default function AccessibilitySettings({
  colorBlindnessType,
  contrast,
  animationIntensity,
  reducedMotion,
  onSettingsChange,
  className = '',
}: AccessibilitySettingsProps) {
  const { t } = useTranslation();
  // Event handlers (React Compiler will optimize these)
  const handleColorBlindnessChange = (value: string) => {
    onSettingsChange({ colorBlindnessType: value as ColorBlindnessType });
  };

  const handleContrastChange = (value: string) => {
    onSettingsChange({ contrast: value as ContrastLevel });
  };

  const handleAnimationChange = (value: string) => {
    const newIntensity = value as AnimationIntensity;
    onSettingsChange({
      animationIntensity: newIntensity,
      reducedMotion: newIntensity === 'none' || newIntensity === 'reduced',
    });
  };

  const handleReducedMotionToggle = () => {
    const newReducedMotion = !reducedMotion;
    onSettingsChange({
      reducedMotion: newReducedMotion,
      animationIntensity: newReducedMotion ? 'reduced' : 'normal',
    });
  };

  const colorBlindnessOptions = [
    { value: 'none', label: t('accessibility.none') },
    { value: 'protanopia', label: t('accessibility.protanopia') },
    { value: 'deuteranopia', label: t('accessibility.deuteranopia') },
    { value: 'tritanopia', label: t('accessibility.tritanopia') },
  ];

  const contrastOptions = [
    { value: 'low', label: t('accessibility.lowContrast') },
    { value: 'normal', label: t('accessibility.standard') },
    { value: 'high', label: t('accessibility.highContrast') },
  ];

  const animationOptions = [
    { value: 'none', label: t('accessibility.noAnimation') },
    { value: 'reduced', label: t('accessibility.reduced') },
    { value: 'normal', label: t('accessibility.standard') },
    { value: 'enhanced', label: t('accessibility.enhanced') },
  ];

  return (
    <div className={`accessibility-settings ${className}`}>
      <h3
        className={`${TYPOGRAPHY.PANEL_TITLE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyber-cyan ${SPACING.PANEL_TITLE_BOTTOM}`}
      >
        {t('settings.accessibility')}
      </h3>

      <div className={SPACING.FORM_ELEMENTS}>
        {/* Color blindness support */}
        <div>
          <label
            htmlFor='color-blindness-select'
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.colorVisionSupport')}
          </label>
          <Select value={colorBlindnessType} onValueChange={handleColorBlindnessChange}>
            <SelectTrigger
              id='color-blindness-select'
              className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                         text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                         hover:bg-cyber-cyan-20 transition-colors
                         [&>span]:text-foreground'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-cyber-cyan-30'>
              {colorBlindnessOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.colorVisionSupportDescription')}
          </p>
        </div>

        {/* Contrast settings */}
        <div>
          <label
            htmlFor='contrast-select'
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.contrast')}
          </label>
          <Select value={contrast} onValueChange={handleContrastChange}>
            <SelectTrigger
              id='contrast-select'
              className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                         text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                         hover:bg-cyber-cyan-20 transition-colors
                         [&>span]:text-foreground'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-cyber-cyan-30'>
              {contrastOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.contrastDescription')}
          </p>
        </div>

        {/* Animation intensity */}
        <div>
          <label
            htmlFor='animation-intensity-select'
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.animationIntensity')}
          </label>
          <Select value={animationIntensity} onValueChange={handleAnimationChange}>
            <SelectTrigger
              id='animation-intensity-select'
              className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                         text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                         hover:bg-cyber-cyan-20 transition-colors
                         [&>span]:text-foreground'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-cyber-cyan-30'>
              {animationOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.animationIntensityDescription')}
          </p>
        </div>

        {/* Motion Sensitivity */}
        <div>
          <div className='flex items-center space-x-3'>
            <Switch
              id='reduced-motion-switch'
              checked={reducedMotion}
              onCheckedChange={() => handleReducedMotionToggle()}
              className={cn(
                'data-[state=checked]:bg-cyber-cyan data-[state=unchecked]:bg-gray-600',
                'border-2 data-[state=checked]:border-cyber-cyan data-[state=unchecked]:border-gray-500'
              )}
              aria-label={t('settings.reducedMotion')}
            />
            <label htmlFor='reduced-motion-switch' className='cursor-pointer'>
              <span className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-cyber-cyan`}>
                {t('settings.reducedMotion')}
              </span>
              <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple`}>
                {t('accessibility.animationIntensityDescription')}
              </p>
            </label>
          </div>
        </div>

        {/* Preview area */}
        <div className='mt-4 p-3 rounded-lg hologram'>
          <div
            className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} ${SPACING.SECTION_TITLE_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.currentSettings')}
          </div>
          <div className={`${TYPOGRAPHY.BODY_TEXT} ${SPACING.PANEL_INTERNAL}`}>
            <div className='text-cyber-purple'>
              {t('accessibility.colorVisionSupport')}:{' '}
              {colorBlindnessOptions.find((opt) => opt.value === colorBlindnessType)?.label}
            </div>
            <div className='text-cyber-purple'>
              {t('accessibility.contrast')}:{' '}
              {contrastOptions.find((opt) => opt.value === contrast)?.label}
            </div>
            <div className='text-cyber-purple'>
              {t('accessibility.animationIntensity')}:{' '}
              {animationOptions.find((opt) => opt.value === animationIntensity)?.label}
            </div>
            {reducedMotion && (
              <div className='text-cyber-yellow'>{t('accessibility.reducedMotionActive')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AccessibilitySettingsMemo = React.memo(AccessibilitySettings);
