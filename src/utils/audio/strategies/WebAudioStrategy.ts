/**
 * Web Audio API implementation strategy
 * High-performance audio with object pooling and concurrent playback
 */

import { createAudioError } from '../../../types/errors';
import type { SoundKey } from '../../../types/tetris';
import { log } from '../../logging/logger';
import { type AudioState, AudioStrategy, type SoundConfig } from './AudioStrategy';

interface AudioContextState {
  context: AudioContext | null;
  gainNode: GainNode | null;
  initialized: boolean;
  suspended: boolean;
}

interface ActiveSound {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  soundKey: SoundKey;
  startTime: number;
  duration: number;
}

type AudioBufferCache = {
  [K in SoundKey]?: AudioBuffer;
};

export class WebAudioStrategy extends AudioStrategy {
  private audioState: AudioContextState = {
    context: null,
    gainNode: null,
    initialized: false,
    suspended: false,
  };

  private audioBuffers: AudioBufferCache = {};
  private activeSounds: Map<string, ActiveSound> = new Map();
  private loadingPromises: Map<SoundKey, Promise<AudioBuffer>> = new Map();

  canPlayAudio(): boolean {
    if (typeof window === 'undefined') return false;

    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    return !!AudioContextClass;
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        throw createAudioError(
          'Web Audio API is not supported',
          {
            component: 'WebAudioStrategy',
            metadata: { operation: 'audio_context_init' },
          },
          undefined // No user message for audio errors (they're suppressed)
        );
      }

      this.audioState.context = new AudioContextClass();
      this.audioState.gainNode = this.audioState.context.createGain();
      this.audioState.gainNode.connect(this.audioState.context.destination);

      this.updateVolume();
      this.audioState.initialized = true;

