/**
 * ゲームルール関連の定数
 *
 * スコア計算、レベル進行、ゲームバランスに関する設定値
 */

// スコア計算
export const SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  HARD_DROP_BONUS: 2,
  SOFT_DROP_BONUS: 1,
} as const;

// レベル・進行設定
export const LEVEL_UP_LINES = 10;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 999;

// ゲームタイミング
export const INITIAL_DROP_TIME = 1000; // ms
export const DROP_TIME_MULTIPLIER = 0.9;

// 統計・ランキング設定
export const MAX_HIGH_SCORES = 10;
export const MIN_SCORE = 0;
export const MAX_SCORE = 9999999;

// セッション管理
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

// バリデーション設定
export const VALIDATION = {
  MIN_SCORE,
  MAX_SCORE,
  MIN_LEVEL,
  MAX_LEVEL,
  SESSION_TIMEOUT,
} as const;

// 型エクスポート
export type ScoreType = keyof typeof SCORES;
