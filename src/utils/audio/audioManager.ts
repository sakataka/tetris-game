/**
 * High-performance audio management system based on Web Audio API
 * Alternative to HTMLAudioElement with object pooling and concurrent playback support
 */

import { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';

type AudioBufferCache = {
  [K in SoundKey]?: AudioBuffer;
};

interface AudioContextState {
  context: AudioContext | null;
  gainNode: GainNode | null;
  initialized: boolean;
  suspended: boolean;
}

interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface ActiveSound {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  soundKey: SoundKey;
  startTime: number;
  duration: number;
}

class AudioManager {
  private static instance: AudioManager | null = null;

  private audioState: AudioContextState = {
    context: null,
    gainNode: null,
    initialized: false,
    suspended: false,
  };

  private audioBuffers: AudioBufferCache = {};
  private activeSounds: Map<string, ActiveSound> = new Map();
  private loadingPromises: Map<SoundKey, Promise<AudioBuffer>> = new Map();

  private masterVolume: number = 0.5;
  private isMuted: boolean = false;

  // Audio file path definitions
  private readonly soundFiles: Record<SoundKey, string> = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3',
  };

  private constructor() {
    this.initializeAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * AudioContext initialization with fallback support
   */
  private async initializeAudioContext(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Web Audio API compatibility check
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new AudioError(
          'Web Audio API is not supported',
          { action: 'audio_context_init', component: 'AudioManager' },
          { recoverable: false, retryable: false }
        );
      }

      this.audioState.context = new AudioContextClass();
      this.audioState.gainNode = this.audioState.context.createGain();
      this.audioState.gainNode.connect(this.audioState.context.destination);

      // Initial volume configuration
      this.updateMasterVolume();

      this.audioState.initialized = true;

      // Browser autoplay policy compliance
      if (this.audioState.context.state === 'suspended') {
        this.audioState.suspended = true;
        this.setupUserInteractionUnlock();
      }
    } catch (error) {
      const audioError = new AudioError(
        'Failed to initialize AudioContext',
        { action: 'audio_context_init', component: 'AudioManager', additionalData: { error } },
        { recoverable: false, retryable: false }
      );
      handleError(audioError);
    }
  }

  /**
   * Audio unlock via user interaction to comply with browser autoplay policies
   */
  private setupUserInteractionUnlock(): void {
    const unlockAudio = async () => {
      if (!this.audioState.context || this.audioState.context.state !== 'suspended') return;

      try {
        await this.audioState.context.resume();
        this.audioState.suspended = false;

        // Remove event listeners after successful unlock
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      } catch (error) {
        const audioError = new AudioError(
          'Failed to unlock audio context',
          { action: 'audio_unlock', component: 'AudioManager', additionalData: { error } },
          { recoverable: true, retryable: true }
        );
        handleError(audioError);
      }
    };

    // Attempt audio unlock on multiple user interaction events
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  }

  /**
   * Parallel preloading of audio files with error handling
   */
  public async preloadAllSounds(): Promise<void> {
    if (!this.audioState.context) {
      await this.initializeAudioContext();
    }

    const loadPromises = Object.entries(this.soundFiles).map(async ([key, path]) => {
      const soundKey = key as SoundKey;

      if (this.audioBuffers[soundKey]) return Promise.resolve(); // Already loaded
      if (this.loadingPromises.has(soundKey)) return this.loadingPromises.get(soundKey);

      const loadPromise = this.loadAudioBuffer(soundKey, path);
      this.loadingPromises.set(soundKey, loadPromise);

      try {
        const buffer = await loadPromise;
        this.audioBuffers[soundKey] = buffer;
      } catch {
        // Individual errors are handled inside loadAudioBuffer
      } finally {
        this.loadingPromises.delete(soundKey);
      }
      return Promise.resolve();
    });

    await Promise.allSettled(loadPromises);
  }

  /**
   * Individual audio file loading with HTTP error handling
   */
  private async loadAudioBuffer(soundKey: SoundKey, path: string): Promise<AudioBuffer> {
    if (!this.audioState.context) {
      throw new AudioError(
        'AudioContext not initialized',
        { action: 'audio_load', component: 'AudioManager', additionalData: { soundKey } },
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
          component: 'AudioManager',
          additionalData: { soundKey, path, error },
        },
        { recoverable: true, retryable: true }
      );
      handleError(audioError);
      throw audioError;
    }
  }

  /**
   * Main audio playback function with comprehensive error handling
   *
   * Note: High cognitive complexity is intentional as this function integrates
   * core audio system features: robust error handling, fallback mechanisms,
   * concurrent playback management. Each conditional branch handles specific
   * error states or browser limitations - splitting would reduce maintainability.
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async playSound(soundKey: SoundKey, config: Partial<SoundConfig> = {}): Promise<void> {
    if (this.isMuted || !this.audioState.context || !this.audioState.gainNode) return;

    // Warning only when AudioContext is suspended - user interaction required
    if (this.audioState.suspended) {
      const audioError = new AudioError(
        `Audio context suspended, requires user interaction: ${soundKey}`,
        { action: 'audio_play', component: 'AudioManager', additionalData: { soundKey } },
        {
          recoverable: true,
          retryable: true,
          userMessage: '音声を有効にするには画面をタップしてください',
        }
      );
      handleError(audioError);
      return;
    }

    // Auto-load audio buffer if not already loaded
    if (!this.audioBuffers[soundKey]) {
      if (!this.loadingPromises.has(soundKey)) {
        const loadPromise = this.loadAudioBuffer(soundKey, this.soundFiles[soundKey]);
        this.loadingPromises.set(soundKey, loadPromise);

        try {
          this.audioBuffers[soundKey] = await loadPromise;
        } catch {
          return; // Error already handled in loadAudioBuffer
        } finally {
          this.loadingPromises.delete(soundKey);
        }
      } else {
        // Wait if already loading
        try {
          this.audioBuffers[soundKey] = await this.loadingPromises.get(soundKey)!;
        } catch {
          return;
        }
      }
    }

    const audioBuffer = this.audioBuffers[soundKey];
    if (!audioBuffer) return;

    try {
      // Create AudioBufferSourceNode (single-use limitation of Web Audio API)
      const source = this.audioState.context.createBufferSource();
      source.buffer = audioBuffer;

      // Individual volume control GainNode
      const soundGainNode = this.audioState.context.createGain();
      const volume = config.volume ?? 1.0;
      soundGainNode.gain.value = volume;

      // Audio graph connection: source -> soundGain -> masterGain -> destination
      source.connect(soundGainNode);
      soundGainNode.connect(this.audioState.gainNode);

      // Loop configuration
      source.loop = config.loop ?? false;

      // Fade-in processing using AudioParam automation
      if (config.fadeIn && config.fadeIn > 0) {
        soundGainNode.gain.setValueAtTime(0, this.audioState.context.currentTime);
        soundGainNode.gain.linearRampToValueAtTime(
          volume,
          this.audioState.context.currentTime + config.fadeIn
        );
      }

      // Register as active sound for resource management
      const soundId = `${soundKey}-${Date.now()}-${Math.random()}`;
      const activeSound: ActiveSound = {
        source,
        gainNode: soundGainNode,
        soundKey,
        startTime: this.audioState.context.currentTime,
        duration: audioBuffer.duration,
      };

      this.activeSounds.set(soundId, activeSound);

      // Cleanup on playback completion
      source.onended = () => {
        this.activeSounds.delete(soundId);
      };

      // Fade-out processing using AudioParam automation
      if (config.fadeOut && config.fadeOut > 0 && !source.loop) {
        const fadeStartTime =
          this.audioState.context.currentTime + audioBuffer.duration - config.fadeOut;
        if (fadeStartTime > this.audioState.context.currentTime) {
          soundGainNode.gain.setValueAtTime(volume, fadeStartTime);
          soundGainNode.gain.linearRampToValueAtTime(0, fadeStartTime + config.fadeOut);
        }
      }

      // Start playback
      source.start(0);
    } catch (error) {
      const audioError = new AudioError(
        `Failed to play sound: ${soundKey}`,
        { action: 'audio_play', component: 'AudioManager', additionalData: { soundKey, error } },
        { recoverable: true, retryable: false }
      );
      handleError(audioError);
    }
  }

  /**
   * Stop specific sound type with active sound management
   */
  public stopSound(soundKey: SoundKey): void {
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

  /**
   * Stop all active sounds with cleanup
   */
  public stopAllSounds(): void {
    for (const [, activeSound] of this.activeSounds.entries()) {
      try {
        activeSound.source.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    this.activeSounds.clear();
  }

  /**
   * Master volume control with range clamping
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterVolume();
  }

  /**
   * Get current master volume
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute state control
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateMasterVolume();
  }

  /**
   * Get current mute state
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Apply master volume changes to audio graph
   */
  private updateMasterVolume(): void {
    if (this.audioState.gainNode) {
      const effectiveVolume = this.isMuted ? 0 : this.masterVolume;
      this.audioState.gainNode.gain.value = effectiveVolume;
    }
  }

  /**
   * Audio system state inspection for debugging and monitoring
   */
  public getAudioState(): {
    initialized: boolean;
    suspended: boolean;
    loadedSounds: SoundKey[];
    activeSounds: number;
    masterVolume: number;
    isMuted: boolean;
  } {
    return {
      initialized: this.audioState.initialized,
      suspended: this.audioState.suspended,
      loadedSounds: Object.keys(this.audioBuffers) as SoundKey[],
      activeSounds: this.activeSounds.size,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
    };
  }

  /**
   * Memory cleanup and resource disposal
   */
  public dispose(): void {
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

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// Export convenience functions
export const playSound = (soundKey: SoundKey, config?: Partial<SoundConfig>) =>
  audioManager.playSound(soundKey, config);

export const preloadSounds = () => audioManager.preloadAllSounds();
export const setMasterVolume = (volume: number) => audioManager.setMasterVolume(volume);
export const setMuted = (muted: boolean) => audioManager.setMuted(muted);
export const getMasterVolume = () => audioManager.getMasterVolume();
export const isMuted = () => audioManager.isMutedState();
export const getAudioState = () => audioManager.getAudioState();
export const stopSound = (soundKey: SoundKey) => audioManager.stopSound(soundKey);
export const stopAllSounds = () => audioManager.stopAllSounds();
