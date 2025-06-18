// Type definitions for basic game elements
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type ThemeVariant = 'cyberpunk' | 'classic' | 'retro' | 'minimal' | 'neon';
export type GameMode = 'single' | 'versus' | 'cooperative' | 'debug';
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

// Import unified theme config
import type { UnifiedThemeConfig } from '../utils/ui/unifiedThemeSystem';

// Type definitions for accessibility features
export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ContrastLevel = 'low' | 'normal' | 'high';
export type AnimationIntensity = 'none' | 'reduced' | 'normal' | 'enhanced';

// Strict type definitions for audio system
export type SoundKey =
  | 'lineClear'
  | 'pieceLand'
  | 'pieceRotate'
  | 'tetris'
  | 'gameOver'
  | 'hardDrop';
export type SoundCategory = 'effect' | 'music' | 'ui' | 'ambient';
export type VolumeLevel = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

// Virtual control types for mobile
export type VirtualControl = 'left' | 'right' | 'down' | 'rotate' | 'hardDrop' | 'pause';

// Key binding types for controls
export interface KeyBinding {
  left: string;
  right: string;
  down: string;
  rotate: string;
  hardDrop: string;
  pause: string;
}

// Board type definition
export type Board = (string | null)[][];

// Strict type definitions for game state
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver' | 'loading';
export type InputSource = 'keyboard' | 'touch' | 'gamepad' | 'mouse';

// Type definitions for performance features
export type RendererType = 'dom' | 'canvas' | 'webgl';
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor';

// Data range constraint types
export type ScoreRange = number; // Integer 0 or greater
export type LevelRange = number; // Integer 1 or greater
export type LineRange = number; // Integer 0 or greater

// Improved type safety with branded types
export type PlayerId = string & { readonly __brand: 'PlayerId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type GameId = string & { readonly __brand: 'GameId' };

export interface Position {
  readonly x: number;
  readonly y: number;
}

// Immutable Tetromino definition (shape data is read-only)
export interface Tetromino {
  readonly type: TetrominoType;
  readonly shape: readonly (readonly number[])[];
  readonly position: Position;
  readonly color: string;
}

// Particles are mutable (for animations)
export interface Particle {
  id: string; // Mutable for pool reuse
  x: number;
  y: number;
  color: string; // Mutable for pool reuse
  vx: number;
  vy: number;
  life: number;
}

// Line effect state (particle array is mutable)
export interface LineEffectState {
  readonly flashingLines: readonly number[];
  readonly shaking: boolean;
  particles: Particle[]; // Mutable for animation updates
}

// Game state (scores etc. are changeable, board is mutable)
export interface GameState {
  board: (string | null)[][]; // Modified during game progression
  currentPiece: Readonly<Tetromino> | null;
  nextPiece: Readonly<Tetromino> | null;
  score: ScoreRange;
  level: LevelRange;
  lines: LineRange;
  gameOver: boolean;
  isPaused: boolean;
  lineEffect: LineEffectState;
}

// Type definitions for error handling
export interface GameError {
  readonly type: 'AUDIO_LOAD_ERROR' | 'STORAGE_ERROR' | 'GAME_STATE_ERROR';
  readonly message: string;
  readonly timestamp: number;
}

export interface ErrorState {
  readonly errors: readonly GameError[];
  readonly hasErrors: boolean;
}

// Constants have been moved to constants/index.ts
// This file contains only type definitions

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
  readonly virtualControlsEnabled: boolean;
  // Extended settings from useSettings hook
  readonly audioEnabled?: boolean;
  readonly showGhost?: boolean;
  readonly showParticles?: boolean;
}

// Import ThemeConfig from new theme manager
export type { UnifiedThemeConfig as ThemeConfig } from '../utils/ui/unifiedThemeSystem';

// Extended theme state
export interface ThemeState {
  readonly current: ThemeVariant;
  readonly customColors?: Record<string, string>;
  readonly effectIntensity: number;
  readonly animations: boolean;
  readonly config: UnifiedThemeConfig | Record<string, unknown>; // Theme configuration object
  readonly accessibility: {
    readonly colorBlindnessType: ColorBlindnessType;
    readonly contrast: ContrastLevel;
    readonly animationIntensity: AnimationIntensity;
    readonly reducedMotion: boolean;
  };
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
  readonly endTime: number | null;
  readonly gamesPlayed: number;
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
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;

  // Error handling actions
  addError: (error: GameError) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;

  // Session tracking actions
  startPlaySession: () => void;
  endPlaySession: () => void;
  incrementGameCount: () => void;
}
