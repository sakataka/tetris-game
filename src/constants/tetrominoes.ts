/**
 * Tetromino definition related constants
 *
 * Tetromino shape, color, and type definitions
 */

// Tetromino color definitions
export const TETROMINO_COLORS = {
  I: '#00ffff', // Cyan
  O: '#ffff00', // Yellow
  T: '#ff00ff', // Magenta
  S: '#00ff00', // Green
  Z: '#ff0000', // Red
  J: '#0000ff', // Blue
  L: '#ff8000', // Orange
} as const;

// Tetromino shape definitions
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

// Tetromino type list
export const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

// Type exports
export type TetrominoColor = keyof typeof TETROMINO_COLORS;
export type TetrominoShape = keyof typeof TETROMINO_SHAPES;
export type TetrominoTypeList = typeof TETROMINO_TYPES;
