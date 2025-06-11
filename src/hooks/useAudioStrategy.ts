import { useState, useRef, useCallback } from 'react';
import { audioManager } from '../utils/audio';

export type AudioStrategyType = 'webaudio' | 'htmlaudio' | 'silent';

interface UseAudioStrategyProps {
  preferredStrategy?: AudioStrategyType;
  enableWebAudio?: boolean;
}

interface AudioStrategyState {
  currentStrategy: AudioStrategyType;
  isWebAudioSupported: boolean;
  isInitialized: boolean;
  initializationError: Error | null;
}

/**
 * Audio strategy selection and switching logic
 *
 * Handles the detection and switching between different audio strategies:
 * - Web Audio API (preferred)
 * - HTML Audio Element (fallback)
 * - Silent mode (final fallback)
 */
export function useAudioStrategy({
  preferredStrategy = 'webaudio',
  enableWebAudio = true,
}: UseAudioStrategyProps = {}) {
  const [strategyState, setStrategyState] = useState<AudioStrategyState>({
    currentStrategy: 'silent',
    isWebAudioSupported: false,
    isInitialized: false,
    initializationError: null,
  });

  const initializationAttempted = useRef(false);

  // Detect Web Audio API support
  const detectWebAudioSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext;
      return !!AudioContext;
    } catch {
      return false;
    }
  }, []);

  // Initialize audio strategy
  const initializeStrategy = useCallback(
    async (strategy: AudioStrategyType = preferredStrategy) => {
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      setStrategyState((prev) => ({
        ...prev,
        isInitialized: false,
        initializationError: null,
      }));

      try {
        const webAudioSupported = enableWebAudio && detectWebAudioSupport();

        let finalStrategy: AudioStrategyType = strategy;

        // Strategy selection logic
        if (strategy === 'webaudio' && !webAudioSupported) {
          finalStrategy = 'htmlaudio';
        }

        // Test Web Audio API initialization if selected
        if (finalStrategy === 'webaudio') {
          try {
            // Test if audioManager can initialize Web Audio
            const webAudioState = audioManager.getAudioState();
            if (webAudioState.loadedSounds.length === 0) {
              // Need to initialize, but don't preload here
              // That's handled by useAudioPreloader
            }
          } catch {
            // Web Audio failed, fallback to HTML Audio
            finalStrategy = 'htmlaudio';
          }
        }

        setStrategyState({
          currentStrategy: finalStrategy,
          isWebAudioSupported: webAudioSupported,
          isInitialized: true,
          initializationError: null,
        });
      } catch (error) {
        // Final fallback to silent mode
        setStrategyState({
          currentStrategy: 'silent',
          isWebAudioSupported: false,
          isInitialized: true,
          initializationError:
            error instanceof Error ? error : new Error('Unknown audio initialization error'),
        });
      }
    },
    [preferredStrategy, enableWebAudio, detectWebAudioSupport]
  );

  // Switch to a different strategy
  const switchStrategy = useCallback(
    async (newStrategy: AudioStrategyType) => {
      initializationAttempted.current = false;
      await initializeStrategy(newStrategy);
    },
    [initializeStrategy]
  );

  // Get current strategy capabilities
  const getStrategyCapabilities = useCallback(() => {
    const { currentStrategy, isWebAudioSupported } = strategyState;

    return {
      canPlayAudio: currentStrategy !== 'silent',
      hasVolumeControl: currentStrategy !== 'silent',
      hasAdvancedFeatures: currentStrategy === 'webaudio',
      supportsFallback: isWebAudioSupported && currentStrategy === 'htmlaudio',
    };
  }, [strategyState]);

  // Reset strategy state
  const resetStrategy = useCallback(() => {
    initializationAttempted.current = false;
    setStrategyState({
      currentStrategy: 'silent',
      isWebAudioSupported: false,
      isInitialized: false,
      initializationError: null,
    });
  }, []);

  return {
    // Strategy state
    ...strategyState,

    // Strategy control
    initializeStrategy,
    switchStrategy,
    resetStrategy,

    // Strategy information
    getStrategyCapabilities,

    // Convenience getters
    isWebAudioActive: strategyState.currentStrategy === 'webaudio',
    isHtmlAudioActive: strategyState.currentStrategy === 'htmlaudio',
    isSilentMode: strategyState.currentStrategy === 'silent',
  };
}
