/**
 * Configuration Utilities
 *
 * Helper functions for configuration management and validation
 */

import { logger } from '@/utils/logging';
import { ENV_CONFIG } from './environment';
import type { GameConfiguration } from './gameConfig';


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

