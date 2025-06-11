/**
 * Web Audio API implementation strategy
 * High-performance audio with object pooling and concurrent playback
 */

import type { SoundKey } from '../../../types/tetris';
import { AudioError, handleError } from '../../data/errorHandler';
import { AudioStrategy, type SoundConfig, type AudioState } from './AudioStrategy';

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
        throw new AudioError(
          'Web Audio API is not supported',
          { action: 'audio_context_init', component: 'WebAudioStrategy' },
          { recoverable: false, retryable: false }
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
      const audioError = new AudioError(
        'Failed to initialize AudioContext',
        { action: 'audio_context_init', component: 'WebAudioStrategy', additionalData: { error } },
        { recoverable: false, retryable: false }
      );
      handleError(audioError);
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
        const audioError = new AudioError(
          'Failed to unlock audio context',
          { action: 'audio_unlock', component: 'WebAudioStrategy', additionalData: { error } },
          { recoverable: true, retryable: true }
        );
        handleError(audioError);
      }
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  }

  async playSound(soundKey: SoundKey, config: Partial<SoundConfig> = {}): Promise<void> {
    if (this.isMuted || !this.audioState.context || !this.audioState.gainNode) return;

    if (this.audioState.suspended) {
      const audioError = new AudioError(
        `Audio context suspended, requires user interaction: ${soundKey}`,
        { action: 'audio_play', component: 'WebAudioStrategy', additionalData: { soundKey } },
        {
          recoverable: true,
          retryable: true,
          userMessage: 'Tap the screen to enable audio',
        }
      );
      handleError(audioError);
      return;
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
      const audioError = new AudioError(
        `Failed to play sound: ${soundKey}`,
        {
          action: 'audio_play',
          component: 'WebAudioStrategy',
          additionalData: { soundKey, error },
        },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);
    }
  }

  private async loadSoundBuffer(soundKey: SoundKey): Promise<void> {
    if (!this.audioState.context) {
      throw new AudioError(
        'AudioContext not initialized',
        { action: 'audio_load', component: 'WebAudioStrategy', additionalData: { soundKey } },
        { recoverable: true, retryable: true }
      );
    }

    if (this.loadingPromises.has(soundKey)) {
      try {
        this.audioBuffers[soundKey] = await this.loadingPromises.get(soundKey)!;
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
      throw new AudioError(
        'AudioContext not initialized',
        { action: 'audio_load', component: 'WebAudioStrategy', additionalData: { soundKey } },
        { recoverable: true, retryable: true }
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
      const audioError = new AudioError(
        `Failed to load audio file: ${soundKey}`,
        {
          action: 'audio_load',
          component: 'WebAudioStrategy',
          additionalData: { soundKey, path, error },
        },
        { recoverable: true, retryable: true }
      );
      handleError(audioError);
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
