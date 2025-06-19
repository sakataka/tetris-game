/**
 * Constants Validation System
 *
 * Provides comprehensive TypeScript and runtime validation for all
 * configuration systems with detailed error reporting and type safety.
 */

import type { AudioConfiguration } from './audioConfig';
import type { GameRulesConfig } from './gameConfig';
import type { UIConfiguration } from './uiConfig';

// Validation result types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  category: 'game' | 'ui' | 'audio' | 'general';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Type-safe validation schemas
export interface ValidationSchema<T> {
  required?: (keyof T)[];
  rules: ValidationRule<T>[];
}

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown, config: Partial<T>) => ValidationError[];
  dependencies?: (keyof T)[];
}

// Common validation functions
export const validators = {
  // Numeric validations
  isPositive: (
    value: unknown,
    fieldName: string,
    category: 'game' | 'ui' | 'audio' | 'general' = 'general'
  ): ValidationError[] => {
    if (typeof value !== 'number' || value <= 0) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be a positive number`,
          severity: 'error' as const,
          category,
        },
      ];
    }
    return [];
  },

  isNonNegative: (
    value: unknown,
    fieldName: string,
    category: 'game' | 'ui' | 'audio' | 'general' = 'general'
  ): ValidationError[] => {
    if (typeof value !== 'number' || value < 0) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be non-negative`,
          severity: 'error' as const,
          category,
        },
      ];
    }
    return [];
  },

  isInRange: (
    value: unknown,
    min: number,
    max: number,
    fieldName: string,
    category: 'game' | 'ui' | 'audio' | 'general' = 'general'
  ): ValidationError[] => {
    if (typeof value !== 'number' || value < min || value > max) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be between ${min} and ${max}`,
          severity: 'error' as const,
          category,
        },
      ];
    }
    return [];
  },

  // String validations
  isNonEmptyString: (value: unknown, fieldName: string): ValidationError[] => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be a non-empty string`,
          severity: 'error' as const,
          category: 'general' as const,
        },
      ];
    }
    return [];
  },

  // Boolean validations
  isBoolean: (value: unknown, fieldName: string): ValidationError[] => {
    if (typeof value !== 'boolean') {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be a boolean`,
          severity: 'error' as const,
          category: 'general' as const,
        },
      ];
    }
    return [];
  },

  // Array validations
  isNonEmptyArray: (value: unknown, fieldName: string): ValidationError[] => {
    if (!Array.isArray(value) || value.length === 0) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be a non-empty array`,
          severity: 'error' as const,
          category: 'general' as const,
        },
      ];
    }
    return [];
  },

  // Object validations
  isObject: (value: unknown, fieldName: string): ValidationError[] => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return [
        {
          field: fieldName,
          message: `${fieldName} must be an object`,
          severity: 'error' as const,
          category: 'general' as const,
        },
      ];
    }
    return [];
  },
} as const;

// Game configuration validation schema
export const gameConfigSchema: ValidationSchema<GameRulesConfig> = {
  required: ['scoring', 'levelProgression', 'mechanics', 'physics', 'particles', 'validation'],
  rules: [
    {
      field: 'scoring',
      validate: (value, _config) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'scoring',
              message: 'Scoring must be an object',
              severity: 'error',
              category: 'game',
            },
          ];
        }

        const scoring = value as Record<string, unknown>;
        errors.push(...validators.isPositive(scoring['single'], 'scoring.single', 'game'));
        errors.push(...validators.isPositive(scoring['tetris'], 'scoring.tetris', 'game'));

        // Cross-field validation
        if (
          typeof scoring['tetris'] === 'number' &&
          typeof scoring['single'] === 'number' &&
          scoring['tetris'] <= scoring['single']
        ) {
          errors.push({
            field: 'scoring.tetris',
            message: 'Tetris score must be greater than single line score',
            severity: 'error',
            category: 'game',
          });
        }

        return errors;
      },
    },
    {
      field: 'levelProgression',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'levelProgression',
              message: 'Level progression must be an object',
              severity: 'error',
              category: 'game',
            },
          ];
        }

        const progression = value as Record<string, unknown>;
        errors.push(
          ...validators.isPositive(
            progression['linesPerLevel'],
            'levelProgression.linesPerLevel',
            'game'
          )
        );
        errors.push(
          ...validators.isInRange(
            progression['minLevel'],
            1,
            999,
            'levelProgression.minLevel',
            'game'
          )
        );
        errors.push(
          ...validators.isInRange(
            progression['initialDropTime'],
            100,
            5000,
            'levelProgression.initialDropTime',
            'game'
          )
        );

        return errors;
      },
    },
    {
      field: 'physics',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'physics',
              message: 'Physics must be an object',
              severity: 'error',
              category: 'game',
            },
          ];
        }

        const physics = value as Record<string, unknown>;
        errors.push(
          ...validators.isInRange(physics['cellSize'], 8, 64, 'physics.cellSize', 'game')
        );
        errors.push(...validators.isNonNegative(physics['moveDelay'], 'physics.moveDelay', 'game'));

        return errors;
      },
    },
  ],
};

