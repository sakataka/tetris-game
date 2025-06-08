/**
 * ゲーム定数の定義
 * 文字列リソースと分離して、ゲームロジック用の定数を管理
 */

// ゲームボード設定
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// ゲームタイミング設定
export const INITIAL_DROP_TIME = 1000;
export const DROP_TIME_MULTIPLIER = 0.9;
export const LEVEL_UP_LINES = 10;

// スコア計算
export const SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  HARD_DROP_BONUS: 2,
  SOFT_DROP_BONUS: 1,
} as const;

// パーティクル設定
export const PARTICLE_CONFIG = {
  GRAVITY: 0.2,
  MAX_Y: 500,
  LIFE_MAX: 60,
  SCALE_BASE: 1.0,
  OPACITY_MULTIPLIER: 0.8,
  COUNT_PER_LINE: 15,
} as const;

// エフェクト設定
export const EFFECTS = {
  FLASH_DURATION: 300,
  SHAKE_DURATION: 200,
  NEON_BLUR_SM: '4px',
  NEON_BLUR_MD: '8px',
  NEON_BLUR_LG: '12px',
  NEON_BLUR_XL: '16px',
} as const;

// テーマ設定
export const THEME_CONFIG = {
  DEFAULT_VOLUME: 0.5,
  DEFAULT_EFFECT_INTENSITY: 50,
  ANIMATION_DURATION: '0.3s',
  TRANSITION_DURATION: '0.2s',
} as const;

// モバイル設定
export const MOBILE_CONFIG = {
  TOUCH_DELAY: 100,
  VIRTUAL_BUTTON_SIZE: 48,
  MIN_SCREEN_WIDTH: 320,
  TABLET_BREAKPOINT: 768,
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'tetris-settings',
  HIGH_SCORES: 'tetris-high-scores',
  STATISTICS: 'tetris-statistics',
  THEME_CONFIG: 'tetris-theme',
  PLAY_SESSIONS: 'tetris-sessions',
} as const;

// バリデーション設定
export const VALIDATION = {
  MAX_HIGH_SCORES: 10,
  MIN_SCORE: 0,
  MAX_SCORE: 9999999,
  MIN_LEVEL: 1,
  MAX_LEVEL: 999,
  SESSION_TIMEOUT: 300000, // 5分
} as const;

// パフォーマンス設定
export const PERFORMANCE = {
  PARTICLE_POOL_SIZE: 100,
  MAX_PARTICLES: 200,
  RENDER_BATCH_SIZE: 20,
  CLEANUP_INTERVAL: 10000, // 10秒
} as const;

// 多言語化設定（将来の拡張用）
export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'ja',
  SUPPORTED_LOCALES: ['ja', 'en', 'zh', 'ko'] as const,
  FALLBACK_LOCALE: 'en',
  DATE_FORMAT: {
    ja: 'YYYY年MM月DD日',
    en: 'MM/DD/YYYY',
    zh: 'YYYY年MM月DD日',
    ko: 'YYYY년 MM월 DD일',
  },
} as const;

// テトリミノの色定義
export const TETROMINO_COLORS = {
  I: '#00ffff', // シアン
  O: '#ffff00', // イエロー
  T: '#ff00ff', // マゼンタ
  S: '#00ff00', // グリーン
  Z: '#ff0000', // レッド
  J: '#0000ff', // ブルー
  L: '#ff8000', // オレンジ
} as const;

// テトリミノの形状定義
export const TETROMINO_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
} as const;

// 型エクスポート
export type SupportedLocale = typeof I18N_CONFIG.SUPPORTED_LOCALES[number];
export type StorageKey = keyof typeof STORAGE_KEYS;
export type TetrominoColor = keyof typeof TETROMINO_COLORS;