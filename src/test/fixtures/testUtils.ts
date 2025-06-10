/**
 * 共通テストユーティリティ関数
 *
 * テスト間で再利用可能なヘルパー関数とアサーション
 */

import { expect } from 'vitest';
import type { HighScore, GameStatistics } from '../../types/tetris';

// ===== アサーションヘルパー =====

/**
 * ハイスコアオブジェクトの構造検証
 */
export const expectValidHighScore = (highScore: unknown) => {
  expect(highScore).toMatchObject({
    id: expect.any(String),
    score: expect.any(Number),
    level: expect.any(Number),
    lines: expect.any(Number),
    date: expect.any(Number),
  });

  const score = highScore as HighScore;
  expect(score.score).toBeGreaterThanOrEqual(0);
  expect(score.level).toBeGreaterThanOrEqual(1);
  expect(score.lines).toBeGreaterThanOrEqual(0);
  expect(score.date).toBeGreaterThan(0);
};

/**
 * 統計オブジェクトの構造検証
 */
export const expectValidStatistics = (statistics: unknown) => {
  expect(statistics).toMatchObject({
    totalGames: expect.any(Number),
    totalScore: expect.any(Number),
    totalLines: expect.any(Number),
    playTime: expect.any(Number),
    bestScore: expect.any(Number),
    averageScore: expect.any(Number),
    bestStreak: expect.any(Number),
    tetrisCount: expect.any(Number),
  });

  const stats = statistics as GameStatistics;
  expect(stats.totalGames).toBeGreaterThanOrEqual(0);
  expect(stats.totalScore).toBeGreaterThanOrEqual(0);
  expect(stats.totalLines).toBeGreaterThanOrEqual(0);
  expect(stats.playTime).toBeGreaterThanOrEqual(0);
  expect(stats.bestScore).toBeGreaterThanOrEqual(0);
  expect(stats.averageScore).toBeGreaterThanOrEqual(0);
  expect(stats.bestStreak).toBeGreaterThanOrEqual(0);
  expect(stats.tetrisCount).toBeGreaterThanOrEqual(0);
};

/**
 * テーマ設定の構造検証
 */
export const expectValidThemeConfig = (theme: unknown) => {
  expect(theme).toMatchObject({
    variant: expect.any(String),
    colors: expect.objectContaining({
      primary: expect.any(String),
      secondary: expect.any(String),
      accent: expect.any(String),
      background: expect.any(String),
    }),
    animations: expect.objectContaining({
      enabled: expect.any(Boolean),
      intensity: expect.stringMatching(/^(none|reduced|normal|enhanced)$/),
    }),
    accessibility: expect.objectContaining({
      colorBlindness: expect.stringMatching(/^(none|protanopia|deuteranopia|tritanopia)$/),
      contrast: expect.stringMatching(/^(low|normal|high)$/),
      reducedMotion: expect.any(Boolean),
    }),
  });
};

/**
 * 配列のソート状態検証
 */
export const expectArraySorted = <T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  order: 'asc' | 'desc' = 'asc'
) => {
  const sorted = [...array].sort(compareFn);
  if (order === 'desc') {
    sorted.reverse();
  }
  expect(array).toEqual(sorted);
};

/**
 * ハイスコア配列の正しいソート検証
 */
export const expectHighScoresSorted = (highScores: HighScore[]) => {
  expectArraySorted(highScores, (a, b) => b.score - a.score, 'desc');
};

// ===== 数値検証ヘルパー =====

/**
 * 数値が指定範囲内にあることを検証
 */
export const expectNumberInRange = (value: number, min: number, max: number, message?: string) => {
  expect(value, message).toBeGreaterThanOrEqual(min);
  expect(value, message).toBeLessThanOrEqual(max);
};

/**
 * パーセンテージ値の検証 (0-100)
 */
export const expectValidPercentage = (value: number, message?: string) => {
  expectNumberInRange(value, 0, 100, message);
};

/**
 * 色文字列の検証 (hex format)
 */
export const expectValidHexColor = (color: string) => {
  expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
};

// ===== 時間・パフォーマンス検証 =====

/**
 * 実行時間が指定時間以下であることを検証
 */
export const expectExecutionTime = async <T>(
  fn: () => Promise<T> | T,
  maxTimeMs: number,
  label?: string
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  expect(
    duration,
    `${label || 'Execution'} took ${duration}ms, expected < ${maxTimeMs}ms`
  ).toBeLessThan(maxTimeMs);

  return result;
};

/**
 * 非同期操作の完了待機
 */
export const waitForNextTick = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * 指定時間の待機
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ===== モックリセットヘルパー =====

/**
 * 複数のモック関数を一括リセット
 */
export const resetMocks = (...mocks: Array<{ mockReset?: () => void; mockClear?: () => void }>) => {
  mocks.forEach((mock) => {
    if (mock.mockReset) {
      mock.mockReset();
    } else if (mock.mockClear) {
      mock.mockClear();
    }
  });
};

/**
 * localStorage のクリア（テスト間の状態クリーンアップ）
 */
export const clearTestStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
};

// ===== エラーテストヘルパー =====

/**
 * 非同期関数が特定のエラーをスローすることを検証
 */
export const expectAsyncToThrow = async (
  asyncFn: () => Promise<unknown>,
  expectedError?: string | RegExp | Error
): Promise<Error> => {
  let thrownError: Error | null = null;

  try {
    await asyncFn();
    expect.fail('Expected function to throw an error, but it did not');
  } catch (error) {
    thrownError = error as Error;
  }

  if (expectedError) {
    if (typeof expectedError === 'string') {
      expect(thrownError.message).toContain(expectedError);
    } else if (expectedError instanceof RegExp) {
      expect(thrownError.message).toMatch(expectedError);
    } else if (expectedError instanceof Error) {
      expect(thrownError.constructor).toBe(expectedError.constructor);
      expect(thrownError.message).toBe(expectedError.message);
    }
  }

  return thrownError;
};

// ===== DOM テストヘルパー =====

/**
 * CSS プロパティが正しく設定されていることを検証
 */
export const expectCSSProperty = (
  element: { style: { getPropertyValue: (prop: string) => string } },
  property: string,
  expectedValue: string
) => {
  const actualValue = element.style.getPropertyValue(property);
  expect(actualValue).toBe(expectedValue);
};

/**
 * 複数のCSS変数が設定されていることを検証
 */
export const expectCSSVariables = (
  element: { style: { getPropertyValue: (prop: string) => string } },
  variables: Record<string, string>
) => {
  Object.entries(variables).forEach(([property, expectedValue]) => {
    expectCSSProperty(element, property, expectedValue);
  });
};