// UI configuration validation schema
export const uiConfigSchema: ValidationSchema<UIConfiguration> = {
  required: ['layout', 'breakpoints', 'effects', 'typography', 'spacing'],
  rules: [
    {
      field: 'layout',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'layout',
              message: 'Layout must be an object',
              severity: 'error',
              category: 'ui',
            },
          ];
        }

        const layout = value as Record<string, unknown>;
        errors.push(...validators.isInRange(layout['cellSize'], 8, 64, 'layout.cellSize', 'ui'));
        errors.push(
          ...validators.isInRange(
            layout['virtualButtonSize'],
            32,
            128,
            'layout.virtualButtonSize',
            'ui'
          )
        );

        return errors;
      },
    },
    {
      field: 'breakpoints',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'breakpoints',
              message: 'Breakpoints must be an object',
              severity: 'error',
              category: 'ui',
            },
          ];
        }

        const breakpoints = value as Record<string, unknown>;
        if (
          typeof breakpoints['mobile'] === 'number' &&
          typeof breakpoints['tablet'] === 'number' &&
          breakpoints['mobile'] >= breakpoints['tablet']
        ) {
          errors.push({
            field: 'breakpoints.tablet',
            message: 'Tablet breakpoint must be larger than mobile breakpoint',
            severity: 'error',
            category: 'ui',
          });
        }

        return errors;
      },
    },
    {
      field: 'accessibility',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [];
        }

        const accessibility = value as Record<string, unknown>;
        if (
          typeof accessibility['minTouchTargetSize'] === 'number' &&
          accessibility['minTouchTargetSize'] < 44
        ) {
          errors.push({
            field: 'accessibility.minTouchTargetSize',
            message: 'Minimum touch target size should be at least 44px for WCAG compliance',
            severity: 'error',
            category: 'ui',
          });
        }

        return errors;
      },
    },
  ],
};

// Audio configuration validation schema
export const audioConfigSchema: ValidationSchema<AudioConfiguration> = {
  required: ['global', 'categoryVolumes', 'sounds', 'playback', 'performance'],
  rules: [
    {
      field: 'global',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'global',
              message: 'Global audio settings must be an object',
              severity: 'error',
              category: 'audio',
            },
          ];
        }

        const global = value as Record<string, unknown>;
        errors.push(
          ...validators.isInRange(global['masterVolume'], 0, 1, 'global.masterVolume', 'audio')
        );

        return errors;
      },
    },
    {
      field: 'sounds',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'sounds',
              message: 'Sound settings must be an object',
              severity: 'error',
              category: 'audio',
            },
          ];
        }

        const sounds = value as Record<string, unknown>;
        errors.push(
          ...validators.isNonNegative(sounds['maxRetries'], 'sounds.maxRetries', 'audio')
        );
        errors.push(
          ...validators.isPositive(
            sounds['maxConcurrentSounds'],
            'sounds.maxConcurrentSounds',
            'audio'
          )
        );

        return errors;
      },
    },
    {
      field: 'playback',
      validate: (value) => {
        const errors: ValidationError[] = [];
        if (typeof value !== 'object' || value === null) {
          return [
            {
              field: 'playback',
              message: 'Playback settings must be an object',
              severity: 'error',
              category: 'audio',
            },
          ];
        }

        const playback = value as Record<string, unknown>;
        if (typeof playback['sampleRate'] === 'number' && playback['sampleRate'] < 8000) {
          errors.push({
            field: 'playback.sampleRate',
            message: 'Sample rate must be at least 8000 Hz',
            severity: 'error',
            category: 'audio',
          });
        }

        if (typeof playback['channels'] === 'number' && ![1, 2].includes(playback['channels'])) {
          errors.push({
            field: 'playback.channels',
            message: 'Channels must be 1 (mono) or 2 (stereo)',
            severity: 'error',
            category: 'audio',
          });
        }

        return errors;
      },
    },
  ],
};

