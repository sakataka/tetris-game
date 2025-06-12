/**
 * Game Configuration System
 *
 * Unified configuration management with environment-based overrides
 */

import { ENV_CONFIG } from './environment';
import { PERFORMANCE_LIMITS, GAME_TIMING, DEFAULT_VALUES, PREVIEW_PIECES } from '../constants';

// Configuration interfaces
export interface GamePerformanceConfig {
  maxParticles: number;
  targetFps: number;
  particlePoolSize: number;
  enableOptimizations: boolean;
  debugPerformance: boolean;
}

export interface GameFeatureConfig {
  audioEnabled: boolean;
  particlesEnabled: boolean;
  analyticsEnabled: boolean;
  autoSaveEnabled: boolean;
  ghostPieceEnabled: boolean;
}

export interface GameUIConfig {
  showFPS: boolean;
  showDebugInfo: boolean;
  defaultVolume: number;
  effectIntensity: number;
  animations: boolean;
}

export interface GameplayConfig {
  defaultLevel: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  previewPieces: number;
}

export interface GameConfiguration {
  performance: GamePerformanceConfig;
  features: GameFeatureConfig;
  ui: GameUIConfig;
  gameplay: GameplayConfig;
  environment: string;
}

// Default configurations
const createDefaultPerformanceConfig = (): GamePerformanceConfig => ({
  maxParticles: PERFORMANCE_LIMITS.MAX_PARTICLES,
  targetFps: PERFORMANCE_LIMITS.TARGET_FPS,
  particlePoolSize: PERFORMANCE_LIMITS.PARTICLE_POOL_SIZE,
  enableOptimizations: true,
  debugPerformance: false,
});

const createDefaultFeatureConfig = (): GameFeatureConfig => ({
  audioEnabled: true,
  particlesEnabled: true,
  analyticsEnabled: false,
  autoSaveEnabled: true,
  ghostPieceEnabled: DEFAULT_VALUES.GAME.SHOW_GHOST,
});

const createDefaultUIConfig = (): GameUIConfig => ({
  showFPS: false,
  showDebugInfo: false,
  defaultVolume: DEFAULT_VALUES.VOLUME,
  effectIntensity: DEFAULT_VALUES.EFFECT_INTENSITY.DEFAULT,
  animations: true,
});

const createDefaultGameplayConfig = (): GameplayConfig => ({
  defaultLevel: DEFAULT_VALUES.GAME.LEVEL,
  initialSpeed: GAME_TIMING.INITIAL_DROP_TIME,
  speedIncrement: GAME_TIMING.SPEED_INCREMENT_PER_LEVEL,
  maxSpeed: GAME_TIMING.MIN_DROP_TIME,
  previewPieces: PREVIEW_PIECES,
});

// Environment-specific configuration creators
function createDevelopmentConfig(): GameConfiguration {
  return {
    performance: {
      ...createDefaultPerformanceConfig(),
      maxParticles: ENV_CONFIG.PERFORMANCE.MAX_PARTICLES,
      targetFps: ENV_CONFIG.PERFORMANCE.TARGET_FPS,
      particlePoolSize: ENV_CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE,
      debugPerformance: ENV_CONFIG.PERFORMANCE.DEBUG_PERFORMANCE,
    },
    features: {
      ...createDefaultFeatureConfig(),
      audioEnabled: ENV_CONFIG.FEATURES.AUDIO_ENABLED,
      particlesEnabled: ENV_CONFIG.FEATURES.PARTICLES_ENABLED,
      analyticsEnabled: ENV_CONFIG.FEATURES.ANALYTICS_ENABLED,
      autoSaveEnabled: ENV_CONFIG.FEATURES.AUTO_SAVE_ENABLED,
      ghostPieceEnabled: ENV_CONFIG.FEATURES.GHOST_PIECE_ENABLED,
    },
    ui: {
      ...createDefaultUIConfig(),
      showFPS: ENV_CONFIG.DEBUG.SHOW_FPS,
      showDebugInfo: ENV_CONFIG.DEBUG.SHOW_DEBUG_INFO,
      defaultVolume: ENV_CONFIG.AUDIO.DEFAULT_VOLUME,
    },
    gameplay: createDefaultGameplayConfig(),
    environment: 'development',
  };
}

