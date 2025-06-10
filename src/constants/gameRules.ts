/**
 * Game rules related constants
 *
 * Configuration values for score calculation, level progression, and game balance
 */

// Score calculation
export const SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  HARD_DROP_BONUS: 2,
  SOFT_DROP_BONUS: 1,
} as const;

// Level and progression settings
export const LEVEL_UP_LINES = 10;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 999;

// Game timing
export const INITIAL_DROP_TIME = 1000; // ms
export const DROP_TIME_MULTIPLIER = 0.9;

// Statistics and ranking settings
export const MAX_HIGH_SCORES = 10;
export const MIN_SCORE = 0;
export const MAX_SCORE = 9999999;

// Session management
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

// Validation settings
export const VALIDATION = {
  MIN_SCORE,
  MAX_SCORE,
  MIN_LEVEL,
  MAX_LEVEL,
  SESSION_TIMEOUT,
} as const;

// Type exports
export type ScoreType = keyof typeof SCORES;
