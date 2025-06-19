/**
 * Abstract base class for audio playback strategies
 * Defines common interface for different audio implementations
 */

import type { SoundKey } from '@/types/tetris';

export interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
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

export abstract class AudioStrategy {
  protected masterVolume = 0.5;
  protected isMuted = false;

  // Sound file path definitions
  protected readonly soundFiles: Record<SoundKey, string> = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3',
  };

  /**
   * Check if this strategy can be used in current environment
   */
  abstract canPlayAudio(): boolean;

  /**
   * Initialize the audio strategy
   */
  abstract initialize(): Promise<void>;

  /**
   * Play a sound with given configuration
   */
  abstract playSound(soundKey: SoundKey, config?: Partial<SoundConfig>): Promise<void>;

  /**
   * Stop specific sound type
   */
  abstract stopSound(soundKey: SoundKey): void;

  /**
   * Stop all active sounds
   */
  abstract stopAllSounds(): void;

  /**
   * Set master volume (0.0 - 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  /**
   * Get current master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateVolume();
  }

  /**
   * Get current mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Preload all sound files
   */
  abstract preloadSounds(): Promise<void>;

  /**
   * Get current audio state for debugging
   */
  abstract getAudioState(): AudioState;

  /**
   * Clean up resources
   */
  abstract dispose(): void;

  /**
   * Update volume implementation - override in subclasses
   */
  protected abstract updateVolume(): void;

  /**
   * Get effective volume considering mute state
   */
  protected getEffectiveVolume(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }
}
