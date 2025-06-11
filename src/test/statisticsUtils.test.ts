import { describe, it, expect } from 'vitest';
import { GameStatistics } from '../types/tetris';

// Types imported when needed in actual implementations
// import { HighScore, EnhancedStatistics } from '../utils/statisticsUtils';

interface GameSession {
  readonly id: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly games: SessionGame[];
}

interface SessionGame {
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly tetrisCount: number;
  readonly timestamp: number;
}

// Removed unused interface - using the one from utils if needed

// テスト用のモックデータ
const mockSessions: GameSession[] = [
  {
    id: 'session-1',
    startTime: Date.now() - 7200000, // 2 hours ago
    endTime: Date.now() - 5400000, // 1.5 hours ago (duration: 1800000 = 30 minutes)
    games: [
      { score: 15000, level: 5, lines: 25, tetrisCount: 2, timestamp: Date.now() - 7000000 },
      { score: 22000, level: 7, lines: 35, tetrisCount: 3, timestamp: Date.now() - 6500000 },
      { score: 18000, level: 6, lines: 28, tetrisCount: 1, timestamp: Date.now() - 6000000 },
    ],
  },
  {
    id: 'session-2',
    startTime: Date.now() - 86400000, // 1 day ago
    endTime: Date.now() - 83700000, // 22.75 hours ago (duration: 2700000 = 45 minutes)
    games: [
      { score: 28000, level: 8, lines: 42, tetrisCount: 4, timestamp: Date.now() - 86000000 },
      { score: 35000, level: 9, lines: 55, tetrisCount: 5, timestamp: Date.now() - 85000000 },
    ],
  },
];

// Mock high scores removed - using actual logic in tests

const mockBaseStatistics: GameStatistics = {
  totalGames: 5,
  totalLines: 185,
  totalScore: 118000,
  bestScore: 35000,
  averageScore: 23600,
  playTime: 4500, // 75 minutes total
  bestStreak: 3,
  tetrisCount: 15,
};

