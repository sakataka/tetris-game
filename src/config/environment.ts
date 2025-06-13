/**
 * Environment Configuration
 *
 * Centralized environment variable management with type safety and defaults
 */

// Environment validation helper
function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Core environment configuration
export const ENV_CONFIG = {
  // Runtime Environment
  NODE_ENV: getEnvString('NODE_ENV', 'development'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // Feature Flags
  FEATURES: {
    AUDIO_ENABLED: getEnvBoolean('NEXT_PUBLIC_AUDIO_ENABLED', true),
    PARTICLES_ENABLED: getEnvBoolean('NEXT_PUBLIC_PARTICLES_ENABLED', true),
    ANALYTICS_ENABLED: getEnvBoolean('NEXT_PUBLIC_ANALYTICS_ENABLED', false),
    AUTO_SAVE_ENABLED: getEnvBoolean('NEXT_PUBLIC_AUTO_SAVE_ENABLED', true),
    GHOST_PIECE_ENABLED: getEnvBoolean('NEXT_PUBLIC_GHOST_PIECE_ENABLED', true),
  },

  // Performance Settings
  PERFORMANCE: {
    MAX_PARTICLES: getEnvNumber('NEXT_PUBLIC_MAX_PARTICLES', 200),
    TARGET_FPS: getEnvNumber('NEXT_PUBLIC_TARGET_FPS', 60),
    PARTICLE_POOL_SIZE: getEnvNumber('NEXT_PUBLIC_PARTICLE_POOL_SIZE', 150),
    DEBUG_PERFORMANCE: getEnvBoolean('NEXT_PUBLIC_DEBUG_PERFORMANCE', false),
  },

  // Audio Settings
  AUDIO: {
    DEFAULT_VOLUME: getEnvNumber('NEXT_PUBLIC_DEFAULT_VOLUME', 50) / 100, // Convert to 0-1 range
    PRELOAD_ENABLED: getEnvBoolean('NEXT_PUBLIC_AUDIO_PRELOAD', true),
  },

  // Game Settings
  GAME: {
    DEFAULT_LEVEL: getEnvNumber('NEXT_PUBLIC_DEFAULT_LEVEL', 1),
  },

  // Development Tools
  DEBUG: {
    SHOW_FPS: getEnvBoolean('NEXT_PUBLIC_SHOW_FPS', false),
    SHOW_DEBUG_INFO: getEnvBoolean('NEXT_PUBLIC_SHOW_DEBUG_INFO', false),
    ENABLE_BUNDLE_ANALYZER: getEnvBoolean('ANALYZE', false),
  },
} as const;

// Type exports for better TypeScript integration
export type EnvironmentConfig = typeof ENV_CONFIG;
export type FeatureFlags = typeof ENV_CONFIG.FEATURES;
export type PerformanceConfig = typeof ENV_CONFIG.PERFORMANCE;
export type AudioConfig = typeof ENV_CONFIG.AUDIO;
export type GameConfig = typeof ENV_CONFIG.GAME;
export type DebugConfig = typeof ENV_CONFIG.DEBUG;

// Configuration validation
export function validateEnvironmentConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate performance settings
  if (ENV_CONFIG.PERFORMANCE.MAX_PARTICLES < 50 || ENV_CONFIG.PERFORMANCE.MAX_PARTICLES > 500) {
    errors.push('MAX_PARTICLES must be between 50 and 500');
  }

  if (ENV_CONFIG.PERFORMANCE.TARGET_FPS < 30 || ENV_CONFIG.PERFORMANCE.TARGET_FPS > 120) {
    errors.push('TARGET_FPS must be between 30 and 120');
  }

  if (
    ENV_CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE < 50 ||
    ENV_CONFIG.PERFORMANCE.PARTICLE_POOL_SIZE > 300
  ) {
    errors.push('PARTICLE_POOL_SIZE must be between 50 and 300');
  }

  // Validate audio settings
  if (ENV_CONFIG.AUDIO.DEFAULT_VOLUME < 0 || ENV_CONFIG.AUDIO.DEFAULT_VOLUME > 1) {
    errors.push('DEFAULT_VOLUME must be between 0 and 100');
  }

  // Validate game settings
  if (ENV_CONFIG.GAME.DEFAULT_LEVEL < 1 || ENV_CONFIG.GAME.DEFAULT_LEVEL > 20) {
    errors.push('DEFAULT_LEVEL must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Runtime configuration info for debugging
export function getConfigurationInfo(): Record<string, unknown> {
  return {
    environment: ENV_CONFIG.NODE_ENV,
    features: ENV_CONFIG.FEATURES,
    performance: ENV_CONFIG.PERFORMANCE,
    audio: ENV_CONFIG.AUDIO,
    game: ENV_CONFIG.GAME,
    debug: ENV_CONFIG.DEBUG,
    validation: validateEnvironmentConfig(),
  };
}
