'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import { type SupportedLanguage, languageNames, supportedLanguages } from '../i18n';
import { useCurrentLanguage, useSetLanguage } from '../store/languageStore';

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

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as SupportedLanguage;
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
      <select
        id='language-select'
        value={currentLanguage}
        onChange={handleLanguageChange}
        className={`
          bg-gray-800 border border-gray-600 rounded px-2 py-1 ${TYPOGRAPHY.BODY_TEXT}
          text-gray-100 hover:border-cyber-cyan transition-colors
          focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:border-transparent
        `}
        aria-label={t('aria.changeLanguage')}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang} className='bg-gray-800 text-gray-100'>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
});

export default LanguageSelector;
