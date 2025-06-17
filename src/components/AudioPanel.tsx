import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY, UI_SIZES } from '../constants/layout';
import type { ExtendedGameSettings } from '../store/settingsStore';
import CyberCard from './ui/CyberCard';
import { Progress } from './ui/progress';

interface AudioPanelProps {
  isMuted: boolean;
  volume: number;
  settings: ExtendedGameSettings;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onUpdateSettings: (settings: Partial<ExtendedGameSettings>) => void;
  audioSystemStatus?: {
    isWebAudioEnabled: boolean;
    preloadProgress?: {
      total: number;
      loaded: number;
      failed: number;
      progress: number;
    };
    fallbackStatus?: {
      currentLevel: number;
      availableLevels: string[];
      silentMode: boolean;
    };
  };
}

const AudioPanel = memo(function AudioPanel({
  isMuted,
  volume,
  settings,
  onToggleMute,
  onVolumeChange,
  onUpdateSettings,
  audioSystemStatus,
}: AudioPanelProps) {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('settings.audioUpper')} theme='primary'>
      {/* Audio System Status - Hidden per requirement */}

      {/* Audio Preload Progress */}
      {audioSystemStatus?.preloadProgress && audioSystemStatus.preloadProgress.progress < 100 && (
        <div className='mb-3'>
          <div className='flex justify-between items-center mb-1'>
            <span className={`text-theme-foreground ${TYPOGRAPHY.SMALL_LABEL}`}>
              Loading Audio: {audioSystemStatus.preloadProgress.loaded}/
              {audioSystemStatus.preloadProgress.total}
            </span>
            <span className={`text-theme-primary ${TYPOGRAPHY.SMALL_LABEL} font-mono`}>
              {Math.round(audioSystemStatus.preloadProgress.progress)}%
            </span>
          </div>
          <Progress
            value={audioSystemStatus.preloadProgress.progress}
            className='h-2 bg-theme-muted/50 [&>div]:bg-theme-primary'
          />
          {audioSystemStatus.preloadProgress.failed > 0 && (
            <div className={`text-theme-error ${TYPOGRAPHY.SMALL_LABEL} mt-1`}>
              {audioSystemStatus.preloadProgress.failed} files failed to load
            </div>
          )}
        </div>
      )}

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
                '[&>span[data-slot=slider-track]]:bg-theme-muted',
                '[&>span[data-slot=slider-range]]:bg-theme-primary',
                '[&>span[data-slot=slider-thumb]]:border-theme-primary [&>span[data-slot=slider-thumb]]:bg-theme-primary',
                '[&>span[data-slot=slider-thumb]]:shadow-[var(--button-glow-base)_var(--theme-primary)]'
              )}
            />
            <span
              className={`font-mono text-theme-primary ${TYPOGRAPHY.BODY_TEXT} ${GAME_UI_SIZES.VOLUME_DISPLAY}`}
            >
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <label htmlFor='mute-switch' className={`text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.mute')}
          </label>
          <Switch
            id='mute-switch'
            checked={!isMuted}
            onCheckedChange={() => onToggleMute()}
            className={cn(
              'data-[state=checked]:bg-theme-primary data-[state=unchecked]:bg-theme-muted',
              'border-2 data-[state=checked]:border-theme-primary data-[state=unchecked]:border-theme-border'
            )}
            aria-label={t('settings.mute')}
          />
        </div>
        <div className='flex justify-between items-center'>
          <label
            htmlFor='virtual-controls-switch'
            className={`text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}
          >
            {t('settings.virtualControls')}
          </label>
          <Switch
            id='virtual-controls-switch'
            checked={settings.virtualControlsEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ virtualControlsEnabled: checked })}
            className={cn(
              'data-[state=checked]:bg-theme-primary data-[state=unchecked]:bg-theme-muted',
              'border-2 data-[state=checked]:border-theme-primary data-[state=unchecked]:border-theme-border'
            )}
            aria-label={t('settings.virtualControls')}
          />
        </div>
      </div>
    </CyberCard>
  );
});

export default AudioPanel;
