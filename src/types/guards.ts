/**
 * Type Guards for Runtime Type Validation
 *
 * These type guards provide runtime validation for complex types
 * and ensure type safety at runtime boundaries.
 */

import {
  GameState,
  Tetromino,
  TetrominoType,
  Board,
  Position,
  GameSettings,
  HighScore,
  ThemeConfig,
  ColorPalette,
  SoundKey,
  VolumeLevel,
  KeyBinding,
  DifficultyLevel,
  ThemeVariant,
  AnimationIntensity,
} from './tetris';

// Tetromino type guards
export function isTetrominoType(value: unknown): value is TetrominoType {
  return typeof value === 'string' && ['I', 'O', 'T', 'S', 'Z', 'J', 'L'].includes(value);
}

export function isPosition(value: unknown): value is Position {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof (value as Position).x === 'number' &&
    typeof (value as Position).y === 'number'
  );
}

export function isTetromino(value: unknown): value is Tetromino {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('type' in value) ||
    !('position' in value) ||
    !('rotation' in value) ||
    !('shape' in value) ||
    !('color' in value)
  ) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    isTetrominoType(obj.type) &&
    isPosition(obj.position) &&
    typeof obj.rotation === 'number' &&
    Array.isArray(obj.shape) &&
    typeof obj.color === 'string'
  );
}

// Board validation
export function isValidBoard(value: unknown): value is Board {
  if (!Array.isArray(value)) return false;

  return value.every(
    (row) => Array.isArray(row) && row.every((cell) => cell === null || isTetrominoType(cell))
  );
}

// Game state validation
export function isValidGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;

  const state = value as GameState;
  return (
    isValidBoard(state.board) &&
    (state.currentPiece === null || isTetromino(state.currentPiece)) &&
    (state.nextPiece === null || isTetromino(state.nextPiece)) &&
    typeof state.score === 'number' &&
    typeof state.level === 'number' &&
    typeof state.lines === 'number' &&
    typeof state.gameOver === 'boolean' &&
    typeof state.isPaused === 'boolean'
  );
}

// Settings validation
export function isSoundKey(value: unknown): value is SoundKey {
  return (
    typeof value === 'string' &&
    ['lineClear', 'pieceLand', 'pieceRotate', 'gameOver', 'tetris', 'hardDrop'].includes(value)
  );
}

export function isVolumeLevel(value: unknown): value is VolumeLevel {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

export function isDifficulty(value: unknown): value is DifficultyLevel {
  return typeof value === 'string' && ['easy', 'normal', 'hard'].includes(value);
}

export function isKeyBinding(value: unknown): value is KeyBinding {
  if (typeof value !== 'object' || value === null) return false;

  const binding = value as KeyBinding;
  return (
    typeof binding.left === 'string' &&
    typeof binding.right === 'string' &&
    typeof binding.down === 'string' &&
    typeof binding.rotate === 'string' &&
    typeof binding.hardDrop === 'string' &&
    typeof binding.pause === 'string'
  );
}

export function isValidGameSettings(value: unknown): value is GameSettings {
  if (typeof value !== 'object' || value === null) return false;

  const settings = value as GameSettings;
  return (
    typeof settings.volume === 'number' &&
    typeof settings.isMuted === 'boolean' &&
    typeof settings.theme === 'string' &&
    typeof settings.keyBindings === 'object' &&
    isDifficulty(settings.difficulty) &&
    typeof settings.gameMode === 'string' &&
    typeof settings.virtualControlsEnabled === 'boolean'
  );
}

// Theme validation
export function isThemeVariant(value: unknown): value is ThemeVariant {
  return (
    typeof value === 'string' &&
    ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'].includes(value)
  );
}

export function isAnimationIntensity(value: unknown): value is AnimationIntensity {
  return typeof value === 'string' && ['none', 'reduced', 'normal', 'enhanced'].includes(value);
}

export function isColorPalette(value: unknown): value is ColorPalette {
  if (typeof value !== 'object' || value === null) return false;

  const palette = value as ColorPalette;
  return (
    typeof palette.primary === 'string' &&
    typeof palette.secondary === 'string' &&
    typeof palette.tertiary === 'string' &&
    typeof palette.background === 'string' &&
    typeof palette.foreground === 'string' &&
    typeof palette.accent === 'string'
  );
}

export function isThemeConfig(value: unknown): value is ThemeConfig {
  if (typeof value !== 'object' || value === null) return false;

  const theme = value as ThemeConfig;
  return (
    typeof theme.name === 'string' &&
    isColorPalette(theme.colors) &&
    typeof theme.effects === 'object' &&
    typeof theme.accessibility === 'object'
  );
}

// High score validation
export function isValidHighScore(value: unknown): value is HighScore {
  if (typeof value !== 'object' || value === null) return false;

  const score = value as HighScore;
  return (
    typeof score.id === 'string' &&
    typeof score.score === 'number' &&
    typeof score.level === 'number' &&
    typeof score.lines === 'number' &&
    typeof score.date === 'string' &&
    (score.playerName === undefined || typeof score.playerName === 'string')
  );
}

// Array type guards
export function isHighScoreArray(value: unknown): value is HighScore[] {
  return Array.isArray(value) && value.every(isValidHighScore);
}

// Utility function to safely parse JSON with type validation
export function safeParseJSON<T>(
  json: string,
  validator: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
