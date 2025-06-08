import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import { GameState } from '../types/tetris';

// Mock store state
const mockStoreState = {
  highScores: [],
  statistics: {
    totalGames: 0,
    totalLines: 0,
    totalScore: 0,
    bestScore: 0,
    averageScore: 0,
    playTime: 0,
    bestStreak: 0,
    tetrisCount: 0
  }
};

// Mock store actions
const mockActions = {
  addHighScore: vi.fn(),
  updateStatistics: vi.fn()
};

// Mock the new statisticsStore
vi.mock('../store/statisticsStore', () => ({
  useStatisticsActions: () => mockActions,
  useStatisticsStore: {
    getState: () => mockStoreState
  }
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
    particles: []
  },
  ...overrides
});

describe('useHighScoreManager', () => {
  let mockPlaySound: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaySound = vi.fn();
    
    // Reset mock store state
    mockStoreState.highScores = [];
    mockStoreState.statistics = {
      totalGames: 0,
      totalLines: 0,
      totalScore: 0,
      bestScore: 0,
      averageScore: 0,
      playTime: 0,
      bestStreak: 0,
      tetrisCount: 0
    };
  });

  describe('ハイスコア判定機能', () => {
    it('空のハイスコアリストに対して、任意のスコアがハイスコアと判定される', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.checkIsHighScore(1000)).toBe(true);
      expect(result.current.checkIsHighScore(100)).toBe(true);
    });

    it('既存のハイスコアより高いスコアがハイスコアと判定される', () => {
      mockStoreState.highScores = [
        { id: '1', score: 10000, level: 5, lines: 25, date: Date.now() }
      ];

      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.checkIsHighScore(15000)).toBe(true);
      expect(result.current.checkIsHighScore(5000)).toBe(true); // リストが満杯でないため
    });

    it('現在のハイスコアを正しく取得できる', () => {
      mockStoreState.highScores = [
        { id: '1', score: 25000, level: 8, lines: 40, date: Date.now() },
        { id: '2', score: 15000, level: 5, lines: 25, date: Date.now() }
      ];

      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getCurrentHighScore()).toBe(25000);
    });

    it('ハイスコアが空の場合、現在のハイスコアは0', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getCurrentHighScore()).toBe(0);
    });
  });

  describe('スコアランク機能', () => {
    beforeEach(() => {
      mockStoreState.highScores = [
        { id: '1', score: 30000, level: 8, lines: 40, date: Date.now() },
        { id: '2', score: 20000, level: 6, lines: 30, date: Date.now() },
        { id: '3', score: 10000, level: 4, lines: 20, date: Date.now() }
      ];
    });

    it('1位になるスコアの順位を正しく取得できる', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(40000)).toBe(1);
    });

    it('2位になるスコアの順位を正しく取得できる', () => {
      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(25000)).toBe(2);
    });

    it('ランクインしないスコアではnullを返す', () => {
      // 10個のハイスコアで満杯にする
      mockStoreState.highScores = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        score: (10 - i) * 1000, // 10000, 9000, ..., 1000
        level: 5,
        lines: 25,
        date: Date.now()
      }));

      const gameState = createMockGameState();
      const { result } = renderHook(() => 
        useHighScoreManager({ gameState, playSound: mockPlaySound })
      );

      expect(result.current.getScoreRank(500)).toBe(null);
    });
  });

  describe('ゲーム終了時の自動保存', () => {
    it('ゲーム終了時に統計が更新される', () => {
      const gameState = createMockGameState({ 
        gameOver: false, 
        score: 15000, 
        level: 5, 
        lines: 25 
      });

      const { rerender } = renderHook((props) => 
        useHighScoreManager(props), 
        { initialProps: { gameState, playSound: mockPlaySound } }
      );

      // ゲーム終了状態に変更
      const gameOverState = createMockGameState({ 
        gameOver: true, 
        score: 15000, 
        level: 5, 
        lines: 25 
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockActions.updateStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          totalGames: 1,
          totalScore: 15000,
          totalLines: 25
        })
      );
    });

    it('ハイスコア達成時にハイスコアが保存される', () => {
      const gameState = createMockGameState({ 
        gameOver: false, 
        score: 25000, 
        level: 7, 
        lines: 35 
      });

      const { rerender } = renderHook((props) => 
        useHighScoreManager(props), 
        { initialProps: { gameState, playSound: mockPlaySound } }
      );

      // ゲーム終了状態に変更
      const gameOverState = createMockGameState({ 
        gameOver: true, 
        score: 25000, 
        level: 7, 
        lines: 35 
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockActions.addHighScore).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 25000,
          level: 7,
          lines: 35
        })
      );
    });

    it('1位達成時に特別な音効果が再生される', () => {
      const gameState = createMockGameState({ 
        gameOver: false, 
        score: 50000, 
        level: 10, 
        lines: 80 
      });

      const { rerender } = renderHook((props) => 
        useHighScoreManager(props), 
        { initialProps: { gameState, playSound: mockPlaySound } }
      );

      // ゲーム終了状態に変更
      const gameOverState = createMockGameState({ 
        gameOver: true, 
        score: 50000, 
        level: 10, 
        lines: 80 
      });

      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      expect(mockPlaySound).toHaveBeenCalledWith('tetris');
    });

    it('同じゲーム終了が複数回処理されない', () => {
      const gameOverState = createMockGameState({ 
        gameOver: true, 
        score: 15000, 
        level: 5, 
        lines: 25 
      });

      const { rerender } = renderHook((props) => 
        useHighScoreManager(props), 
        { initialProps: { gameState: gameOverState, playSound: mockPlaySound } }
      );

      // 同じ状態で再レンダー
      act(() => {
        rerender({ gameState: gameOverState, playSound: mockPlaySound });
      });

      // 統計更新は1回だけ呼ばれるべき
      expect(mockActions.updateStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('手動ハイスコア保存', () => {
    it('手動でハイスコアを保存できる', () => {
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