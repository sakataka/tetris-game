export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  color: string;
}

export interface LineEffectState {
  flashingLines: number[];
  shaking: boolean;
  particles: Array<{
    id: string;
    x: number;
    y: number;
    color: string;
    vx: number;
    vy: number;
    life: number;
  }>;
}

export interface GameState {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
  lineEffect: LineEffectState;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [1, 1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0',  // Cyan
  O: '#f0f000',  // Yellow
  T: '#a000f0',  // Purple
  S: '#00f000',  // Green
  Z: '#f00000',  // Red
  J: '#0000f0',  // Blue
  L: '#f0a000'   // Orange
};