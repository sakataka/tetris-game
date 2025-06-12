/**
 * Storage management related constants
 *
 * LocalStorage keys and data persistence settings
 */

// Local storage keys
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'tetris-settings',
  HIGH_SCORES: 'tetris-high-scores',
  STATISTICS: 'tetris-statistics',
  THEME_CONFIG: 'tetris-theme',
  PLAY_SESSIONS: 'tetris-sessions',
  ACCESSIBILITY: 'tetris-accessibility-settings',
  LOCALE: 'tetris-locale',
  GAME_CONFIG: 'tetris-game-config', // New: Unified game configuration
} as const;

// Data management settings
export const DATA_MANAGEMENT = {
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
  MAX_SESSION_HISTORY: 100,
  BACKUP_RETENTION_DAYS: 30,
} as const;

// Type exports
export type StorageKey = keyof typeof STORAGE_KEYS;
