/**
 * Game Configuration System
 *
 * Provides runtime configurable game constants with validation
 * and preset management for different difficulty levels.
 */

import { DEFAULT_VALUES } from './defaults';

export interface GameRulesConfig {
  // Scoring system
  scoring: {
    single: number;
    double: number;
    triple: number;
    tetris: number;
    hardDropBonus: number;
    softDropBonus: number;
  };

  // Level progression
  levelProgression: {
    linesPerLevel: number;
    minLevel: number;
    maxLevel: number;
    initialDropTime: number;
    dropTimeMultiplier: number;
  };

  // Game mechanics
  mechanics: {
    previewPieces: number;
    maxHighScores: number;
    sessionTimeout: number;
  };

  // Physics and timing
  physics: {
    cellSize: number;
    cellCenterOffset: number;
    boardPositionOffset: number;
    moveDelay: number;
    repeatDelay: number;
    repeatInterval: number;
  };

  // Particle system
  particles: {
    poolSize: number;
    preloadCount: number;
    positionVarianceX: number;
    positionVarianceY: number;
    gravity: number;
    lifeDuration: number;
    scaleBase: number;
    scaleMultiplier: number;
    opacityMultiplier: number;
  };

  // Validation bounds
  validation: {
    minScore: number;
    maxScore: number;
  };
}

// Default game configuration
export const DEFAULT_GAME_CONFIG: GameRulesConfig = {
  scoring: {
    single: 100,
    double: 300,
    triple: 500,
    tetris: 800,
    hardDropBonus: 2,
    softDropBonus: 1,
  },

  levelProgression: {
    linesPerLevel: 10,
    minLevel: 1,
    maxLevel: 999,
    initialDropTime: 1000,
    dropTimeMultiplier: 0.9,
  },

  mechanics: {
    previewPieces: 3,
    maxHighScores: DEFAULT_VALUES.UI.HIGH_SCORE_MAX_DISPLAY,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },

  physics: {
    cellSize: 24,
    cellCenterOffset: 12,
    boardPositionOffset: 8,
    moveDelay: 100,
    repeatDelay: 150,
    repeatInterval: 50,
  },

  particles: {
    poolSize: 150,
    preloadCount: 50,
    positionVarianceX: 20,
    positionVarianceY: 10,
    gravity: 0.5,
    lifeDuration: 20,
    scaleBase: 0.5,
    scaleMultiplier: 1.5,
    opacityMultiplier: 0.8,
  },

  validation: {
    minScore: 0,
    maxScore: 9999999,
  },
} as const;

// Difficulty presets
export const DIFFICULTY_PRESETS = {
  easy: {
    ...DEFAULT_GAME_CONFIG,
    levelProgression: {
      ...DEFAULT_GAME_CONFIG.levelProgression,
      linesPerLevel: 15,
      initialDropTime: 1500,
      dropTimeMultiplier: 0.95,
    },
    physics: {
      ...DEFAULT_GAME_CONFIG.physics,
      moveDelay: 120,
      repeatDelay: 180,
    },
  } as GameRulesConfig,

  normal: DEFAULT_GAME_CONFIG,

  hard: {
    ...DEFAULT_GAME_CONFIG,
    levelProgression: {
      ...DEFAULT_GAME_CONFIG.levelProgression,
      linesPerLevel: 8,
      initialDropTime: 800,
      dropTimeMultiplier: 0.85,
    },
    physics: {
      ...DEFAULT_GAME_CONFIG.physics,
      moveDelay: 80,
      repeatDelay: 120,
    },
  } as GameRulesConfig,

  expert: {
    ...DEFAULT_GAME_CONFIG,
    levelProgression: {
      ...DEFAULT_GAME_CONFIG.levelProgression,
      linesPerLevel: 5,
      initialDropTime: 600,
      dropTimeMultiplier: 0.8,
    },
    physics: {
      ...DEFAULT_GAME_CONFIG.physics,
      moveDelay: 60,
      repeatDelay: 100,
    },
  } as GameRulesConfig,
} as const;

export type DifficultyPreset = keyof typeof DIFFICULTY_PRESETS;