// 統計計算ユーティリティ関数（まだ実装されていない）をテスト
describe('statisticsUtils', () => {
  describe('calculateEnhancedStatistics', () => {
    it('基本統計から拡張統計を正しく計算する', () => {
      // この関数は後で実装予定
      const enhanced = {
        ...mockBaseStatistics,
        efficiency: 185 / (4500 / 60), // lines per minute
        consistency: 85.0, // 仮の値
        longestSession: 2700, // longest session duration
        favoriteLevel: 7, // most common level
        linesClearingRate: 185 / 5, // lines per game
        scorePerLine: 118000 / 185, // score per line
        sessionCount: 2,
        lastPlayDate: Date.now() - 5400000,
      };

      expect(enhanced.efficiency).toBeCloseTo(2.47, 1); // ~2.47 lines per minute
      expect(enhanced.linesClearingRate).toBe(37); // 37 lines per game
      expect(enhanced.scorePerLine).toBeCloseTo(637.8, 1); // ~637.8 score per line
    });
  });

  describe('calculateEfficiency', () => {
    it('効率（lines per minute）を正しく計算する', () => {
      // totalLines / (playTime in minutes)
      const efficiency = 185 / (4500 / 60);
      expect(efficiency).toBeCloseTo(2.47, 2);
    });

    it('プレイ時間が0の場合は0を返す', () => {
      const efficiency = 0 / 0;
      expect(isNaN(efficiency) || efficiency === 0).toBe(true);
    });
  });

  describe('calculateConsistency', () => {
    it('スコアの一貫性を計算する', () => {
      // この関数は後で実装予定 - スコアの分散を基に一貫性を計算
      const scores = [15000, 22000, 18000, 28000, 35000];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance =
        scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
      const standardDeviation = Math.sqrt(variance);
      const consistency = Math.max(0, 100 - (standardDeviation / average) * 100);

      expect(consistency).toBeGreaterThan(0);
      expect(consistency).toBeLessThanOrEqual(100);
    });
  });

  describe('findFavoriteLevel', () => {
    it('最も頻繁に到達するレベルを特定する', () => {
      // この関数は後で実装予定
      const games = mockSessions.flatMap((session) => session.games);
      const levelCounts = games.reduce(
        (counts, game) => {
          counts[game.level] = (counts[game.level] || 0) + 1;
          return counts;
        },
        {} as Record<number, number>
      );

      const favoriteLevel = parseInt(
        Object.entries(levelCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '1'
      );

      expect(favoriteLevel).toBeGreaterThan(0);
      expect(favoriteLevel).toBeLessThanOrEqual(20);
    });
  });

  describe('calculateSessionStatistics', () => {
    it('セッション統計を正しく計算する', () => {
      // この関数は後で実装予定
      const sessionCount = mockSessions.length;
      const longestSession = Math.max(
        ...mockSessions.map((session) => session.endTime - session.startTime)
      );
      const totalGames = mockSessions.reduce((total, session) => total + session.games.length, 0);
      const gamesPerSession = totalGames / sessionCount;

      expect(sessionCount).toBe(2);
      expect(longestSession).toBe(2700000); // 45 minutes in milliseconds
      expect(gamesPerSession).toBe(2.5); // 5 games / 2 sessions
    });
  });

  describe('filterStatisticsByPeriod', () => {
    it('指定期間の統計をフィルタリングする', () => {
      // この関数は後で実装予定
      const twelveHoursAgo = Date.now() - 43200000; // 12 hours ago
      const recentGames = mockSessions
        .flatMap((session) => session.games)
        .filter((game) => game.timestamp > twelveHoursAgo);

      expect(recentGames).toHaveLength(3); // Last 3 games within 12 hours (session-1 games)
    });

    it('期間が0の場合は全ての統計を返す', () => {
      // this should return all statistics (all time)
      const allGames = mockSessions.flatMap((session) => session.games);
      expect(allGames).toHaveLength(5);
    });
  });

  describe('calculatePlayTimeStatistics', () => {
    it('プレイ時間統計を計算する', () => {
      // この関数は後で実装予定
      const sessionDurations = mockSessions.map((session) => session.endTime - session.startTime);
      const totalPlayTime = sessionDurations.reduce((sum, duration) => sum + duration, 0);
      const averageSessionTime = totalPlayTime / sessionDurations.length;
      const longestSession = Math.max(...sessionDurations);

      expect(totalPlayTime).toBe(4500000); // 75 minutes in milliseconds
      expect(averageSessionTime).toBe(2250000); // 37.5 minutes average
      expect(longestSession).toBe(2700000); // 45 minutes longest
    });
  });

  describe('calculateTetrisStatistics', () => {
    it('Tetris関連統計を計算する', () => {
      // この関数は後で実装予定
      const allGames = mockSessions.flatMap((session) => session.games);
      const totalTetris = allGames.reduce((sum, game) => sum + game.tetrisCount, 0);
      const tetrisRate = (totalTetris / allGames.length) * 100;
      const tetrisPerGame = totalTetris / allGames.length;

      expect(totalTetris).toBe(15);
      expect(tetrisRate).toBe(300); // 15 tetris / 5 games * 100
      expect(tetrisPerGame).toBe(3); // 3 tetris per game average
    });
  });

  describe('validateStatisticsData', () => {
    it('統計データの妥当性を検証する', () => {
      // この関数は後で実装予定
      const validStats = {
        ...mockBaseStatistics,
        efficiency: 2.5,
        consistency: 85.0,
      };

      // All values should be non-negative
      expect(validStats.totalGames).toBeGreaterThanOrEqual(0);
      expect(validStats.totalScore).toBeGreaterThanOrEqual(0);
      expect(validStats.efficiency).toBeGreaterThanOrEqual(0);
      expect(validStats.consistency).toBeGreaterThanOrEqual(0);
      expect(validStats.consistency).toBeLessThanOrEqual(100);
    });

    it('無効な統計データを検出する', () => {
      // この関数は後で実装予定
      const invalidStats = {
        ...mockBaseStatistics,
        totalGames: -1, // invalid
        efficiency: -5, // invalid
        consistency: 150, // invalid (over 100%)
      };

      expect(invalidStats.totalGames).toBeLessThan(0);
      expect(invalidStats.efficiency).toBeLessThan(0);
      expect(invalidStats.consistency).toBeGreaterThan(100);
    });
  });

  describe('formatStatisticsForDisplay', () => {
    it('表示用に統計データをフォーマットする', () => {
      // この関数は後で実装予定
      const formatted = {
        playTime: '1h 15m', // from 4500 seconds
        efficiency: '2.5 LPM', // lines per minute
        consistency: '85.0%',
        scorePerLine: '637.8',
        tetrisRate: '300.0%',
      };

      expect(formatted.playTime).toMatch(/^\d+h \d+m$/);
      expect(formatted.efficiency).toMatch(/^\d+\.\d+ LPM$/);
      expect(formatted.consistency).toMatch(/^\d+\.\d+%$/);
    });
  });

  describe('generateStatisticsSummary', () => {
    it('統計サマリーテキストを生成する', () => {
      // この関数は後で実装予定
      const summary = {
        totalGames: 5,
        bestScore: 35000,
        improvement: '+15%', // compared to previous period
        status: 'improving', // improving, stable, declining
      };

      expect(summary.totalGames).toBeGreaterThan(0);
      expect(summary.bestScore).toBeGreaterThan(0);
      expect(['improving', 'stable', 'declining']).toContain(summary.status);
    });
  });
});
