import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './i18n/locales/en.json';
import ja from './i18n/locales/ja.json';

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
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,

      // Language detection options - force English as default
      detection: {
        order: ['localStorage'],
        caches: ['localStorage'],
        lookupLocalStorage: 'tetris-language',
      },

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      // Development options
      debug: import.meta.env.DEV,
    });
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
