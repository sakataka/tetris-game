import { describe, it, expect } from 'vitest';
import {
  isHighScore,
  getHighScoreRank,
  getHighScoreMessage,
  generateHighScoreId,
  createHighScoreEntry,
  validateHighScore,
  sortHighScores,
  validatePlayerName,
  calculateHighScoreStats,
} from '../utils/game/highScoreUtils';
import { HighScore } from '../types/tetris';

const mockHighScores: HighScore[] = [
  { id: '1', score: 50000, level: 10, lines: 80, date: Date.now() },
  { id: '2', score: 40000, level: 8, lines: 60, date: Date.now() },
  { id: '3', score: 30000, level: 6, lines: 40, date: Date.now() },
  { id: '4', score: 20000, level: 4, lines: 20, date: Date.now() },
  { id: '5', score: 10000, level: 2, lines: 10, date: Date.now() },
];

describe('highScoreUtils', () => {
  describe('isHighScore', () => {
    it('Returns true when high score list is not full', () => {
      expect(isHighScore(1000, mockHighScores.slice(0, 3), 10)).toBe(true);
    });

    it('Returns true when new score is higher than lowest score', () => {
      expect(isHighScore(15000, mockHighScores, 5)).toBe(true);
    });

    it('Returns false when new score is lower than lowest score', () => {
      expect(isHighScore(5000, mockHighScores, 5)).toBe(false);
    });

    it('Returns false when new score equals lowest score', () => {
      expect(isHighScore(10000, mockHighScores, 5)).toBe(false);
    });
  });

  describe('getHighScoreRank', () => {
    it('Returns 1 for score that ranks first', () => {
      expect(getHighScoreRank(60000, mockHighScores)).toBe(1);
    });

    it('Returns 3 for score that ranks third', () => {
      expect(getHighScoreRank(35000, mockHighScores)).toBe(3);
    });

    it('Returns appropriate rank for score that ranks last', () => {
      expect(getHighScoreRank(15000, mockHighScores, 10)).toBe(5);
    });

    it('Returns null for score that does not rank', () => {
      expect(getHighScoreRank(5000, mockHighScores, 5)).toBe(null);
    });
  });

  describe('getHighScoreMessage', () => {
    it('Returns special message for 1st place', () => {
      const message = getHighScoreMessage(1);
      expect(message).toContain('New Record');
      expect(message).toContain('Highest score ever');
    });

    it('Returns message for 2nd place', () => {
      const message = getHighScoreMessage(2);
      expect(message).toContain('2nd place');
    });

    it('Returns message for 3rd place', () => {
      const message = getHighScoreMessage(3);
      expect(message).toContain('3rd place');
    });

    it('Returns general message for 4th place and below', () => {
      const message = getHighScoreMessage(5);
      expect(message).toContain('Top 5');
      expect(message).toContain('Amazing score');
    });
  });

  describe('generateHighScoreId', () => {
    it('Generates unique IDs', () => {
      const id1 = generateHighScoreId();
      const id2 = generateHighScoreId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^score_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^score_\d+_[a-z0-9]+$/);
    });
  });

  describe('createHighScoreEntry', () => {
    it('Creates correct high score entry with player name', () => {
      const entry = createHighScoreEntry(25000, 5, 30, 'TestPlayer');

      expect(entry.score).toBe(25000);
      expect(entry.level).toBe(5);
      expect(entry.lines).toBe(30);
      expect(entry.playerName).toBe('TestPlayer');
      expect(entry.id).toMatch(/^score_\d+_[a-z0-9]+$/);
      expect(entry.date).toBeTypeOf('number');
    });

    it('Creates correct high score entry without player name', () => {
      const entry = createHighScoreEntry(25000, 5, 30);

      expect(entry.score).toBe(25000);
      expect(entry.level).toBe(5);
      expect(entry.lines).toBe(30);
      expect(entry.playerName).toBeUndefined();
    });
  });

  describe('validateHighScore', () => {
    it('Returns true for valid high score', () => {
      const validScore: HighScore = {
        id: 'test-1',
        score: 25000,
        level: 5,
        lines: 30,
        date: Date.now(),
        playerName: 'TestPlayer',
      };

      expect(validateHighScore(validScore)).toBe(true);
    });

    it('Valid without player name', () => {
      const validScore: HighScore = {
        id: 'test-1',
        score: 25000,
        level: 5,
        lines: 30,
        date: Date.now(),
      };

      expect(validateHighScore(validScore)).toBe(true);
    });

    it('Invalid with negative score', () => {
      const invalidScore = {
        id: 'test-1',
        score: -1000,
        level: 5,
        lines: 30,
        date: Date.now(),
      } as HighScore;

      expect(validateHighScore(invalidScore)).toBe(false);
    });

    it('Invalid with level 0', () => {
      const invalidScore = {
        id: 'test-1',
        score: 25000,
        level: 0,
        lines: 30,
        date: Date.now(),
      } as HighScore;

      expect(validateHighScore(invalidScore)).toBe(false);
    });
  });

  describe('sortHighScores', () => {
    it('Sorts by score in descending order', () => {
      const unsorted: HighScore[] = [
        { id: '1', score: 30000, level: 6, lines: 40, date: 1000 },
        { id: '2', score: 50000, level: 10, lines: 80, date: 2000 },
        { id: '3', score: 40000, level: 8, lines: 60, date: 1500 },
      ];

      const sorted = sortHighScores(unsorted);

      expect(sorted[0]?.score).toBe(50000);
      expect(sorted[1]?.score).toBe(40000);
      expect(sorted[2]?.score).toBe(30000);
    });

    it('Sorts by date (newest first) when scores are equal', () => {
      const unsorted: HighScore[] = [
        { id: '1', score: 30000, level: 6, lines: 40, date: 1000 },
        { id: '2', score: 30000, level: 6, lines: 40, date: 2000 },
        { id: '3', score: 30000, level: 6, lines: 40, date: 1500 },
      ];

      const sorted = sortHighScores(unsorted);

      expect(sorted[0]?.date).toBe(2000);
      expect(sorted[1]?.date).toBe(1500);
      expect(sorted[2]?.date).toBe(1000);
    });
  });

  describe('validatePlayerName', () => {
    it('Returns true for valid alphanumeric name', () => {
      expect(validatePlayerName('PLAYER123')).toBe(true);
    });

    it('Returns true for valid Japanese name', () => {
      expect(validatePlayerName('TetrisChampion')).toBe(true);
    });

    it('Returns true with underscores', () => {
      expect(validatePlayerName('CYBER_MASTER')).toBe(true);
    });

    it('Returns false for empty string', () => {
      expect(validatePlayerName('')).toBe(false);
    });

    it('Returns false for name that is too long', () => {
      expect(validatePlayerName('A'.repeat(21))).toBe(false);
    });

    it('Returns false with special characters', () => {
      expect(validatePlayerName('PLAYER@123')).toBe(false);
    });
  });

  describe('calculateHighScoreStats', () => {
    it('Returns correct stats for empty list', () => {
      const stats = calculateHighScoreStats([]);

      expect(stats.totalScores).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highestScore).toBe(0);
      expect(stats.lowestScore).toBe(0);
    });

    it('Calculates correct stats for multiple scores', () => {
      const stats = calculateHighScoreStats(mockHighScores);

      expect(stats.totalScores).toBe(5);
      expect(stats.averageScore).toBe(30000); // (50000+40000+30000+20000+10000)/5
      expect(stats.highestScore).toBe(50000);
      expect(stats.lowestScore).toBe(10000);
      expect(stats.averageLevel).toBe(6); // (10+8+6+4+2)/5
      expect(stats.averageLines).toBe(42); // (80+60+40+20+10)/5
    });
  });
});
