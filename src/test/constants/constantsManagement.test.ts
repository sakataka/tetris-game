/**
 * Constants Management Tests
 *
 * Tests for the comprehensive constants management system including
 * game configuration, UI configuration, audio configuration, and validation.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUDIO_QUALITY_PRESETS,
  type AudioConfiguration,
  type AudioQuality,
  audioConfigManager,
  DEFAULT_AUDIO_CONFIG,
  SOUND_DEFINITIONS,
} from '@/constants/audioConfig';
import { DEFAULT_VALUES } from '@/constants/defaults';
import {
  DEFAULT_GAME_CONFIG,
  DIFFICULTY_PRESETS,
  type DifficultyPreset,
  type GameRulesConfig,
  gameConfigManager,
  mergeGameConfig,
} from '@/constants/gameConfig';
import {
  DEFAULT_UI_CONFIG,
  DEVICE_PRESETS,
  type DevicePreset,
  type UIConfiguration,
  uiConfigManager,
} from '@/constants/uiConfig';
import {
  formatValidationResult,
  isValidAudioConfig,
  isValidGameConfig,
  isValidUIConfig,
  type ValidationResult,
  validateAllConfigs,
  validateAudioConfig as validateAudioConfigV2,
  validateGameConfig as validateGameConfigV2,
  validateUIConfig as validateUIConfigV2,
} from '@/constants/validation';

describe('Game Configuration Management', () => {
  beforeEach(() => {
    gameConfigManager.resetToDefault();
  });

  describe('Default Configuration', () => {
    it('should have valid default configuration', () => {
      const config = gameConfigManager.getConfig();
      expect(config).toEqual(DEFAULT_GAME_CONFIG);
      expect(isValidGameConfig(config)).toBe(true);
    });

    it('should export backward compatibility constants correctly', () => {
      const config = gameConfigManager.getConfig();
      expect(config.scoring.single).toBe(100);
      expect(config.scoring.tetris).toBe(800);
      expect(config.levelProgression.linesPerLevel).toBe(10);
      expect(config.levelProgression.initialDropTime).toBe(1000);
    });
  });

  describe('Difficulty Presets', () => {
    it('should have all required difficulty presets', () => {
      const presets: DifficultyPreset[] = ['easy', 'normal', 'hard', 'expert'];
      presets.forEach((preset) => {
        expect(DIFFICULTY_PRESETS[preset]).toBeDefined();
        expect(isValidGameConfig(DIFFICULTY_PRESETS[preset])).toBe(true);
      });
    });

    it('should set difficulty presets correctly', () => {
      gameConfigManager.setPreset('easy');
      const config = gameConfigManager.getConfig();

      expect(config.levelProgression.linesPerLevel).toBe(15);
      expect(config.levelProgression.initialDropTime).toBe(1500);
      expect(config.physics.moveDelay).toBe(120);
    });

    it('should notify listeners when preset changes', () => {
      let notificationCount = 0;
      let lastConfig: GameRulesConfig | null = null;

      const unsubscribe = gameConfigManager.subscribe((config: GameRulesConfig) => {
        notificationCount++;
        lastConfig = config;
      });

      gameConfigManager.setPreset('hard');

      expect(notificationCount).toBe(1);
      expect(lastConfig).toBeDefined();
      expect((lastConfig as unknown as GameRulesConfig)?.levelProgression.linesPerLevel).toBe(8);

      unsubscribe();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configurations', () => {
      const result = validateGameConfigV2(DEFAULT_GAME_CONFIG);
      expect(result.errors).toEqual([]);
    });

    it('should catch invalid scoring configuration', () => {
      const invalidConfig = {
        scoring: {
          single: 100,
          tetris: 50, // Invalid: tetris should be > single
          double: 300,
          triple: 500,
          hardDropBonus: 2,
          softDropBonus: 1,
        },
      };

      const result = validateGameConfigV2(invalidConfig);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error) => error.field.includes('tetris'))).toBe(true);
    });

    it('should catch invalid level progression', () => {
      const invalidConfig = {
        levelProgression: {
          linesPerLevel: 10,
          minLevel: 5,
          maxLevel: 3, // Invalid: max < min
          initialDropTime: 50, // Invalid: too small
          dropTimeMultiplier: 0.9,
        },
      };

      const result = validateGameConfigV2(invalidConfig);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Merging', () => {
    it('should merge configurations correctly', () => {
      const override = {
        scoring: {
          single: 200,
          tetris: 1000,
        },
      };

      const merged = mergeGameConfig(DEFAULT_GAME_CONFIG, override as any);

      expect(merged.scoring.single).toBe(200);
      expect(merged.scoring.tetris).toBe(1000);
      expect(merged.scoring.double).toBe(DEFAULT_GAME_CONFIG.scoring.double);
    });

    it('should throw on invalid merge', () => {
      const invalidOverride = {
        scoring: {
          single: -100, // Invalid
        },
      };

      expect(() => {
        mergeGameConfig(DEFAULT_GAME_CONFIG, invalidOverride as any);
      }).toThrow();
    });
  });
});

describe('UI Configuration Management', () => {
  beforeEach(() => {
    uiConfigManager.resetToDefault();
  });

  describe('Default Configuration', () => {
    it('should have valid default configuration', () => {
      const config = uiConfigManager.getConfig();
      expect(config).toEqual(DEFAULT_UI_CONFIG);
      expect(isValidUIConfig(config)).toBe(true);
    });

    it('should compute UI values correctly', () => {
      const computed = uiConfigManager.getComputedValues();

      expect(computed.spacing.sm).toBe(8); // baseUnit * 1
      expect(computed.spacing.md).toBe(16); // baseUnit * 2
      expect(computed.typography.sizes.base).toBe(14);
      expect(computed.mediaQueries.mobile).toContain('767');
    });
  });

  describe('Device Presets', () => {
    it('should have all required device presets', () => {
      const presets: DevicePreset[] = ['mobile', 'tablet', 'desktop', 'accessibility'];
      presets.forEach((preset) => {
        expect(DEVICE_PRESETS[preset]).toBeDefined();
        expect(isValidUIConfig(DEVICE_PRESETS[preset])).toBe(true);
      });
    });

    it('should set mobile preset correctly', () => {
      uiConfigManager.setPreset('mobile');
      const config = uiConfigManager.getConfig();

      expect(config.layout.cellSize).toBe(20);
      expect(config.layout.virtualButtonSize).toBe(56);
      expect(config.typography.baseFontSize).toBe(16);
    });

    it('should set accessibility preset correctly', () => {
      uiConfigManager.setPreset('accessibility');
      const config = uiConfigManager.getConfig();

      expect(config.accessibility.highContrastMode).toBe(true);
      expect(config.accessibility.largeText).toBe(true);
      expect(config.accessibility.minTouchTargetSize).toBe(48);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate breakpoint ordering', () => {
      const invalidConfig = {
        breakpoints: {
          mobile: 1024,
          tablet: 768, // Invalid: tablet < mobile
          desktop: 1280,
        },
      };

      const result = validateUIConfigV2(invalidConfig);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about small touch targets', () => {
      const configWithSmallTargets = {
        accessibility: {
          minTouchTargetSize: 32, // Below WCAG recommendation
          focusRingWidth: 2,
          highContrastMode: false,
          reducedMotion: false,
          largeText: false,
        },
      };

      const result = validateUIConfigV2(configWithSmallTargets);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Audio Configuration Management', () => {
  beforeEach(() => {
    audioConfigManager.resetToDefault();
  });

  describe('Default Configuration', () => {
    it('should have valid default configuration', () => {
      const config = audioConfigManager.getConfig();
      expect(config).toEqual(DEFAULT_AUDIO_CONFIG);
      expect(isValidAudioConfig(config)).toBe(true);
    });

    it('should compute audio values correctly', () => {
      const computed = audioConfigManager.getComputedValues();

      expect(computed.effectiveVolumes.lineClear).toBeGreaterThan(0);
      expect(computed.soundPaths.lineClear).toBe('/sounds/line-clear.wav');
      expect(computed.preloadOrder).toContain('lineClear');
    });

    it('should use correct default values from constants', () => {
      const config = audioConfigManager.getConfig();

      expect(config.global.masterVolume).toBe(DEFAULT_VALUES.VOLUME);
      expect(config.sounds.maxRetries).toBe(DEFAULT_VALUES.AUDIO.MAX_RETRIES);
      expect(config.sounds.throttleMs).toBe(DEFAULT_VALUES.AUDIO.THROTTLE_MS);
    });
  });

  describe('Quality Presets', () => {
    it('should have all required quality presets', () => {
      const presets: AudioQuality[] = ['low', 'medium', 'high', 'ultra'];
      presets.forEach((preset) => {
        expect(AUDIO_QUALITY_PRESETS[preset]).toBeDefined();
        expect(isValidAudioConfig(AUDIO_QUALITY_PRESETS[preset])).toBe(true);
      });
    });

    it('should set quality presets correctly', () => {
      audioConfigManager.setQualityPreset('high');
      const config = audioConfigManager.getConfig();

      expect(config.playback.sampleRate).toBe(48000);
      expect(config.playback.bitDepth).toBe(24);
      expect(config.performance.poolSize).toBe(100);
    });

    it('should enable advanced features in ultra preset', () => {
      audioConfigManager.setQualityPreset('ultra');
      const config = audioConfigManager.getConfig();

      expect(config.global.enableSpatialAudio).toBe(true);
      expect(config.global.enableReverb).toBe(true);
      expect(config.sounds.maxConcurrentSounds).toBe(32);
    });
  });

  describe('Sound Definitions', () => {
    it('should have all required sound definitions', () => {
      const requiredSounds = [
        'lineClear',
        'pieceLand',
        'pieceRotate',
        'tetris',
        'gameOver',
        'hardDrop',
      ];

      requiredSounds.forEach((soundKey) => {
        expect(SOUND_DEFINITIONS[soundKey as keyof typeof SOUND_DEFINITIONS]).toBeDefined();
      });
    });

    it('should provide sound metadata correctly', () => {
      const lineClear = audioConfigManager.getSoundDefinition('lineClear');

      expect(lineClear.category).toBe('effect');
      expect(lineClear.preload).toBe(true);
      expect(lineClear.fileName).toBe('line-clear.wav');
      expect(lineClear.defaultVolume).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate volume ranges', () => {
      const invalidConfig = {
        global: {
          masterVolume: 1.5 as any, // Invalid: > 1
          muted: false,
          enableSpatialAudio: false,
          enableReverb: false,
          audioContext: 'webaudio' as const,
        },
      };

      const result = validateAudioConfigV2(invalidConfig);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate sample rate constraints', () => {
      const invalidConfig = {
        playback: {
          sampleRate: 4000, // Invalid: too low
          channels: 2 as const,
          bufferSize: 4096,
          bitDepth: 16 as const,
          crossfadeDuration: 300,
        },
      };

      const result = validateAudioConfigV2(invalidConfig);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Comprehensive Validation System', () => {
  it('should validate all configuration types together', () => {
    const configs = {
      game: DEFAULT_GAME_CONFIG,
      ui: DEFAULT_UI_CONFIG,
      audio: DEFAULT_AUDIO_CONFIG,
    };

    const result = validateAllConfigs(configs);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should collect errors from all configuration types', () => {
    const invalidConfigs = {
      game: {
        scoring: {
          single: -100, // Invalid
        },
      },
      ui: {
        layout: {
          cellSize: 4, // Invalid
        },
      },
      audio: {
        global: {
          masterVolume: 2, // Invalid
        },
      },
    };

    const result = validateAllConfigs(invalidConfigs as any);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    // Should have errors from all three categories
    const categories = result.errors.map((e) => e.category);
    expect(categories).toContain('game');
    expect(categories).toContain('ui');
    expect(categories).toContain('audio');
  });

  it('should format validation results properly', () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          field: 'test.field',
          message: 'Test error message',
          severity: 'error',
          category: 'game',
        },
      ],
      warnings: [
        {
          field: 'test.warning',
          message: 'Test warning message',
          suggestion: 'Try this instead',
        },
      ],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain('❌ Configuration has errors');
    expect(formatted).toContain('Test error message');
    expect(formatted).toContain('Test warning message');
    expect(formatted).toContain('Try this instead');
  });
});

describe('Integration with Existing Constants', () => {
  it('should maintain backward compatibility with DEFAULT_VALUES', () => {
    // Test that new configurations use values from DEFAULT_VALUES
    expect(DEFAULT_AUDIO_CONFIG.global.masterVolume).toBe(DEFAULT_VALUES.VOLUME);
    expect(DEFAULT_AUDIO_CONFIG.sounds.maxRetries).toBe(DEFAULT_VALUES.AUDIO.MAX_RETRIES);
    expect(DEFAULT_AUDIO_CONFIG.sounds.throttleMs).toBe(DEFAULT_VALUES.AUDIO.THROTTLE_MS);
    expect(DEFAULT_UI_CONFIG.theme.defaultVolume).toBe(DEFAULT_VALUES.VOLUME);
  });

  it('should export constants for backward compatibility', () => {
    // These should be accessible from the main constants export
    const config = gameConfigManager.getConfig();
    expect(config.scoring.single).toBeDefined();
    expect(config.levelProgression.linesPerLevel).toBeDefined();
    expect(config.mechanics.previewPieces).toBeDefined();
  });

  it('should maintain consistent typing', () => {
    // Type checks to ensure configurations are compatible
    const gameConfig: GameRulesConfig = gameConfigManager.getConfig();
    const uiConfig: UIConfiguration = uiConfigManager.getConfig();
    const audioConfig: AudioConfiguration = audioConfigManager.getConfig();

    expect(gameConfig).toBeDefined();
    expect(uiConfig).toBeDefined();
    expect(audioConfig).toBeDefined();
  });
});
