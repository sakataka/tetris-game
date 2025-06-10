// 基本的なゲーム要素の型定義
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type ThemeVariant = 'cyberpunk' | 'classic' | 'retro' | 'minimal' | 'neon';
export type GameMode = 'single' | 'versus' | 'cooperative';
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

// アクセシビリティ関連の型定義
export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ContrastLevel = 'low' | 'normal' | 'high';
export type AnimationIntensity = 'none' | 'reduced' | 'normal' | 'enhanced';

// 音響システムの厳密な型定義
export type SoundKey =
  | 'lineClear'
  | 'pieceLand'
  | 'pieceRotate'
  | 'tetris'
  | 'gameOver'
  | 'hardDrop';
export type SoundCategory = 'effect' | 'music' | 'ui' | 'ambient';
export type VolumeLevel = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

// ゲーム状態の厳密な型定義
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver' | 'loading';
export type InputSource = 'keyboard' | 'touch' | 'gamepad' | 'mouse';

// パフォーマンス関連の型定義
export type RendererType = 'dom' | 'canvas' | 'webgl';
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor';

// データ範囲の制約型
export type ScoreRange = number; // 0以上の整数
export type LevelRange = number; // 1以上の整数
export type LineRange = number; // 0以上の整数

// ブランド型による型安全性の向上
export type PlayerId = string & { readonly __brand: 'PlayerId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type GameId = string & { readonly __brand: 'GameId' };

export interface Position {
  readonly x: number;
  readonly y: number;
}

// 不変のTetromino定義（形状データは読み取り専用）
export interface Tetromino {
  readonly type: TetrominoType;
  readonly shape: ReadonlyArray<ReadonlyArray<number>>;
  readonly position: Position;
  readonly color: string;
}

// パーティクルは可変（アニメーション用）
export interface Particle {
  id: string; // プールでの再利用のため可変
  x: number;
  y: number;
  color: string; // プールでの再利用のため可変
  vx: number;
  vy: number;
  life: number;
}

// ラインエフェクト状態（パーティクル配列は可変）
export interface LineEffectState {
  readonly flashingLines: ReadonlyArray<number>;
  readonly shaking: boolean;
  particles: Particle[]; // アニメーション更新のため可変
}

// ゲーム状態（スコア等は変更可能、ボードは可変）
export interface GameState {
  board: (string | null)[][]; // ゲーム進行で変更される
  currentPiece: Readonly<Tetromino> | null;
  nextPiece: Readonly<Tetromino> | null;
  score: ScoreRange;
  level: LevelRange;
  lines: LineRange;
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

// 定数は constants/index.ts に移動済み
// このファイルは型定義のみを含む

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
}

// カスタムカラーパレット設定
export interface ColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly tertiary: string;
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
}

// テーマ詳細設定
export interface ThemeConfig {
  readonly name: string;
  readonly colors: ColorPalette;
  readonly effects: {
    readonly blur: number;
    readonly glow: number;
    readonly saturation: number;
    readonly brightness: number;
  };
  readonly accessibility: {
    readonly colorBlindnessType: ColorBlindnessType;
    readonly contrast: ContrastLevel;
    readonly animationIntensity: AnimationIntensity;
  };
}

// 拡張されたテーマ状態
export interface ThemeState {
  readonly current: ThemeVariant;
  readonly customColors?: Record<string, string>;
  readonly effectIntensity: number;
  readonly animations: boolean;
  readonly config: ThemeConfig;
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
  setCustomColors: (colors: Partial<ColorPalette>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;
  resetThemeToDefault: () => void;

  // Error handling actions
  addError: (error: GameError) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;

  // Session tracking actions
  startPlaySession: () => void;
  endPlaySession: () => void;
  incrementGameCount: () => void;
}
