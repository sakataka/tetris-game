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
  useErrors as useNewErrors,
  useStartPlaySession,
  useEndPlaySession,
  useIncrementGameCount,
  useGetActiveSession,
  useGetSessionDuration,
  useGetTotalPlayTime,
  useAddError,
  useClearErrors,
  useClearError,
} from './sessionStore';

// Legacy store removal completed
