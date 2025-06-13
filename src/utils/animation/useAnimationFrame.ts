/**
 * useAnimationFrame custom hook
 *
 * Unified animation management hook leveraging AnimationManager
 * Replaces traditional scattered requestAnimationFrame usage
 */

import { useCallback, useEffect, useRef } from 'react';
import { type AnimationOptions, animationManager } from './animationManager';

/**
 * Configuration options for unified animation hook
 */
export interface UseAnimationOptions extends AnimationOptions {
  /** Enable/disable animation */
  enabled?: boolean;
  /** Automatic cleanup on component unmount */
  autoCleanup?: boolean;
}

/**
 * Unified requestAnimationFrame management hook
 *
 * @param callback Animation callback function
 * @param deps Dependency array
 * @param options Animation options
 * @returns Animation control functions
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  const optionsRef = useRef(options);
  const callbackRef = useRef(callback);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const animationIdRef = useRef<string | undefined>(undefined);

  // Update options and callback references
  useEffect(() => {
    optionsRef.current = options;
    callbackRef.current = callback;
  }, [options, callback]);

  // Animation start/stop control
  const startAnimation = useCallback(() => {
    const currentOptions = optionsRef.current;
    if (!(currentOptions.enabled ?? true)) return;

    const animationId = `animation-${Date.now()}-${Math.random()}`;
    animationIdRef.current = animationId;

    const animate = (currentTime: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = currentTime - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = currentTime;
    };

    animationManager.registerAnimation(animationId, animate, currentOptions);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationIdRef.current) {
      animationManager.unregisterAnimation(animationIdRef.current);
      animationIdRef.current = undefined;
      previousTimeRef.current = undefined;
    }
  }, []);

  // Restart animation when dependency array changes
  useEffect(() => {
    // Reset previous state when dependency array changes
    previousTimeRef.current = undefined;

    const currentOptions = optionsRef.current;
    if (currentOptions.enabled ?? true) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => {
      if (currentOptions.autoCleanup ?? true) {
        stopAnimation();
      }
    };
    // Complex expression in deps array is intentional for dynamic dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAnimation, stopAnimation, ...deps]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    start: startAnimation,
    stop: stopAnimation,
    isRunning: !!animationIdRef.current,
  };
}

/**
 * Simple animation hook that doesn't require deltaTime-based updates
 *
 * @param callback Per-frame callback
 * @param deps Dependency array
 * @param options Animation options
 */
export function useSimpleAnimation(
  callback: () => void,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  return useAnimationFrame(() => callback(), deps, options);
}

/**
 * Conditional animation hook
 *
 * @param callback Animation callback
 * @param condition Animation execution condition
 * @param deps Dependency array
 * @param options Animation options
 */
export function useConditionalAnimation(
  callback: (deltaTime: number) => void,
  condition: boolean,
  deps: React.DependencyList,
  options: Omit<UseAnimationOptions, 'enabled'> = {}
) {
  return useAnimationFrame(callback, [condition, ...deps], { ...options, enabled: condition });
}

/**
 * Timer-based animation hook (alternative to setInterval)
 *
 * @param callback Callback to execute
 * @param interval Execution interval (milliseconds)
 * @param deps Dependency array
 * @param options Animation options
 */
export function useTimerAnimation(
  callback: () => void,
  interval: number,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  const accumulatedTimeRef = useRef<number>(0);

  // Reset accumulated time when dependency array changes in useEffect
  useEffect(() => {
    accumulatedTimeRef.current = 0;
    // Complex expression in deps array is intentional for dynamic dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps]);

  return useAnimationFrame(
    (deltaTime) => {
      // Accumulate deltaTime
      accumulatedTimeRef.current += deltaTime;

      // Execute when interval time has elapsed
      if (accumulatedTimeRef.current >= interval) {
        callback();
        // Retain remaining time for next execution (improved accuracy)
        accumulatedTimeRef.current = accumulatedTimeRef.current % interval;
      }
    },
    deps,
    options
  );
}

/**
 * Animation hook with performance monitoring
 *
 * @param callback Animation callback
 * @param deps Dependency array
 * @param options Animation options
 * @returns Animation control and performance statistics
 */
export function usePerformanceAnimation(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  const frameCountRef = useRef(0);
  const averageFrameTimeRef = useRef(0);

  const performanceCallback = useCallback(
    (deltaTime: number) => {
      const startTime = performance.now();
      callback(deltaTime);
      const endTime = performance.now();

      const frameTime = endTime - startTime;
      frameCountRef.current++;

      // Calculate frame time using moving average
      averageFrameTimeRef.current = averageFrameTimeRef.current * 0.9 + frameTime * 0.1;
    },
    [callback]
  );

  const controls = useAnimationFrame(performanceCallback, deps, options);

  const getPerformanceStats = useCallback(
    () => ({
      frameCount: frameCountRef.current,
      averageFrameTime: averageFrameTimeRef.current,
      estimatedFPS: averageFrameTimeRef.current > 0 ? 1000 / averageFrameTimeRef.current : 0,
    }),
    []
  );

  return {
    ...controls,
    getPerformanceStats,
  };
}
