export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type ThemeVariant = 'cyberpunk' | 'classic' | 'neon';
export type GameMode = 'single' | 'versus' | 'cooperative';
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Tetromino {
  readonly type: TetrominoType;
  readonly shape: number[][];
  readonly position: Position;
  readonly color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

export interface LineEffectState {
  flashingLines: number[];
  shaking: boolean;
  particles: Particle[];
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

// エラーハンドリング用の型定義
export interface GameError {
  readonly type: 'AUDIO_LOAD_ERROR' | 'STORAGE_ERROR' | 'GAME_STATE_ERROR';
  readonly message: string;
  readonly timestamp: number;
}

export interface ErrorState {
  readonly errors: readonly GameError[];
  readonly hasErrors: boolean;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Animation and effect constants
export const EFFECT_RESET_DELAY = 300; // ms
export const PARTICLE_LIFE_DURATION = 60; // frames
export const PARTICLES_PER_CELL = 3;
export const HARD_DROP_BONUS_MULTIPLIER = 2;
export const TETRIS_BONUS_POINTS = 300;
export const BASE_LINE_POINTS = 100;

// Particle physics constants
export const PARTICLE_GRAVITY = 0.2;
export const PARTICLE_MAX_Y = 500;
export const PARTICLE_SCALE_BASE = 0.5;
export const PARTICLE_SCALE_MULTIPLIER = 1.5;
export const PARTICLE_OPACITY_MULTIPLIER = 0.9;

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

// Phase 2: Enhanced state management types
export interface HighScore {
  readonly id: string;
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly date: number;
  readonly playerName?: string;
}

export interface GameStatistics {
  readonly totalGames: number;
  readonly totalLines: number;
  readonly totalScore: number;
  readonly bestScore: number;
  readonly averageScore: number;
  readonly playTime: number; // in seconds
  readonly bestStreak: number;
  readonly tetrisCount: number;
}

export interface GameSettings {
  readonly volume: number;
  readonly isMuted: boolean;
  readonly theme: ThemeVariant;
  readonly keyBindings: Record<string, string>;
  readonly difficulty: DifficultyLevel;
  readonly gameMode: GameMode;
}

export interface ThemeState {
  readonly current: ThemeVariant;
  readonly customColors?: Record<string, string>;
  readonly effectIntensity: number;
  readonly animations: boolean;
}

// Global state interface for Zustand store
export interface GlobalGameState extends GameState {
  readonly settings: GameSettings;
  readonly highScores: readonly HighScore[];
  readonly statistics: GameStatistics;
  readonly theme: ThemeState;
  readonly errors: readonly GameError[];
  readonly currentSession: PlaySession | null;
  readonly playSessions: readonly PlaySession[];
}

// Play session tracking
export interface PlaySession {
  readonly id: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly gameCount: number;
  readonly isActive: boolean;
}

// Zustand store actions interface
export interface GameStoreActions {
  // Game state actions
  setGameState: (gameState: Partial<GameState>) => void;
  updateParticles: (particles: Particle[]) => void;
  resetGame: () => void;
  togglePause: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // High scores actions
  addHighScore: (score: HighScore) => void;
  clearHighScores: () => void;
  
  // Statistics actions
  updateStatistics: (stats: Partial<GameStatistics>) => void;
  resetStatistics: () => void;
  
  // Theme actions
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  
  // Error handling actions
  addError: (error: GameError) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;
  
  // Session tracking actions
  startPlaySession: () => void;
  endPlaySession: () => void;
  incrementGameCount: () => void;
}