// Configuration validation
export function validateGameConfig(config: Partial<GameRulesConfig>): string[] {
  const errors: string[] = [];

  if (config.scoring) {
    const { scoring } = config;
    if (scoring.single !== undefined && scoring.single < 0) {
      errors.push('Single line score must be non-negative');
    }
    if (
      scoring.tetris !== undefined &&
      scoring.single !== undefined &&
      scoring.tetris < scoring.single
    ) {
      errors.push('Tetris score must be greater than single line score');
    }
  }

  if (config.levelProgression) {
    const { levelProgression } = config;
    if (levelProgression.minLevel !== undefined && levelProgression.minLevel < 1) {
      errors.push('Minimum level must be at least 1');
    }
    if (
      levelProgression.maxLevel !== undefined &&
      levelProgression.minLevel !== undefined &&
      levelProgression.maxLevel < levelProgression.minLevel
    ) {
      errors.push('Maximum level must be greater than minimum level');
    }
    if (levelProgression.initialDropTime !== undefined && levelProgression.initialDropTime < 100) {
      errors.push('Initial drop time must be at least 100ms');
    }
  }

  if (config.physics) {
    const { physics } = config;
    if (physics.cellSize !== undefined && physics.cellSize < 8) {
      errors.push('Cell size must be at least 8 pixels');
    }
    if (physics.moveDelay !== undefined && physics.moveDelay < 0) {
      errors.push('Move delay must be non-negative');
    }
  }

  return errors;
}

// Configuration merger with validation
export function mergeGameConfig(
  base: GameRulesConfig,
  override: Partial<GameRulesConfig>
): GameRulesConfig {
  const errors = validateGameConfig(override);
  if (errors.length > 0) {
    throw new Error(`Invalid game configuration: ${errors.join(', ')}`);
  }

  return {
    scoring: { ...base.scoring, ...override.scoring },
    levelProgression: { ...base.levelProgression, ...override.levelProgression },
    mechanics: { ...base.mechanics, ...override.mechanics },
    physics: { ...base.physics, ...override.physics },
    particles: { ...base.particles, ...override.particles },
    validation: { ...base.validation, ...override.validation },
  };
}

// Runtime configuration management
class GameConfigManager {
  private currentConfig: GameRulesConfig = DEFAULT_GAME_CONFIG;
  private listeners: ((config: GameRulesConfig) => void)[] = [];

  getConfig(): GameRulesConfig {
    return this.currentConfig;
  }

  setConfig(config: Partial<GameRulesConfig>): void {
    this.currentConfig = mergeGameConfig(this.currentConfig, config);
    this.notifyListeners();
  }

  setPreset(preset: DifficultyPreset): void {
    this.currentConfig = DIFFICULTY_PRESETS[preset];
    this.notifyListeners();
  }

  resetToDefault(): void {
    this.currentConfig = DEFAULT_GAME_CONFIG;
    this.notifyListeners();
  }

  subscribe(listener: (config: GameRulesConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentConfig));
  }
}

export const gameConfigManager = new GameConfigManager();

// Export current configuration as constants for backward compatibility
export const GAME_CONFIG = gameConfigManager.getConfig();

// Re-export for backward compatibility with existing code
export const SCORES = {
  SINGLE: GAME_CONFIG.scoring.single,
  DOUBLE: GAME_CONFIG.scoring.double,
  TRIPLE: GAME_CONFIG.scoring.triple,
  TETRIS: GAME_CONFIG.scoring.tetris,
  HARD_DROP_BONUS: GAME_CONFIG.scoring.hardDropBonus,
  SOFT_DROP_BONUS: GAME_CONFIG.scoring.softDropBonus,
} as const;
export const LEVEL_UP_LINES = GAME_CONFIG.levelProgression.linesPerLevel;
export const MIN_LEVEL = GAME_CONFIG.levelProgression.minLevel;
export const MAX_LEVEL = GAME_CONFIG.levelProgression.maxLevel;
export const PREVIEW_PIECES = GAME_CONFIG.mechanics.previewPieces;
export const INITIAL_DROP_TIME = GAME_CONFIG.levelProgression.initialDropTime;
export const DROP_TIME_MULTIPLIER = GAME_CONFIG.levelProgression.dropTimeMultiplier;
export const MAX_HIGH_SCORES = GAME_CONFIG.mechanics.maxHighScores;
export const MIN_SCORE = GAME_CONFIG.validation.minScore;
export const MAX_SCORE = GAME_CONFIG.validation.maxScore;
export const SESSION_TIMEOUT = GAME_CONFIG.mechanics.sessionTimeout;
export const GAME_PHYSICS = GAME_CONFIG.physics;
export const PARTICLE_SYSTEM = GAME_CONFIG.particles;

export const VALIDATION = {
  MIN_SCORE: GAME_CONFIG.validation.minScore,
  MAX_SCORE: GAME_CONFIG.validation.maxScore,
  MIN_LEVEL: GAME_CONFIG.levelProgression.minLevel,
  MAX_LEVEL: GAME_CONFIG.levelProgression.maxLevel,
  SESSION_TIMEOUT: GAME_CONFIG.mechanics.sessionTimeout,
} as const;

export type ScoreType = 'single' | 'double' | 'triple' | 'tetris';
