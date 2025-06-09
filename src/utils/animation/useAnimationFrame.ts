/**
 * useAnimationFrame カスタムフック
 * 
 * AnimationManagerを活用した統一されたアニメーション管理フック
 * 従来の分散したrequestAnimationFrame使用を置き換える
 */

import { useEffect, useCallback, useRef } from 'react';
import { animationManager, AnimationOptions } from './animationManager';

/**
 * 統一されたアニメーションフックの設定オプション
 */
export interface UseAnimationOptions extends AnimationOptions {
  /** アニメーションの有効/無効 */
  enabled?: boolean;
  /** コンポーネントアンマウント時の自動クリーンアップ */
  autoCleanup?: boolean;
}

/**
 * requestAnimationFrameの統一管理フック
 * 
 * @param callback アニメーションコールバック関数
 * @param deps 依存配列
 * @param options アニメーションオプション
 * @returns アニメーション制御関数
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

  // オプションとコールバック参照の更新
  useEffect(() => {
    optionsRef.current = options;
    callbackRef.current = callback;
  }, [options, callback]);

  // アニメーション開始/停止の制御
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

  // 依存配列の変更時にアニメーション再開
  useEffect(() => {
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
    // ESLint警告を抑制（意図的な設計）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return {
    start: startAnimation,
    stop: stopAnimation,
    isRunning: !!animationIdRef.current
  };
}

/**
 * deltaTime ベースの更新が不要なシンプルなアニメーションフック
 * 
 * @param callback フレーム毎のコールバック
 * @param deps 依存配列
 * @param options アニメーションオプション
 */
export function useSimpleAnimation(
  callback: () => void,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  return useAnimationFrame(
    () => callback(),
    deps,
    options
  );
}

/**
 * 条件付きアニメーションフック
 * 
 * @param callback アニメーションコールバック
 * @param condition アニメーション実行条件
 * @param deps 依存配列
 * @param options アニメーションオプション
 */
export function useConditionalAnimation(
  callback: (deltaTime: number) => void,
  condition: boolean,
  deps: React.DependencyList,
  options: Omit<UseAnimationOptions, 'enabled'> = {}
) {
  return useAnimationFrame(
    callback,
    [condition, ...deps],
    { ...options, enabled: condition }
  );
}

/**
 * タイマーベースのアニメーションフック（setIntervalの代替）
 * 
 * @param callback 実行するコールバック
 * @param interval 実行間隔（ミリ秒）
 * @param deps 依存配列
 * @param options アニメーションオプション
 */
export function useTimerAnimation(
  callback: () => void,
  interval: number,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  const lastExecutionRef = useRef<number>(0);

  return useAnimationFrame(
    (currentTime) => {
      if (currentTime - lastExecutionRef.current >= interval) {
        callback();
        lastExecutionRef.current = currentTime;
      }
    },
    deps,
    options
  );
}

/**
 * パフォーマンス監視付きアニメーションフック
 * 
 * @param callback アニメーションコールバック
 * @param deps 依存配列
 * @param options アニメーションオプション
 * @returns アニメーション制御とパフォーマンス統計
 */
export function usePerformanceAnimation(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList,
  options: UseAnimationOptions = {}
) {
  const frameCountRef = useRef(0);
  const averageFrameTimeRef = useRef(0);

  const performanceCallback = useCallback((deltaTime: number) => {
    const startTime = performance.now();
    callback(deltaTime);
    const endTime = performance.now();
    
    const frameTime = endTime - startTime;
    frameCountRef.current++;
    
    // 移動平均でフレーム時間を計算
    averageFrameTimeRef.current = 
      (averageFrameTimeRef.current * 0.9) + (frameTime * 0.1);
  }, [callback]);

  const controls = useAnimationFrame(performanceCallback, deps, options);

  const getPerformanceStats = useCallback(() => ({
    frameCount: frameCountRef.current,
    averageFrameTime: averageFrameTimeRef.current,
    estimatedFPS: averageFrameTimeRef.current > 0 ? 1000 / averageFrameTimeRef.current : 0
  }), []);

  return {
    ...controls,
    getPerformanceStats
  };
}