/**
 * Base Audio Strategy with Common Logic
 * Extracts shared functionality from concrete implementations
 */

import { createAudioError } from '@/types/errors';
import type { SoundKey } from '@/types/tetris';
import { log } from '@/utils/logging';

export interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn: number | undefined;
  fadeOut: number | undefined;
}

export interface AudioState {
  initialized: boolean;
  suspended: boolean;
  loadedSounds: SoundKey[];
  activeSounds: number;
  masterVolume: number;
  isMuted: boolean;
  strategyType: string;
}

import { AudioStrategy } from './AudioStrategy';

// Common audio utility functions
export abstract class BaseAudioStrategy extends AudioStrategy {
  protected override masterVolume = 0.5;
  protected override isMuted = false;
  protected initialized = false;

  // Sound file path definitions (shared across all strategies)
  protected override readonly soundFiles: Record<SoundKey, string> = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3',
  };

  // Common volume management
  override setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  override getMasterVolume(): number {
    return this.masterVolume;
  }

  override setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateVolume();
  }

  override isMutedState(): boolean {
    return this.isMuted;
  }

  protected override getEffectiveVolume(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }

  // Common error handling
  protected handleAudioError(error: unknown, operation: string, soundKey?: SoundKey): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Create audio error (not used directly but logs the error)
    createAudioError(
      `${operation} failed: ${errorMessage}`,
      {
        component: this.constructor.name,
        metadata: { soundKey, operation },
      },
      undefined // No user message for audio errors (they're suppressed)
    );

    log.warn('Audio operation failed', {
      component: this.constructor.name,
      metadata: { error: errorMessage, operation, soundKey },
    });

    // Don't throw - audio errors should be non-blocking
  }

  // Common configuration validation
  protected validateSoundConfig(config: Partial<SoundConfig>): SoundConfig {
    return {
      volume: Math.max(0, Math.min(1, config.volume ?? 1)),
      loop: config.loop ?? false,
      fadeIn: config.fadeIn ? Math.max(0, config.fadeIn) : undefined,
      fadeOut: config.fadeOut ? Math.max(0, config.fadeOut) : undefined,
    };
  }

  // Common file loading utility
  protected async loadAudioFile(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      this.handleAudioError(error, 'loadAudioFile', url as SoundKey);
      throw error;
    }
  }

  // Common initialization framework
  protected async initializeStrategy(strategyName: string): Promise<void> {
    if (typeof window === 'undefined') {
      log.warn('Audio initialization skipped - no window object', {
        component: strategyName,
        metadata: { operation: 'initialize' },
      });
      return;
    }

    if (!this.canPlayAudio()) {
      throw createAudioError(
        `${strategyName} is not supported in this environment`,
        {
          component: strategyName,
          metadata: { operation: 'audio_support_check' },
        },
        undefined
      );
    }

    try {
      await this.doInitialize();
      this.initialized = true;

      log.debug('Audio strategy initialized successfully', {
        component: strategyName,
        metadata: {
          operation: 'initialize',
          masterVolume: this.masterVolume,
          isMuted: this.isMuted,
        },
      });
    } catch (error) {
      const audioError = createAudioError(
        `Failed to initialize ${strategyName}`,
        {
          component: strategyName,
          metadata: { error, operation: 'strategy_initialization' },
        },
        undefined
      );

      log.warn('Audio strategy initialization failed', {
        component: strategyName,
        metadata: { error: audioError },
      });

      throw audioError;
    }
  }

  protected isInitialized(): boolean {
    return this.initialized;
  }

  protected async safeAudioOperation<T>(
    operation: string,
    fn: () => Promise<T> | T,
    soundKey?: SoundKey
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handleAudioError(error, operation, soundKey);
      // Return undefined instead of throwing to maintain non-blocking behavior
      return undefined;
    }
  }

  // Strategy-specific initialization (must be implemented by concrete strategies)
  protected abstract doInitialize(): Promise<void>;

  // Abstract methods that must be implemented by concrete strategies
  abstract override canPlayAudio(): boolean;
  abstract override initialize(): Promise<void>;
  abstract override playSound(soundKey: SoundKey, config?: Partial<SoundConfig>): Promise<void>;
  abstract override stopSound(soundKey: SoundKey): void;
  abstract override stopAllSounds(): void;
  abstract override preloadSounds(): Promise<void>;
  abstract override getAudioState(): AudioState;
  abstract override dispose(): void;
  protected abstract override updateVolume(): void;
}
