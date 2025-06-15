// Unified export of new split Zustand store collection

// I18n Store (unified language + locale)
export {
  useI18nStore,
  useCurrentLanguage,
  useSupportedLanguages,
  useIsRTL,
  useDateFormat,
  useSetLanguage,
  useInitializeLanguage,
  useLanguageChange,
  type LanguageChangeCallback,
} from './i18nStore';

// Settings Store
export {
  useSettingsStore,
  useSettings,
  useUpdateSettings,
  useResetSettings,
  useUpdateTheme,
} from './settingsStore';

// Game State Store
export {
  useGameStateStore,
  useGameState as useNewGameState,
  useDropTime,
  useSetGameState,
  useUpdateParticles,
  useResetGame,
  useTogglePause,
  useSetDropTime,
  useUpdateLineEffect,
  useClearLineEffect,
  useCalculatePiecePlacementState,
  useMovePieceToPosition,
  useRotatePieceTo,
} from './gameStateStore';

// Theme Store
export {
  useThemeStore,
  useTheme as useNewTheme,
  useThemeConfig,
  useThemeAccessibility,
  useSetTheme,
  useUpdateThemeState,
  useSetCustomColors,
  useSetAccessibilityOptions,
  useResetThemeToDefault,
  useSetEffectIntensity,
  useToggleAnimations,
} from './themeStore';

// Statistics Store
export {
  useStatisticsStore,
  useHighScores as useNewHighScores,
  useStatistics as useNewStatistics,
  useAddHighScore,
  useClearHighScores,
  useUpdateStatistics,
  useResetStatistics,
  useIncrementTotalGames,
  useUpdateBestScore,
  useAddScore,
  useAddLines,
  useAddTetris,
  useAddPlayTime,
  useUpdateBestStreak,
  useGetAverageScore,
  useGetEfficiency,
} from './statisticsStore';

// Session Store
export {
  useSessionStore,
  useCurrentSession,
  usePlaySessions,
  useStartPlaySession,
  useEndPlaySession,
  useIncrementGameCount,
  useGetActiveSession,
  useGetSessionDuration,
  useGetTotalPlayTime,
} from './sessionStore';

// Error Store (consolidated error handling)
export {
  useErrorStore,
  useErrors,
  useErrorStats,
  useErrorConfig,
  useShowErrorPanel,
  useSelectedErrorId,
  useErrorActions,
  useErrorSelectors,
  useErrorSummary,
  useErrorsByLevel,
  useErrorsByCategory,
} from './errorStore';

// Accessibility Store (unified visual + orchestration)
export {
  useAccessibilityStore,
  useAccessibility,
  useAccessibilityLevel,
  useAccessibilityEnabled,
  useSetAccessibilityLevel,
  useToggleAccessibility,
  useApplyAccessibilityPreset,
  useResetAllAccessibility,
  useDetectSystemPreferences,
  useEnableAccessibilityMode,
  useEnableGamingMode,
  useEnableScreenReaderMode,
  // Visual accessibility (now integrated)
  useVisualAccessibilityState,
  useColorBlindnessType,
  useContrastLevel,
  useFontSizeLevel,
  useVisualAssistance,
  useAnimationSettings,
  useSetColorBlindnessType,
  useSetContrast,
  useSetFontSize,
  useSetAnimationIntensity,
  useUpdateVisualAssistance,
  useToggleHighContrast,
  useToggleLargeText,
  useToggleReducedMotion,
  useDetectSystemVisualPreferences,
} from './accessibilityStore';

// Specialized Accessibility Store (cognitive + input)
export {
  // Cognitive accessibility
  useCognitiveAccessibilityState,
  useCognitiveAssistance,
  useGameAccessibility,
  useSimplifiedUI,
  useConfirmActions,
  useAutoSave,
  useTimeoutWarnings,
  usePauseOnFocusLoss,
  usePauseOnBlur,
  useVisualGameOver,
  useColorCodedPieces,
  useGridLines,
  useDropPreview,
  useUpdateCognitiveAssistance,
  useUpdateGameSpecific,
  useToggleSimplifiedUI,
  useToggleConfirmActions,
  useToggleAutoSave,
  useEnableFocusMode,
  useDisableFocusMode,
  // Input accessibility
  useInputAccessibilityState,
  useKeyboardNavigation,
  useFeedbackSettings,
  useKeyboardEnabled,
  useFocusOutline,
  useSkipLinks,
  useTabOrder,
  useSoundEffects,
  useVoiceAnnouncements,
  useHapticFeedback,
  useScreenReader,
  useUpdateKeyboardNavigation,
  useUpdateFeedbackSettings,
  useToggleKeyboardFocus,
  useToggleSoundEffects,
  useToggleVoiceAnnouncements,
  useToggleHapticFeedback,
  // Reset functions
  useResetCognitiveToDefaults,
  useResetInputToDefaults,
  useResetSpecializedToDefaults,
} from './specializedAccessibility';

// Legacy store removal completed
