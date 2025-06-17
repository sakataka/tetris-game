import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/ui/cn';
import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type { ThemeVariant } from '../types/tetris';
import { ThemeSelectorMemo } from './ThemeSelector';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

interface ThemeSettingsProps {
  currentTheme: ThemeVariant;
  effectIntensity: number;
  animations: boolean;
  onThemeChange: (theme: ThemeVariant) => void;
  onEffectIntensityChange: (intensity: number) => void;
  onAnimationsToggle: () => void;
  onResetToDefault: () => void;
  className?: string;
}

export default function ThemeSettings({
  currentTheme,
  effectIntensity,
  animations,
  onThemeChange,
  onEffectIntensityChange,
  onAnimationsToggle,
  onResetToDefault,
  className = '',
}: ThemeSettingsProps) {
  const { t } = useTranslation();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // Generate unique IDs for form elements
  const effectIntensityRangeId = useId();
  const animationsSwitchId = useId();

  // Event handler (React Compiler will optimize this)
  const handleEffectIntensityChange = (value: number[]) => {
    onEffectIntensityChange(value[0] ?? 1);
  };

  const handleResetConfirm = () => {
    onResetToDefault();
    toast.success('🎨 Theme Reset Complete', {
      description: 'All theme settings have been restored to default cyberpunk theme',
      duration: 3000,
    });
  };


  return (
    <div className={`theme-settings ${className}`}>
      <ScrollArea className='h-[500px]'>
        <div className={SPACING.PANEL_INTERNAL}>
          {/* Theme Selection */}
          <div className='mb-6'>
            <h3 className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} mb-3 text-theme-primary`}>
              🎨 {t('themes.title')}
            </h3>
            <ThemeSelectorMemo currentTheme={currentTheme} onThemeChange={onThemeChange} />
          </div>

          {/* Effect Settings */}
          <div className='mb-6'>
            <h3 className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} mb-3 text-theme-primary`}>
              ✨ {t('accessibility.motion')}
            </h3>
            
            {/* Effect intensity */}
            <div className='mb-4'>
              <Label
                htmlFor={effectIntensityRangeId}
                className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-theme-primary`}
              >
                {t('accessibility.effectIntensity')}: {(effectIntensity * 100).toFixed(0)}%
              </Label>
              <Slider
                id={effectIntensityRangeId}
                value={[effectIntensity]}
                onValueChange={handleEffectIntensityChange}
                min={0.5}
                max={1.5}
                step={0.1}
                className='w-full cursor-pointer'
              />
              <div
                className={`flex justify-between ${TYPOGRAPHY.SMALL_LABEL} text-theme-primary mt-0.5`}
              >
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            {/* Animation enable/disable */}
            <div>
              <div className='flex items-center space-x-3'>
                <Switch
                  id={animationsSwitchId}
                  checked={animations}
                  onCheckedChange={() => onAnimationsToggle()}
                  className={cn(
                    'data-[state=checked]:bg-theme-primary data-[state=unchecked]:bg-theme-muted',
                    'border-2 data-[state=checked]:border-theme-primary data-[state=unchecked]:border-theme-border'
                  )}
                  aria-label={t('accessibility.fullAnimation')}
                />
                <Label htmlFor={animationsSwitchId} className='cursor-pointer'>
                  <span
                    className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-theme-primary`}
                  >
                    {t('accessibility.fullAnimation')}
                  </span>
                  <p className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-primary`}>
                    {t('accessibility.fullAnimationDesc')}
                  </p>
                </Label>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className='flex gap-2'>
            <Button
              variant='destructive'
              onClick={() => setShowResetConfirmation(true)}
              className={cn(
                'bg-theme-error/20 border border-theme-error/30 text-theme-error',
                'hover:bg-theme-error/30 hover:text-theme-error',
                TYPOGRAPHY.BUTTON_TEXT
              )}
            >
              {t('buttons.reset')}
            </Button>
          </div>
        </div>
      </ScrollArea>

      <ConfirmationDialog
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleResetConfirm}
        title={t('themes.resetConfirmation.title')}
        description={t('themes.resetConfirmation.description')}
        confirmText={t('buttons.reset')}
        cancelText={t('common.cancel')}
        variant='destructive'
      />
    </div>
  );
}

export const ThemeSettingsMemo = React.memo(ThemeSettings);
