import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import { useAudioVolumeState } from '../store/audioStore';
import { useSettings, useUpdateSettings } from '../store/settingsStore';
import AudioPanel from './AudioPanel';
import LanguageSelector from './LanguageSelector';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

// No props needed - all state comes from stores
const SettingsTabContent = memo(function SettingsTabContent() {
  const { t } = useTranslation();
  const { volume, isMuted, setVolume, toggleMute } = useAudioVolumeState();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <div className={`${SPACING.PANEL_INTERNAL} p-4 space-y-6`}>
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
        onToggleMute={toggleMute}
        onVolumeChange={setVolume}
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
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='debug-mode-checkbox'
              checked={settings.gameMode === 'debug'}
              onCheckedChange={(checked) => {
                updateSettings({
                  gameMode: checked ? 'debug' : 'single',
                });
              }}
              className='data-[state=checked]:bg-cyber-cyan data-[state=checked]:border-cyber-cyan data-[state=unchecked]:border-gray-600 data-[state=unchecked]:bg-gray-900'
              aria-label={t('settings.debugMode')}
            />
            <Label
              htmlFor='debug-mode-checkbox'
              className='text-gray-300 hover:text-white transition-colors cursor-pointer'
            >
              <span className={TYPOGRAPHY.BODY_TEXT}>{t('settings.debugMode')}</span>
            </Label>
          </div>
          <p className='mt-1 text-xs text-gray-500'>{t('settings.debugModeDescription')}</p>
        </div>
      </div>
    </div>
  );
});

SettingsTabContent.displayName = 'SettingsTabContent';

export default SettingsTabContent;
