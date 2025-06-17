import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import { type SupportedLanguage, languageNames, supportedLanguages } from '../i18n';
import { useCurrentLanguage, useSetLanguage } from '../store/i18nStore';
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
          className={cn(TYPOGRAPHY.BODY_TEXT, TYPOGRAPHY.BODY_WEIGHT, 'text-theme-primary')}
        >
          {t('settings.language')}:
        </label>
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger
          id='language-select'
          data-testid='language-selector'
          className={cn(
            'w-[180px] bg-theme-primary/10 border-theme-primary/30 text-theme-primary',
            'hover:bg-theme-primary/20 hover:border-theme-primary transition-colors',
            'focus:ring-theme-primary focus:border-theme-primary',
            'data-[state=open]:border-theme-primary',
            '[&>span]:text-theme-primary',
            TYPOGRAPHY.BODY_TEXT
          )}
          aria-label={t('aria.changeLanguage')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-background border-theme-primary/30'>
          {supportedLanguages.map((lang) => (
            <SelectItem
              key={lang}
              value={lang}
              className='text-foreground hover:bg-theme-primary/20 focus:bg-theme-primary/20 focus:text-theme-primary'
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
