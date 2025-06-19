import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_VALUES } from '@/constants';
import { audioManager } from '@/utils/audio';
import { log } from '@/utils/logging/logger';

export type AudioStrategyType = 'webaudio' | 'htmlaudio' | 'silent';

interface AudioStrategyState {
  currentStrategy: AudioStrategyType;
  isWebAudioSupported: boolean;
  isInitialized: boolean;
  initializationError: Error | null;
}

interface UseAudioStrategyProps {
  useWebAudio?: boolean;
  onStrategyChange?: (strategy: AudioStrategyType) => void;
  onInitializationError?: (error: Error) => void;
}

interface AudioStrategyAPI {
  strategyState: AudioStrategyState;
  switchToStrategy: (strategy: AudioStrategyType) => Promise<boolean>;
  retryInitialization: () => Promise<void>;
  detectWebAudioSupport: () => boolean;
}

/**
 * Audio strategy selection and initialization management
 *
 * Handles:
 * - Web Audio API support detection
 * - Strategy selection (Web Audio → HTML Audio → Silent fallback)
 * - Strategy switching with retry mechanisms
 * - Initialization error handling
 */
export function useAudioStrategy({
  useWebAudio = true,
  onStrategyChange,
  onInitializationError,
}: UseAudioStrategyProps = {}): AudioStrategyAPI {
  // ===== Strategy State =====
  const [strategyState, setStrategyState] = useState<AudioStrategyState>({
    currentStrategy: 'silent',
    isWebAudioSupported: false,
    isInitialized: false,
    initializationError: null,
  });

  // ===== Refs =====
  const initializationAttempted = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = DEFAULT_VALUES.AUDIO.MAX_RETRIES;

  // ===== Strategy Detection =====

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

  // ===== Strategy Switching =====

  const switchToStrategy = useCallback(
    async (strategy: AudioStrategyType): Promise<boolean> => {
      log.audio(`Switching to ${strategy} strategy`, { action: 'switchToStrategy' });

      try {
        setStrategyState((prev) => ({
          ...prev,
          currentStrategy: strategy,
          initializationError: null,
        }));

        // Initialize audio manager with strategy-specific initialization
        await audioManager.initialize();
        const success = await audioManager.switchToStrategy(
          strategy === 'webaudio'
            ? 'WebAudioStrategy'
            : strategy === 'htmlaudio'
              ? 'HTMLAudioStrategy'
              : 'SilentStrategy'
        );

        if (success) {
          setStrategyState((prev) => ({
            ...prev,
            isInitialized: true,
            initializationError: null,
          }));
          onStrategyChange?.(strategy);
          retryCount.current = DEFAULT_VALUES.UI.RETRY_COUNT_INITIAL;
          log.audio(`Successfully switched to ${strategy} strategy`, {
            action: 'switchToStrategy',
          });
          return true;
        }

        throw new Error(`Failed to initialize ${strategy} strategy`);
      } catch (error) {
        const audioError = error instanceof Error ? error : new Error(String(error));
        log.audio(`Failed to switch to ${strategy} strategy: ${audioError.message}`, {
          action: 'switchToStrategy',
        });

        setStrategyState((prev) => ({
          ...prev,
          initializationError: audioError,
          isInitialized: false,
        }));

        onInitializationError?.(audioError);
        return false;
      }
    },
    [onStrategyChange, onInitializationError]
  );

  // Determine the best strategy with fallback chain
  const determineStrategy = useCallback(async (): Promise<void> => {
    const isWebAudioSupported = detectWebAudioSupport();

    setStrategyState((prev) => ({
      ...prev,
      isWebAudioSupported,
    }));

    // Strategy priority: Web Audio → HTML Audio → Silent
    if (useWebAudio && isWebAudioSupported) {
      const success = await switchToStrategy('webaudio');
      if (success) return;
    }

    // Fallback to HTML Audio
    const htmlSuccess = await switchToStrategy('htmlaudio');
    if (htmlSuccess) return;

    // Final fallback to Silent
    await switchToStrategy('silent');
  }, [useWebAudio, detectWebAudioSupport, switchToStrategy]);

  // Retry initialization
  const retryInitialization = useCallback(async (): Promise<void> => {
    if (retryCount.current >= maxRetries) {
      log.audio('Max retries reached, switching to silent mode', { action: 'retryInitialization' });
      await switchToStrategy('silent');
      return;
    }

    retryCount.current++;
    log.audio(`Retry attempt ${retryCount.current}/${maxRetries}`, {
      action: 'retryInitialization',
    });
    await determineStrategy();
  }, [determineStrategy, switchToStrategy, maxRetries]);

  // ===== Initialization Effect =====
  useEffect(() => {
    if (!initializationAttempted.current) {
      initializationAttempted.current = true;
      log.audio('Initializing audio strategy', { action: 'useAudioStrategy' });
      determineStrategy();
    }
  }, [determineStrategy]);

  // ===== API =====
  return {
    strategyState,
    switchToStrategy,
    retryInitialization,
    detectWebAudioSupport,
  };
}
