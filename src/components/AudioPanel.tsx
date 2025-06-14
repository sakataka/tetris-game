'use client';

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY, UI_SIZES } from '../constants/layout';
import type { GameSettings } from '../types/tetris';
import CyberCard from './ui/CyberCard';

interface AudioPanelProps {
  isMuted: boolean;
  volume: number;
  settings: GameSettings;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
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

  return (
    <CyberCard title={t('settings.audio').toUpperCase()} theme='cyan'>
      <div className={SPACING.FORM_ELEMENTS}>
        <div className='flex justify-between items-center'>
          <span className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>{t('settings.volume')}</span>
          <div className='flex items-center space-x-2'>
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0] ?? 0)}
              min={0}
              max={1}
              step={0.1}
              className={cn(
                UI_SIZES.SLIDER.WIDTH,
                '[&>span[data-slot=slider-track]]:bg-gray-700',
                '[&>span[data-slot=slider-range]]:bg-cyber-cyan',
                '[&>span[data-slot=slider-thumb]]:border-cyber-cyan [&>span[data-slot=slider-thumb]]:bg-cyber-cyan',
                '[&>span[data-slot=slider-thumb]]:shadow-[0_0_10px_rgba(0,255,255,0.5)]'
              )}
            />
            <span
              className={`font-mono text-cyan-400 ${TYPOGRAPHY.BODY_TEXT} ${GAME_UI_SIZES.VOLUME_DISPLAY}`}
            >
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <label htmlFor='mute-switch' className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.mute')}
          </label>
          <Switch
            id='mute-switch'
            checked={!isMuted}
            onCheckedChange={() => onToggleMute()}
            className={cn(
              'data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600',
              'border-2 data-[state=checked]:border-green-400 data-[state=unchecked]:border-gray-500'
            )}
            aria-label={t('settings.mute')}
          />
        </div>
        <div className='flex justify-between items-center'>
          <label
            htmlFor='virtual-controls-switch'
            className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}
          >
            {t('settings.virtualControls')}
          </label>
          <Switch
            id='virtual-controls-switch'
            checked={settings.virtualControlsEnabled}
            onCheckedChange={(checked) => onUpdateSettings({ virtualControlsEnabled: checked })}
            className={cn(
              'data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600',
              'border-2 data-[state=checked]:border-green-400 data-[state=unchecked]:border-gray-500'
            )}
            aria-label={t('settings.virtualControls')}
          />
        </div>
      </div>
    </CyberCard>
  );
});

export default AudioPanel;
