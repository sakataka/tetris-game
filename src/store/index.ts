// 新しい分割されたZustandストア群の統合エクスポート

// Settings Store
export {
  useSettingsStore,
  useSettings,
  useSettingsActions
} from './settingsStore';

// Game State Store
export {
  useGameStateStore,
  useGameState as useNewGameState,
  useDropTime,
  useGameStateActions
} from './gameStateStore';

// Theme Store
export {
  useThemeStore,
  useTheme as useNewTheme,
  useThemeConfig,
  useThemeAccessibility,
  useThemeActions
} from './themeStore';

// Statistics Store
export {
  useStatisticsStore,
  useHighScores as useNewHighScores,
  useStatistics as useNewStatistics,
  useStatisticsActions
} from './statisticsStore';

// Session Store
export {
  useSessionStore,
  useCurrentSession,
  usePlaySessions,
  useErrors as useNewErrors,
  useSessionActions,
  useErrorActions
} from './sessionStore';

// レガシーストア（段階的廃止予定）
export { useGameStore } from './gameStore';