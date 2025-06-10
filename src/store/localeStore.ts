import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRef, useEffect } from 'react';
import { I18N_CONFIG, type SupportedLocale } from '../constants';

// Type definitions for language settings
export interface LocaleState {
  currentLanguage: SupportedLocale;
  supportedLanguages: readonly SupportedLocale[];
  dateFormat: string;
  isRTL: boolean;

  // Actions
  setLanguage: (language: SupportedLocale) => void;
  getDateFormat: () => string;
  isLanguageSupported: (language: string) => boolean;
  reset: () => void;
}

// Initial state
const DEFAULT_LOCALE_STATE: Pick<
  LocaleState,
  'currentLanguage' | 'supportedLanguages' | 'dateFormat' | 'isRTL'
> = {
  currentLanguage: I18N_CONFIG.DEFAULT_LOCALE,
  supportedLanguages: I18N_CONFIG.SUPPORTED_LOCALES,
  dateFormat: I18N_CONFIG.DATE_FORMAT[I18N_CONFIG.DEFAULT_LOCALE],
  isRTL: false, // Currently no RTL languages supported
};

// RTL language determination
const RTL_LANGUAGES: readonly SupportedLocale[] = [] as const; // To be extended for future Arabic support

// Get date format
const getDateFormatForLanguage = (language: SupportedLocale): string => {
  return I18N_CONFIG.DATE_FORMAT[language] || I18N_CONFIG.DATE_FORMAT[I18N_CONFIG.FALLBACK_LOCALE];
};

// RTL determination
const isRTLLanguage = (language: SupportedLocale): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// Browser language detection and fallback
const detectBrowserLanguage = (): SupportedLocale => {
  if (typeof window === 'undefined') {
    return I18N_CONFIG.DEFAULT_LOCALE;
  }

  const browserLang = navigator.language;

  // Check for exact match
  if (I18N_CONFIG.SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale;
  }

  // Check for language code only match (e.g., en-US → en)
  const langCode = browserLang.split('-')[0] as SupportedLocale;
  if (I18N_CONFIG.SUPPORTED_LOCALES.includes(langCode)) {
    return langCode;
  }

  // Fallback
  return I18N_CONFIG.DEFAULT_LOCALE;
};

// Zustand store
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_LOCALE_STATE,

      setLanguage: (language: SupportedLocale) => {
        if (!get().isLanguageSupported(language)) {
          console.warn(
            `Unsupported language: ${language}. Falling back to ${I18N_CONFIG.DEFAULT_LOCALE}`
          );
          language = I18N_CONFIG.DEFAULT_LOCALE;
        }

        set({
          currentLanguage: language,
          dateFormat: getDateFormatForLanguage(language),
          isRTL: isRTLLanguage(language),
        });

        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
          document.documentElement.dir = isRTLLanguage(language) ? 'rtl' : 'ltr';
        }
      },

      getDateFormat: () => {
        const { currentLanguage } = get();
        return getDateFormatForLanguage(currentLanguage);
      },

      isLanguageSupported: (language: string): boolean => {
        return I18N_CONFIG.SUPPORTED_LOCALES.includes(language as SupportedLocale);
      },

      reset: () => {
        const detectedLanguage = detectBrowserLanguage();
        set({
          ...DEFAULT_LOCALE_STATE,
          currentLanguage: detectedLanguage,
          dateFormat: getDateFormatForLanguage(detectedLanguage),
          isRTL: isRTLLanguage(detectedLanguage),
        });
      },
    }),
    {
      name: 'tetris-locale',
      version: 1,

      // Processing when restoring from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set HTML attributes on restoration
          if (typeof document !== 'undefined') {
            document.documentElement.lang = state.currentLanguage;
            document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
          }
        }
      },

      // Filter values to save to storage
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

// Selector functions (performance optimization)
export const useCurrentLanguage = () => useLocaleStore((state) => state.currentLanguage);
export const useSupportedLanguages = () => useLocaleStore((state) => state.supportedLanguages);
export const useIsRTL = () => useLocaleStore((state) => state.isRTL);
export const useDateFormat = () => useLocaleStore((state) => state.dateFormat);
export const useSetLanguage = () => useLocaleStore((state) => state.setLanguage);

// Callback type for language changes
export type LanguageChangeCallback = (
  newLanguage: SupportedLocale,
  oldLanguage: SupportedLocale
) => void;

// Custom hook for monitoring language changes
export const useLanguageChange = (callback: LanguageChangeCallback) => {
  const currentLanguage = useCurrentLanguage();
  const prevLanguageRef = useRef(currentLanguage);

  useEffect(() => {
    if (prevLanguageRef.current !== currentLanguage) {
      callback(currentLanguage, prevLanguageRef.current);
      prevLanguageRef.current = currentLanguage;
    }
  }, [currentLanguage, callback]);
};
