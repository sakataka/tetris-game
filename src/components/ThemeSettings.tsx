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
import type {
  AnimationIntensity,
  ColorBlindnessType,
  ContrastLevel,
  ThemeVariant,
} from '../types/tetris';
import { ThemeSelectorMemo } from './ThemeSelector';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

interface ThemeSettingsProps {
  currentTheme: ThemeVariant;
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  effectIntensity: number;
  animations: boolean;
  onThemeChange: (theme: ThemeVariant) => void;
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
  colorBlindnessType: _colorBlindnessType, // Unused after accessibility removal
  contrast: _contrast, // Unused after accessibility removal
  animationIntensity: _animationIntensity, // Unused after accessibility removal
  reducedMotion: _reducedMotion, // Unused after accessibility removal
  effectIntensity,
  animations,
  onThemeChange,
  onAccessibilityChange: _onAccessibilityChange, // Unused after accessibility removal
  onEffectIntensityChange,
  onAnimationsToggle,
  onResetToDefault,
  className = '',
}: ThemeSettingsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'theme' | 'effects'>('theme');
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

  const tabs = [
    { id: 'theme', label: t('themes.preview'), icon: '🎨' },
    { id: 'effects', label: t('accessibility.motion'), icon: '✨' },
  ] as const;

  return (
    <div className={`theme-settings ${className}`}>
      {/* Tab navigation */}
      <div
        className={`flex flex-wrap gap-0.5 ${SPACING.PANEL_TITLE_BOTTOM} p-0.5 rounded-lg bg-theme-primary/10`}
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
                ? 'bg-theme-primary/20 text-theme-primary border-theme-primary/50 shadow-lg shadow-theme-primary/20'
                : 'bg-theme-surface/30 text-theme-muted hover:bg-theme-primary/10 hover:text-theme-primary hover:border-theme-primary/30 border-transparent'
            )}
          >
            <span className='hidden sm:inline'>{tab.icon} </span>
            <span className='truncate'>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <div className='min-h-[200px]'>
        <ScrollArea className='h-[400px]'>
          {activeTab === 'theme' && (
            <div className={SPACING.PANEL_INTERNAL}>
              <ThemeSelectorMemo currentTheme={currentTheme} onThemeChange={onThemeChange} />

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
          )}


          {activeTab === 'effects' && (
            <div className={SPACING.PANEL_INTERNAL}>
              {/* Effect intensity */}
              <div>
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

              {/* Effect preview */}
              <div className='p-4 rounded-lg bg-theme-primary/10 border border-theme-primary/30'>
                <div
                  className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} mb-3 text-theme-primary`}
                >
                  {t('colorPalette.preview')}
                </div>
                <div className={SPACING.LOOSE}>
                  <div
                    className='p-3 rounded border border-theme-primary/30 text-center bg-theme-primary/10'
                    style={{
                      filter: `brightness(${0.8 + effectIntensity * 0.4}) saturate(${0.8 + effectIntensity * 0.4})`,
                      animation: animations ? 'pulse 2s infinite' : 'none',
                    }}
                  >
                    {t('themes.effects.neon')}
                  </div>
                  <div
                    className='p-3 rounded bg-theme-primary/10 border border-theme-primary/30 text-center'
                    style={{
                      backdropFilter: `blur(${5 + effectIntensity * 10}px)`,
                      animation: animations ? 'float 3s ease-in-out infinite' : 'none',
                    }}
                  >
                    {t('themes.effects.hologram')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

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
