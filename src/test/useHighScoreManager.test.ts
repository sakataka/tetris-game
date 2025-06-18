import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import type { GameState } from '../types/tetris';
// Note: createTestFixtures was removed as part of theme system simplification

// Create test fixtures and mocks
const fixtures = {
  highScores: [] as Array<{
    id: string;
    score: number;
    level: number;
    lines: number;
    date: number;
  }>,
  statistics: { totalGames: 0, totalScore: 0, totalLines: 0, averageScore: 0 },
};
const mockActions = {
  addHighScore: vi.fn(),
  updateStatistics: vi.fn(),
  clearStatistics: vi.fn(),
};

// Mock the new statisticsStore
vi.mock('../store/statisticsStore', () => ({
  useHighScores: () => fixtures.highScores,
  useStatistics: () => fixtures.statistics,
  useAddHighScore: () => mockActions.addHighScore,
  useUpdateStatistics: () => mockActions.updateStatistics,
  useClearStatistics: () => mockActions.clearStatistics,
  useStatisticsStore: {
    getState: () => ({
      highScores: fixtures.highScores,
      statistics: fixtures.statistics,
    }),
  },
}));

const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
  board: [],
  currentPiece: null,
  nextPiece: null,
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  isPaused: false,
  lineEffect: {
    flashingLines: [],
    shaking: false,
    particles: [],
  },
  ...overrides,
});

describe('useHighScoreManager', () => {
  let mockPlaySound: (soundKey: string) => Promise<void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaySound = vi.fn().mockResolvedValue(undefined);

    // Reset mock store state via fixtures
    fixtures.highScores.length = 0;
    // Statistics are read-only, so we create a new object
    Object.assign(fixtures.statistics, {
      totalGames: 0,
      totalScore: 0,
      totalLines: 0,
      playTime: 0,
      bestStreak: 0,
      tetrisCount: 0,
      bestScore: 0,
      averageScore: 0,
    });

    // Reset mock actions
    mockActions.addHighScore.mockClear();
    mockActions.updateStatistics.mockClear();
    mockActions.clearStatistics.mockClear();
  });

  describe('High score determination functionality', () => {
    it('Any score is determined as high score for empty high score list', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.checkIsHighScore(1000)).toBe(true);
      expect(result.current.checkIsHighScore(100)).toBe(true);
    });

    it('Score higher than existing high score is determined as high score', () => {
      fixtures.highScores.push({ id: '1', score: 10000, level: 5, lines: 25, date: Date.now() });

      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.checkIsHighScore(15000)).toBe(true);
      expect(result.current.checkIsHighScore(5000)).toBe(true); // Because list is not full
    });

    it('Can correctly get current high score', () => {
      fixtures.highScores.push(
        { id: '1', score: 25000, level: 8, lines: 40, date: Date.now() },
        { id: '2', score: 15000, level: 5, lines: 25, date: Date.now() }
      );

      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getCurrentHighScore()).toBe(25000);
    });

    it('Current high score is 0 when high scores are empty', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getCurrentHighScore()).toBe(0);
    });
  });

  describe('Score rank functionality', () => {
    beforeEach(() => {
      fixtures.highScores.push(
        { id: '1', score: 30000, level: 8, lines: 40, date: Date.now() },
        { id: '2', score: 20000, level: 6, lines: 30, date: Date.now() },
        { id: '3', score: 10000, level: 4, lines: 20, date: Date.now() }
      );
    });

    it('Can correctly get rank for score that ranks 1st', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(40000)).toBe(1);
    });

    it('Can correctly get rank for score that ranks 2nd', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(25000)).toBe(2);
    });

    it('Returns null for score that does not rank', () => {
      // Fill with 10 high scores
      fixtures.highScores.push(
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `${i}`,
          score: (10 - i) * 1000, // 10000, 9000, ..., 1000
          level: 5,
          lines: 25,
          date: Date.now(),
        }))
      );

      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(500)).toBe(null);
    });
  });

  describe('Automatic save on game end', () => {
    it('Statistics are updated when game ends', () => {
      const gameState = createMockGameState({
        gameOver: false,
        score: 15000,
        level: 5,
        lines: 25,
      });

      const { rerender } = renderHook((props) => useHighScoreManager(props), {
        initialProps: { gameState, playSound: mockPlaySound },
      });

      // Change to game over state
      const gameOverState = createMockGameState({
        gameOver: true,
        score: 15000,
        level: 5,
        lines: 25,
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockActions.updateStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          totalScore: 15000,
          totalLines: 25,
        })
      );
    });

    it('High score is saved when achieving high score', () => {
      const gameState = createMockGameState({
        gameOver: false,
        score: 25000,
        level: 7,
        lines: 35,
      });

      const { rerender } = renderHook((props) => useHighScoreManager(props), {
        initialProps: { gameState, playSound: mockPlaySound },
      });

      // Change to game over state
      const gameOverState = createMockGameState({
        gameOver: true,
        score: 25000,
        level: 7,
        lines: 35,
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockActions.addHighScore).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 25000,
          level: 7,
          lines: 35,
        })
      );
    });

    it('Special sound effect is played when achieving 1st place', () => {
      const gameState = createMockGameState({
        gameOver: false,
        score: 50000,
        level: 10,
        lines: 80,
      });

      const { rerender } = renderHook((props) => useHighScoreManager(props), {
        initialProps: { gameState, playSound: mockPlaySound },
      });

      // Change to game over state
      const gameOverState = createMockGameState({
        gameOver: true,
        score: 50000,
        level: 10,
        lines: 80,
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockPlaySound).toHaveBeenCalledWith('tetris');
    });

    it('Same game end is not processed multiple times', () => {
      const gameOverState = createMockGameState({
        gameOver: true,
        score: 15000,
        level: 5,
        lines: 25,
      });

      const { rerender } = renderHook((props) => useHighScoreManager(props), {
        initialProps: { gameState: gameOverState, playSound: mockPlaySound },
      });

      // Re-render with same state
      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      // Statistics update should be called only once
      expect(mockActions.updateStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual high score save', () => {
    it('Can manually save high score', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() =>
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      const savedEntry = result.current.manualSaveHighScore(20000, 6, 30, 'TestPlayer');

      expect(mockActions.addHighScore).toHaveBeenCalledWith(savedEntry);
      expect(savedEntry.score).toBe(20000);
      expect(savedEntry.level).toBe(6);
      expect(savedEntry.lines).toBe(30);
      expect(savedEntry.playerName).toBe('TestPlayer');
    });
  });
});
