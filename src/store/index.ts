// Unified export of new split Zustand store collection

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

// Legacy store removal completed
