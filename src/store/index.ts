// Unified export of new split Zustand store collection

// Accessibility Store (unified: visual + cognitive + input)
export {
  useAccessibility,
  useAccessibilityLevel,
  useAccessibilityStore,
  useCognitiveAccessibility,
  useInputAccessibility,
  useVisualAccessibility,
} from './accessibilityStore';
// Error Store (consolidated error handling)
export {
  useErrorActions,
  useErrorConfig,
  useErrorSelectors,
  useErrorStats,
  useErrorStore,
  useErrorSummary,
  useErrors,
  useErrorsByCategory,
  useErrorsByLevel,
  useSelectedErrorId,
  useShowErrorPanel,
} from './errorStore';

// Game State Store
export {
  useCalculatePiecePlacementState,
  useClearLineEffect,
  useDropTime,
  useGameState as useNewGameState,
  useGameStateStore,
  useMovePieceToPosition,
  useResetGame,
  useRotatePieceTo,
  useSetDropTime,
  useSetGameState,
  useTogglePause,
  useUpdateLineEffect,
  useUpdateParticles,
} from './gameStateStore';
// I18n Store (unified language + locale)
export {
  type LanguageChangeCallback,
  useCurrentLanguage,
  useDateFormat,
  useI18nStore,
  useInitializeLanguage,
  useIsRTL,
  useLanguageChange,
  useSetLanguage,
  useSupportedLanguages,
} from './i18nStore';
// Settings Store (unified with navigation)
export {
  useAudioSettings,
  useKeyBindings,
  useNavigation,
  useSettings,
  useSettingsStore,
  useUpdateSettings,
  useVisualSettings,
} from './settingsStore';
// Statistics Store (unified with session management)
export {
  // Statistics actions
  useAddHighScore,
  useAddLines,
  useAddPlayTime,
  useAddScore,
  useAddTetris,
  useClearAllSessions,
  useClearHighScores,
  // Session selectors
  useCurrentSession,
  useEndPlaySession,
  useGetActiveSession,
  // Computed getters
  useGetAverageScore,
  useGetEfficiency,
  useGetSessionDuration,
  useGetTotalPlayTime,
  // Statistics selectors
  useHighScores,
  useIncrementGameCount,
  useIncrementTotalGames,
  useIsSessionActive,
  usePlaySessions,
  useResetStatistics,
  useSessionStats,
  // Session actions
  useStartPlaySession,
  useStatistics,
  useStatisticsStore,
  useUpdateBestScore,
  useUpdateBestStreak,
  useUpdateStatistics,
} from './statisticsStore';
// Theme Store
export {
  useSetAccessibilityOptions,
  useSetEffectIntensity,
  useSetTheme,
  useTheme as useNewTheme,
  useThemeAccessibility,
  useThemeConfig,
  useThemeStore,
  useToggleAnimations,
  useUpdateThemeState,
} from './themeStore';

// Legacy store removal completed
