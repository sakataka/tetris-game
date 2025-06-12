'use client';

import { memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import AudioPanel from './AudioPanel';
import { GameSettings } from '../types/tetris';

interface SettingsTabContentProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

const SettingsTabContent = memo(function SettingsTabContent({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  settings,
  updateSettings,
}: SettingsTabContentProps) {
  const { t } = useTranslation();

  return (
    <div className='space-y-0.5 p-0.5'>
      {/* Language Settings */}
      <div className='space-y-0.5'>
        <h3 className='text-xs font-bold text-cyber-cyan border-b border-cyber-cyan/30 pb-0.5'>
          {t('settings.language')}
        </h3>
        <Suspense fallback={<div className='text-gray-400 text-xs'>{t('common.loading')}</div>}>
          <LanguageSelector />
        </Suspense>
      </div>

      {/* Audio Settings */}
      <AudioPanel
        isMuted={isMuted}
        volume={volume}
        settings={settings}
        onToggleMute={onToggleMute}
        onVolumeChange={onVolumeChange}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
});

export default SettingsTabContent;
