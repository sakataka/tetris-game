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

// Settings Store (unified with navigation)
export {
  useSettingsStore,
  // Settings selectors
  useSettings,
  useVolume,
  useIsMuted,
  useAudioEnabled,
  useTheme,
  useShowGhost,
  useShowParticles,
  useKeyBindings,
  // Navigation selectors
  useActiveTab,
  // Settings actions
  useUpdateSettings,
  useResetSettings,
  useUpdateTheme,
  useUpdateKeyBinding,
  useAddKeyBinding,
  useRemoveKeyBinding,
  useResetKeyBindings,
  useIsKeyBound,
  useGetKeyBinding,
  useUpdateVolume,
  useToggleMute,
  useToggleAudioEnabled,
  useToggleShowGhost,
  useToggleShowParticles,
  // Navigation actions
  useSetActiveTab,
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
  useSetAccessibilityOptions,
  useSetEffectIntensity,
  useToggleAnimations,
} from './themeStore';

// Statistics Store (unified with session management)
export {
  useStatisticsStore,
  // Statistics selectors
  useHighScores,
  useStatistics,
  // Session selectors
  useCurrentSession,
  usePlaySessions,
  useSessionStats,
  useIsSessionActive,
  // Statistics actions
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
  // Session actions
  useStartPlaySession,
  useEndPlaySession,
  useIncrementGameCount,
  useClearAllSessions,
  // Computed getters
  useGetAverageScore,
  useGetEfficiency,
  useGetActiveSession,
  useGetSessionDuration,
  useGetTotalPlayTime,
} from './statisticsStore';

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

// Accessibility Store (unified: visual + cognitive + input)
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
  // Visual accessibility
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
  useSetUIComplexity,
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
  useEnableOptimizedKeyboard,
  useEnableBasicKeyboard,
  useEnableFullFeedback,
  useEnableMinimalFeedback,
  useEnableSilentMode,
  // Reset functions
  useResetCognitiveToDefaults,
  useResetInputToDefaults,
} from './accessibilityStore';

// Legacy store removal completed
