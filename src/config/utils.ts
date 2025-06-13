/**
 * Configuration Utilities
 *
 * Helper functions for configuration management and validation
 */

import { logger } from '../utils/logging/logger';
import { ENV_CONFIG } from './environment';
import type { GameConfiguration } from './gameConfig';

// Configuration comparison utilities
export function compareConfigurations(
  config1: GameConfiguration,
  config2: GameConfiguration
): { identical: boolean; differences: string[] } {
  const differences: string[] = [];

  // Compare performance settings
  Object.keys(config1.performance).forEach((key) => {
    const k = key as keyof GameConfiguration['performance'];
    if (config1.performance[k] !== config2.performance[k]) {
      differences.push(`performance.${key}: ${config1.performance[k]} → ${config2.performance[k]}`);
    }
  });

  // Compare feature flags
  Object.keys(config1.features).forEach((key) => {
    const k = key as keyof GameConfiguration['features'];
    if (config1.features[k] !== config2.features[k]) {
      differences.push(`features.${key}: ${config1.features[k]} → ${config2.features[k]}`);
    }
  });

  // Compare UI settings
  Object.keys(config1.ui).forEach((key) => {
    const k = key as keyof GameConfiguration['ui'];
    if (config1.ui[k] !== config2.ui[k]) {
      differences.push(`ui.${key}: ${config1.ui[k]} → ${config2.ui[k]}`);
    }
  });

  // Compare gameplay settings
  Object.keys(config1.gameplay).forEach((key) => {
    const k = key as keyof GameConfiguration['gameplay'];
    if (config1.gameplay[k] !== config2.gameplay[k]) {
      differences.push(`gameplay.${key}: ${config1.gameplay[k]} → ${config2.gameplay[k]}`);
    }
  });

  return {
    identical: differences.length === 0,
    differences,
  };
}

// Configuration backup and restore
export interface ConfigurationBackup {
  config: GameConfiguration;
  timestamp: Date;
  environment: string;
  version: string;
}

export function createConfigurationBackup(
  config: GameConfiguration,
  version = '1.0.0'
): ConfigurationBackup {
  return {
    config: JSON.parse(JSON.stringify(config)), // Deep clone
    timestamp: new Date(),
    environment: ENV_CONFIG.NODE_ENV,
    version,
  };
}

export function restoreConfigurationFromBackup(backup: ConfigurationBackup): GameConfiguration {
  logger.info('Restoring configuration from backup', {
    component: 'ConfigUtils',
    action: 'restoreConfigurationFromBackup',
    metadata: {
      backupTimestamp: backup.timestamp,
      backupEnvironment: backup.environment,
      backupVersion: backup.version,
    },
  });

  return backup.config;
}

// Configuration export/import utilities
export function exportConfiguration(config: GameConfiguration): string {
  const exportData = {
    config,
    exportedAt: new Date().toISOString(),
    environment: ENV_CONFIG.NODE_ENV,
    version: '1.0.0',
  };

  return JSON.stringify(exportData, null, 2);
}

