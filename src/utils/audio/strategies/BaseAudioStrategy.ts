/**
 * Base Audio Strategy with Common Logic
 * Extracts shared functionality from concrete implementations
 */

import { createAudioError } from '../../../types/errors';
import type { SoundKey } from '../../../types/tetris';
import { log } from '../../logging';

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

// Common audio utility functions
export abstract class BaseAudioStrategy {
  protected masterVolume = 0.5;
  protected isMuted = false;

  // Sound file path definitions (shared across all strategies)
  protected readonly soundFiles: Record<SoundKey, string> = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3',
  };

  // Common volume management
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateVolume();
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  protected getEffectiveVolume(): number {
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

  // Abstract methods that must be implemented by concrete strategies
  abstract canPlayAudio(): boolean;
  abstract initialize(): Promise<void>;
  abstract playSound(soundKey: SoundKey, config?: Partial<SoundConfig>): Promise<void>;
  abstract stopSound(soundKey: SoundKey): void;
  abstract stopAllSounds(): void;
  abstract preloadSounds(): Promise<void>;
  abstract getAudioState(): AudioState;
  abstract dispose(): void;
  protected abstract updateVolume(): void;
}
