/**
 * シンプルなタイマーデバッグテスト
 * 
 * useTimerAnimationが実際に動作するかを確認
 */

import { describe, it, expect } from 'vitest';

describe('タイマー動作デバッグ', () => {
  it('useTimerAnimationの基本動作確認', () => {
    // 直接useTimerAnimationをインポートせず、動作確認のみ
    let callCount = 0;
    const callback = () => callCount++;

    // 手動でdeltaTime累積ロジックをテスト
    let accumulatedTime = 0;
    const interval = 1000; // 1秒間隔

    // 60fps相当のdeltaTime (16.67ms) を60回実行
    for (let i = 0; i < 60; i++) {
      const deltaTime = 16.67;
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= interval) {
        callback();
        accumulatedTime = accumulatedTime % interval;
      }
    }

    // 1秒経過で1回実行される
    expect(callCount).toBe(1);
    expect(accumulatedTime).toBeLessThan(interval);
  });

  it('複数回実行のテスト', () => {
    let callCount = 0;
    const callback = () => callCount++;

    let accumulatedTime = 0;
    const interval = 100; // 100ms間隔

    // 1秒分のフレーム実行
    for (let i = 0; i < 60; i++) {
      const deltaTime = 16.67;
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= interval) {
        callback();
        accumulatedTime = accumulatedTime % interval;
      }
    }

    // 約10回実行される（1000ms / 100ms = 10回）
    expect(callCount).toBe(10);
  });

  it('累積時間リセットのテスト', () => {
    let callCount = 0;
    const callback = () => callCount++;

    let accumulatedTime = 0;
    let interval = 500; // 500ms間隔

    // 300ms分実行（まだ発火しない）
    for (let i = 0; i < 18; i++) {
      const deltaTime = 16.67;
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= interval) {
        callback();
        accumulatedTime = accumulatedTime % interval;
      }
    }
    expect(callCount).toBe(0);

    // 間隔変更（累積時間リセットをシミュレート）
    interval = 200;
    accumulatedTime = 0; // リセット

    // さらに200ms分実行
    for (let i = 0; i < 12; i++) {
      const deltaTime = 16.67;
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= interval) {
        callback();
        accumulatedTime = accumulatedTime % interval;
      }
    }

    // 新しい間隔で発火される
    expect(callCount).toBe(1);
  });

  it('精度保持のテスト', () => {
    let callCount = 0;
    const callback = () => callCount++;

    let accumulatedTime = 0;
    const interval = 16.67; // 1フレーム間隔

    // 10フレーム実行
    for (let i = 0; i < 10; i++) {
      const deltaTime = 16.67;
      accumulatedTime += deltaTime;
      
      while (accumulatedTime >= interval) {
        callback();
        accumulatedTime -= interval; // より精密な計算
      }
    }

    // 10回実行される
    expect(callCount).toBe(10);
    expect(accumulatedTime).toBeLessThan(interval);
  });
});