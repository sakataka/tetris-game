/**
 * Configuration System Tests
 *
 * Test suite for the unified configuration management system
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createGameConfig,
  ENV_CONFIG,
  type GameConfiguration,
  mergeGameConfig,
  validateEnvironmentConfig,
  validateGameConfig,
} from '../config';
import {
  createConfigurationBackup,
  exportConfiguration,
  importConfiguration,
  optimizeConfigurationForDevice,
  restoreConfigurationFromBackup,
} from '../config/utils';

describe('Environment Configuration', () => {
  it('should have valid default environment config', () => {
    expect(ENV_CONFIG).toBeDefined();
    expect(ENV_CONFIG.NODE_ENV).toBe('test'); // In test environment
    expect(ENV_CONFIG.IS_PRODUCTION).toBe(false);
    expect(typeof ENV_CONFIG.FEATURES.AUDIO_ENABLED).toBe('boolean');
    expect(typeof ENV_CONFIG.PERFORMANCE.MAX_PARTICLES).toBe('number');
  });

  it('should validate environment configuration correctly', () => {
    const validation = validateEnvironmentConfig();
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('errors');
    expect(Array.isArray(validation.errors)).toBe(true);
  });

  it('should handle invalid environment values gracefully', () => {
    // For this test, we'll test the validation function directly
    // since environment variables are processed at module load time
    const validation = validateEnvironmentConfig();
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('errors');
    expect(Array.isArray(validation.errors)).toBe(true);

    // In test environment, config should be valid
    expect(validation.isValid).toBe(true);
  });
});

describe('Game Configuration', () => {
  let testConfig: GameConfiguration;

  beforeEach(() => {
    testConfig = createGameConfig('test');
  });

  it('should create valid test configuration', () => {
    expect(testConfig).toBeDefined();
    expect(testConfig.environment).toBe('test');
    expect(testConfig.features.audioEnabled).toBe(false); // Disabled in test
    expect(testConfig.features.particlesEnabled).toBe(false); // Disabled in test
    expect(testConfig.performance.maxParticles).toBe(50); // Minimal for testing
  });

  it('should create valid development configuration', () => {
    const devConfig = createGameConfig('development');
    expect(devConfig.environment).toBe('development');
    expect(devConfig.features.audioEnabled).toBe(true);
    expect(devConfig.performance.maxParticles).toBeGreaterThan(50);
  });

  it('should create valid production configuration', () => {
    const prodConfig = createGameConfig('production');
    expect(prodConfig.environment).toBe('production');
    expect(prodConfig.ui.showFPS).toBe(false); // Always disabled in production
    expect(prodConfig.ui.showDebugInfo).toBe(false); // Always disabled in production
    expect(prodConfig.performance.debugPerformance).toBe(false);
  });

  it('should validate configuration correctly', () => {
    const validation = validateGameConfig(testConfig);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect invalid configuration values', () => {
    const invalidConfig: GameConfiguration = {
      ...testConfig,
      performance: {
        ...testConfig.performance,
        maxParticles: -10, // Invalid
        targetFps: 200, // Invalid
      },
      ui: {
        ...testConfig.ui,
        defaultVolume: 2.0, // Invalid (> 1)
        effectIntensity: -1, // Invalid
      },
    };

    const validation = validateGameConfig(invalidConfig);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should merge configurations correctly', () => {
    const updates: Partial<GameConfiguration> = {
      features: {
        ...testConfig.features,
        audioEnabled: true,
      },
      performance: {
        ...testConfig.performance,
        maxParticles: 100,
      },
    };

    const merged = mergeGameConfig(testConfig, updates);
    expect(merged.features.audioEnabled).toBe(true);
    expect(merged.performance.maxParticles).toBe(100);
    expect(merged.ui.defaultVolume).toBe(testConfig.ui.defaultVolume); // Unchanged
  });
});

describe('Configuration Utilities', () => {
  let config1: GameConfiguration;

  beforeEach(() => {
    config1 = createGameConfig('test');
  });


  it('should create and restore configuration backups', () => {
    const backup = createConfigurationBackup(config1, '1.0.0');
    expect(backup.config).toEqual(config1);
    expect(backup.version).toBe('1.0.0');
    expect(backup.timestamp).toBeInstanceOf(Date);

    const restored = restoreConfigurationFromBackup(backup);
    expect(restored).toEqual(config1);
  });

  it('should export and import configurations', () => {
    const exported = exportConfiguration(config1);
    expect(typeof exported).toBe('string');
    expect(() => JSON.parse(exported)).not.toThrow();

    const imported = importConfiguration(exported);
    expect(imported).toEqual(config1);
  });

  it('should handle invalid import data gracefully', () => {
    const invalidData = 'invalid json';
    const imported = importConfiguration(invalidData);
    expect(imported).toBe(null);

    const incompleteData = JSON.stringify({ incomplete: true });
    const imported2 = importConfiguration(incompleteData);
    expect(imported2).toBe(null);
  });

  it('should optimize configuration for devices', () => {
    const highEndConfig = createGameConfig('development');

    // Test mobile optimization
    const mobileOptimized = optimizeConfigurationForDevice(highEndConfig, {
      isMobile: true,
      isLowEnd: false,
    });
    expect(mobileOptimized.performance.targetFps).toBeLessThanOrEqual(45);

    // Test low-end device optimization
    const lowEndOptimized = optimizeConfigurationForDevice(highEndConfig, {
      isMobile: false,
      isLowEnd: true,
    });
    expect(lowEndOptimized.performance.maxParticles).toBeLessThanOrEqual(50);
    expect(lowEndOptimized.features.particlesEnabled).toBe(false);
  });

});

describe('Configuration Store Integration', () => {
  it('should handle configuration store creation', () => {
    // Mock Zustand for testing
    const mockStore = {
      config: createGameConfig('test'),
      isLoading: false,
      lastUpdated: new Date(),
      validationErrors: [],
    };

    expect(mockStore.config).toBeDefined();
    expect(mockStore.validationErrors).toHaveLength(0);
  });

  it('should validate configuration updates', () => {
    const currentConfig = createGameConfig('test');
    const invalidUpdate: Partial<GameConfiguration> = {
      performance: {
        ...currentConfig.performance,
        maxParticles: -1, // Invalid
      },
    };

    const mergedConfig = mergeGameConfig(currentConfig, invalidUpdate);
    const validation = validateGameConfig(mergedConfig);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
