/**
 * HTML Audio Element fallback strategy
 * Cross-browser compatible audio implementation
 */

import type { SoundKey } from '../../../types/tetris';
import { AudioError, handleError } from '../../data/errorHandler';
import { AudioStrategy, type SoundConfig, type AudioState } from './AudioStrategy';

interface HTMLAudioElement extends globalThis.HTMLAudioElement {
  volume: number;
  muted: boolean;
}

interface ActiveHTMLSound {
  audio: HTMLAudioElement;
  soundKey: SoundKey;
  startTime: number;
}

export class HTMLAudioStrategy extends AudioStrategy {
  private audioElements: Map<SoundKey, HTMLAudioElement[]> = new Map();
  private activeSounds: Map<string, ActiveHTMLSound> = new Map();
  private loadedSounds: Set<SoundKey> = new Set();
  private initialized: boolean = false;

  canPlayAudio(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof Audio !== 'undefined';
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if (!this.canPlayAudio()) {
        throw new AudioError(
          'HTML Audio is not supported',
          { action: 'html_audio_init', component: 'HTMLAudioStrategy' },
          { recoverable: false, retryable: false }
        );
      }

      this.initialized = true;
    } catch (error) {
      const audioError = new AudioError(
        'Failed to initialize HTML Audio',
        { action: 'html_audio_init', component: 'HTMLAudioStrategy', additionalData: { error } },
        { recoverable: false, retryable: false }
      );
      handleError(audioError);
      throw audioError;
    }
  }

  async playSound(soundKey: SoundKey, config: Partial<SoundConfig> = {}): Promise<void> {
    if (this.isMuted || !this.initialized) return;

    try {
      // Get or create audio element
      const audio = await this.getAvailableAudioElement(soundKey);
      if (!audio) return;

      // Configure audio
      audio.volume = this.getEffectiveVolume() * (config.volume ?? 1.0);
      audio.loop = config.loop ?? false;
      audio.currentTime = 0;

      // Register as active sound
      const soundId = `${soundKey}-${Date.now()}-${Math.random()}`;
      const activeSound: ActiveHTMLSound = {
        audio,
        soundKey,
        startTime: Date.now(),
      };

      this.activeSounds.set(soundId, activeSound);

      // Handle playback end
      const onEnded = () => {
        this.activeSounds.delete(soundId);
        audio.removeEventListener('ended', onEnded);
      };

      audio.addEventListener('ended', onEnded);

      // Play audio
      await audio.play();
    } catch (error) {
      const audioError = new AudioError(
        `Failed to play HTML audio: ${soundKey}`,
        {
          action: 'html_audio_play',
          component: 'HTMLAudioStrategy',
          additionalData: { soundKey, error },
        },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);
    }
  }

  private async getAvailableAudioElement(soundKey: SoundKey): Promise<HTMLAudioElement | null> {
    const elements = this.audioElements.get(soundKey) || [];

    // Find available (not playing) element
    for (const element of elements) {
      if (element.paused || element.ended) {
        return element;
      }
    }

    // Create new element if needed (up to 3 concurrent sounds per type)
    if (elements.length < 3) {
      try {
        const newElement = await this.createAudioElement(soundKey);
        if (newElement) {
          elements.push(newElement);
          this.audioElements.set(soundKey, elements);
          return newElement;
        }
      } catch (error) {
        const audioError = new AudioError(
          `Failed to create audio element: ${soundKey}`,
          {
            action: 'html_audio_create',
            component: 'HTMLAudioStrategy',
            additionalData: { soundKey, error },
          },
          { recoverable: true, retryable: false }
        );
        handleError(audioError);
      }
    }

    return null; // All elements busy or creation failed
  }

  private async createAudioElement(soundKey: SoundKey): Promise<HTMLAudioElement | null> {
    try {
      const audio = new Audio(this.soundFiles[soundKey]) as HTMLAudioElement;

      // Set initial properties
      audio.volume = this.getEffectiveVolume();
      audio.preload = 'auto';

      // Wait for loadeddata event
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 10000); // 10 second timeout

        audio.addEventListener(
          'loadeddata',
          () => {
            clearTimeout(timeout);
            this.loadedSounds.add(soundKey);
            resolve(audio);
          },
          { once: true }
        );

        audio.addEventListener(
          'error',
          () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load audio: ${soundKey}`));
          },
          { once: true }
        );

        // Start loading
        audio.load();
      });
    } catch (error) {
      const audioError = new AudioError(
        `Failed to create audio element: ${soundKey}`,
        {
          action: 'html_audio_create',
          component: 'HTMLAudioStrategy',
          additionalData: { soundKey, error },
        },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);
      return null;
    }
  }

  stopSound(soundKey: SoundKey): void {
    for (const [soundId, activeSound] of this.activeSounds.entries()) {
      if (activeSound.soundKey === soundKey) {
        try {
          activeSound.audio.pause();
          activeSound.audio.currentTime = 0;
          this.activeSounds.delete(soundId);
        } catch {
          // Ignore errors when stopping
        }
      }
    }
  }

  stopAllSounds(): void {
    for (const [soundId, activeSound] of this.activeSounds.entries()) {
      try {
        activeSound.audio.pause();
        activeSound.audio.currentTime = 0;
        this.activeSounds.delete(soundId);
      } catch {
        // Ignore errors when stopping
      }
    }
  }

  async preloadSounds(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const loadPromises = Object.keys(this.soundFiles).map(async (key) => {
      const soundKey = key as SoundKey;
      if (this.loadedSounds.has(soundKey)) return;

      try {
        await this.createAudioElement(soundKey);
      } catch {
        // Individual errors are handled in createAudioElement
      }
    });

    await Promise.allSettled(loadPromises);
  }

  protected updateVolume(): void {
    const effectiveVolume = this.getEffectiveVolume();

    // Update all audio elements
    for (const elements of this.audioElements.values()) {
      for (const audio of elements) {
        try {
          audio.volume = effectiveVolume;
        } catch {
          // Ignore volume setting errors
        }
      }
    }
  }

  getAudioState(): AudioState {
    return {
      initialized: this.initialized,
      suspended: false, // HTML Audio doesn't have suspended state
      loadedSounds: Array.from(this.loadedSounds),
      activeSounds: this.activeSounds.size,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
      strategyType: 'HTMLAudio',
    };
  }

  dispose(): void {
    this.stopAllSounds();

    // Remove all audio elements
    for (const elements of this.audioElements.values()) {
      for (const audio of elements) {
        try {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    this.audioElements.clear();
    this.loadedSounds.clear();
    this.initialized = false;
  }
}
