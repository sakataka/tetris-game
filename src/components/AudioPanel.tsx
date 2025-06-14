'use client';

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
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

  // Audio system status badge
  const getAudioSystemBadge = () => {
    if (!audioSystemStatus) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant='secondary'
              className='bg-gray-500/20 text-gray-400 border-gray-400/30 cursor-help'
            >
              UNKNOWN
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className='text-center'>
              <div className='font-medium'>Unknown Status</div>
              <div className='text-xs text-cyan-300 mt-1'>Audio system status unknown</div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (audioSystemStatus.fallbackStatus?.silentMode) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant='outline'
              className='bg-gray-700/20 text-gray-300 border-gray-500/30 cursor-help'
            >
              SILENT MODE
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className='text-center'>
              <div className='font-medium'>Silent Mode</div>
              <div className='text-xs text-cyan-300 mt-1'>Audio system failed to initialize</div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (audioSystemStatus.isWebAudioEnabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant='default'
              className='bg-green-500/20 text-green-400 border-green-400/50 cursor-help'
            >
              WEB AUDIO
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className='text-center'>
              <div className='font-medium'>Web Audio API</div>
              <div className='text-xs text-cyan-300 mt-1'>
                High-quality audio with advanced effects
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant='secondary'
            className='bg-yellow-500/20 text-yellow-400 border-yellow-400/50 cursor-help'
          >
            HTML AUDIO
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className='text-center'>
            <div className='font-medium'>HTML Audio</div>
            <div className='text-xs text-cyan-300 mt-1'>
              Basic audio fallback for older browsers
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <CyberCard title={t('settings.audio').toUpperCase()} theme='cyan'>
      {/* Audio System Status */}
      <div className='flex justify-between items-center mb-3'>
        <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>Audio System:</span>
        {getAudioSystemBadge()}
      </div>

      {/* Audio Preload Progress */}
      {audioSystemStatus?.preloadProgress && audioSystemStatus.preloadProgress.progress < 100 && (
        <div className='mb-3'>
          <div className='flex justify-between items-center mb-1'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>
              Loading Audio: {audioSystemStatus.preloadProgress.loaded}/
              {audioSystemStatus.preloadProgress.total}
            </span>
            <span className={`text-cyber-cyan ${TYPOGRAPHY.SMALL_LABEL} font-mono`}>
              {Math.round(audioSystemStatus.preloadProgress.progress)}%
            </span>
          </div>
          <Progress
            value={audioSystemStatus.preloadProgress.progress}
            className='h-2 bg-gray-700/50 [&>div]:bg-gradient-to-r [&>div]:from-cyber-cyan [&>div]:to-blue-400'
          />
          {audioSystemStatus.preloadProgress.failed > 0 && (
            <div className={`text-red-400 ${TYPOGRAPHY.SMALL_LABEL} mt-1`}>
              {audioSystemStatus.preloadProgress.failed} files failed to load
            </div>
          )}
        </div>
      )}

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
