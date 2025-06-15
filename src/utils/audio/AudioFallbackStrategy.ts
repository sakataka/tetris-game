/**
 * Audio Fallback Strategies
 * 
 * Individual strategy implementations for different audio fallback levels.
 * Extracted from audioFallback.ts for better modularity.
 */

import type { SoundKey } from '../../types/tetris';
import { AudioError, handleError } from '../data/errorHandler';
import { log } from '../logging';

export interface FallbackLevel {
  name: string;
  available: boolean;
  priority: number; // 1-5, 5 is highest priority
  testResult?: boolean;
}

export abstract class AudioFallbackStrategy {
  protected name: string;
  protected priority: number;
  protected audioInstances: Map<SoundKey, HTMLAudioElement | AudioBuffer> = new Map();

  constructor(name: string, priority: number) {
    this.name = name;
    this.priority = priority;
  }

  abstract isAvailable(): Promise<boolean>;
  abstract test(): Promise<boolean>;
  abstract playSound(soundKey: SoundKey): Promise<void>;
  abstract preloadSounds(soundMap: Record<SoundKey, string>): Promise<void>;
  abstract cleanup(): void;

  getName(): string {
    return this.name;
  }

  getPriority(): number {
    return this.priority;
  }
}

/**
 * Web Audio API Strategy
 */
export class WebAudioStrategy extends AudioFallbackStrategy {
  private audioContext: AudioContext | null = null;

  constructor() {
    super('web-audio-api', 5);
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      
      if (!AudioContextClass) return false;

      // Test AudioContext creation
      const testContext = new AudioContextClass();
      await testContext.close();
      return true;
    } catch {
      return false;
    }
  }

  async test(): Promise<boolean> {
    try {
      await this.initializeContext();
      return this.audioContext !== null;
    } catch {
      return false;
    }
  }

  private async initializeContext(): Promise<void> {
    if (this.audioContext) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    this.audioContext = new AudioContextClass();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playSound(soundKey: SoundKey): Promise<void> {
    if (!this.audioContext) {
      await this.initializeContext();
    }

    const buffer = this.audioInstances.get(soundKey) as AudioBuffer;
    if (!buffer) {
      throw new AudioError(`Sound not preloaded: ${soundKey}`, 'SOUND_NOT_FOUND');
    }

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);
    source.start(0);
  }

  async preloadSounds(soundMap: Record<SoundKey, string>): Promise<void> {
    await this.initializeContext();
    
    const promises = Object.entries(soundMap).map(async ([soundKey, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.audioInstances.set(soundKey as SoundKey, audioBuffer);
      } catch (error) {
        log.warn(`Failed to preload sound ${soundKey}:`, error as Error);
      }
    });

    await Promise.all(promises);
  }

  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioInstances.clear();
  }
}

/**
 * HTML Audio Element Strategy
 */
export class HtmlAudioStrategy extends AudioFallbackStrategy {
  constructor() {
    super('html-audio-element', 4);
  }

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      const audio = new Audio();
      return audio.canPlayType('audio/mpeg') !== '';
    } catch {
      return false;
    }
  }

  async test(): Promise<boolean> {
    try {
      const audio = new Audio();
      return audio.canPlayType('audio/mpeg') !== '';
    } catch {
      return false;
    }
  }

  async playSound(soundKey: SoundKey): Promise<void> {
    const audio = this.audioInstances.get(soundKey) as HTMLAudioElement;
    if (!audio) {
      throw new AudioError(`Sound not preloaded: ${soundKey}`, 'SOUND_NOT_FOUND');
    }

    // Reset to beginning and play
    audio.currentTime = 0;
    await audio.play();
  }

  async preloadSounds(soundMap: Record<SoundKey, string>): Promise<void> {
    const promises = Object.entries(soundMap).map(async ([soundKey, url]) => {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        
        // Wait for load
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = reject;
          audio.load();
        });

        this.audioInstances.set(soundKey as SoundKey, audio);
      } catch (error) {
        log.warn(`Failed to preload sound ${soundKey}:`, error as Error);
      }
    });

    await Promise.all(promises);
  }

  cleanup(): void {
    for (const audio of this.audioInstances.values()) {
      const audioElement = audio as HTMLAudioElement;
      audioElement.pause();
      audioElement.src = '';
    }
    this.audioInstances.clear();
  }
}

/**
 * Visual Feedback Strategy
 */
export class VisualFeedbackStrategy extends AudioFallbackStrategy {
  private feedbackContainer: HTMLElement | null = null;

  constructor() {
    super('visual-feedback', 2);
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined';
  }

  async test(): Promise<boolean> {
    return true; // Always available in browser
  }

  async playSound(soundKey: SoundKey): Promise<void> {
    this.showVisualFeedback(soundKey);
  }

  async preloadSounds(): Promise<void> {
    this.initializeFeedbackContainer();
  }

  private initializeFeedbackContainer(): void {
    if (this.feedbackContainer) return;

    this.feedbackContainer = document.createElement('div');
    this.feedbackContainer.id = 'audio-visual-feedback';
    this.feedbackContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      pointer-events: none;
      font-family: monospace;
      font-size: 12px;
      opacity: 0.8;
    `;
    document.body.appendChild(this.feedbackContainer);
  }

  private showVisualFeedback(soundKey: SoundKey): void {
    if (!this.feedbackContainer) return;

    const feedback = document.createElement('div');
    feedback.textContent = `🔊 ${soundKey}`;
    feedback.style.cssText = `
      background: rgba(0, 255, 255, 0.2);
      border: 1px solid cyan;
      padding: 4px 8px;
      margin: 2px 0;
      border-radius: 4px;
      animation: fadeOut 2s forwards;
    `;

    this.feedbackContainer.appendChild(feedback);

    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 2000);
  }

  cleanup(): void {
    if (this.feedbackContainer && this.feedbackContainer.parentNode) {
      this.feedbackContainer.parentNode.removeChild(this.feedbackContainer);
      this.feedbackContainer = null;
    }
  }
}

/**
 * Silent Strategy (No-op)
 */
export class SilentStrategy extends AudioFallbackStrategy {
  constructor() {
    super('silent-mode', 1);
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async test(): Promise<boolean> {
    return true;
  }

  async playSound(): Promise<void> {
    // No-op: silent mode
  }

  async preloadSounds(): Promise<void> {
    // No-op: silent mode
  }

  cleanup(): void {
    // No-op: silent mode
  }
}