export function importConfiguration(data: string): GameConfiguration | null {
  try {
    const parsed = JSON.parse(data);

    if (!parsed.config) {
      logger.error('Invalid configuration export format', {
        component: 'ConfigUtils',
        action: 'importConfiguration',
      });
      return null;
    }

    logger.info('Configuration imported successfully', {
      component: 'ConfigUtils',
      action: 'importConfiguration',
      metadata: {
        importedFrom: parsed.environment,
        importedAt: parsed.exportedAt,
        version: parsed.version,
      },
    });

    return parsed.config;
  } catch (error) {
    logger.error('Failed to import configuration', {
      component: 'ConfigUtils',
      action: 'importConfiguration',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return null;
  }
}

// Performance optimization utilities - helper functions
function applyMobileOptimizations(config: GameConfiguration): void {
  config.performance.targetFps = Math.min(config.performance.targetFps, 45);
  config.performance.maxParticles = Math.min(config.performance.maxParticles, 100);
}

function applyLowEndOptimizations(config: GameConfiguration): void {
  config.performance.maxParticles = Math.min(config.performance.maxParticles, 50);
  config.features.particlesEnabled = false;
}

function logOptimizations(
  config: GameConfiguration,
  deviceInfo: {
    isMobile?: boolean;
    isLowEnd?: boolean;
  }
): void {
  logger.info('Configuration optimized for device', {
    component: 'ConfigUtils',
    action: 'optimizeConfigurationForDevice',
    metadata: {
      isMobile: deviceInfo.isMobile,
      isLowEnd: deviceInfo.isLowEnd,
      maxParticles: config.performance.maxParticles,
      targetFps: config.performance.targetFps,
      particlesEnabled: config.features.particlesEnabled,
    },
  });
}

export function optimizeConfigurationForDevice(
  config: GameConfiguration,
  deviceInfo?: {
    isMobile?: boolean;
    isLowEnd?: boolean;
    memoryLimit?: number;
    screenSize?: { width: number; height: number };
  }
): GameConfiguration {
  const optimized = JSON.parse(JSON.stringify(config)) as GameConfiguration;

  if (deviceInfo?.isLowEnd || deviceInfo?.isMobile) {
    if (deviceInfo.isMobile) {
      applyMobileOptimizations(optimized);
    }

    if (deviceInfo.isLowEnd) {
      applyLowEndOptimizations(optimized);
    }

    logOptimizations(optimized, deviceInfo);
  }

  return optimized;
}

// Configuration validation helpers - split for reduced complexity
function validatePerformanceSection(data: Partial<GameConfiguration['performance']>): string[] {
  const errors: string[] = [];
  if (data.maxParticles !== undefined && (data.maxParticles < 10 || data.maxParticles > 500)) {
    errors.push('maxParticles must be between 10 and 500');
  }
  if (data.targetFps !== undefined && (data.targetFps < 15 || data.targetFps > 120)) {
    errors.push('targetFps must be between 15 and 120');
  }
  return errors;
}

function validateUISection(data: Partial<GameConfiguration['ui']>): string[] {
  const errors: string[] = [];
  if (data.defaultVolume !== undefined && (data.defaultVolume < 0 || data.defaultVolume > 1)) {
    errors.push('defaultVolume must be between 0 and 1');
  }
  if (
    data.effectIntensity !== undefined &&
    (data.effectIntensity < 0 || data.effectIntensity > 2)
  ) {
    errors.push('effectIntensity must be between 0 and 2');
  }
  return errors;
}

function validateGameplaySection(data: Partial<GameConfiguration['gameplay']>): string[] {
  const errors: string[] = [];
  if (data.defaultLevel !== undefined && (data.defaultLevel < 1 || data.defaultLevel > 20)) {
    errors.push('defaultLevel must be between 1 and 20');
  }
  if (data.previewPieces !== undefined && (data.previewPieces < 1 || data.previewPieces > 6)) {
    errors.push('previewPieces must be between 1 and 6');
  }
  return errors;
}

export function validateConfigurationSection<T extends keyof GameConfiguration>(
  section: T,
  data: Partial<GameConfiguration[T]>
): { isValid: boolean; errors: string[] } {
  let errors: string[] = [];

  switch (section) {
    case 'performance':
      errors = validatePerformanceSection(data as Partial<GameConfiguration['performance']>);
      break;
    case 'ui':
      errors = validateUISection(data as Partial<GameConfiguration['ui']>);
      break;
    case 'gameplay':
      errors = validateGameplaySection(data as Partial<GameConfiguration['gameplay']>);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Debug utilities
export function getConfigurationDiff(
  before: GameConfiguration,
  after: GameConfiguration
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};

  // Helper function to recursively find differences
  function findDiffs(obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = '') {
    Object.keys(obj1).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
        findDiffs(val1 as Record<string, unknown>, val2 as Record<string, unknown>, currentPath);
      } else if (val1 !== val2) {
        diff[currentPath] = { before: val1, after: val2 };
      }
    });
  }

  findDiffs(
    before as unknown as Record<string, unknown>,
    after as unknown as Record<string, unknown>
  );
  return diff;
}

export function logConfigurationChanges(
  before: GameConfiguration,
  after: GameConfiguration,
  context?: string
): void {
  const diff = getConfigurationDiff(before, after);
  const changeCount = Object.keys(diff).length;

  if (changeCount > 0) {
    logger.info(`Configuration changes detected${context ? ` (${context})` : ''}`, {
      component: 'ConfigUtils',
      action: 'logConfigurationChanges',
      metadata: {
        changeCount,
        changes: diff,
      },
    });
  }
}
