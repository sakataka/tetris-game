import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/ui/cn';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type {
  AnimationIntensity,
  ColorBlindnessType,
  ColorPalette,
  ContrastLevel,
  ThemeVariant,
} from '../types/tetris';
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
  colorBlindnessType: _colorBlindnessType, // Unused after accessibility removal
  contrast: _contrast, // Unused after accessibility removal
  animationIntensity: _animationIntensity, // Unused after accessibility removal
  reducedMotion: _reducedMotion, // Unused after accessibility removal
  effectIntensity,
  animations,
  onThemeChange,
  onColorsChange,
  onAccessibilityChange: _onAccessibilityChange, // Unused after accessibility removal
  onEffectIntensityChange,
  onAnimationsToggle,
  onResetToDefault,
  className = '',
}: ThemeSettingsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'theme' | 'colors' | 'effects'>('theme');
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

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
    { id: 'colors', label: t('colorPalette.title'), icon: '🌈' },
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
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : 'bg-gray-800/30 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-400/30 border-transparent'
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

          {activeTab === 'effects' && (
            <div className={SPACING.PANEL_INTERNAL}>
              {/* Effect intensity */}
              <div>
                <Label
                  htmlFor='effect-intensity-range'
                  className={`block ${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} ${SPACING.FORM_LABEL_BOTTOM} text-cyber-cyan`}
                >
                  Effect Intensity: {(effectIntensity * 100).toFixed(0)}%
                </Label>
                <Slider
                  id='effect-intensity-range'
                  value={[effectIntensity]}
                  onValueChange={handleEffectIntensityChange}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className='w-full cursor-pointer'
                />
                <div
                  className={`flex justify-between ${TYPOGRAPHY.SMALL_LABEL} text-cyan-400 mt-0.5`}
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
                    id='animations-switch'
                    checked={animations}
                    onCheckedChange={() => onAnimationsToggle()}
                    className={cn(
                      'data-[state=checked]:bg-cyber-cyan data-[state=unchecked]:bg-gray-600',
                      'border-2 data-[state=checked]:border-cyber-cyan data-[state=unchecked]:border-gray-500'
                    )}
                    aria-label={t('accessibility.fullAnimation')}
                  />
                  <Label htmlFor='animations-switch' className='cursor-pointer'>
                    <span
                      className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-cyber-cyan`}
                    >
                      {t('accessibility.fullAnimation')}
                    </span>
                    <p className={`${TYPOGRAPHY.SMALL_LABEL} text-cyan-400`}>
                      {t('accessibility.fullAnimationDesc')}
                    </p>
                  </Label>
                </div>
              </div>

              {/* Effect preview */}
              <div className='p-4 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30'>
                <div
                  className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} mb-3 text-cyber-cyan`}
                >
                  {t('colorPalette.preview')}
                </div>
                <div className={SPACING.LOOSE}>
                  <div
                    className='p-3 rounded border border-cyber-cyan-30 text-center bg-cyber-cyan-10'
                    style={{
                      filter: `brightness(${0.8 + effectIntensity * 0.4}) saturate(${0.8 + effectIntensity * 0.4})`,
                      animation: animations ? 'pulse 2s infinite' : 'none',
                    }}
                  >
                    Neon Effect
                  </div>
                  <div
                    className='p-3 rounded bg-cyber-cyan-10 border border-cyber-cyan-30 text-center'
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
