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

  // Test Web Audio API initialization
  const testWebAudioStrategy = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[AudioStrategy] Testing Web Audio strategy...');
      await audioManager.initialize();
      const webAudioState = audioManager.getAudioState();

      console.log('[AudioStrategy] Web Audio state:', webAudioState);

      if (!webAudioState.initialized) {
        throw new Error('Web Audio initialization failed');
      }
      console.log('[AudioStrategy] Web Audio strategy test successful');
      return true;
    } catch (webAudioError) {
      console.warn(
        '[AudioStrategy] Web Audio initialization failed, falling back to HTML Audio:',
        webAudioError
      );
      return false;
    }
  }, []);

  // Test HTML Audio capability
  const testHtmlAudioStrategy = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[AudioStrategy] Testing HTML Audio strategy...');
      const testAudio = new Audio();
      testAudio.volume = 0;
      testAudio.muted = true;

      const canPlay = testAudio.canPlayType('audio/mpeg');
      console.log('[AudioStrategy] HTML Audio MP3 support:', canPlay);

      if (!canPlay) {
        throw new Error('HTML Audio MP3 support not available');
      }
      console.log('[AudioStrategy] HTML Audio strategy test successful');
      return true;
    } catch (htmlAudioError) {
      console.warn(
        '[AudioStrategy] HTML Audio test failed, falling back to silent mode:',
        htmlAudioError
      );
      return false;
    }
  }, []);

  // Initialize audio strategy
  const initializeStrategy = useCallback(
    async (strategy: AudioStrategyType = preferredStrategy, forceRetry: boolean = false) => {
      // Allow retry if explicitly requested or if previous initialization failed
      if (
        initializationAttempted.current &&
        !forceRetry &&
        strategyState.isInitialized &&
        !strategyState.initializationError
      ) {
        return;
      }

      // Reset initialization flag if retrying or if there was an error
      if (forceRetry || strategyState.initializationError) {
        initializationAttempted.current = false;
      }

      setStrategyState((prev) => ({
        ...prev,
        isInitialized: false,
        initializationError: null,
      }));

      try {
        console.log(
          `[AudioStrategy] Initializing audio strategy: ${strategy}, forceRetry: ${forceRetry}`
        );

        const webAudioSupported = enableWebAudio && detectWebAudioSupport();
        console.log(
          `[AudioStrategy] Web Audio supported: ${webAudioSupported}, enableWebAudio: ${enableWebAudio}`
        );

        let finalStrategy: AudioStrategyType = strategy;

        // Strategy selection and testing
        if (strategy === 'webaudio' && !webAudioSupported) {
          console.log('[AudioStrategy] Web Audio not supported, falling back to HTML Audio');
          finalStrategy = 'htmlaudio';
        }

        if (finalStrategy === 'webaudio') {
          console.log('[AudioStrategy] Testing Web Audio strategy');
          const webAudioWorking = await testWebAudioStrategy();
          if (!webAudioWorking) {
            console.log('[AudioStrategy] Web Audio failed, falling back to HTML Audio');
            finalStrategy = 'htmlaudio';
          }
        }

        if (finalStrategy === 'htmlaudio') {
          console.log('[AudioStrategy] Testing HTML Audio strategy');
          const htmlAudioWorking = await testHtmlAudioStrategy();
          if (!htmlAudioWorking) {
            console.log('[AudioStrategy] HTML Audio failed, falling back to silent mode');
            finalStrategy = 'silent';
          }
        }

        initializationAttempted.current = true;

        console.log(`[AudioStrategy] Initialization complete. Final strategy: ${finalStrategy}`);

        setStrategyState({
          currentStrategy: finalStrategy,
          isWebAudioSupported: webAudioSupported,
          isInitialized: true,
          initializationError: null,
        });
      } catch (error) {
        // Don't mark as attempted if initialization failed, allow retry
        initializationAttempted.current = false;

        console.error('[AudioStrategy] Critical initialization error:', error);

        setStrategyState({
          currentStrategy: 'silent',
          isWebAudioSupported: false,
          isInitialized: true,
          initializationError:
            error instanceof Error ? error : new Error('Unknown audio initialization error'),
        });
      }
    },
    [
      preferredStrategy,
      enableWebAudio,
      detectWebAudioSupport,
      strategyState.isInitialized,
      strategyState.initializationError,
      testWebAudioStrategy,
      testHtmlAudioStrategy,
    ]
  );

  // Switch to a different strategy
  const switchStrategy = useCallback(
    async (newStrategy: AudioStrategyType) => {
      initializationAttempted.current = false;
      await initializeStrategy(newStrategy, true);
    },
    [initializeStrategy]
  );

  // Retry current strategy initialization
  const retryInitialization = useCallback(async () => {
    const currentStrategy = strategyState.currentStrategy;
    initializationAttempted.current = false;
    await initializeStrategy(currentStrategy, true);
  }, [initializeStrategy, strategyState.currentStrategy]);

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
    retryInitialization,

    // Strategy information
    getStrategyCapabilities,

    // Convenience getters
    isWebAudioActive: strategyState.currentStrategy === 'webaudio',
    isHtmlAudioActive: strategyState.currentStrategy === 'htmlaudio',
    isSilentMode: strategyState.currentStrategy === 'silent',

    // Debug information
    hasInitializationError: strategyState.initializationError !== null,
    canRetry: !strategyState.isInitialized || strategyState.initializationError !== null,
  };
}