      // Handle browser autoplay policy
      if (this.audioState.context.state === 'suspended') {
        this.audioState.suspended = true;
        this.setupUserInteractionUnlock();
      }
    } catch (error) {
      const audioError = createAudioError(
        'Failed to initialize AudioContext',
        {
          component: 'WebAudioStrategy',
          metadata: { error, operation: 'audio_context_init' },
        },
        undefined // No user message for audio errors (they're suppressed)
      );
      log.warn('AudioContext initialization failed', {
        component: 'WebAudioStrategy',
        action: 'audio_context_init',
        metadata: { audioError },
      });
      throw audioError;
    }
  }

  private setupUserInteractionUnlock(): void {
    const unlockAudio = async () => {
      if (!this.audioState.context || this.audioState.context.state !== 'suspended') return;

      try {
        await this.audioState.context.resume();
        this.audioState.suspended = false;

        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      } catch (error) {
        const audioError = createAudioError(
          'Failed to unlock audio context',
          {
            component: 'WebAudioStrategy',
            metadata: { error, operation: 'audio_unlock' },
          },
          undefined // No user message for audio errors (they're suppressed)
        );
        log.warn('Audio unlock failed', {
          component: 'WebAudioStrategy',
          action: 'audio_unlock',
          metadata: { audioError },
        });
      }
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  }

  async playSound(soundKey: SoundKey, config: Partial<SoundConfig> = {}): Promise<void> {
    if (this.isMuted || !this.audioState.context || !this.audioState.gainNode) return;

    if (this.audioState.suspended) {
      log.audio(
        `Audio context suspended, requires user interaction for: ${soundKey}. Trying to resume...`
      );
      try {
        await this.audioState.context.resume();
        this.audioState.suspended = this.audioState.context.state === 'suspended';
        log.audio(`Audio context resume attempt: ${this.audioState.context.state}`);

        if (this.audioState.suspended) {
          log.audio('Audio context still suspended after resume attempt');
          return;
        }
      } catch (error) {
        log.audio(`Failed to resume audio context: ${error}`);
        return;
      }
    }

    // Load audio buffer if needed
    if (!this.audioBuffers[soundKey]) {
      await this.loadSoundBuffer(soundKey);
    }

    const audioBuffer = this.audioBuffers[soundKey];
    if (!audioBuffer) return;

    try {
      const source = this.audioState.context.createBufferSource();
      source.buffer = audioBuffer;

      const soundGainNode = this.audioState.context.createGain();
      const volume = config.volume ?? 1.0;
      soundGainNode.gain.value = volume;

      source.connect(soundGainNode);
      soundGainNode.connect(this.audioState.gainNode);

      source.loop = config.loop ?? false;

      // Fade-in processing
      if (config.fadeIn && config.fadeIn > 0) {
        soundGainNode.gain.setValueAtTime(0, this.audioState.context.currentTime);
        soundGainNode.gain.linearRampToValueAtTime(
          volume,
          this.audioState.context.currentTime + config.fadeIn
        );
      }

      // Register active sound
      const soundId = `${soundKey}-${Date.now()}-${Math.random()}`;
      const activeSound: ActiveSound = {
        source,
        gainNode: soundGainNode,
        soundKey,
        startTime: this.audioState.context.currentTime,
        duration: audioBuffer.duration,
      };

      this.activeSounds.set(soundId, activeSound);

      source.onended = () => {
        this.activeSounds.delete(soundId);
      };

      // Fade-out processing
      if (config.fadeOut && config.fadeOut > 0 && !source.loop) {
        const fadeStartTime =
          this.audioState.context.currentTime + audioBuffer.duration - config.fadeOut;
        if (fadeStartTime > this.audioState.context.currentTime) {
          soundGainNode.gain.setValueAtTime(volume, fadeStartTime);
          soundGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + config.fadeOut);
        }
      }

      source.start(0);
    } catch (error) {
      const audioError = createAudioError(
        `Failed to play sound: ${soundKey}`,
        {
          component: 'WebAudioStrategy',
          metadata: { soundKey, error, operation: 'audio_play' },
        },
        undefined // No user message for audio errors (they're suppressed)
      );
      log.warn('Sound playback failed', {
        component: 'WebAudioStrategy',
        action: 'audio_play',
        metadata: { audioError },
      });
    }
  }

  private async loadSoundBuffer(soundKey: SoundKey): Promise<void> {
    if (!this.audioState.context) {
      throw createAudioError(
        'AudioContext not initialized',
        {
          component: 'WebAudioStrategy',
          metadata: { soundKey, operation: 'audio_load' },
        },
        undefined // No user message for audio errors (they're suppressed)
      );
    }

    if (this.loadingPromises.has(soundKey)) {
      try {
        const loadingPromise = this.loadingPromises.get(soundKey);
        if (loadingPromise) {
          this.audioBuffers[soundKey] = await loadingPromise;
        }
      } catch {
        // Error already handled
      }
      return;
    }

    const loadPromise = this.loadAudioBuffer(soundKey, this.soundFiles[soundKey]);
    this.loadingPromises.set(soundKey, loadPromise);

    try {
      this.audioBuffers[soundKey] = await loadPromise;
    } catch {
      // Error already handled in loadAudioBuffer
    } finally {
      this.loadingPromises.delete(soundKey);
    }
  }

  private async loadAudioBuffer(soundKey: SoundKey, path: string): Promise<AudioBuffer> {
    if (!this.audioState.context) {
      throw createAudioError(
        'AudioContext not initialized',
        {
          component: 'WebAudioStrategy',
          metadata: { soundKey, operation: 'audio_load' },
        },
        undefined // No user message for audio errors (they're suppressed)
      );
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return await this.audioState.context.decodeAudioData(arrayBuffer);
    } catch (error) {
      const audioError = createAudioError(
        `Failed to load audio file: ${soundKey}`,
        {
          component: 'WebAudioStrategy',
          metadata: { soundKey, path, error, operation: 'audio_load' },
        },
        undefined // No user message for audio errors (they're suppressed)
      );
      log.warn('Audio file loading failed', {
        component: 'WebAudioStrategy',
        action: 'audio_load',
        metadata: { audioError },
      });
      throw audioError;
    }
  }

  stopSound(soundKey: SoundKey): void {
    for (const [soundId, activeSound] of this.activeSounds.entries()) {
      if (activeSound.soundKey === soundKey) {
        try {
          activeSound.source.stop();
          this.activeSounds.delete(soundId);
        } catch {
          // Ignore if already stopped
        }
      }
    }
  }

  stopAllSounds(): void {
    for (const [, activeSound] of this.activeSounds.entries()) {
      try {
        activeSound.source.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    this.activeSounds.clear();
  }

  async preloadSounds(): Promise<void> {
    if (!this.audioState.context) {
      await this.initialize();
    }

    const loadPromises = Object.entries(this.soundFiles).map(async ([key]) => {
      const soundKey = key as SoundKey;
      if (this.audioBuffers[soundKey]) return;

      try {
        await this.loadSoundBuffer(soundKey);
      } catch {
        // Individual errors are handled in loadSoundBuffer
      }
    });

    await Promise.allSettled(loadPromises);
  }

  protected updateVolume(): void {
    if (this.audioState.gainNode) {
      this.audioState.gainNode.gain.value = this.getEffectiveVolume();
    }
  }

  getAudioState(): AudioState {
    return {
      initialized: this.audioState.initialized,
      suspended: this.audioState.suspended,
      loadedSounds: Object.keys(this.audioBuffers) as SoundKey[],
      activeSounds: this.activeSounds.size,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
      strategyType: 'WebAudio',
    };
  }

  dispose(): void {
    this.stopAllSounds();

    if (this.audioState.context) {
      this.audioState.context.close();
    }

    this.audioBuffers = {};
    this.loadingPromises.clear();
    this.audioState = {
      context: null,
      gainNode: null,
      initialized: false,
      suspended: false,
    };
  }
}
