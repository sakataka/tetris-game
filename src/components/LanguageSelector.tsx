'use client';

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
          className={`${TYPOGRAPHY.BODY_TEXT} ${TYPOGRAPHY.BODY_WEIGHT} text-gray-300`}
        >
          {t('settings.language')}:
        </label>
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger
          id='language-select'
          className={`
            w-[180px] bg-gray-800 border-gray-600 ${TYPOGRAPHY.BODY_TEXT}
            text-gray-100 hover:border-cyber-cyan transition-colors
            focus:ring-cyber-cyan focus:border-transparent
            [&>span]:text-gray-100
          `}
          aria-label={t('aria.changeLanguage')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-gray-800 border-gray-600'>
          {supportedLanguages.map((lang) => (
            <SelectItem
              key={lang}
              value={lang}
              className='text-gray-100 hover:bg-gray-700 focus:bg-gray-700 focus:text-cyber-cyan'
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
