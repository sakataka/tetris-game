/**
 * Configuration Store
 *
 * Runtime configuration management with Zustand integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storage';
import { logger } from '@/utils/logging/logger';
import {
  createGameConfig,
  type GameConfiguration,
  mergeGameConfig,
  validateGameConfig,
} from './gameConfig';

export interface ConfigStore {
  // State
  config: GameConfiguration;
  isLoading: boolean;
  lastUpdated: Date | null;
  validationErrors: string[];

  // Actions
  updateConfig: (updates: Partial<GameConfiguration>) => void;
  resetToDefaults: () => void;
  validateConfiguration: () => boolean;
  getConfigValue: <T extends keyof GameConfiguration>(
    section: T,
    key: keyof GameConfiguration[T]
  ) => GameConfiguration[T][keyof GameConfiguration[T]];

  // Feature flag helpers
  isFeatureEnabled: (feature: keyof GameConfiguration['features']) => boolean;
  toggleFeature: (feature: keyof GameConfiguration['features']) => void;

  // Performance helpers
  getPerformanceSetting: (setting: keyof GameConfiguration['performance']) => number | boolean;
  updatePerformanceSetting: (
    setting: keyof GameConfiguration['performance'],
    value: number | boolean
  ) => void;
}

// Create default configuration
const createInitialState = () => {
  const config = createGameConfig();
  const validation = validateGameConfig(config);

  if (!validation.isValid) {
    logger.warn('Initial configuration validation failed', {
      component: 'ConfigStore',
      metadata: { errors: validation.errors },
    });
  }

  return {
    config,
    isLoading: false,
    lastUpdated: new Date(),
    validationErrors: validation.errors,
  };
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialState(),

      // Actions
      updateConfig: (updates) => {
        const currentConfig = get().config;
        const newConfig = mergeGameConfig(currentConfig, updates);
        const validation = validateGameConfig(newConfig);

        if (!validation.isValid) {
          logger.error('Configuration update validation failed', {
            component: 'ConfigStore',
            action: 'updateConfig',
            metadata: {
              errors: validation.errors,
              updates,
            },
          });
        }

        set({
          config: newConfig,
          lastUpdated: new Date(),
          validationErrors: validation.errors,
        });

        logger.info('Configuration updated', {
          component: 'ConfigStore',
          action: 'updateConfig',
          metadata: {
            isValid: validation.isValid,
            updatedSections: Object.keys(updates),
          },
        });
      },

      resetToDefaults: () => {
        const defaultConfig = createGameConfig();
        set({
          config: defaultConfig,
          lastUpdated: new Date(),
          validationErrors: [],
        });

        logger.info('Configuration reset to defaults', {
          component: 'ConfigStore',
          action: 'resetToDefaults',
        });
      },

      validateConfiguration: () => {
        const config = get().config;
        const validation = validateGameConfig(config);

        set({
          validationErrors: validation.errors,
        });

        return validation.isValid;
      },

      getConfigValue: (section, key) => {
        const config = get().config;
        return config[section][key as keyof (typeof config)[typeof section]];
      },

      // Feature flag helpers
      isFeatureEnabled: (feature) => {
        return get().config.features[feature];
      },

      toggleFeature: (feature) => {
        const currentConfig = get().config;
        const currentValue = currentConfig.features[feature];

        get().updateConfig({
          features: {
            ...currentConfig.features,
            [feature]: !currentValue,
          },
        });

        logger.info(`Feature ${feature} ${!currentValue ? 'enabled' : 'disabled'}`, {
          component: 'ConfigStore',
          action: 'toggleFeature',
          metadata: { feature, newValue: !currentValue },
        });
      },

      // Performance helpers
      getPerformanceSetting: (setting) => {
        return get().config.performance[setting];
      },

      updatePerformanceSetting: (setting, value) => {
        const currentConfig = get().config;

        get().updateConfig({
          performance: {
            ...currentConfig.performance,
            [setting]: value,
          },
        });

        logger.info(`Performance setting ${String(setting)} updated`, {
          component: 'ConfigStore',
          action: 'updatePerformanceSetting',
          metadata: { setting, value },
        });
      },
    }),
    {
      name: STORAGE_KEYS.GAME_CONFIG,
      version: 1,
      partialize: (state) => ({
        config: {
          // Only persist user-configurable settings
          features: state.config.features,
          ui: {
            defaultVolume: state.config.ui.defaultVolume,
            effectIntensity: state.config.ui.effectIntensity,
            animations: state.config.ui.animations,
            // Don't persist debug flags
            showFPS: false,
            showDebugInfo: false,
          },
          performance: {
            // Persist user performance preferences
            maxParticles: state.config.performance.maxParticles,
            targetFps: state.config.performance.targetFps,
            enableOptimizations: state.config.performance.enableOptimizations,
            // Don't persist development settings
            particlePoolSize: state.config.performance.particlePoolSize,
            debugPerformance: false,
          },
          // Always use current environment for gameplay settings
          gameplay: state.config.gameplay,
          environment: state.config.environment,
        },
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Merge persisted config with current environment defaults
          const currentDefaults = createGameConfig();
          state.config = mergeGameConfig(currentDefaults, state.config);

          // Validate after rehydration
          const validation = validateGameConfig(state.config);
          state.validationErrors = validation.errors;

          if (!validation.isValid) {
            logger.warn('Rehydrated configuration validation failed', {
              component: 'ConfigStore',
              action: 'onRehydrateStorage',
              metadata: { errors: validation.errors },
            });
          }

          logger.info('Configuration rehydrated from storage', {
            component: 'ConfigStore',
            action: 'onRehydrateStorage',
            metadata: {
              isValid: validation.isValid,
              environment: state.config.environment,
            },
          });
        }
      },
    }
  )
);

// Selector hooks for performance
export const useGameConfig = () => useConfigStore((state) => state.config);
export const useFeatureFlags = () => useConfigStore((state) => state.config.features);
export const usePerformanceConfig = () => useConfigStore((state) => state.config.performance);
export const useUIConfig = () => useConfigStore((state) => state.config.ui);
export const useGameplayConfig = () => useConfigStore((state) => state.config.gameplay);

export const useConfigActions = () =>
  useConfigStore((state) => ({
    updateConfig: state.updateConfig,
    resetToDefaults: state.resetToDefaults,
    validateConfiguration: state.validateConfiguration,
    isFeatureEnabled: state.isFeatureEnabled,
    toggleFeature: state.toggleFeature,
    getPerformanceSetting: state.getPerformanceSetting,
    updatePerformanceSetting: state.updatePerformanceSetting,
  }));

// Configuration monitoring hook
export const useConfigMonitoring = () =>
  useConfigStore((state) => ({
    isLoading: state.isLoading,
    lastUpdated: state.lastUpdated,
    validationErrors: state.validationErrors,
    isValid: state.validationErrors.length === 0,
  }));
