'use client';

import { memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface SettingsTabContentProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

const SettingsTabContent = memo(function SettingsTabContent({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
}: SettingsTabContentProps) {
  const { t } = useTranslation();

  return (
    <div className='space-y-6 p-4'>
      {/* Language Settings */}
      <div className='space-y-3'>
        <h3 className='text-lg font-bold text-cyber-cyan border-b border-cyber-cyan/30 pb-2'>
          {t('settings.language')}
        </h3>
        <Suspense fallback={<div className='text-gray-400 text-sm'>{t('common.loading')}</div>}>
          <LanguageSelector />
        </Suspense>
      </div>

      {/* Audio Settings */}
      <div className='space-y-3'>
        <h3 className='text-lg font-bold text-cyber-cyan border-b border-cyber-cyan/30 pb-2'>
          {t('settings.audio')}
        </h3>
        <div className='space-y-3'>
          {/* Volume Control */}
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-300'>{t('settings.volume')}:</label>
            <div className='flex items-center gap-2'>
              <input
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className='w-20 accent-cyber-cyan'
              />
              <span className='text-xs text-gray-400 w-8'>{Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Mute Toggle */}
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-300'>
              {t('settings.soundEffects')}:
            </label>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
            >
              {isMuted ? t('settings.mute') : t('settings.unmute')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SettingsTabContent;
