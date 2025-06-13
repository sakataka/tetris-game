/**
 * Common test utility functions
 *
 * Helper functions and assertions reusable across tests
 */

import { expect } from 'vitest';
import type { GameStatistics, HighScore } from '../../types/tetris';

// ===== Assertion Helpers =====

/**
 * High score object structure validation
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
 * Statistics object structure validation
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
 * Theme configuration structure validation
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
 * Array sort state validation
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
 * Correct sort validation for high score arrays
 */
export const expectHighScoresSorted = (highScores: HighScore[]) => {
  expectArraySorted(highScores, (a, b) => b.score - a.score, 'desc');
};

// ===== Numeric Validation Helpers =====

/**
 * Verify that a number is within a specified range
 */
export const expectNumberInRange = (value: number, min: number, max: number, message?: string) => {
  expect(value, message).toBeGreaterThanOrEqual(min);
  expect(value, message).toBeLessThanOrEqual(max);
};

/**
 * Percentage value validation (0-100)
 */
export const expectValidPercentage = (value: number, message?: string) => {
  expectNumberInRange(value, 0, 100, message);
};

/**
 * Color string validation (hex format)
 */
export const expectValidHexColor = (color: string) => {
  expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
};

// ===== Time & Performance Validation =====

/**
 * Verify that execution time is under specified time
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
 * Wait for asynchronous operation completion
 */
export const waitForNextTick = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Wait for specified time
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ===== Mock Reset Helpers =====

/**
 * Batch reset multiple mock functions
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
 * Clear localStorage (state cleanup between tests)
 */
export const clearTestStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
};

// ===== Error Test Helpers =====

/**
 * Verify that an async function throws a specific error
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

// ===== DOM Test Helpers =====

/**
 * Verify that CSS properties are set correctly
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
 * Verify that multiple CSS variables are set
 */
export const expectCSSVariables = (
  element: { style: { getPropertyValue: (prop: string) => string } },
  variables: Record<string, string>
) => {
  Object.entries(variables).forEach(([property, expectedValue]) => {
    expectCSSProperty(element, property, expectedValue);
  });
};
