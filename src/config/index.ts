/**
 * Configuration System - Unified Exports
 *
 * Central export point for all configuration-related functionality
 */

// Configuration store
export {
  type ConfigStore,
  useConfigActions,
  useConfigMonitoring,
  useConfigStore,
  useFeatureFlags,
  useGameConfig,
  useGameplayConfig,
  usePerformanceConfig,
  useUIConfig,
} from './configStore';
// Environment configuration
export {
  type AudioConfig,
  type DebugConfig,
  ENV_CONFIG,
  type EnvironmentConfig,
  type FeatureFlags,
  type GameConfig,
  getConfigurationInfo,
  type PerformanceConfig,
  validateEnvironmentConfig,
} from './environment';
// Game configuration
export {
  createGameConfig,
  GAME_CONFIG,
  type GameConfiguration,
  type GameFeatureConfig,
  type GamePerformanceConfig,
  type GameplayConfig,
  type GameUIConfig,
  getGameConfigInfo,
  mergeGameConfig,
  validateGameConfig,
} from './gameConfig';

// Configuration utilities
export * from './utils';
