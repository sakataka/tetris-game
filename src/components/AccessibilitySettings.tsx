'use client';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorBlindnessType, ContrastLevel, AnimationIntensity } from '../types/tetris';
import { SPACING, TYPOGRAPHY } from '../constants/layout';

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
  const handleColorBlindnessChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onSettingsChange({ colorBlindnessType: event.target.value as ColorBlindnessType });
    },
    [onSettingsChange]
  );

  const handleContrastChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onSettingsChange({ contrast: event.target.value as ContrastLevel });
    },
    [onSettingsChange]
  );

  const handleAnimationChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newIntensity = event.target.value as AnimationIntensity;
      onSettingsChange({
        animationIntensity: newIntensity,
        reducedMotion: newIntensity === 'none' || newIntensity === 'reduced',
      });
    },
    [onSettingsChange]
  );

  const handleReducedMotionToggle = useCallback(() => {
    const newReducedMotion = !reducedMotion;
    onSettingsChange({
      reducedMotion: newReducedMotion,
      animationIntensity: newReducedMotion ? 'reduced' : 'normal',
    });
  }, [reducedMotion, onSettingsChange]);

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
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.colorVisionSupport')}
          </label>
          <select
            value={colorBlindnessType}
            onChange={handleColorBlindnessChange}
            className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors'
          >
            {colorBlindnessOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className='bg-background text-foreground'
              >
                {option.label}
              </option>
            ))}
          </select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.colorVisionSupportDescription')}
          </p>
        </div>

        {/* Contrast settings */}
        <div>
          <label
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.contrast')}
          </label>
          <select
            value={contrast}
            onChange={handleContrastChange}
            className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors'
          >
            {contrastOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className='bg-background text-foreground'
              >
                {option.label}
              </option>
            ))}
          </select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.contrastDescription')}
          </p>
        </div>

        {/* Animation intensity */}
        <div>
          <label
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
          >
            {t('accessibility.animationIntensity')}
          </label>
          <select
            value={animationIntensity}
            onChange={handleAnimationChange}
            className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors'
          >
            {animationOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className='bg-background text-foreground'
              >
                {option.label}
              </option>
            ))}
          </select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple mt-1`}>
            {t('accessibility.animationIntensityDescription')}
          </p>
        </div>

        {/* Motion Sensitivity */}
        <div>
          <label className='flex items-center space-x-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
              className='w-4 h-4 accent-cyber-cyan rounded focus:ring-2 focus:ring-cyber-cyan'
            />
            <div>
              <span className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-cyber-cyan`}>
                {t('settings.reducedMotion')}
              </span>
              <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyber-purple`}>
                {t('accessibility.animationIntensityDescription')}
              </p>
            </div>
          </label>
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
