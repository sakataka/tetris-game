/**
 * Configuration System - Unified Exports
 *
 * Central export point for all configuration-related functionality
 */

// Environment configuration
export {
  ENV_CONFIG,
  validateEnvironmentConfig,
  getConfigurationInfo,
  type EnvironmentConfig,
  type FeatureFlags,
  type PerformanceConfig,
  type AudioConfig,
  type GameConfig,
  type DebugConfig,
} from './environment';

// Game configuration
export {
  createGameConfig,
  validateGameConfig,
  mergeGameConfig,
  GAME_CONFIG,
  getGameConfigInfo,
  type GameConfiguration,
  type GamePerformanceConfig,
  type GameFeatureConfig,
  type GameUIConfig,
  type GameplayConfig,
} from './gameConfig';

// Configuration store
export {
  useConfigStore,
  useGameConfig,
  useFeatureFlags,
  usePerformanceConfig,
  useUIConfig,
  useGameplayConfig,
  useConfigActions,
  useConfigMonitoring,
  type ConfigStore,
} from './configStore';

// Configuration utilities
export * from './utils';
