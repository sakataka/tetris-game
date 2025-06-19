/**
 * Audio Configuration System
 *
 * Provides runtime configurable audio constants with sound management,
 * volume control, and preset configurations for different audio preferences.
 */

import type { SoundCategory, SoundKey, VolumeLevel } from '@/types/tetris';
import { DEFAULT_VALUES } from './defaults';

export interface SoundDefinition {
  key: SoundKey;
  category: SoundCategory;
  fileName: string;
  defaultVolume: VolumeLevel;
  loop: boolean;
  preload: boolean;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export interface AudioConfiguration {
  // Global audio settings
  global: {
    masterVolume: VolumeLevel;
    muted: boolean;
    enableSpatialAudio: boolean;
    enableReverb: boolean;
    audioContext: 'webaudio' | 'htmlaudio' | 'silent';
  };

  // Category-specific volumes
  categoryVolumes: Record<SoundCategory, VolumeLevel>;

  // Sound management
  sounds: {
    maxRetries: number;
    throttleMs: number;
    preloadProgressComplete: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    maxConcurrentSounds: number;
  };

  // Playback settings
  playback: {
    bufferSize: number;
    sampleRate: number;
    channels: 1 | 2;
    bitDepth: 16 | 24 | 32;
    crossfadeDuration: number;
  };

  // Performance settings
  performance: {
    poolSize: number;
    preloadBatchSize: number;
    garbageCollectInterval: number;
    maxMemoryUsage: number; // in MB
  };

  // Quality presets
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// Sound definitions with metadata
export const SOUND_DEFINITIONS: Record<SoundKey, SoundDefinition> = {
  lineClear: {
    key: 'lineClear',
    category: 'effect',
    fileName: 'line-clear.wav',
    defaultVolume: 0.7,
    loop: false,
    preload: true,
    priority: 'high',
    description: 'Sound when lines are cleared',
  },
  pieceLand: {
    key: 'pieceLand',
    category: 'effect',
    fileName: 'piece-land.wav',
    defaultVolume: 0.5,
    loop: false,
    preload: true,
    priority: 'medium',
    description: 'Sound when piece lands',
  },
  pieceRotate: {
    key: 'pieceRotate',
    category: 'effect',
    fileName: 'piece-rotate.wav',
    defaultVolume: 0.4,
    loop: false,
    preload: true,
    priority: 'low',
    description: 'Sound when piece rotates',
  },
  tetris: {
    key: 'tetris',
    category: 'effect',
    fileName: 'tetris.wav',
    defaultVolume: 0.8,
    loop: false,
    preload: true,
    priority: 'high',
    description: 'Sound when four lines are cleared at once',
  },
  gameOver: {
    key: 'gameOver',
    category: 'ui',
    fileName: 'game-over.wav',
    defaultVolume: 0.6,
    loop: false,
    preload: true,
    priority: 'high',
    description: 'Sound when game ends',
  },
  hardDrop: {
    key: 'hardDrop',
    category: 'effect',
    fileName: 'hard-drop.wav',
    defaultVolume: 0.6,
    loop: false,
    preload: true,
    priority: 'medium',
    description: 'Sound when piece is hard dropped',
  },
} as const;

// Default audio configuration
export const DEFAULT_AUDIO_CONFIG: AudioConfiguration = {
  global: {
    masterVolume: DEFAULT_VALUES.VOLUME as VolumeLevel,
    muted: DEFAULT_VALUES.MUTED,
    enableSpatialAudio: false,
    enableReverb: false,
    audioContext: 'webaudio',
  },

  categoryVolumes: {
    effect: 0.8,
    music: 0.6,
    ui: 0.7,
    ambient: 0.5,
  },

  sounds: {
    maxRetries: DEFAULT_VALUES.AUDIO.MAX_RETRIES,
    throttleMs: DEFAULT_VALUES.AUDIO.THROTTLE_MS,
    preloadProgressComplete: DEFAULT_VALUES.AUDIO.PRELOAD_PROGRESS_COMPLETE,
    fadeInDuration: 100,
    fadeOutDuration: 200,
    maxConcurrentSounds: 8,
  },

  playback: {
    bufferSize: 4096,
    sampleRate: 44100,
    channels: 2,
    bitDepth: 16,
    crossfadeDuration: 300,
  },

  performance: {
    poolSize: 50,
    preloadBatchSize: 5,
    garbageCollectInterval: 30000, // 30 seconds
    maxMemoryUsage: 32, // 32MB
  },

  quality: 'medium',
} as const;

// Quality presets for different performance levels
export const AUDIO_QUALITY_PRESETS = {
  low: {
    ...DEFAULT_AUDIO_CONFIG,
    playback: {
      ...DEFAULT_AUDIO_CONFIG.playback,
      bufferSize: 8192,
      sampleRate: 22050,
      channels: 1,
      bitDepth: 16,
    },
    performance: {
      ...DEFAULT_AUDIO_CONFIG.performance,
      poolSize: 20,
      preloadBatchSize: 3,
      maxMemoryUsage: 16,
    },
    sounds: {
      ...DEFAULT_AUDIO_CONFIG.sounds,
      maxConcurrentSounds: 4,
    },
  } as AudioConfiguration,

  medium: DEFAULT_AUDIO_CONFIG,

  high: {
    ...DEFAULT_AUDIO_CONFIG,
    playback: {
      ...DEFAULT_AUDIO_CONFIG.playback,
      bufferSize: 2048,
      sampleRate: 48000,
      channels: 2,
      bitDepth: 24,
    },
    performance: {
      ...DEFAULT_AUDIO_CONFIG.performance,
      poolSize: 100,
      preloadBatchSize: 10,
      maxMemoryUsage: 64,
    },
    sounds: {
      ...DEFAULT_AUDIO_CONFIG.sounds,
      maxConcurrentSounds: 16,
    },
  } as AudioConfiguration,

  ultra: {
    ...DEFAULT_AUDIO_CONFIG,
    global: {
      ...DEFAULT_AUDIO_CONFIG.global,
      enableSpatialAudio: true,
      enableReverb: true,
    },
    playback: {
      ...DEFAULT_AUDIO_CONFIG.playback,
      bufferSize: 1024,
      sampleRate: 96000,
      channels: 2,
      bitDepth: 32,
    },
    performance: {
      ...DEFAULT_AUDIO_CONFIG.performance,
      poolSize: 200,
      preloadBatchSize: 15,
      maxMemoryUsage: 128,
    },
    sounds: {
      ...DEFAULT_AUDIO_CONFIG.sounds,
      maxConcurrentSounds: 32,
    },
  } as AudioConfiguration,
} as const;

export type AudioQuality = keyof typeof AUDIO_QUALITY_PRESETS;

// Device-specific audio presets
export const DEVICE_AUDIO_PRESETS = {
  mobile: {
    ...AUDIO_QUALITY_PRESETS.low,
    sounds: {
      ...AUDIO_QUALITY_PRESETS.low.sounds,
      throttleMs: 150, // Higher throttle for mobile
    },
    performance: {
      ...AUDIO_QUALITY_PRESETS.low.performance,
      poolSize: 15,
      maxMemoryUsage: 8,
    },
  } as AudioConfiguration,

  desktop: AUDIO_QUALITY_PRESETS.high,

  gameConsole: AUDIO_QUALITY_PRESETS.ultra,
} as const;

export type DeviceAudioPreset = keyof typeof DEVICE_AUDIO_PRESETS;

// Configuration validation
export function validateAudioConfig(config: Partial<AudioConfiguration>): string[] {
  const errors: string[] = [];

  if (config.global) {
    const { global } = config;
    if (global.masterVolume !== undefined && (global.masterVolume < 0 || global.masterVolume > 1)) {
      errors.push('Master volume must be between 0 and 1');
    }
  }

  if (config.categoryVolumes) {
    const { categoryVolumes } = config;
    Object.entries(categoryVolumes).forEach(([category, volume]) => {
      if (volume < 0 || volume > 1) {
        errors.push(`Category volume for ${category} must be between 0 and 1`);
      }
    });
  }

  if (config.sounds) {
    const { sounds } = config;
    if (sounds.maxRetries !== undefined && sounds.maxRetries < 0) {
      errors.push('Max retries must be non-negative');
    }
    if (sounds.throttleMs !== undefined && sounds.throttleMs < 0) {
      errors.push('Throttle duration must be non-negative');
    }
    if (sounds.maxConcurrentSounds !== undefined && sounds.maxConcurrentSounds < 1) {
      errors.push('Max concurrent sounds must be at least 1');
    }
  }

  if (config.playback) {
    const { playback } = config;
    if (playback.sampleRate !== undefined && playback.sampleRate < 8000) {
      errors.push('Sample rate must be at least 8000 Hz');
    }
    if (playback.channels !== undefined && ![1, 2].includes(playback.channels)) {
      errors.push('Channels must be 1 (mono) or 2 (stereo)');
    }
  }

  return errors;
}

// Configuration merger with validation
export function mergeAudioConfig(
  base: AudioConfiguration,
  override: Partial<AudioConfiguration>
): AudioConfiguration {
  const errors = validateAudioConfig(override);
  if (errors.length > 0) {
    throw new Error(`Invalid audio configuration: ${errors.join(', ')}`);
  }

  return {
    global: { ...base.global, ...override.global },
    categoryVolumes: { ...base.categoryVolumes, ...override.categoryVolumes },
    sounds: { ...base.sounds, ...override.sounds },
    playback: { ...base.playback, ...override.playback },
    performance: { ...base.performance, ...override.performance },
    quality: override.quality ?? base.quality,
  };
}

// Computed audio values
export function computeAudioValues(config: AudioConfiguration) {
  return {
    // Effective volumes (master * category * sound)
    effectiveVolumes: Object.fromEntries(
      Object.values(SOUND_DEFINITIONS).map((sound) => [
        sound.key,
        config.global.masterVolume * config.categoryVolumes[sound.category] * sound.defaultVolume,
      ])
    ) as Record<SoundKey, number>,

    // File paths
    soundPaths: Object.fromEntries(
      Object.values(SOUND_DEFINITIONS).map((sound) => [sound.key, `/sounds/${sound.fileName}`])
    ) as Record<SoundKey, string>,

    // Preload priority order
    preloadOrder: Object.values(SOUND_DEFINITIONS)
      .filter((sound) => sound.preload)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .map((sound) => sound.key),
  };
}

// Runtime audio configuration management
class AudioConfigManager {
  private currentConfig: AudioConfiguration = DEFAULT_AUDIO_CONFIG;
  private listeners: ((config: AudioConfiguration) => void)[] = [];

  getConfig(): AudioConfiguration {
    return this.currentConfig;
  }

  setConfig(config: Partial<AudioConfiguration>): void {
    this.currentConfig = mergeAudioConfig(this.currentConfig, config);
    this.notifyListeners();
  }

  setQualityPreset(quality: AudioQuality): void {
    this.currentConfig = AUDIO_QUALITY_PRESETS[quality];
    this.notifyListeners();
  }

  setDevicePreset(device: DeviceAudioPreset): void {
    this.currentConfig = DEVICE_AUDIO_PRESETS[device];
    this.notifyListeners();
  }

  resetToDefault(): void {
    this.currentConfig = DEFAULT_AUDIO_CONFIG;
    this.notifyListeners();
  }

  getComputedValues() {
    return computeAudioValues(this.currentConfig);
  }

  getSoundDefinition(soundKey: SoundKey): SoundDefinition {
    return SOUND_DEFINITIONS[soundKey];
  }

  subscribe(listener: (config: AudioConfiguration) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentConfig));
  }
}

export const audioConfigManager = new AudioConfigManager();