// Generic validation runner
export function validateConfig<T>(
  config: Partial<T>,
  schema: ValidationSchema<T>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in config) || config[field] === undefined) {
        errors.push({
          field: String(field),
          message: `Required field '${String(field)}' is missing`,
          severity: 'error',
          category: 'general',
        });
      }
    }
  }

  // Run validation rules
  for (const rule of schema.rules) {
    const fieldValue = config[rule.field];
    if (fieldValue !== undefined) {
      const ruleErrors = rule.validate(fieldValue, config);
      errors.push(...ruleErrors);
    }
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
    warnings,
  };
}

// Specialized validation functions
export function validateGameConfig(config: Partial<GameRulesConfig>): ValidationResult {
  return validateConfig(config, gameConfigSchema);
}

export function validateUIConfig(config: Partial<UIConfiguration>): ValidationResult {
  return validateConfig(config, uiConfigSchema);
}

export function validateAudioConfig(config: Partial<AudioConfiguration>): ValidationResult {
  return validateConfig(config, audioConfigSchema);
}

// Runtime type guards
export function isValidGameConfig(config: unknown): config is GameRulesConfig {
  if (typeof config !== 'object' || config === null) return false;
  const result = validateGameConfig(config as Partial<GameRulesConfig>);
  return result.valid;
}

export function isValidUIConfig(config: unknown): config is UIConfiguration {
  if (typeof config !== 'object' || config === null) return false;
  const result = validateUIConfig(config as Partial<UIConfiguration>);
  return result.valid;
}

export function isValidAudioConfig(config: unknown): config is AudioConfiguration {
  if (typeof config !== 'object' || config === null) return false;
  const result = validateAudioConfig(config as Partial<AudioConfiguration>);
  return result.valid;
}

// Comprehensive system validation
export function validateAllConfigs(configs: {
  game?: Partial<GameRulesConfig>;
  ui?: Partial<UIConfiguration>;
  audio?: Partial<AudioConfiguration>;
}): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  if (configs.game) {
    const gameResult = validateGameConfig(configs.game);
    allErrors.push(...gameResult.errors);
    allWarnings.push(...gameResult.warnings);
  }

  if (configs.ui) {
    const uiResult = validateUIConfig(configs.ui);
    allErrors.push(...uiResult.errors);
    allWarnings.push(...uiResult.warnings);
  }

  if (configs.audio) {
    const audioResult = validateAudioConfig(configs.audio);
    allErrors.push(...audioResult.errors);
    allWarnings.push(...audioResult.warnings);
  }

  return {
    valid: allErrors.filter((e) => e.severity === 'error').length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// Error formatting utilities
export function formatValidationError(error: ValidationError): string {
  const prefix = error.severity === 'error' ? '❌' : '⚠️';
  return `${prefix} [${error.category}] ${error.field}: ${error.message}`;
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✅ Configuration is valid');
  } else {
    lines.push('❌ Configuration has errors');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((error) => {
      lines.push(`  ${formatValidationError(error)}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((warning) => {
      lines.push(`  ⚠️ ${warning.field}: ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`     💡 ${warning.suggestion}`);
      }
    });
  }

  return lines.join('\n');
}
