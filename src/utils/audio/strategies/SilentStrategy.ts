/**
 * Silent audio strategy for fallback scenarios
 * Provides no-op audio implementation when all other strategies fail
 */

import type { SoundKey } from '../../../types/tetris';
import { AudioStrategy, type SoundConfig, type AudioState } from './AudioStrategy';

export class SilentStrategy extends AudioStrategy {
  private initialized: boolean = false;
  private activeSounds: number = 0;

  canPlayAudio(): boolean {
    return true; // Silent strategy always works
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async playSound(_soundKey: SoundKey, config?: Partial<SoundConfig>): Promise<void> {
    if (this.isMuted || !this.initialized) return;

    // Simulate sound playback timing
    this.activeSounds++;

    // Clean up after simulated duration
    const duration = config?.loop ? 0 : 1000; // 1 second default duration
    if (duration > 0) {
      setTimeout(() => {
        if (this.activeSounds > 0) {
          this.activeSounds--;
        }
      }, duration);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stopSound(_soundKey: SoundKey): void {
    // No-op: nothing to stop in silent mode
    if (this.activeSounds > 0) {
      this.activeSounds--;
    }
  }

  stopAllSounds(): void {
    this.activeSounds = 0;
  }

  async preloadSounds(): Promise<void> {
    // No-op: nothing to preload in silent mode
    return Promise.resolve();
  }

  protected updateVolume(): void {
    // No-op: no volume to update in silent mode
  }

  getAudioState(): AudioState {
    return {
      initialized: this.initialized,
      suspended: false,
      loadedSounds: Object.keys(this.soundFiles) as SoundKey[], // Pretend all sounds are loaded
      activeSounds: this.activeSounds,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
      strategyType: 'Silent',
    };
  }

  dispose(): void {
    this.stopAllSounds();
    this.initialized = false;
  }
}
