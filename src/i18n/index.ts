import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';

// Language resources
const resources = {
  en: { translation: en },
  ja: { translation: ja },
} as const;

// Supported languages
export const supportedLanguages = ['en', 'ja'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Default language
export const defaultLanguage: SupportedLanguage = 'en';

// Language display names
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ja: '日本語',
};

// Only initialize on client side to avoid SSR issues
if (typeof window !== 'undefined') {
  // Get language from localStorage or use default
  const storedLanguage = localStorage.getItem('tetris-language');
  const initialLanguage = (storedLanguage && supportedLanguages.includes(storedLanguage as SupportedLanguage)) 
    ? storedLanguage as SupportedLanguage 
    : defaultLanguage;

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: defaultLanguage,

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      // Development options
      debug: import.meta.env.DEV,
    });

  // Ensure localStorage is set to the determined language
  localStorage.setItem('tetris-language', initialLanguage);
} else {
  // Server-side initialization without detection
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });
}

export default i18n;
