import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import { type SupportedLanguage, languageNames, supportedLanguages } from '../i18n';
import { useCurrentLanguage, useSetLanguage } from '../store/languageStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector = memo(function LanguageSelector({
  className = '',
  showLabel = true,
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const currentLanguage = useCurrentLanguage();
  const setLanguage = useSetLanguage();

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as SupportedLanguage;
    setLanguage(newLanguage);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label
          htmlFor='language-select'
          className={cn(TYPOGRAPHY.BODY_TEXT, TYPOGRAPHY.BODY_WEIGHT, 'text-cyber-cyan')}
        >
          {t('settings.language')}:
        </label>
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger
          id='language-select'
          data-testid='language-selector'
          className={cn(
            'w-[180px] bg-cyber-cyan-10 border-cyber-cyan-30 text-cyber-cyan',
            'hover:bg-cyber-cyan-20 hover:border-cyber-cyan transition-colors',
            'focus:ring-cyber-cyan focus:border-cyber-cyan',
            'data-[state=open]:border-cyber-cyan',
            '[&>span]:text-cyber-cyan',
            TYPOGRAPHY.BODY_TEXT
          )}
          aria-label={t('aria.changeLanguage')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-background border-cyber-cyan-30'>
          {supportedLanguages.map((lang) => (
            <SelectItem
              key={lang}
              value={lang}
              className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
            >
              {languageNames[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export default LanguageSelector;
