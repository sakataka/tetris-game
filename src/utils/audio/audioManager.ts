/**
 * Strategy Pattern based Audio Manager
 * Provides fallback chain: Web Audio API → HTML Audio → Silent
 */

import type { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';
import { log } from '../logging';
import {
  type AudioState,
  type AudioStrategy,
  HTMLAudioStrategy,
  SilentStrategy,
  type SoundConfig,
  WebAudioStrategy,
} from './strategies';

export class AudioManagerV2 {
  private static instance: AudioManagerV2 | null = null;
  private currentStrategy: AudioStrategy;
  private strategies: AudioStrategy[] = [];
  private strategyIndex = 0;
  private initialized = false;

  private constructor() {
    this.initializeStrategies();
    const firstStrategy = this.strategies[0];
    if (!firstStrategy) {
      throw new Error('No audio strategies available');
    }
    this.currentStrategy = firstStrategy;
  }

  public static getInstance(): AudioManagerV2 {
    if (!AudioManagerV2.instance) {
      AudioManagerV2.instance = new AudioManagerV2();
    }
    return AudioManagerV2.instance;
  }

  private initializeStrategies(): void {
    this.strategies = [new WebAudioStrategy(), new HTMLAudioStrategy(), new SilentStrategy()];
  }

  /**
   * Initialize audio system with fallback chain
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    for (let i = 0; i < this.strategies.length; i++) {
      const strategy = this.strategies[i];
      if (!strategy) continue;

      if (!strategy.canPlayAudio()) {
        continue;
      }

      try {
        await strategy.initialize();
        this.currentStrategy = strategy;
        this.strategyIndex = i;
        this.initialized = true;

        // Log successful strategy selection
        log.audio(`Audio system initialized with ${strategy.constructor.name}`);
        return;
      } catch (error) {
        const audioError = new AudioError(
          `Failed to initialize ${strategy.constructor.name}`,
          {
            action: 'audio_strategy_init',
            component: 'AudioManagerV2',
            additionalData: { strategy: strategy.constructor.name, error },
          },
          { recoverable: true, retryable: false }
        );
        handleError(audioError);
      }
    }

    // If all strategies failed, use silent as final fallback
    const silentStrategy = new SilentStrategy();
    await silentStrategy.initialize();
    this.currentStrategy = silentStrategy;
    this.strategyIndex = this.strategies.length - 1;
    this.initialized = true;

    log.warn('All audio strategies failed, using silent fallback', { component: 'Audio' });
  }

  /**
   * Play sound with automatic fallback on failure
   */
  public async playSound(soundKey: SoundKey, config?: Partial<SoundConfig>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.currentStrategy.playSound(soundKey, config);
    } catch (error) {
      // Attempt fallback to next strategy
      await this.fallbackToNextStrategy(error);

      // Retry with new strategy
      if (this.currentStrategy) {
        try {
          await this.currentStrategy.playSound(soundKey, config);
        } catch (fallbackError) {
          const audioError = new AudioError(
            `Failed to play sound after fallback: ${soundKey}`,
            {
              action: 'audio_play_fallback',
              component: 'AudioManagerV2',
              additionalData: { soundKey, originalError: error, fallbackError },
            },
            { recoverable: false, retryable: false }
          );
          handleError(audioError);
        }
      }
    }
  }

  /**
   * Fallback to next available strategy
   */
  private async fallbackToNextStrategy(error: unknown): Promise<void> {
    const nextIndex = this.strategyIndex + 1;

    if (nextIndex >= this.strategies.length) {
      // No more strategies available
      return;
    }

    const nextStrategy = this.strategies[nextIndex];
    if (!nextStrategy) return;

    try {
      await nextStrategy.initialize();

      // Dispose current strategy
      this.currentStrategy.dispose();

      // Switch to new strategy
      this.currentStrategy = nextStrategy;
      this.strategyIndex = nextIndex;

      log.warn(`Audio strategy fallback: ${nextStrategy.constructor.name}`, { component: 'Audio' });
    } catch (initError) {
      const audioError = new AudioError(
        `Failed to fallback to ${nextStrategy.constructor.name}`,
        {
          action: 'audio_strategy_fallback',
          component: 'AudioManagerV2',
          additionalData: { originalError: error, fallbackError: initError },
        },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);

      // Try next strategy recursively
      await this.fallbackToNextStrategy(initError);
    }
  }

  /**
   * Stop specific sound
   */
  public stopSound(soundKey: SoundKey): void {
    if (this.currentStrategy) {
      this.currentStrategy.stopSound(soundKey);
    }
  }

  /**
   * Stop all sounds
   */
  public stopAllSounds(): void {
    if (this.currentStrategy) {
      this.currentStrategy.stopAllSounds();
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    if (this.currentStrategy) {
      this.currentStrategy.setMasterVolume(volume);
    }
  }

  /**
   * Get master volume
   */
  public getMasterVolume(): number {
    return this.currentStrategy ? this.currentStrategy.getMasterVolume() : 0.5;
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean): void {
    if (this.currentStrategy) {
      this.currentStrategy.setMuted(muted);
    }
  }

  /**
   * Get mute state
   */
  public isMutedState(): boolean {
    return this.currentStrategy ? this.currentStrategy.isMutedState() : false;
  }

  /**
   * Preload all sounds
   */
  public async preloadAllSounds(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.currentStrategy) {
      try {
        await this.currentStrategy.preloadSounds();
      } catch (error) {
        const audioError = new AudioError(
          'Failed to preload sounds',
          {
            action: 'audio_preload',
            component: 'AudioManagerV2',
            additionalData: { strategy: this.currentStrategy.constructor.name, error },
          },
          { recoverable: true, retryable: false }
        );
        handleError(audioError);
      }
    }
  }

  /**
   * Get current audio state
   */
  public getAudioState(): AudioState & { currentStrategy: string } {
    const baseState = this.currentStrategy
      ? this.currentStrategy.getAudioState()
      : {
          initialized: false,
          suspended: false,
          loadedSounds: [],
          activeSounds: 0,
          masterVolume: 0.5,
          isMuted: false,
          strategyType: 'None',
        };

    return {
      ...baseState,
      currentStrategy: this.currentStrategy ? this.currentStrategy.constructor.name : 'None',
    };
  }

  /**
   * Get available strategies
   */
  public getAvailableStrategies(): string[] {
    return this.strategies
      .filter((strategy) => strategy.canPlayAudio())
      .map((strategy) => strategy.constructor.name);
  }

  /**
   * Force switch to specific strategy (for testing)
   */
  public async switchToStrategy(strategyName: string): Promise<boolean> {
    const strategyIndex = this.strategies.findIndex(
      (strategy) => strategy.constructor.name === strategyName
    );

    if (strategyIndex === -1) {
      return false;
    }

    const strategy = this.strategies[strategyIndex];
    if (!strategy) return false;

    if (!strategy.canPlayAudio()) {
      return false;
    }

    try {
      await strategy.initialize();

      // Dispose current strategy
      if (this.currentStrategy) {
        this.currentStrategy.dispose();
      }

      this.currentStrategy = strategy;
      this.strategyIndex = strategyIndex;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up all resources
   */
  public dispose(): void {
    if (this.currentStrategy) {
      this.currentStrategy.dispose();
    }

    for (const strategy of this.strategies) {
      strategy.dispose();
    }

    this.strategies = [];
    this.initialized = false;
    AudioManagerV2.instance = null;
  }
}

// Export singleton instance
export const audioManagerV2 = AudioManagerV2.getInstance();
export const audioManager = audioManagerV2; // Backward compatibility

// Export convenience functions with same interface as original
export const playSound = (soundKey: SoundKey, config?: Partial<SoundConfig>) =>
  audioManagerV2.playSound(soundKey, config);

export const preloadSounds = () => audioManagerV2.preloadAllSounds();
export const setMasterVolume = (volume: number) => audioManagerV2.setMasterVolume(volume);
export const setMuted = (muted: boolean) => audioManagerV2.setMuted(muted);
export const getMasterVolume = () => audioManagerV2.getMasterVolume();
export const isMuted = () => audioManagerV2.isMutedState();
export const getAudioState = () => audioManagerV2.getAudioState();
export const stopSound = (soundKey: SoundKey) => audioManagerV2.stopSound(soundKey);
export const stopAllSounds = () => audioManagerV2.stopAllSounds();
