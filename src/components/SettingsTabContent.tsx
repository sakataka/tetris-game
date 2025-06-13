'use client';

import { memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import AudioPanel from './AudioPanel';
import { GameSettings } from '../types/tetris';
import { SPACING, TYPOGRAPHY } from '../constants/layout';

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
    <div className={`${SPACING.PANEL_INTERNAL} p-1.5`}>
      {/* Language Settings */}
      <div className={SPACING.PANEL_INTERNAL}>
        <h3
          className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyber-cyan border-b border-cyber-cyan/30 ${SPACING.SECTION_TITLE_BOTTOM}`}
        >
          {t('settings.language')}
        </h3>
        <Suspense
          fallback={
            <div className={`text-gray-400 ${TYPOGRAPHY.BODY_TEXT}`}>{t('common.loading')}</div>
          }
        >
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

      {/* Game Mode Settings */}
      <div className={SPACING.PANEL_INTERNAL}>
        <h3
          className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyber-cyan border-b border-cyber-cyan/30 ${SPACING.SECTION_TITLE_BOTTOM}`}
        >
          {t('settings.gameMode')}
        </h3>
        <div className='mt-3'>
          <label className='flex items-center space-x-3 text-gray-300 hover:text-white transition-colors cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.gameMode === 'debug'}
              onChange={(e) => {
                updateSettings({
                  gameMode: e.target.checked ? 'debug' : 'single',
                });
              }}
              className='w-4 h-4 text-cyber-cyan bg-gray-900 border-gray-600 rounded focus:ring-cyber-cyan focus:ring-2'
            />
            <span className={TYPOGRAPHY.BODY_TEXT}>{t('settings.debugMode')}</span>
          </label>
          <p className='mt-1 text-xs text-gray-500'>{t('settings.debugModeDescription')}</p>
        </div>
      </div>
    </div>
  );
});

export default SettingsTabContent;
