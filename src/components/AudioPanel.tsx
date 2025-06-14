'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY, UI_SIZES } from '../constants/layout';
import type { GameSettings } from '../types/tetris';
import CyberCard from './ui/CyberCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/ui/cn';

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
          <span className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>{t('settings.mute')}</span>
          <Button
            variant='outline'
            size='sm'
            onClick={onToggleMute}
            className={cn(
              'font-mono',
              TYPOGRAPHY.BUTTON_TEXT,
              isMuted
                ? 'border-red-400/50 text-red-400 hover:bg-red-500/20'
                : 'border-green-400/50 text-green-400 hover:bg-green-500/20'
            )}
          >
            {isMuted ? t('common.off').toUpperCase() : t('common.on').toUpperCase()}
          </Button>
        </div>
        <div className='flex justify-between items-center'>
          <span className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.virtualControls')}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              onUpdateSettings({ virtualControlsEnabled: !settings.virtualControlsEnabled })
            }
            className={cn(
              'font-mono',
              TYPOGRAPHY.BUTTON_TEXT,
              settings.virtualControlsEnabled
                ? 'border-green-400/50 text-green-400 hover:bg-green-500/20'
                : 'border-gray-400/50 text-gray-400 hover:bg-gray-500/20'
            )}
          >
            {settings.virtualControlsEnabled
              ? t('common.on').toUpperCase()
              : t('common.off').toUpperCase()}
          </Button>
        </div>
      </div>
    </CyberCard>
  );
});

export default AudioPanel;
