import { memo, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY, UI_SIZES } from '@/constants/layout';
import type { ExtendedGameSettings } from '@/store/settingsStore';
import { cn } from '@/utils/ui/cn';
import CyberCard from './ui/CyberCard';

interface AudioPanelProps {
  isMuted: boolean;
  volume: number;
  settings: ExtendedGameSettings;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onUpdateSettings: (settings: Partial<ExtendedGameSettings>) => void;
}

const AudioPanel = memo(function AudioPanel({
  isMuted,
  volume,
  settings,
  onToggleMute,
  onVolumeChange,
  onUpdateSettings,
}: AudioPanelProps) {
  const { t } = useTranslation();

  // Generate unique IDs for form elements
  const muteSwitchId = useId();
  const virtualControlsSwitchId = useId();

  return (
    <CyberCard title={t('settings.audioUpper')} theme='primary'>
      <div className={SPACING.FORM_ELEMENTS}>
        <div className='flex justify-between items-center'>
          <span className={`text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.volume')}
          </span>
          <div className='flex items-center space-x-2'>
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0] ?? 0)}
              min={0}
              max={1}
              step={0.1}
              data-testid='volume-slider'
              className={cn(
                UI_SIZES.SLIDER.WIDTH,
                '[&>span[data-slot=slider-track]]:bg-theme-foreground/20',
                '[&>span[data-slot=slider-range]]:bg-theme-foreground',
                '[&>span[data-slot=slider-thumb]]:border-theme-foreground [&>span[data-slot=slider-thumb]]:bg-theme-foreground',
                '[&>span[data-slot=slider-thumb]]:shadow-[var(--button-glow-base)_var(--theme-primary)]'
              )}
            />
            <span
              className={`font-mono text-theme-foreground ${TYPOGRAPHY.BODY_TEXT} ${GAME_UI_SIZES.VOLUME_DISPLAY}`}
            >
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <label htmlFor={muteSwitchId} className={`text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.mute')}
          </label>
          <Switch
            id={muteSwitchId}
            checked={!isMuted}
            onCheckedChange={() => onToggleMute()}
            className={cn(
              'data-[state=checked]:bg-theme-foreground data-[state=unchecked]:bg-theme-foreground/20',
              'border-2 data-[state=checked]:border-theme-foreground data-[state=unchecked]:border-theme-border'
            )}
            aria-label={t('settings.mute')}
          />
        </div>
        <div className='flex justify-between items-center'>
          <label
            htmlFor={virtualControlsSwitchId}
            className={`text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}
          >
            {t('settings.virtualControls')}
          </label>
          <Switch
            id={virtualControlsSwitchId}
            checked={settings.virtualControlsEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ virtualControlsEnabled: checked })}
            className={cn(
              'data-[state=checked]:bg-theme-foreground data-[state=unchecked]:bg-theme-foreground/20',
              'border-2 data-[state=checked]:border-theme-foreground data-[state=unchecked]:border-theme-border'
            )}
            aria-label={t('settings.virtualControls')}
          />
        </div>
      </div>
    </CyberCard>
  );
});

export default AudioPanel;
