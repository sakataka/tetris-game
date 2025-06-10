/**
 * ストレージ管理関連の定数
 *
 * LocalStorageキー、データ永続化設定
 */

// ローカルストレージキー
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'tetris-settings',
  HIGH_SCORES: 'tetris-high-scores',
  STATISTICS: 'tetris-statistics',
  THEME_CONFIG: 'tetris-theme',
  PLAY_SESSIONS: 'tetris-sessions',
  ACCESSIBILITY: 'tetris-accessibility-settings',
  LOCALE: 'tetris-locale',
} as const;

// データ管理設定
export const DATA_MANAGEMENT = {
  AUTO_SAVE_INTERVAL: 5000, // 5秒
  MAX_SESSION_HISTORY: 100,
  BACKUP_RETENTION_DAYS: 30,
} as const;

// 型エクスポート
export type StorageKey = keyof typeof STORAGE_KEYS;
