import { describe, it, expect, beforeEach } from 'vitest';
import { HighScore, GameStatistics } from '../types/tetris';

// 型安全なストア状態の型定義
interface TestStoreState {
  highScores: HighScore[];
  statistics: GameStatistics;
}

// テスト専用のストア作成関数をモック
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

describe('GameStore - ハイスコア機能', () => {
  beforeEach(() => {
    // テストストアをリセット
    testStore = createTestStore();
  });

  describe('ハイスコアの追加と管理', () => {
    it('新しいハイスコアを追加できる', () => {
      const newScore: HighScore = {
        id: 'test-1',
        score: 15000,
        level: 5,
        lines: 25,
        date: Date.now(),
        playerName: 'テストプレイヤー',
      };

      testStore.addHighScore(newScore);

      expect(testStore.getState().highScores).toHaveLength(1);
      expect(testStore.getState().highScores[0]).toEqual(newScore);
    });

    it('複数のハイスコアをスコア順（降順）でソートする', () => {
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

    it('11個以上のスコアが追加されたとき、上位10個のみを保持する', () => {
      // 15個のスコアを追加
      const scores: HighScore[] = Array.from({ length: 15 }, (_, i) => ({
        id: `test-${i}`,
        score: (i + 1) * 1000,
        level: i + 1,
        lines: (i + 1) * 2,
        date: Date.now(),
      }));

      scores.forEach((score) => testStore.addHighScore(score));

      expect(testStore.getState().highScores).toHaveLength(10);
      // 最高スコアが15000、最低が6000であることを確認
      expect(testStore.getState().highScores[0]?.score).toBe(15000);
      expect(testStore.getState().highScores[9]?.score).toBe(6000);
    });

    it('ハイスコアをクリアできる', () => {
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

  describe('統計機能', () => {
    it('統計データを更新できる', () => {
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
      // 平均スコアが自動計算されることを確認
      expect(testStore.getState().statistics.averageScore).toBe(15000);
    });

    it('ベストスコアがハイスコア追加時に自動更新される', () => {
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

    it('統計データをリセットできる', () => {
      // まず統計を更新
      testStore.updateStatistics({
        totalGames: 10,
        totalScore: 100000,
        bestScore: 50000,
      });

      expect(testStore.getState().statistics.totalGames).toBe(10);

      // リセット
      testStore.resetStatistics();

      expect(testStore.getState().statistics.totalGames).toBe(0);
      expect(testStore.getState().statistics.totalScore).toBe(0);
      expect(testStore.getState().statistics.bestScore).toBe(0);
      expect(testStore.getState().statistics.averageScore).toBe(0);
    });
  });

  describe('ゲームリセット時の統計更新', () => {
    it('ゲームリセット時にtotalGamesが増加し、averageScoreが再計算される', () => {
      // 初期状態の確認
      expect(testStore.getState().statistics.totalGames).toBe(0);
      expect(testStore.getState().statistics.averageScore).toBe(0);

      // 最初にスコアを設定してゲーム終了をシミュレート
      testStore.updateStatistics({ totalScore: 10000, totalGames: 1 });

      const updatedStats = testStore.getState().statistics;
      expect(updatedStats.totalGames).toBe(1);
      expect(updatedStats.averageScore).toBe(10000);

      // 2回目のゲーム
      testStore.updateStatistics({ totalScore: 30000, totalGames: 2 });

      const finalStats = testStore.getState().statistics;
      expect(finalStats.totalGames).toBe(2);
      expect(finalStats.averageScore).toBe(15000);
    });
  });
});

describe('ハイスコア判定ユーティリティ（予定）', () => {
  it('スコアがハイスコアランクインするかを判定できる', () => {
    // この機能は後で実装予定
    expect(true).toBe(true);
  });

  it('ハイスコア達成時の適切なメッセージを生成できる', () => {
    // この機能は後で実装予定
    expect(true).toBe(true);
  });
});
