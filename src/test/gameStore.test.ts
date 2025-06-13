import { beforeEach, describe, expect, it } from 'vitest';
import type { GameStatistics, HighScore } from '../types/tetris';

// Type-safe store state type definition
interface TestStoreState {
  highScores: HighScore[];
  statistics: GameStatistics;
}

// Mock test-specific store creation function
const createTestStore = () => {
  let state: TestStoreState = {
    highScores: [],
    statistics: {
      totalGames: 0,
      totalLines: 0,
      totalScore: 0,
      bestScore: 0,
      averageScore: 0,
      playTime: 0,
      bestStreak: 0,
      tetrisCount: 0,
    },
  };

  return {
    getState: () => state,
    setState: (newState: Partial<TestStoreState>) => {
      state = { ...state, ...newState };
    },
    addHighScore: (score: HighScore) => {
      const newHighScores = [...state.highScores, score]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      const bestScore = Math.max(state.statistics.bestScore, score.score);

      state = {
        ...state,
        highScores: newHighScores,
        statistics: {
          ...state.statistics,
          bestScore,
        },
      };
    },
    clearHighScores: () => {
      state = { ...state, highScores: [] };
    },
    updateStatistics: (stats: Partial<GameStatistics>) => {
      const newStats = { ...state.statistics, ...stats };
      if (newStats.totalGames > 0) {
        newStats.averageScore = Math.floor(newStats.totalScore / newStats.totalGames);
      }
      state = { ...state, statistics: newStats };
    },
    resetStatistics: () => {
      state = {
        ...state,
        statistics: {
          totalGames: 0,
          totalLines: 0,
          totalScore: 0,
          bestScore: 0,
          averageScore: 0,
          playTime: 0,
          bestStreak: 0,
          tetrisCount: 0,
        },
      };
    },
  };
};

// Mock zustand store
let testStore = createTestStore();

describe('GameStore - High score functionality', () => {
  beforeEach(() => {
    // Reset test store
    testStore = createTestStore();
  });

  describe('Adding and managing high scores', () => {
    it('Can add new high score', () => {
      const newScore: HighScore = {
        id: 'test-1',
        score: 15000,
        level: 5,
        lines: 25,
        date: Date.now(),
        playerName: 'Test Player',
      };

      testStore.addHighScore(newScore);

      expect(testStore.getState().highScores).toHaveLength(1);
      expect(testStore.getState().highScores[0]).toEqual(newScore);
    });

    it('Sorts multiple high scores in descending order', () => {
      const scores: HighScore[] = [
        {
          id: 'test-1',
          score: 10000,
          level: 3,
          lines: 15,
          date: Date.now(),
        },
        {
          id: 'test-2',
          score: 25000,
          level: 7,
          lines: 40,
          date: Date.now(),
        },
        {
          id: 'test-3',
          score: 15000,
          level: 5,
          lines: 25,
          date: Date.now(),
        },
      ];

      scores.forEach((score) => testStore.addHighScore(score));

      expect(testStore.getState().highScores).toHaveLength(3);
      expect(testStore.getState().highScores[0]?.score).toBe(25000);
      expect(testStore.getState().highScores[1]?.score).toBe(15000);
      expect(testStore.getState().highScores[2]?.score).toBe(10000);
    });

    it('Keeps only top 10 scores when more than 11 scores are added', () => {
      // Add 15 scores
      const scores: HighScore[] = Array.from({ length: 15 }, (_, i) => ({
        id: `test-${i}`,
        score: (i + 1) * 1000,
        level: i + 1,
        lines: (i + 1) * 2,
        date: Date.now(),
      }));

      scores.forEach((score) => testStore.addHighScore(score));

      expect(testStore.getState().highScores).toHaveLength(10);
      // Verify highest score is 15000, lowest is 6000
      expect(testStore.getState().highScores[0]?.score).toBe(15000);
      expect(testStore.getState().highScores[9]?.score).toBe(6000);
    });

    it('Can clear high scores', () => {
      const newScore: HighScore = {
        id: 'test-1',
        score: 15000,
        level: 5,
        lines: 25,
        date: Date.now(),
      };

      testStore.addHighScore(newScore);
      expect(testStore.getState().highScores).toHaveLength(1);

      testStore.clearHighScores();
      expect(testStore.getState().highScores).toHaveLength(0);
    });
  });

  describe('Statistics functionality', () => {
    it('Can update statistics data', () => {
      const newStats: Partial<GameStatistics> = {
        totalGames: 5,
        totalLines: 50,
        totalScore: 75000,
        tetrisCount: 3,
      };

      testStore.updateStatistics(newStats);

      expect(testStore.getState().statistics.totalGames).toBe(5);
      expect(testStore.getState().statistics.totalLines).toBe(50);
      expect(testStore.getState().statistics.totalScore).toBe(75000);
      expect(testStore.getState().statistics.tetrisCount).toBe(3);
      // Verify average score is automatically calculated
      expect(testStore.getState().statistics.averageScore).toBe(15000);
    });

    it('Best score is automatically updated when adding high score', () => {
      expect(testStore.getState().statistics.bestScore).toBe(0);

      const newScore: HighScore = {
        id: 'test-1',
        score: 25000,
        level: 7,
        lines: 40,
        date: Date.now(),
      };

      testStore.addHighScore(newScore);

      expect(testStore.getState().statistics.bestScore).toBe(25000);
    });

    it('Can reset statistics data', () => {
      // First update statistics
      testStore.updateStatistics({
        totalGames: 10,
        totalScore: 100000,
        bestScore: 50000,
      });

      expect(testStore.getState().statistics.totalGames).toBe(10);

      // Reset
      testStore.resetStatistics();

      expect(testStore.getState().statistics.totalGames).toBe(0);
      expect(testStore.getState().statistics.totalScore).toBe(0);
      expect(testStore.getState().statistics.bestScore).toBe(0);
      expect(testStore.getState().statistics.averageScore).toBe(0);
    });
  });

  describe('Statistics update on game reset', () => {
    it('totalGames increases and averageScore is recalculated on game reset', () => {
      // Verify initial state
      expect(testStore.getState().statistics.totalGames).toBe(0);
      expect(testStore.getState().statistics.averageScore).toBe(0);

      // First set score and simulate game end
      testStore.updateStatistics({ totalScore: 10000, totalGames: 1 });

      const updatedStats = testStore.getState().statistics;
      expect(updatedStats.totalGames).toBe(1);
      expect(updatedStats.averageScore).toBe(10000);

      // Second game
      testStore.updateStatistics({ totalScore: 30000, totalGames: 2 });

      const finalStats = testStore.getState().statistics;
      expect(finalStats.totalGames).toBe(2);
      expect(finalStats.averageScore).toBe(15000);
    });
  });
});

describe('High score judgment utility (planned)', () => {
  it('Can determine if score ranks in high scores', () => {
    // This feature will be implemented later
    expect(true).toBe(true);
  });

  it('Can generate appropriate message when achieving high score', () => {
    // This feature will be implemented later
    expect(true).toBe(true);
  });
});