function createProductionConfig(): GameConfiguration {
  return {
    performance: {
      ...createDefaultPerformanceConfig(),
      maxParticles: Math.min(ENV_CONFIG.PERFORMANCE.MAX_PARTICLES, 150), // Limit for production
      targetFps: ENV_CONFIG.PERFORMANCE.TARGET_FPS,
      particlePoolSize: Math.min(ENV_CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE, 120),
      enableOptimizations: true,
      debugPerformance: false, // Always disabled in production
    },
    features: {
      ...createDefaultFeatureConfig(),
      audioEnabled: ENV_CONFIG.FEATURES.AUDIO_ENABLED,
      particlesEnabled: ENV_CONFIG.FEATURES.PARTICLES_ENABLED,
      analyticsEnabled: ENV_CONFIG.FEATURES.ANALYTICS_ENABLED,
      autoSaveEnabled: ENV_CONFIG.FEATURES.AUTO_SAVE_ENABLED,
      ghostPieceEnabled: ENV_CONFIG.FEATURES.GHOST_PIECE_ENABLED,
    },
    ui: {
      ...createDefaultUIConfig(),
      showFPS: false, // Always disabled in production
      showDebugInfo: false, // Always disabled in production
      defaultVolume: ENV_CONFIG.AUDIO.DEFAULT_VOLUME,
    },
    gameplay: createDefaultGameplayConfig(),
    environment: 'production',
  };
}

function createTestConfig(): GameConfiguration {
  return {
    performance: {
      ...createDefaultPerformanceConfig(),
      maxParticles: 50, // Minimal for testing
      targetFps: 30,
      particlePoolSize: 30,
      enableOptimizations: false, // Disable for predictable testing
      debugPerformance: false,
    },
    features: {
      ...createDefaultFeatureConfig(),
      audioEnabled: false, // Disable audio in tests
      particlesEnabled: false, // Disable particles in tests
      analyticsEnabled: false,
      autoSaveEnabled: false, // Disable auto-save in tests
    },
    ui: {
      ...createDefaultUIConfig(),
      showFPS: false,
      showDebugInfo: false,
      defaultVolume: 0, // Muted for tests
    },
    gameplay: createDefaultGameplayConfig(),
    environment: 'test',
  };
}

// Main configuration factory
export function createGameConfig(environment?: string): GameConfiguration {
  const env = environment || ENV_CONFIG.NODE_ENV;

  switch (env) {
    case 'production':
      return createProductionConfig();
    case 'test':
      return createTestConfig();
    case 'development':
    default:
      return createDevelopmentConfig();
  }
}

// Configuration validation
export function validateGameConfig(config: GameConfiguration): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate performance config
  if (config.performance.maxParticles < 10 || config.performance.maxParticles > 500) {
    errors.push('Performance: maxParticles must be between 10 and 500');
  }

  if (config.performance.targetFps < 15 || config.performance.targetFps > 120) {
    errors.push('Performance: targetFps must be between 15 and 120');
  }

  if (config.performance.particlePoolSize < 10 || config.performance.particlePoolSize > 300) {
    errors.push('Performance: particlePoolSize must be between 10 and 300');
  }

  // Validate UI config
  if (config.ui.defaultVolume < 0 || config.ui.defaultVolume > 1) {
    errors.push('UI: defaultVolume must be between 0 and 1');
  }

  if (config.ui.effectIntensity < 0 || config.ui.effectIntensity > 2) {
    errors.push('UI: effectIntensity must be between 0 and 2');
  }

  // Validate gameplay config
  if (config.gameplay.defaultLevel < 1 || config.gameplay.defaultLevel > 20) {
    errors.push('Gameplay: defaultLevel must be between 1 and 20');
  }

  if (config.gameplay.previewPieces < 1 || config.gameplay.previewPieces > 6) {
    errors.push('Gameplay: previewPieces must be between 1 and 6');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Configuration merger for runtime updates
export function mergeGameConfig(
  baseConfig: GameConfiguration,
  updates: Partial<GameConfiguration>
): GameConfiguration {
  return {
    performance: { ...baseConfig.performance, ...updates.performance },
    features: { ...baseConfig.features, ...updates.features },
    ui: { ...baseConfig.ui, ...updates.ui },
    gameplay: { ...baseConfig.gameplay, ...updates.gameplay },
    environment: updates.environment || baseConfig.environment,
  };
}

// Export singleton instance
export const GAME_CONFIG = createGameConfig();

// Configuration info for debugging
export function getGameConfigInfo(): Record<string, unknown> {
  const config = GAME_CONFIG;
  const validation = validateGameConfig(config);

  return {
    environment: config.environment,
    performance: config.performance,
    features: config.features,
    ui: config.ui,
    gameplay: config.gameplay,
    validation,
    environmentVariables: {
      NODE_ENV: ENV_CONFIG.NODE_ENV,
      features: ENV_CONFIG.FEATURES,
      performance: ENV_CONFIG.PERFORMANCE,
    },
  };
}
