/**
 * Advanced audio preloading system with intelligent resource management
 * Features priority-based loading, network-aware strategies, and memory optimization
 */

import { createAudioError } from '@/types/errors';
import type { SoundKey } from '@/types/tetris';
import { log } from '../logging/logger';
import { type ISingleton, SingletonMixin, BaseClass } from '../patterns/singletonMixin';
import { audioManager } from './audioManager';

interface PreloadStrategy {
  priority: 'immediate' | 'high' | 'normal' | 'lazy';
  timeout: number; // Preload timeout in milliseconds
  retryCount: number; // Number of retry attempts
  memoryLimit: number; // Memory limit in MB
}

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  inProgress: number;
  progress: number; // Progress ratio 0-1
}

interface SoundPriority {
  soundKey: SoundKey;
  priority: number; // Priority 1-10, 10 is highest
  size?: number; // Estimated file size in bytes
}

class AudioPreloader extends SingletonMixin(class extends BaseClass {}) implements ISingleton {
  private preloadProgress: Map<SoundKey, 'pending' | 'loading' | 'loaded' | 'failed'> = new Map();
  private loadTimestamps: Map<SoundKey, number> = new Map();
  private retryCounters: Map<SoundKey, number> = new Map();
  private memoryUsage = 0;

  // Audio file priority definitions based on gameplay frequency
  private readonly soundPriorities: SoundPriority[] = [
    { soundKey: 'pieceLand', priority: 10 }, // Most frequently used during gameplay
    { soundKey: 'pieceRotate', priority: 9 },
    { soundKey: 'lineClear', priority: 8 },
    { soundKey: 'hardDrop', priority: 7 },
    { soundKey: 'tetris', priority: 6 },
    { soundKey: 'gameOver', priority: 5 }, // Low frequency but critical for UX
  ];

  // Default preloading strategies for different network conditions
  private readonly strategies: Record<string, PreloadStrategy> = {
    immediate: {
      priority: 'immediate',
      timeout: 5000,
      retryCount: 3,
      memoryLimit: 50, // 50MB for high-speed connections
    },
    normal: {
      priority: 'normal',
      timeout: 10000,
      retryCount: 2,
      memoryLimit: 30, // 30MB for normal connections
    },
    lazy: {
      priority: 'lazy',
      timeout: 15000,
      retryCount: 1,
      memoryLimit: 20, // 20MB for slow connections
    },
  };

  /**
   * Priority-based audio preloading with staggered start times
   */
  public async preloadWithStrategy(
    strategy: keyof typeof this.strategies = 'normal'
  ): Promise<PreloadProgress> {
    const config = this.strategies[strategy];

    // Sort by priority (highest first)
    const sortedSounds = [...this.soundPriorities].sort((a, b) => b.priority - a.priority);

    // Initialize progress tracking
    sortedSounds.forEach(({ soundKey }) => {
      if (!this.preloadProgress.has(soundKey)) {
        this.preloadProgress.set(soundKey, 'pending');
      }
    });

    // Progress tracking - removed unused variable

    // Parallel preloading with staggered start for load balancing
    const loadPromises = sortedSounds.map((soundPriority, index) => {
      if (!config) {
        throw new Error('Preload config is required');
      }
      return this.preloadSingleSound(soundPriority, config, index * 100); // 100ms intervals to distribute network load
    });

    await Promise.allSettled(loadPromises);

    return this.getProgress();
  }

