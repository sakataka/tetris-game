import { memo, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/ui/cn';
import { TYPOGRAPHY } from '../constants/layout';
import { languageNames, type SupportedLanguage, supportedLanguages } from '../i18n';
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

  // Generate unique ID for form element
  const languageSelectId = useId();

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as SupportedLanguage;
    setLanguage(newLanguage);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label
          htmlFor={languageSelectId}
          className={cn(TYPOGRAPHY.BODY_TEXT, TYPOGRAPHY.BODY_WEIGHT, 'text-theme-foreground')}
        >
          {t('settings.language')}:
        </label>
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger
          id={languageSelectId}
          data-testid='language-selector'
          className={cn(
            'w-[180px] bg-theme-foreground/10 border-theme-foreground/30 text-theme-foreground',
            'hover:bg-theme-foreground/20 hover:border-theme-foreground transition-colors',
            'focus:ring-theme-foreground focus:border-theme-foreground',
            'data-[state=open]:border-theme-foreground',
            '[&>span]:text-theme-foreground',
            TYPOGRAPHY.BODY_TEXT
          )}
          aria-label={t('aria.changeLanguage')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-background border-theme-foreground/30'>
          {supportedLanguages.map((lang) => (
            <SelectItem
              key={lang}
              value={lang}
              className='text-foreground hover:bg-theme-foreground/20 focus:bg-theme-foreground/20 focus:text-theme-foreground'
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
