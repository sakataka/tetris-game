/**
 * Configuration Utilities
 *
 * Helper functions for configuration management and validation
 */

import { logger } from '../utils/logging/logger';
import { ENV_CONFIG } from './environment';
import type { GameConfiguration } from './gameConfig';

// Configuration comparison utilities
export type ComparisonResult = {
  identical: boolean;
  differences: string[];
};

/**
 * Generic deep comparison function that can handle any object structure.
 * This function recursively compares objects and reports differences as path-based strings.
 * 
 * Examples:
 * - compareObjectsDeep({ a: 1 }, { a: 2 }) → ["a: 1 → 2"]
 * - compareObjectsDeep({ user: { name: "John" } }, { user: { name: "Jane" } }) → ["user.name: John → Jane"]
 * 
 * @param obj1 First object to compare
 * @param obj2 Second object to compare
 * @param path Current path for difference reporting (used internally for recursion)
 * @returns Array of difference strings in format "path: oldValue → newValue"
 */
export function compareObjectsDeep<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T,
  path = ''
): string[] {
  const differences: string[] = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (val1 === undefined && val2 !== undefined) {
      differences.push(`${currentPath}: undefined → ${val2}`);
    } else if (val1 !== undefined && val2 === undefined) {
      differences.push(`${currentPath}: ${val1} → undefined`);
    } else if (
      typeof val1 === 'object' &&
      typeof val2 === 'object' &&
      val1 !== null &&
      val2 !== null
    ) {
      // Recursive comparison for nested objects
      const nestedDiffs = compareObjectsDeep(
        val1 as Record<string, unknown>,
        val2 as Record<string, unknown>,
        currentPath
      );
      differences.push(...nestedDiffs);
    } else if (val1 !== val2) {
      differences.push(`${currentPath}: ${val1} → ${val2}`);
    }
  }

  return differences;
}

/**
 * Generic comparison function for any object structure.
 * This is a convenient wrapper around compareObjectsDeep that returns a structured result.
 * 
 * Example:
 * ```typescript
 * const result = compareObjects({ a: 1 }, { a: 2 });
 * // result: { identical: false, differences: ["a: 1 → 2"] }
 * ```
 * 
 * @param obj1 First object to compare
 * @param obj2 Second object to compare
 * @returns Comparison result with identical flag and array of difference strings
 */
export function compareObjects<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): ComparisonResult {
  const differences = compareObjectsDeep(obj1, obj2);

  return {
    identical: differences.length === 0,
    differences,
  };
}

export function compareConfigurations(
  config1: GameConfiguration,
  config2: GameConfiguration
): ComparisonResult {
  // Use the generic comparison function
  return compareObjects(config1 as unknown as Record<string, unknown>, config2 as unknown as Record<string, unknown>);
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

  // Use the generic comparison function to get differences
  const differences = compareObjectsDeep(
    before as unknown as Record<string, unknown>,
    after as unknown as Record<string, unknown>
  );

  // Convert difference strings to diff object format
  for (const diffStr of differences) {
    const match = diffStr.match(/^(.+): (.+) → (.+)$/);
    if (match) {
      const [, path, beforeVal, afterVal] = match;
      if (path) {
        diff[path] = {
          before: beforeVal === 'undefined' ? undefined : beforeVal,
          after: afterVal === 'undefined' ? undefined : afterVal,
        };
      }
    }
  }

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
