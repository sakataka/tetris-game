'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameSettings } from '../types/tetris';
import PanelBase from './ui/PanelBase';
import { UI_SIZES, GAME_UI_SIZES, SPACING, TYPOGRAPHY } from '../constants/layout';

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
    <PanelBase title={t('settings.audio').toUpperCase()} theme='cyan'>
      <div className={SPACING.FORM_ELEMENTS}>
        <div className='flex justify-between items-center'>
          <span className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>{t('settings.volume')}</span>
          <div className='flex items-center space-x-2'>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className={`${UI_SIZES.SLIDER.WIDTH} ${UI_SIZES.SLIDER.HEIGHT} bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,255,0.5)]`}
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
          <button
            onClick={onToggleMute}
            className={`px-3 py-1 rounded font-mono ${TYPOGRAPHY.BUTTON_TEXT} transition-all duration-300 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-400/50'
                : 'bg-green-500/20 text-green-400 border border-green-400/50'
            }`}
          >
            {isMuted ? t('common.off').toUpperCase() : t('common.on').toUpperCase()}
          </button>
        </div>
        <div className='flex justify-between items-center'>
          <span className={`text-gray-300 ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('settings.virtualControls')}
          </span>
          <button
            onClick={() =>
              onUpdateSettings({ virtualControlsEnabled: !settings.virtualControlsEnabled })
            }
            className={`px-3 py-1 rounded font-mono ${TYPOGRAPHY.BUTTON_TEXT} transition-all duration-300 ${
              settings.virtualControlsEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-400/50'
                : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
            }`}
          >
            {settings.virtualControlsEnabled
              ? t('common.on').toUpperCase()
              : t('common.off').toUpperCase()}
          </button>
        </div>
      </div>
    </PanelBase>
  );
});

export default AudioPanel;
