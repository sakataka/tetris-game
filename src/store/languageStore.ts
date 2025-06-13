import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import i18n from '../i18n';
import type { SupportedLanguage } from '../i18n';
import { defaultLanguage } from '../i18n';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isInitialized: boolean;
}

interface LanguageActions {
  setLanguage: (language: SupportedLanguage) => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageState & LanguageActions>()(
  persist(
    (set, get) => ({
      // State
      currentLanguage: defaultLanguage,
      isInitialized: false,

      // Actions
      setLanguage: (language: SupportedLanguage) => {
        set({ currentLanguage: language });
        i18n.changeLanguage(language);
      },

      initializeLanguage: () => {
        const { currentLanguage } = get();
        if (!get().isInitialized) {
          i18n.changeLanguage(currentLanguage);
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'tetris-language-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentLanguage = () => useLanguageStore((state) => state.currentLanguage);
export const useSetLanguage = () => useLanguageStore((state) => state.setLanguage);
export const useInitializeLanguage = () => useLanguageStore((state) => state.initializeLanguage);
