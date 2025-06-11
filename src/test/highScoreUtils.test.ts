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
    it('ハイスコアリストが満杯でない場合、常にtrueを返す', () => {
      expect(isHighScore(1000, mockHighScores.slice(0, 3), 10)).toBe(true);
    });

    it('新しいスコアが最低スコアより高い場合、trueを返す', () => {
      expect(isHighScore(15000, mockHighScores, 5)).toBe(true);
    });

    it('新しいスコアが最低スコアより低い場合、falseを返す', () => {
      expect(isHighScore(5000, mockHighScores, 5)).toBe(false);
    });

    it('新しいスコアが最低スコアと同じ場合、falseを返す', () => {
      expect(isHighScore(10000, mockHighScores, 5)).toBe(false);
    });
  });

  describe('getHighScoreRank', () => {
    it('1位になるスコアの場合、1を返す', () => {
      expect(getHighScoreRank(60000, mockHighScores)).toBe(1);
    });

    it('3位になるスコアの場合、3を返す', () => {
      expect(getHighScoreRank(35000, mockHighScores)).toBe(3);
    });

    it('最下位になるスコアの場合、適切な順位を返す', () => {
      expect(getHighScoreRank(15000, mockHighScores, 10)).toBe(5);
    });

    it('ハイスコアに入らないスコアの場合、nullを返す', () => {
      expect(getHighScoreRank(5000, mockHighScores, 5)).toBe(null);
    });
  });

  describe('getHighScoreMessage', () => {
    it('1位の場合、特別なメッセージを返す', () => {
      const message = getHighScoreMessage(1);
      expect(message).toContain('New Record');
      expect(message).toContain('Highest score ever');
    });

    it('2位の場合、2位用のメッセージを返す', () => {
      const message = getHighScoreMessage(2);
      expect(message).toContain('2nd place');
    });

    it('3位の場合、3位用のメッセージを返す', () => {
      const message = getHighScoreMessage(3);
      expect(message).toContain('3rd place');
    });

    it('4位以下の場合、一般的なメッセージを返す', () => {
      const message = getHighScoreMessage(5);
      expect(message).toContain('Top 5');
      expect(message).toContain('Amazing score');
    });
  });

  describe('generateHighScoreId', () => {
    it('ユニークなIDを生成する', () => {
      const id1 = generateHighScoreId();
      const id2 = generateHighScoreId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^score_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^score_\d+_[a-z0-9]+$/);
    });
  });

  describe('createHighScoreEntry', () => {
    it('プレイヤー名ありで正しいハイスコアエントリを作成する', () => {
      const entry = createHighScoreEntry(25000, 5, 30, 'TestPlayer');

      expect(entry.score).toBe(25000);
      expect(entry.level).toBe(5);
      expect(entry.lines).toBe(30);
      expect(entry.playerName).toBe('TestPlayer');
      expect(entry.id).toMatch(/^score_\d+_[a-z0-9]+$/);
      expect(entry.date).toBeTypeOf('number');
    });

    it('プレイヤー名なしで正しいハイスコアエントリを作成する', () => {
      const entry = createHighScoreEntry(25000, 5, 30);

      expect(entry.score).toBe(25000);
      expect(entry.level).toBe(5);
      expect(entry.lines).toBe(30);
      expect(entry.playerName).toBeUndefined();
    });
  });

  describe('validateHighScore', () => {
    it('有効なハイスコアでtrueを返す', () => {
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

    it('プレイヤー名なしでも有効', () => {
      const validScore: HighScore = {
        id: 'test-1',
        score: 25000,
        level: 5,
        lines: 30,
        date: Date.now(),
      };

      expect(validateHighScore(validScore)).toBe(true);
    });

    it('負のスコアで無効', () => {
      const invalidScore = {
        id: 'test-1',
        score: -1000,
        level: 5,
        lines: 30,
        date: Date.now(),
      } as HighScore;

      expect(validateHighScore(invalidScore)).toBe(false);
    });

    it('レベル0で無効', () => {
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
    it('スコア順（降順）でソートする', () => {
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

    it('同じスコアの場合、日付の新しい順でソートする', () => {
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
    it('有効な英数字名でtrueを返す', () => {
      expect(validatePlayerName('PLAYER123')).toBe(true);
    });

    it('有効な日本語名でtrueを返す', () => {
      expect(validatePlayerName('テトリス王者')).toBe(true);
    });

    it('アンダースコア含みでtrueを返す', () => {
      expect(validatePlayerName('CYBER_MASTER')).toBe(true);
    });

    it('空文字でfalseを返す', () => {
      expect(validatePlayerName('')).toBe(false);
    });

    it('長すぎる名前でfalseを返す', () => {
      expect(validatePlayerName('A'.repeat(21))).toBe(false);
    });

    it('特殊文字含みでfalseを返す', () => {
      expect(validatePlayerName('PLAYER@123')).toBe(false);
    });
  });

  describe('calculateHighScoreStats', () => {
    it('空のリストで正しい統計を返す', () => {
      const stats = calculateHighScoreStats([]);

      expect(stats.totalScores).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highestScore).toBe(0);
      expect(stats.lowestScore).toBe(0);
    });

    it('複数のスコアで正しい統計を計算する', () => {
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
