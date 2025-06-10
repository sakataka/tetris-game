'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentLanguage, useSetLanguage } from '../store/languageStore';
import { supportedLanguages, languageNames, type SupportedLanguage } from '../i18n';

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
        <label htmlFor='language-select' className='text-sm font-medium text-gray-300'>
          {t('settings.language')}:
        </label>
      )}
      <select
        id='language-select'
        value={currentLanguage}
        onChange={handleLanguageChange}
        className='
          bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm
          text-gray-100 hover:border-cyber-cyan transition-colors
          focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:border-transparent
        '
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
