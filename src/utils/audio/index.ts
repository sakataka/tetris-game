/**
 * Audio system utilities
 *
 * Strategy Pattern based audio management with automatic fallback
 */

export * from './audioManager';
export * from './audioPreloader';

// Legacy fallback system
export * from './audioFallback';

// Modern fallback system (Phase 3)
export { AudioCapabilityDetector } from './AudioCapabilityDetector';
export {
  AudioFallbackStrategy,
  WebAudioStrategy,
  HtmlAudioStrategy,
  VisualFeedbackStrategy,
  SilentStrategy,
} from './AudioFallbackStrategy';
export { AudioFallbackManager } from './AudioFallbackManagerV2';

// Legacy strategies export (keep for compatibility)
export * from './strategies';