  /**
   * Individual audio preloading with retry logic and timeout handling
   */
  private async preloadSingleSound(
    soundPriority: SoundPriority,
    config: PreloadStrategy,
    delay = 0
  ): Promise<void> {
    const { soundKey } = soundPriority;

    // Delayed start for network load distribution
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Memory limit enforcement
    if (this.memoryUsage > config.memoryLimit * 1024 * 1024) {
      this.preloadProgress.set(soundKey, 'failed');
      const error = createAudioError(
        `Memory limit exceeded for ${soundKey}`,
        {
          component: 'AudioPreloader',
          metadata: { soundKey, memoryUsage: this.memoryUsage, action: 'audio_preload' },
        },
        undefined
      );
      log.warn('Audio preload failed due to memory limit', {
        component: 'AudioPreloader',
        metadata: { error: error.toString() },
      });
      return;
    }

    const maxRetries = config.retryCount;
    let currentRetry = this.retryCounters.get(soundKey) || 0;

    while (currentRetry <= maxRetries) {
      try {
        this.preloadProgress.set(soundKey, 'loading');
        this.loadTimestamps.set(soundKey, Date.now());

        // Preload with timeout control
        await Promise.race([
          this.loadWithAudioManager(soundKey),
          this.createTimeoutPromise(config.timeout, soundKey),
        ]);

        this.preloadProgress.set(soundKey, 'loaded');
        this.retryCounters.delete(soundKey);
        return;
      } catch (error) {
        currentRetry++;
        this.retryCounters.set(soundKey, currentRetry);

        if (currentRetry > maxRetries) {
          this.preloadProgress.set(soundKey, 'failed');
          const audioError = createAudioError(
            `Failed to preload ${soundKey} after ${maxRetries} retries`,
            {
              component: 'AudioPreloader',
              metadata: { soundKey, retries: currentRetry, error, action: 'audio_preload' },
            },
            undefined
          );
          log.warn('Audio preload failed after retries', {
            component: 'AudioPreloader',
            metadata: { error: audioError.toString() },
          });
          return;
        }

        // Exponential backoff retry strategy
        const backoffDelay = 2 ** (currentRetry - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  /**
   * Actual loading process using AudioManager's internal preloading
   */
  private async loadWithAudioManager(soundKey: SoundKey): Promise<void> {
    // Use AudioManager's internal preload functionality
    const audioState = audioManager.getAudioState();

    if (!audioState.loadedSounds.includes(soundKey)) {
      // Leverage AudioManager's preloadAllSounds() for individual sounds
      await audioManager.preloadAllSounds();

      // Verify successful loading
      const updatedState = audioManager.getAudioState();
      if (!updatedState.loadedSounds.includes(soundKey)) {
        throw new Error(`Failed to load ${soundKey} via AudioManager`);
      }

      // Update memory usage estimation (rough approximation)
      this.estimateMemoryUsage(soundKey);
    }
  }

  /**
   * Create timeout promise for preload operations
   */
  private createTimeoutPromise(timeout: number, soundKey: SoundKey): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Preload timeout for ${soundKey} after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Estimate memory usage based on typical audio file sizes
   */
  private estimateMemoryUsage(soundKey: SoundKey): void {
    // Estimate audio file memory usage (actual values are difficult to obtain from Web Audio API)
    const estimatedSizes: Record<SoundKey, number> = {
      pieceLand: 50 * 1024, // 50KB
      pieceRotate: 30 * 1024, // 30KB
      lineClear: 80 * 1024, // 80KB
      hardDrop: 40 * 1024, // 40KB
      tetris: 150 * 1024, // 150KB
      gameOver: 200 * 1024, // 200KB
    };

    this.memoryUsage += estimatedSizes[soundKey] || 50 * 1024;
  }

  /**
   * Get current preload progress statistics
   */
  public getProgress(): PreloadProgress {
    const statuses = Array.from(this.preloadProgress.values());

    return {
      total: statuses.length,
      loaded: statuses.filter((s) => s === 'loaded').length,
      failed: statuses.filter((s) => s === 'failed').length,
      inProgress: statuses.filter((s) => s === 'loading').length,
      progress:
        statuses.length > 0 ? statuses.filter((s) => s === 'loaded').length / statuses.length : 0,
    };
  }

  /**
   * Get preload status for specific sound
   */
  public getSoundStatus(soundKey: SoundKey): string {
    return this.preloadProgress.get(soundKey) || 'not-started';
  }

  /**
   * Get loading time statistics for performance monitoring
   */
  public getLoadingStats(): Record<SoundKey, { loadTime: number; status: string }> {
    const stats: Record<string, { loadTime: number; status: string }> = {};

    for (const [soundKey, timestamp] of this.loadTimestamps.entries()) {
      const status = this.preloadProgress.get(soundKey) || 'unknown';
      const loadTime = status === 'loaded' ? Date.now() - timestamp : -1;

      stats[soundKey] = { loadTime, status };
    }

    return stats as Record<SoundKey, { loadTime: number; status: string }>;
  }

  /**
   * Get estimated memory usage information
   */
  public getMemoryUsage(): { estimated: number; limit: number } {
    return {
      estimated: this.memoryUsage,
      limit: 50 * 1024 * 1024, // Default 50MB limit
    };
  }

  /**
   * Reset singleton state (implements ISingleton)
   */
  public override reset(): void {
    this.preloadProgress.clear();
    this.loadTimestamps.clear();
    this.retryCounters.clear();
    this.memoryUsage = 0;
  }

  /**
   * Clean up all resources (implements ISingleton)
   */
  public override destroy(): void {
    this.reset();
  }

  /**
   * Intelligent preloading based on network conditions using Network Information API
   */
  public async preloadBasedOnNetwork(): Promise<PreloadProgress> {
    // Type definition for Network Information API
    interface NetworkInformation {
      effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
      downlink: number;
      rtt?: number;
      saveData?: boolean;
    }

    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    }

    // Network Information API support check with vendor prefixes
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection =
      navigatorWithConnection.connection ||
      navigatorWithConnection.mozConnection ||
      navigatorWithConnection.webkitConnection;

    let strategy: keyof typeof this.strategies = 'normal';

    if (connection) {
      const { effectiveType, downlink } = connection;

      // Network-aware strategy selection for optimal performance
      if (effectiveType === '4g' && downlink > 5) {
        strategy = 'immediate'; // High-speed connection - aggressive preloading
      } else if (effectiveType === '3g' || downlink < 2) {
        strategy = 'lazy'; // Slow connection - conservative preloading
      }
    }

    return this.preloadWithStrategy(strategy);
  }
}

// Export singleton instance
export const audioPreloader = AudioPreloader.getInstance();

// Export convenience functions
export const preloadAudioWithStrategy = (strategy?: 'immediate' | 'normal' | 'lazy') =>
  audioPreloader.preloadWithStrategy(strategy);

export const preloadAudioSmart = () => audioPreloader.preloadBasedOnNetwork();
export const getAudioPreloadProgress = () => audioPreloader.getProgress();
export const getAudioLoadingStats = () => audioPreloader.getLoadingStats();
export const resetAudioPreloader = () => audioPreloader.reset();
