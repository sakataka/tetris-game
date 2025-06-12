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

// Game preview settings
export const PREVIEW_PIECES = 3;

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

// Game physics and visual settings
export const GAME_PHYSICS = {
  CELL_SIZE: 24, // Cell pixel size
  CELL_CENTER_OFFSET: 12, // Cell center offset
  BOARD_POSITION_OFFSET: 8, // Board position adjustment

  // Piece movement
  MOVE_DELAY: 100, // Movement delay (ms)
  REPEAT_DELAY: 150, // Key repeat delay (ms)
  REPEAT_INTERVAL: 50, // Key repeat interval (ms)
} as const;

// Particle system settings
export const PARTICLE_SYSTEM = {
  POOL_SIZE: 150,
  PRELOAD_COUNT: 50,
  POSITION_VARIANCE_X: 20,
  POSITION_VARIANCE_Y: 10,

  // Particle physics
  GRAVITY: 0.5,
  LIFE_DURATION: 20, // frames
  SCALE_BASE: 0.5,
  SCALE_MULTIPLIER: 1.5,
  OPACITY_MULTIPLIER: 0.8,
} as const;

// Type exports
export type ScoreType = keyof typeof SCORES;
