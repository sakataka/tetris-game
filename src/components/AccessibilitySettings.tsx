import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/ui/cn';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type { AnimationIntensity, ColorBlindnessType, ContrastLevel } from '../types/tetris';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

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

  // Generate unique IDs for form elements
  const colorBlindnessSelectId = useId();
  const contrastSelectId = useId();
  const animationSelectId = useId();
  const reducedMotionSwitchId = useId();
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
        className={`${TYPOGRAPHY.PANEL_TITLE} ${TYPOGRAPHY.TITLE_WEIGHT} text-theme-primary ${SPACING.PANEL_TITLE_BOTTOM}`}
      >
        {t('settings.accessibility')}
      </h3>

      <div className={SPACING.FORM_ELEMENTS}>
        {/* Color blindness support */}
        <div>
          <Label
            htmlFor={colorBlindnessSelectId}
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-theme-primary`}
          >
            {t('accessibility.colorVisionSupport')}
          </Label>
          <Select value={colorBlindnessType} onValueChange={handleColorBlindnessChange}>
            <SelectTrigger
              id={colorBlindnessSelectId}
              className={cn(
                'w-full bg-theme-primary/10 border-theme-primary/30 text-foreground',
                'hover:bg-theme-primary/20 focus:ring-theme-primary focus:border-theme-primary',
                'data-[state=open]:border-theme-primary transition-colors',
                '[&>span]:text-foreground'
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-theme-primary/30'>
              {colorBlindnessOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-theme-primary/20 focus:bg-theme-primary/20 focus:text-theme-primary'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-muted mt-1`}>
            {t('accessibility.colorVisionSupportDescription')}
          </p>
        </div>

        {/* Contrast settings */}
        <div>
          <Label
            htmlFor={contrastSelectId}
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-theme-primary`}
          >
            {t('accessibility.contrast')}
          </Label>
          <Select value={contrast} onValueChange={handleContrastChange}>
            <SelectTrigger
              id={contrastSelectId}
              className={cn(
                'w-full bg-theme-primary/10 border-theme-primary/30 text-foreground',
                'hover:bg-theme-primary/20 focus:ring-theme-primary focus:border-theme-primary',
                'data-[state=open]:border-theme-primary transition-colors',
                '[&>span]:text-foreground'
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-theme-primary/30'>
              {contrastOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-theme-primary/20 focus:bg-theme-primary/20 focus:text-theme-primary'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-muted mt-1`}>
            {t('accessibility.contrastDescription')}
          </p>
        </div>

        {/* Animation intensity */}
        <div>
          <Label
            htmlFor={animationSelectId}
            className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-theme-primary`}
          >
            {t('accessibility.animationIntensity')}
          </Label>
          <Select value={animationIntensity} onValueChange={handleAnimationChange}>
            <SelectTrigger
              id={animationSelectId}
              className={cn(
                'w-full bg-theme-primary/10 border-theme-primary/30 text-foreground',
                'hover:bg-theme-primary/20 focus:ring-theme-primary focus:border-theme-primary',
                'data-[state=open]:border-theme-primary transition-colors',
                '[&>span]:text-foreground'
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-theme-primary/30'>
              {animationOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className='text-foreground hover:bg-theme-primary/20 focus:bg-theme-primary/20 focus:text-theme-primary'
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-muted mt-1`}>
            {t('accessibility.animationIntensityDescription')}
          </p>
        </div>

        {/* Motion Sensitivity */}
        <div>
          <div className='flex items-center space-x-3'>
            <Switch
              id={reducedMotionSwitchId}
              checked={reducedMotion}
              onCheckedChange={() => handleReducedMotionToggle()}
              className={cn(
                'data-[state=checked]:bg-theme-primary data-[state=unchecked]:bg-theme-muted',
                'border-2 data-[state=checked]:border-theme-primary data-[state=unchecked]:border-theme-muted/50'
              )}
              aria-label={t('settings.reducedMotion')}
            />
            <Label htmlFor={reducedMotionSwitchId} className='cursor-pointer'>
              <span
                className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-theme-primary`}
              >
                {t('settings.reducedMotion')}
              </span>
              <p className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-muted`}>
                {t('accessibility.animationIntensityDescription')}
              </p>
            </Label>
          </div>
        </div>

        {/* Preview area */}
        <div className='mt-4 p-3 rounded-lg hologram'>
          <div
            className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} ${SPACING.SECTION_TITLE_BOTTOM} text-theme-primary`}
          >
            {t('accessibility.currentSettings')}
          </div>
          <div className={`${TYPOGRAPHY.BODY_TEXT} ${SPACING.PANEL_INTERNAL}`}>
            <div className='text-theme-muted'>
              {t('accessibility.colorVisionSupport')}:{' '}
              {colorBlindnessOptions.find((opt) => opt.value === colorBlindnessType)?.label}
            </div>
            <div className='text-theme-muted'>
              {t('accessibility.contrast')}:{' '}
              {contrastOptions.find((opt) => opt.value === contrast)?.label}
            </div>
            <div className='text-theme-muted'>
              {t('accessibility.animationIntensity')}:{' '}
              {animationOptions.find((opt) => opt.value === animationIntensity)?.label}
            </div>
            {reducedMotion && (
              <div className='text-theme-accent'>{t('accessibility.reducedMotionActive')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AccessibilitySettingsMemo = React.memo(AccessibilitySettings);
