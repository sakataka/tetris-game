/**
 * Audio Fallback Manager V2
 *
 * Modernized version using modular strategy pattern.
 * Replaces the monolithic audioFallback.ts with clean architecture.
 */

import type { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';
import { log } from '../logging';
import { AudioCapabilityDetector, type AudioCapabilities } from './AudioCapabilityDetector';
import {
  type AudioFallbackStrategy,
  WebAudioStrategy,
  HtmlAudioStrategy,
  VisualFeedbackStrategy,
  SilentStrategy,
} from './AudioFallbackStrategy';

interface FallbackConfig {
  enableFallback: boolean;
  maxRetries: number;
  fallbackDelay: number; // ms
  silentMode: boolean; // Complete silent mode
}

export interface FallbackStatus {
  currentLevel: number;
  availableLevels: string[];
  silentMode: boolean;
}

export class AudioFallbackManager {
  private static instance: AudioFallbackManager | null = null;

  private strategies: AudioFallbackStrategy[] = [];
  private currentStrategyIndex = 0;
  private capabilities: AudioCapabilities | null = null;
  private initialized = false;
  private config: FallbackConfig = {
    enableFallback: true,
    maxRetries: 3,
    fallbackDelay: 500,
    silentMode: false,
  };

  private constructor() {
    // Don't initialize immediately to avoid AudioContext creation before user interaction
  }

  public static getInstance(): AudioFallbackManager {
    if (!AudioFallbackManager.instance) {
      AudioFallbackManager.instance = new AudioFallbackManager();
    }
    return AudioFallbackManager.instance;
  }

  /**
   * Ensure initialization is complete before using audio features
   */
  public async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }
  }

  /**
   * Initialize fallback strategies
   */
  private async initialize(): Promise<void> {
    this.capabilities = await AudioCapabilityDetector.detect();

    // Create strategies in priority order
    const allStrategies = [
      new WebAudioStrategy(),
      new HtmlAudioStrategy(),
      new VisualFeedbackStrategy(),
      new SilentStrategy(),
    ];

    // Test availability and keep only working strategies
    this.strategies = [];
    for (const strategy of allStrategies) {
      try {
        const isAvailable = await strategy.isAvailable();
        if (isAvailable) {
          const testResult = await strategy.test();
          if (testResult) {
            this.strategies.push(strategy);
            log.info(`Audio strategy available: ${strategy.getName()}`);
          }
        }
      } catch (error) {
        log.warn(`Strategy ${strategy.getName()} failed test:`, error as Error);
      }
    }

    // Ensure we have at least silent mode
    if (this.strategies.length === 0) {
      this.strategies.push(new SilentStrategy());
    }

    log.info(`Initialized ${this.strategies.length} audio strategies`);
  }

  /**
   * Play sound with automatic fallback
   */
  public async playWithFallback(
    soundKey: SoundKey,
    _options: { volume?: number } = {}
  ): Promise<void> {
    if (this.config.silentMode) return;

    // Ensure initialization is complete
    await this.ensureInitialized();

    let lastError: Error | null = null;
    let retryCount = 0;

    while (
      this.currentStrategyIndex < this.strategies.length &&
      retryCount < this.config.maxRetries
    ) {
      const strategy = this.strategies[this.currentStrategyIndex];

      try {
        await strategy.playSound(soundKey);
        return; // Success!
      } catch (error) {
        lastError = error as Error;

        log.warn(`Strategy ${strategy.getName()} failed for sound ${soundKey}:`, error as Error);

        // Move to next strategy
        this.currentStrategyIndex++;

        if (this.currentStrategyIndex < this.strategies.length) {
          log.info(`Falling back to: ${this.strategies[this.currentStrategyIndex].getName()}`);

          // Add delay before retry
          if (this.config.fallbackDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.config.fallbackDelay));
          }
        }
      }

      retryCount++;
    }

    // If all strategies failed, log error but don't throw
    if (lastError) {
      handleError(
        new AudioError(`All audio strategies failed for sound: ${soundKey}`, 'FALLBACK_EXHAUSTED', {
          soundKey,
          strategies: this.strategies.map((s) => s.getName()),
        })
      );
    }
  }

  /**
   * Preload sounds for all available strategies
   */
  public async preloadSounds(soundMap: Record<SoundKey, string>): Promise<void> {
    await this.ensureInitialized();

    // Preload for current strategy only (for efficiency)
    if (this.strategies.length > 0) {
      const currentStrategy = this.strategies[this.currentStrategyIndex];
      try {
        await currentStrategy.preloadSounds(soundMap);
        log.info(`Sounds preloaded for strategy: ${currentStrategy.getName()}`);
      } catch (error) {
        log.warn(`Failed to preload sounds for ${currentStrategy.getName()}:`, error as Error);
      }
    }
  }

  /**
   * Get current fallback status
   */
  public getStatus(): FallbackStatus {
    return {
      currentLevel: this.currentStrategyIndex,
      availableLevels: this.strategies.map((s) => s.getName()),
      silentMode: this.config.silentMode,
    };
  }

  /**
   * Get audio capabilities
   */
  public getCapabilities(): AudioCapabilities | null {
    return this.capabilities;
  }

  /**
   * Configure fallback behavior
   */
  public configure(config: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset to highest priority strategy
   */
  public reset(): void {
    this.currentStrategyIndex = 0;
  }

  /**
   * Manually set current strategy
   */
  public setStrategy(strategyName: string): boolean {
    const index = this.strategies.findIndex((s) => s.getName() === strategyName);
    if (index !== -1) {
      this.currentStrategyIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Cleanup all strategies
   */
  public cleanup(): void {
    for (const strategy of this.strategies) {
      try {
        strategy.cleanup();
      } catch (error) {
        log.warn(`Error cleaning up strategy ${strategy.getName()}:`, error as Error);
      }
    }
    this.strategies = [];
    this.initialized = false;
  }

  /**
   * Force re-initialization (useful for testing)
   */
  public async reinitialize(): Promise<void> {
    this.cleanup();
    this.initialized = false;
    await this.ensureInitialized();
  }
}
