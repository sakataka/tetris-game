/**
 * Internationalization Store
 *
 * Unified i18n store combining language selection and locale management.
 * Consolidates functionality from languageStore.ts and localeStore.ts
 * for simpler and more maintainable internationalization.
 */

import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { log } from '@/utils/logging';
import i18n, { defaultLanguage, type SupportedLanguage, supportedLanguages } from '@/i18n';

// Unified interface combining language and locale functionality
interface I18nState {
  // Language state (from languageStore)
  currentLanguage: SupportedLanguage;
  isInitialized: boolean;

  // Locale state (from localeStore)
  supportedLanguages: readonly SupportedLanguage[];
  dateFormat: string;
  isRTL: boolean;
}

interface I18nActions {
  // Language actions
  setLanguage: (language: SupportedLanguage) => void;
  initializeLanguage: () => void;

  // Locale actions
  getDateFormat: () => string;
  isLanguageSupported: (language: string) => boolean;
  reset: () => void;
}

// Simple date format mapping for supported languages
const DATE_FORMAT_MAP: Record<SupportedLanguage, string> = {
  en: 'MM/DD/YYYY',
  ja: 'YYYY年MM月DD日',
};

// Default state combining both stores
const DEFAULT_I18N_STATE: Pick<
  I18nState,
  'currentLanguage' | 'supportedLanguages' | 'dateFormat' | 'isRTL' | 'isInitialized'
> = {
  currentLanguage: defaultLanguage,
  isInitialized: false,
  supportedLanguages: supportedLanguages,
  dateFormat: DATE_FORMAT_MAP[defaultLanguage],
  isRTL: false,
};

// RTL language detection (currently none supported)
const RTL_LANGUAGES: readonly SupportedLanguage[] = [] as const;

// Utility functions
const getDateFormatForLanguage = (language: SupportedLanguage): string => {
  return DATE_FORMAT_MAP[language] || DATE_FORMAT_MAP[defaultLanguage];
};

const isRTLLanguage = (language: SupportedLanguage): boolean => {
  return RTL_LANGUAGES.includes(language);
};

const isSupportedLanguage = (language: string): language is SupportedLanguage => {
  return supportedLanguages.includes(language as SupportedLanguage);
};

// Unified i18n store
export const useI18nStore = create<I18nState & I18nActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_I18N_STATE,

      // Language actions (from languageStore)
      setLanguage: (language: SupportedLanguage) => {
        let validLanguage = language;
        if (!get().isLanguageSupported(language)) {
          log.warn(`Unsupported language: ${language}. Falling back to ${defaultLanguage}`, {
            component: 'I18nStore',
          });
          validLanguage = defaultLanguage;
        }

        set({
          currentLanguage: validLanguage,
          dateFormat: getDateFormatForLanguage(validLanguage),
          isRTL: isRTLLanguage(validLanguage),
        });

        // Update i18n instance
        i18n.changeLanguage(validLanguage);

        // Update HTML attributes
        if (typeof document !== 'undefined') {
          document.documentElement.lang = validLanguage;
          document.documentElement.dir = isRTLLanguage(validLanguage) ? 'rtl' : 'ltr';
        }
      },

      initializeLanguage: () => {
        const { currentLanguage } = get();
        if (!get().isInitialized) {
          i18n.changeLanguage(currentLanguage);
          set({ isInitialized: true });

          // Set HTML attributes on initialization
          if (typeof document !== 'undefined') {
            document.documentElement.lang = currentLanguage;
            document.documentElement.dir = isRTLLanguage(currentLanguage) ? 'rtl' : 'ltr';
          }
        }
      },

      // Locale actions (from localeStore)
      getDateFormat: () => {
        const { currentLanguage } = get();
        return getDateFormatForLanguage(currentLanguage);
      },

      isLanguageSupported: (language: string): boolean => {
        return isSupportedLanguage(language);
      },

      reset: () => {
        set({
          ...DEFAULT_I18N_STATE,
          currentLanguage: defaultLanguage,
          dateFormat: getDateFormatForLanguage(defaultLanguage),
          isRTL: isRTLLanguage(defaultLanguage),
        });

        // Update i18n and HTML attributes
        i18n.changeLanguage(defaultLanguage);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = defaultLanguage;
          document.documentElement.dir = isRTLLanguage(defaultLanguage) ? 'rtl' : 'ltr';
        }
      },
    }),
    {
      name: 'tetris-i18n-store',
      storage: createJSONStorage(() => localStorage),
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

      // Don't persist language to force English default
      partialize: (_state) => ({}),
    }
  )
);

// Optimized selector hooks (combining both stores)
export const useCurrentLanguage = () => useI18nStore((state) => state.currentLanguage);
export const useSupportedLanguages = () => useI18nStore((state) => state.supportedLanguages);
export const useIsRTL = () => useI18nStore((state) => state.isRTL);
export const useDateFormat = () => useI18nStore((state) => state.dateFormat);
export const useSetLanguage = () => useI18nStore((state) => state.setLanguage);
export const useInitializeLanguage = () => useI18nStore((state) => state.initializeLanguage);

// Callback type for language changes
export type LanguageChangeCallback = (
  newLanguage: SupportedLanguage,
  oldLanguage: SupportedLanguage
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
