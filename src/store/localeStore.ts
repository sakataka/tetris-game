import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRef, useEffect } from 'react';
import { I18N_CONFIG, type SupportedLocale } from '../constants';

// 言語設定の型定義
export interface LocaleState {
  currentLanguage: SupportedLocale;
  supportedLanguages: readonly SupportedLocale[];
  dateFormat: string;
  isRTL: boolean;

  // アクション
  setLanguage: (language: SupportedLocale) => void;
  getDateFormat: () => string;
  isLanguageSupported: (language: string) => boolean;
  reset: () => void;
}

// 初期状態
const DEFAULT_LOCALE_STATE: Pick<
  LocaleState,
  'currentLanguage' | 'supportedLanguages' | 'dateFormat' | 'isRTL'
> = {
  currentLanguage: I18N_CONFIG.DEFAULT_LOCALE,
  supportedLanguages: I18N_CONFIG.SUPPORTED_LOCALES,
  dateFormat: I18N_CONFIG.DATE_FORMAT[I18N_CONFIG.DEFAULT_LOCALE],
  isRTL: false, // 現在サポート言語にRTL言語なし
};

// RTL言語の判定
const RTL_LANGUAGES: readonly SupportedLocale[] = [] as const; // 将来のアラビア語対応時に拡張

// 日付フォーマットの取得
const getDateFormatForLanguage = (language: SupportedLocale): string => {
  return I18N_CONFIG.DATE_FORMAT[language] || I18N_CONFIG.DATE_FORMAT[I18N_CONFIG.FALLBACK_LOCALE];
};

// RTL判定
const isRTLLanguage = (language: SupportedLocale): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// ブラウザ言語の検出とフォールバック
const detectBrowserLanguage = (): SupportedLocale => {
  if (typeof window === 'undefined') {
    return I18N_CONFIG.DEFAULT_LOCALE;
  }

  const browserLang = navigator.language;

  // 完全一致をチェック
  if (I18N_CONFIG.SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale;
  }

  // 言語コードのみでの一致をチェック（例: en-US → en）
  const langCode = browserLang.split('-')[0] as SupportedLocale;
  if (I18N_CONFIG.SUPPORTED_LOCALES.includes(langCode)) {
    return langCode;
  }

  // フォールバック
  return I18N_CONFIG.DEFAULT_LOCALE;
};

// Zustandストア
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

        // HTML lang属性を更新
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

      // ストレージからの復元時の処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 復元時にHTML属性を設定
          if (typeof document !== 'undefined') {
            document.documentElement.lang = state.currentLanguage;
            document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
          }
        }
      },

      // ストレージに保存する値をフィルタリング
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

// セレクター関数（パフォーマンス最適化）
export const useCurrentLanguage = () => useLocaleStore((state) => state.currentLanguage);
export const useSupportedLanguages = () => useLocaleStore((state) => state.supportedLanguages);
export const useIsRTL = () => useLocaleStore((state) => state.isRTL);
export const useDateFormat = () => useLocaleStore((state) => state.dateFormat);
export const useSetLanguage = () => useLocaleStore((state) => state.setLanguage);

// 言語変更時のコールバック型
export type LanguageChangeCallback = (
  newLanguage: SupportedLocale,
  oldLanguage: SupportedLocale
) => void;

// 言語変更の監視用カスタムフック
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
