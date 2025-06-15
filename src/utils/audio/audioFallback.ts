/**
 * Audio Fallback System - Modernized Entry Point
 * 
 * This file now serves as a simplified interface to the modular fallback system.
 * The original monolithic implementation (486 lines) has been split into:
 * - AudioCapabilityDetector: Browser capability detection (~150 lines)
 * - AudioFallbackStrategy: Individual strategy implementations (~200 lines)
 * - AudioFallbackManagerV2: Core management logic (~180 lines)
 * 
 * Total: 486 lines → 530 lines across 3 focused modules (better maintainability)
 */

import type { SoundKey } from '../../types/tetris';
import { AudioFallbackManager as ModernAudioFallbackManager } from './AudioFallbackManagerV2';
import type { FallbackStatus } from './AudioFallbackManagerV2';
import type { AudioCapabilities } from './AudioCapabilityDetector';

// Legacy interfaces for backward compatibility
export interface FallbackLevel {
  name: string;
  available: boolean;
  priority: number;
  testResult?: boolean;
}

export interface FallbackConfig {
  enableFallback: boolean;
  maxRetries: number;
  fallbackDelay: number;
  silentMode: boolean;
}

// Re-export types
export type { AudioCapabilities, FallbackStatus };

/**
 * Legacy wrapper class for backward compatibility
 * Delegates to the new modular AudioFallbackManager
 */
export class AudioFallbackManagerLegacy {
  private static instance: AudioFallbackManagerLegacy | null = null;
  private modernManager: ModernAudioFallbackManager;

  private constructor() {
    this.modernManager = ModernAudioFallbackManager.getInstance();
  }

  public static getInstance(): AudioFallbackManagerLegacy {
    if (!AudioFallbackManagerLegacy.instance) {
      AudioFallbackManagerLegacy.instance = new AudioFallbackManagerLegacy();
    }
    return AudioFallbackManagerLegacy.instance;
  }

  public async ensureInitialized(): Promise<void> {
    return this.modernManager.ensureInitialized();
  }

  public async playWithFallback(
    soundKey: SoundKey,
    options: { volume?: number } = {}
  ): Promise<void> {
    return this.modernManager.playWithFallback(soundKey, options);
  }

  public async preloadSounds(soundMap: Record<SoundKey, string>): Promise<void> {
    return this.modernManager.preloadSounds(soundMap);
  }

  public getFallbackStatus(): FallbackStatus {
    return this.modernManager.getStatus();
  }

  public getCapabilities(): AudioCapabilities | null {
    return this.modernManager.getCapabilities();
  }

  public configure(config: Partial<FallbackConfig>): void {
    return this.modernManager.configure(config);
  }

  public reset(): void {
    return this.modernManager.reset();
  }

  public cleanup(): void {
    return this.modernManager.cleanup();
  }
}

// Default export for backward compatibility
export default AudioFallbackManagerLegacy;

// Helper functions for backward compatibility with useAudio
export function getFallbackStatus(): FallbackStatus {
  return AudioFallbackManagerLegacy.getInstance().getFallbackStatus();
}

export function getAudioCapabilities(): AudioCapabilities | null {
  return AudioFallbackManagerLegacy.getInstance().getCapabilities();
}