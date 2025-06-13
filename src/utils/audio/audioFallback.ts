/**
 * Robust Audio Fallback System
 * Progressive fallback, error recovery, and alternative methods
 */

import type { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';
import { log } from '../logging';

interface FallbackLevel {
  name: string;
  available: boolean;
  priority: number; // 1-5, 5 is highest priority
  testResult?: boolean;
}

interface FallbackConfig {
  enableFallback: boolean;
  maxRetries: number;
  fallbackDelay: number; // ms
  silentMode: boolean; // Complete silent mode
}

interface AudioCapabilities {
  webAudio: boolean;
  htmlAudio: boolean;
  audioContextSupport: boolean;
  mp3Support: boolean;
  codecs: string[];
  autoplayPolicy: 'allowed' | 'restricted' | 'blocked';
}

class AudioFallbackManager {
  private static instance: AudioFallbackManager | null = null;

  private fallbackLevels: FallbackLevel[] = [];
  private currentLevel = 0;
  private capabilities: AudioCapabilities | null = null;
  private config: FallbackConfig = {
    enableFallback: true,
    maxRetries: 3,
    fallbackDelay: 500,
    silentMode: false,
  };

  // Audio instances for each fallback level
  private audioInstances: Map<string, Map<SoundKey, HTMLAudioElement | AudioBuffer>> = new Map();
  private fallbackCallbacks: Map<string, (soundKey: SoundKey) => Promise<void>> = new Map();

  private constructor() {
    this.initializeFallbackLevels();
  }

  public static getInstance(): AudioFallbackManager {
    if (!AudioFallbackManager.instance) {
      AudioFallbackManager.instance = new AudioFallbackManager();
    }
    return AudioFallbackManager.instance;
  }

  /**
   * Initialize and detect fallback levels
   */
  private async initializeFallbackLevels(): Promise<void> {
    this.capabilities = await this.detectAudioCapabilities();

    this.fallbackLevels = [
      {
        name: 'web-audio-api',
        available: this.capabilities.webAudio && this.capabilities.audioContextSupport,
        priority: 5,
      },
      {
        name: 'html-audio-element',
        available: this.capabilities.htmlAudio && this.capabilities.mp3Support,
        priority: 4,
      },
      {
        name: 'html-audio-fallback',
        available: this.capabilities.htmlAudio,
        priority: 3,
      },
      {
        name: 'visual-feedback',
        available: true, // Always available
        priority: 2,
      },
      {
        name: 'silent-mode',
        available: true, // Final fallback
        priority: 1,
      },
    ];

    // Keep only available levels and sort
    this.fallbackLevels = this.fallbackLevels
      .filter((level) => level.available)
      .sort((a, b) => b.priority - a.priority);

    // Test actual operation of each level
    await this.testFallbackLevels();
  }

  /**
   * Detect browser audio capabilities
   */
  private async detectAudioCapabilities(): Promise<AudioCapabilities> {
    const capabilities: AudioCapabilities = {
      webAudio: false,
      htmlAudio: false,
      audioContextSupport: false,
      mp3Support: false,
      codecs: [],
      autoplayPolicy: 'blocked',
    };

    if (typeof window === 'undefined') return capabilities;

    // Check Web Audio API support
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        capabilities.webAudio = true;

        // Test AudioContext creation
        const testContext = new AudioContextClass();
        capabilities.audioContextSupport = true;
        testContext.close();
      }
    } catch {
      capabilities.webAudio = false;
    }

    // Check HTMLAudioElement support
    try {
      const audio = new Audio();
      capabilities.htmlAudio = true;

      // Check codec support
      const testCodecs = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      capabilities.codecs = testCodecs.filter((codec) => audio.canPlayType(codec) !== '');
      capabilities.mp3Support = capabilities.codecs.includes('audio/mpeg');
    } catch {
      capabilities.htmlAudio = false;
    }

    // Detect autoplay policy
    await this.detectAutoplayPolicy(capabilities);

    return capabilities;
  }

  /**
   * Detect autoplay policy
   */
  private async detectAutoplayPolicy(capabilities: AudioCapabilities): Promise<void> {
    if (!capabilities.htmlAudio) return;

    try {
      const audio = new Audio();
      audio.muted = true;
      audio.volume = 0;

      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
        capabilities.autoplayPolicy = 'allowed';
        audio.pause();
      }
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        capabilities.autoplayPolicy = 'restricted';
      } else {
        capabilities.autoplayPolicy = 'blocked';
      }
    }
  }

  /**
   * Test actual operation of fallback levels
   */
  private async testFallbackLevels(): Promise<void> {
    for (const level of this.fallbackLevels) {
      try {
        level.testResult = await this.testFallbackLevel(level.name);
      } catch {
        level.testResult = false;
        level.available = false;
      }
    }

    // Filter by test results
    this.fallbackLevels = this.fallbackLevels.filter((level) => level.testResult);
  }

  /**
   * Test individual fallback level
   */
  private async testFallbackLevel(levelName: string): Promise<boolean> {
    switch (levelName) {
      case 'web-audio-api':
        return this.testWebAudioAPI();
      case 'html-audio-element':
      case 'html-audio-fallback':
        return this.testHTMLAudio();
      case 'visual-feedback':
      case 'silent-mode':
        return true; // Always successful
      default:
        return false;
    }
  }

  /**
   * Test Web Audio API
   */
  private async testWebAudioAPI(): Promise<boolean> {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();

      // Create silent AudioBuffer for testing
      const buffer = context.createBuffer(1, 1, context.sampleRate);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();

      await context.close();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test HTML Audio element
   */
  private async testHTMLAudio(): Promise<boolean> {
    try {
      const audio = new Audio();
      audio.muted = true;
      audio.volume = 0;

      // Test using data URL
      audio.src =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUY7Tv5Z9NEAxPpuPwtmMcBjiS1/LNeSsFJHfJ8N6QQAoUYrPv5Z9NEAxPpuPwtmMcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxPpuPwtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPwtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiS1/LNeSsFJHfI8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiS1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPv5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N6QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEAxQpuPxtmQcBjiT1/LNeSsFJHfJ8N+QQAoUYrPu5Z9NEA=';

      return new Promise((resolve) => {
        audio.oncanplaythrough = () => resolve(true);
        audio.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 1000); // 1-second timeout
      });
    } catch {
      return false;
    }
  }

  /**
   * Execute audio playback fallback
   */
  public async playWithFallback(
    soundKey: SoundKey,
    options: { volume?: number } = {}
  ): Promise<void> {
    if (this.config.silentMode) return;

    let lastError: Error | null = null;

    for (let i = this.currentLevel; i < this.fallbackLevels.length; i++) {
      const level = this.fallbackLevels[i];
      if (!level) continue;

      try {
        await this.executePlayback(level.name, soundKey, options);
        return; // Exit if successful
      } catch (error) {
        lastError = error as Error;

        // Log error
        const audioError = new AudioError(
          `Fallback level '${level.name}' failed for ${soundKey}`,
          {
            action: 'audio_fallback',
            component: 'AudioFallbackManager',
            additionalData: { level: level.name, soundKey, error },
          },
          { recoverable: true, retryable: true }
        );
        handleError(audioError);

        // Auto-fallback to next level
        this.currentLevel = i + 1;

        if (this.config.fallbackDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.config.fallbackDelay));
        }
      }
    }

    // When all fallbacks fail
    if (lastError) {
      const finalError = new AudioError(
        `All fallback levels failed for ${soundKey}`,
        {
          action: 'audio_fallback_final',
          component: 'AudioFallbackManager',
          additionalData: { soundKey, lastError },
        },
        { recoverable: false, retryable: false }
      );
      handleError(finalError);
    }

    // Last resort: silent mode
    this.config.silentMode = true;
  }

  /**
   * Execute playback at specific level
   */
  private async executePlayback(
    levelName: string,
    soundKey: SoundKey,
    options: { volume?: number }
  ): Promise<void> {
    switch (levelName) {
      case 'web-audio-api':
        return this.playWithWebAudio(soundKey, options);
      case 'html-audio-element':
      case 'html-audio-fallback':
        return this.playWithHTMLAudio(soundKey, options);
      case 'visual-feedback':
        return this.playWithVisualFeedback(soundKey);
      case 'silent-mode':
        return; // Do nothing
      default:
        throw new Error(`Unknown fallback level: ${levelName}`);
    }
  }

  /**
   * Playback with Web Audio API
   */
  private async playWithWebAudio(soundKey: SoundKey, options: { volume?: number }): Promise<void> {
    // Check if AudioManager is available
    const { audioManager } = await import('./audioManager');
    if (options.volume !== undefined) {
      await audioManager.playSound(soundKey, { volume: options.volume });
    } else {
      await audioManager.playSound(soundKey);
    }
  }

  /**
   * Playback with HTMLAudioElement
   */
  private async playWithHTMLAudio(soundKey: SoundKey, options: { volume?: number }): Promise<void> {
    const levelKey = 'html-audio';

    if (!this.audioInstances.has(levelKey)) {
      this.audioInstances.set(levelKey, new Map());
    }

    const instances = this.audioInstances.get(levelKey)!;
    let audio = instances.get(soundKey) as HTMLAudioElement | undefined;

    if (!audio) {
      audio = new Audio();
      audio.src = `/sounds/${soundKey.replace(/([A-Z])/g, '-$1').toLowerCase()}.mp3`;
      audio.preload = 'auto';
      instances.set(soundKey, audio);
    }

    audio.volume = options.volume ?? 0.5;
    audio.currentTime = 0;

    await audio.play();
  }

  /**
   * Playback with visual feedback
   */
  private async playWithVisualFeedback(soundKey: SoundKey): Promise<void> {
    // Browser notification or console feedback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Audio: ${soundKey}`, {
        icon: '/icon-192x192.png',
        tag: 'tetris-audio',
        silent: true,
      });
    } else {
      log.info(`♪ Audio: ${soundKey}`, { component: 'AudioFallback' });
    }
  }

  /**
   * Get current fallback status
   */
  public getFallbackStatus(): {
    currentLevel: number;
    availableLevels: string[];
    capabilities: AudioCapabilities | null;
    silentMode: boolean;
  } {
    return {
      currentLevel: this.currentLevel,
      availableLevels: this.fallbackLevels.map((level) => level.name),
      capabilities: this.capabilities,
      silentMode: this.config.silentMode,
    };
  }

  /**
   * Update fallback configuration
   */
  public updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset fallback level
   */
  public resetFallback(): void {
    this.currentLevel = 0;
    this.config.silentMode = false;
  }

  /**
   * Memory cleanup
   */
  public dispose(): void {
    for (const instances of this.audioInstances.values()) {
      for (const audio of instances.values()) {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
          audio.src = '';
        }
      }
    }
    this.audioInstances.clear();
    this.fallbackCallbacks.clear();
  }
}

// Export singleton instance
export const audioFallbackManager = AudioFallbackManager.getInstance();

// Export convenient functions
export const playWithFallback = (soundKey: SoundKey, options?: { volume?: number }) =>
  audioFallbackManager.playWithFallback(soundKey, options);

export const getFallbackStatus = () => audioFallbackManager.getFallbackStatus();
export const resetAudioFallback = () => audioFallbackManager.resetFallback();
