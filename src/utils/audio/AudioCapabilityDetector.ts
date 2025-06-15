/**
 * Audio Capability Detector
 *
 * Detects browser audio capabilities and autoplay policies.
 * Extracted from audioFallback.ts for better modularity.
 */

import { log } from '../logging';

export interface AudioCapabilities {
  webAudio: boolean;
  htmlAudio: boolean;
  audioContextSupport: boolean;
  mp3Support: boolean;
  codecs: string[];
  autoplayPolicy: 'allowed' | 'restricted' | 'blocked';
}

export class AudioCapabilityDetector {
  private static cachedCapabilities: AudioCapabilities | null = null;

  /**
   * Detect browser audio capabilities with caching
   */
  public static async detect(): Promise<AudioCapabilities> {
    if (AudioCapabilityDetector.cachedCapabilities) {
      return AudioCapabilityDetector.cachedCapabilities;
    }

    const capabilities: AudioCapabilities = {
      webAudio: false,
      htmlAudio: false,
      audioContextSupport: false,
      mp3Support: false,
      codecs: [],
      autoplayPolicy: 'blocked',
    };

    if (typeof window === 'undefined') {
      AudioCapabilityDetector.cachedCapabilities = capabilities;
      return capabilities;
    }

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

      // Test codec support
      const codecs = [
        { name: 'mp3', type: 'audio/mpeg' },
        { name: 'ogg', type: 'audio/ogg; codecs="vorbis"' },
        { name: 'wav', type: 'audio/wav' },
        { name: 'aac', type: 'audio/aac' },
        { name: 'webm', type: 'audio/webm; codecs="vorbis"' },
      ];

      for (const codec of codecs) {
        if (audio.canPlayType(codec.type) !== '') {
          capabilities.codecs.push(codec.name);
          if (codec.name === 'mp3') {
            capabilities.mp3Support = true;
          }
        }
      }
    } catch {
      capabilities.htmlAudio = false;
    }

    // Detect autoplay policy
    capabilities.autoplayPolicy = await AudioCapabilityDetector.detectAutoplayPolicy();

    log.info('Audio capabilities detected', capabilities);
    AudioCapabilityDetector.cachedCapabilities = capabilities;
    return capabilities;
  }

  /**
   * Detect browser autoplay policy
   */
  private static async detectAutoplayPolicy(): Promise<'allowed' | 'restricted' | 'blocked'> {
    if (typeof window === 'undefined') return 'blocked';

    try {
      // Test with a short silent audio clip
      const silentAudio = new Audio(
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAEBXAQACABAAZGF0YQAAAAA='
      );
      silentAudio.volume = 0.01; // Very quiet

      const playPromise = silentAudio.play();

      if (playPromise) {
        await playPromise;
        silentAudio.pause();
        return 'allowed';
      }

      return 'restricted';
    } catch (error) {
      // Check the error type to determine policy
      const errorMessage = (error as Error).message?.toLowerCase() || '';

      if (
        errorMessage.includes('interact') ||
        errorMessage.includes('gesture') ||
        errorMessage.includes('user activation')
      ) {
        return 'restricted';
      }

      return 'blocked';
    }
  }

  /**
   * Clear cached capabilities (for testing)
   */
  public static clearCache(): void {
    AudioCapabilityDetector.cachedCapabilities = null;
  }
}
