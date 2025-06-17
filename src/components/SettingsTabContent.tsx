import { Suspense, memo, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import { useAudioVolumeState } from '../store/audioStore';
import { useSettings, useUpdateSettings } from '../store/settingsStore';
import AudioPanel from './AudioPanel';
import LanguageSelector from './LanguageSelector';
import CyberCard from './ui/CyberCard';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

// No props needed - all state comes from stores
const SettingsTabContent = memo(function SettingsTabContent() {
  const { t } = useTranslation();
  const { volume, isMuted, setVolume, toggleMute } = useAudioVolumeState();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  
  // Generate unique ID for form element
  const debugModeCheckboxId = useId();

  return (
    <div className='space-y-6 max-w-4xl'>
      {/* Language Settings */}
      <CyberCard title={t('settings.language')} theme='primary' size='md'>
        <Suspense
          fallback={
            <div className={`text-theme-muted ${TYPOGRAPHY.BODY_TEXT}`}>{t('common.loading')}</div>
          }
        >
          <LanguageSelector />
        </Suspense>
      </CyberCard>

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
      <CyberCard title={t('settings.gameMode')} theme='primary' size='md'>
        <div className='space-y-3'>
          <div className='flex items-center space-x-3'>
            <Checkbox
              id={debugModeCheckboxId}
              checked={settings.gameMode === 'debug'}
              onCheckedChange={(checked) => {
                updateSettings({
                  gameMode: checked ? 'debug' : 'single',
                });
              }}
              className='data-[state=checked]:bg-theme-primary data-[state=checked]:border-theme-primary data-[state=unchecked]:border-theme-muted data-[state=unchecked]:bg-theme-surface'
              aria-label={t('settings.debugMode')}
            />
            <Label
              htmlFor={debugModeCheckboxId}
              className='text-theme-foreground hover:text-theme-primary transition-colors cursor-pointer'
            >
              <span className={TYPOGRAPHY.BODY_TEXT}>{t('settings.debugMode')}</span>
            </Label>
          </div>
          <p className='text-xs text-theme-muted'>{t('settings.debugModeDescription')}</p>
        </div>
      </CyberCard>
    </div>
  );
});

SettingsTabContent.displayName = 'SettingsTabContent';

export default SettingsTabContent;
