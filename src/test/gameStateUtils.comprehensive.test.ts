import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateScoreIncrease,
  processLineClear,
  createLineEffects,
  checkGameOver,
  updateGameStateWithPiece,
} from '../utils/game/gameStateUtils';
import type { GameState, Tetromino, LineEffectState } from '../types/tetris';

// Mock tetrisUtils
vi.mock('../utils/game/tetrisUtils', () => ({
  placePiece: vi.fn((board: any, piece: any) => {
    // Mock: return board with piece placed
    const newBoard = board.map((row: any) => [...row]);
    // Simulate placing piece at bottom
    const { x, y } = piece.position;
    piece.shape.forEach((row: any, dy: number) => {
      row.forEach((cell: any, dx: number) => {
        if (cell && newBoard[y + dy] && newBoard[y + dy][x + dx] !== undefined) {
          newBoard[y + dy][x + dx] = cell;
        }
      });
    });
    return newBoard;
  }),
  clearLines: vi.fn((board: any) => {
    // Mock: find full lines and clear them
    const fullLines: number[] = [];
    board.forEach((row: any, index: number) => {
      if (row.every((cell: any) => cell !== null)) {
        fullLines.push(index);
      }
    });

    const newBoard = board.filter((_: any, index: number) => !fullLines.includes(index));
    // Add empty lines at top
    while (newBoard.length < 20) {
      newBoard.unshift(Array(10).fill(null));
    }

    return {
      newBoard,
      linesCleared: fullLines.length,
      linesToClear: fullLines,
    };
  }),
  isValidPosition: vi.fn((board: any, piece: any, position: any) => {
    // Mock: simple collision detection
    const { x, y } = position;
    return piece.shape.every((row: any, dy: number) =>
      row.every((cell: any, dx: number) => {
        if (!cell) return true;
        const newY = y + dy;
        const newX = x + dx;
        return (
          newY >= 0 &&
          newY < 20 &&
          newX >= 0 &&
          newX < 10 &&
          board[newY] &&
          board[newY][newX] === null
        );
      })
    );
  }),
  createParticles: vi.fn((linesToClear: any, _board: any) => {
    // Mock: create simple particles
    return linesToClear.map((lineIndex: number, i: number) => ({
      x: i * 50,
      y: lineIndex * 30,
      vx: 1,
      vy: -1,
      life: 1.0,
      maxLife: 1.0,
      color: '#FF0000',
    }));
  }),
  getRandomTetromino: vi.fn((debugMode = false) => ({
    type: debugMode ? 'I' : 'T',
    shape: debugMode
      ? [['I', 'I', 'I', 'I']]
      : [
          ['T', 'T', 'T'],
          [null, 'T', null],
        ],
    position: { x: 4, y: 0 },
    color: debugMode ? '#00FFFF' : '#FF0000',
  })),
}));

// Mock constants with actual values
vi.mock('../constants/gameRules', () => ({
  SCORES: {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
  },
}));

describe('GameStateUtils - Comprehensive Tests', () => {
  const createEmptyBoard = () =>
    Array(20)
      .fill(null)
      .map(() => Array(10).fill(null));

  const createMockTetromino = (): Tetromino => ({
    type: 'T',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ] as const,
    position: { x: 4, y: 18 },
    color: '#FF0000',
  });

  const createMockGameState = (): GameState => ({
    board: createEmptyBoard(),
    currentPiece: createMockTetromino(),
    nextPiece: createMockTetromino(),
    score: 1000,
    level: 2,
    lines: 15,
    gameOver: false,
    isPaused: false,
    lineEffect: {
      flashingLines: [],
      shaking: false,
      particles: [],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateScoreIncrease', () => {
    it('should calculate score for single line clear', () => {
      const result = calculateScoreIncrease(1000, 10, 1);

      expect(result.newScore).toBe(1000 + 100 * 2); // 100 (SINGLE) * level 2
      expect(result.newLevel).toBe(2); // (10 + 1) / 10 + 1 = 2
      expect(result.newLines).toBe(11);
    });

    it('should calculate score for double line clear', () => {
      const result = calculateScoreIncrease(2000, 8, 2);

      expect(result.newScore).toBe(2000 + 300 * 2); // 300 (DOUBLE) * level 2
      expect(result.newLevel).toBe(2); // (8 + 2) / 10 + 1 = 2
      expect(result.newLines).toBe(10);
    });

    it('should calculate score for triple line clear', () => {
      const result = calculateScoreIncrease(3000, 15, 3);

      expect(result.newScore).toBe(3000 + 500 * 2); // 500 (TRIPLE) * level 2
      expect(result.newLevel).toBe(2); // (15 + 3) / 10 + 1 = 2
      expect(result.newLines).toBe(18);
    });

    it('should calculate score for tetris (4 lines)', () => {
      const result = calculateScoreIncrease(5000, 20, 4);

      expect(result.newScore).toBe(5000 + 800 * 3); // 800 (TETRIS) * level 3
      expect(result.newLevel).toBe(3); // (20 + 4) / 10 + 1 = 3
      expect(result.newLines).toBe(24);
    });

    it('should include bonus points', () => {
      const result = calculateScoreIncrease(1000, 5, 1, 50);

      expect(result.newScore).toBe(1000 + 100 * 1 + 50); // Score + single + bonus
      expect(result.newLevel).toBe(1);
      expect(result.newLines).toBe(6);
    });

    it('should not increase score in debug mode', () => {
      const result = calculateScoreIncrease(1000, 10, 4, 100, true);

      expect(result.newScore).toBe(1000); // No score increase in debug mode
      expect(result.newLevel).toBe(2); // Math.floor((10+4)/10) + 1 = 2
      expect(result.newLines).toBe(14); // Lines still increase
    });

    it('should handle zero lines cleared', () => {
      const result = calculateScoreIncrease(5000, 25, 0);

      expect(result.newScore).toBe(5000); // No score increase
      expect(result.newLevel).toBe(3); // (25 + 0) / 10 + 1 = 3
      expect(result.newLines).toBe(25); // No lines increase
    });

    it('should advance level correctly across thresholds', () => {
      // Test crossing level threshold
      const result1 = calculateScoreIncrease(1000, 9, 1); // 9 -> 10 lines
      expect(result1.newLevel).toBe(2); // Level advances

      const result2 = calculateScoreIncrease(2000, 19, 1); // 19 -> 20 lines
      expect(result2.newLevel).toBe(3); // Level advances

      const result3 = calculateScoreIncrease(3000, 29, 2); // 29 -> 31 lines
      expect(result3.newLevel).toBe(4); // Level advances
    });
  });

  describe('processLineClear', () => {
    it('should process line clear with mock', () => {
      const board = createEmptyBoard();
      const piece = createMockTetromino();

      const result = processLineClear(board, piece);

      expect(result).toHaveProperty('newBoard');
      expect(result).toHaveProperty('linesCleared');
      expect(result).toHaveProperty('linesToClear');
      expect(Array.isArray(result.newBoard)).toBe(true);
      expect(typeof result.linesCleared).toBe('number');
      expect(Array.isArray(result.linesToClear)).toBe(true);
    });

    it('should clear full lines', () => {
      // Create board with full bottom line
      const board = createEmptyBoard();
      board[19] = Array(10).fill('X'); // Full line

      const piece = createMockTetromino();
      const result = processLineClear(board, piece);

      expect(result.linesCleared).toBe(1);
      expect(result.linesToClear).toEqual([19]);
      // Mock removes full lines and adds empty lines at top
      // After clearing line 19, line 18 becomes the new bottom line
      expect(result.newBoard).toHaveLength(20);
      expect(result.newBoard[0]?.every((cell: any) => cell === null)).toBe(true); // New empty line at top
    });
  });

  describe('createLineEffects', () => {
    const mockLineEffect: LineEffectState = {
      flashingLines: [],
      shaking: false,
      particles: [],
    };

    it('should return previous effect when no lines cleared', () => {
      const result = createLineEffects(0, [], createEmptyBoard(), mockLineEffect);

      expect(result).toEqual(mockLineEffect);
    });

    it('should create line clear effects', () => {
      const mockPlaySound = vi.fn();
      const result = createLineEffects(
        2,
        [18, 19],
        createEmptyBoard(),
        mockLineEffect,
        mockPlaySound
      );

      expect(result.flashingLines).toEqual([18, 19]);
      expect(result.shaking).toBe(true);
      expect(result.particles).toHaveLength(2); // Mock creates one particle per line
      expect(mockPlaySound).toHaveBeenCalledWith('lineClear');
    });

    it('should play tetris sound for 4 lines', () => {
      const mockPlaySound = vi.fn();
      const result = createLineEffects(
        4,
        [16, 17, 18, 19],
        createEmptyBoard(),
        mockLineEffect,
        mockPlaySound
      );

      expect(result.flashingLines).toEqual([16, 17, 18, 19]);
      expect(result.shaking).toBe(true);
      expect(mockPlaySound).toHaveBeenCalledWith('tetris');
    });

    it('should work without sound callback', () => {
      expect(() => {
        createLineEffects(1, [19], createEmptyBoard(), mockLineEffect);
      }).not.toThrow();
    });
  });

  describe('checkGameOver', () => {
    it('should detect game over when piece cannot be placed', async () => {
      const board = createEmptyBoard();
      const piece = createMockTetromino();
      const gameState = createMockGameState();

      // Mock isValidPosition to return false (collision)
      const tetrisUtils = await import('../utils/game/tetrisUtils');
      vi.mocked(tetrisUtils.isValidPosition).mockReturnValue(false);

      const mockPlaySound = vi.fn();
      const result = checkGameOver(board, piece, gameState, mockPlaySound);

      expect(result.isGameOver).toBe(true);
      expect(result.gameOverState).toEqual({ gameOver: true });
      expect(mockPlaySound).toHaveBeenCalledWith('gameOver');
    });

    it('should not detect game over when piece can be placed', async () => {
      const board = createEmptyBoard();
      const piece = createMockTetromino();
      const gameState = createMockGameState();

      // Mock isValidPosition to return true (no collision)
      const tetrisUtils = await import('../utils/game/tetrisUtils');
      vi.mocked(tetrisUtils.isValidPosition).mockReturnValue(true);

      const result = checkGameOver(board, piece, gameState);

      expect(result.isGameOver).toBe(false);
      expect(result.gameOverState).toBeUndefined();
    });

    it('should work without sound callback', async () => {
      const board = createEmptyBoard();
      const piece = createMockTetromino();
      const gameState = createMockGameState();

      const tetrisUtils = await import('../utils/game/tetrisUtils');
      vi.mocked(tetrisUtils.isValidPosition).mockReturnValue(false);

      expect(() => {
        checkGameOver(board, piece, gameState);
      }).not.toThrow();
    });
  });

  describe('updateGameStateWithPiece', () => {
    it('should update game state when game is not over', () => {
      const prevState = createMockGameState();
      const lineClearResult = {
        newBoard: createEmptyBoard(),
        linesCleared: 1,
        linesToClear: [19],
      };
      const scoreResult = {
        newScore: 1500,
        newLevel: 3,
        newLines: 20,
      };
      const lineEffect = {
        flashingLines: [19],
        shaking: true,
        particles: [],
      };
      const gameOverResult = {
        isGameOver: false,
      };

      const result = updateGameStateWithPiece(
        prevState,
        lineClearResult,
        scoreResult,
        lineEffect,
        gameOverResult,
        false
      );

      expect(result.board).toBe(lineClearResult.newBoard);
      expect(result.score).toBe(scoreResult.newScore);
      expect(result.level).toBe(scoreResult.newLevel);
      expect(result.lines).toBe(scoreResult.newLines);
      expect(result.lineEffect).toEqual(lineEffect);
      expect(result.gameOver).toBe(false);
      expect(result.currentPiece).toBe(prevState.nextPiece);
      // nextPiece should be a new random tetromino
    });

    it('should update game state when game is over', () => {
      const prevState = createMockGameState();
      const lineClearResult = {
        newBoard: createEmptyBoard(),
        linesCleared: 0,
        linesToClear: [],
      };
      const scoreResult = {
        newScore: 1000,
        newLevel: 2,
        newLines: 15,
      };
      const lineEffect = {
        flashingLines: [],
        shaking: false,
        particles: [],
      };
      const gameOverResult = {
        isGameOver: true,
        gameOverState: { gameOver: true },
      };

      const result = updateGameStateWithPiece(
        prevState,
        lineClearResult,
        scoreResult,
        lineEffect,
        gameOverResult,
        false
      );

      expect(result.gameOver).toBe(true);
      expect(result.board).toBe(lineClearResult.newBoard);
      expect(result.score).toBe(scoreResult.newScore);
      expect(result.level).toBe(scoreResult.newLevel);
      expect(result.lines).toBe(scoreResult.newLines);
    });

    it('should handle debug mode for piece generation', async () => {
      const prevState = createMockGameState();
      const lineClearResult = {
        newBoard: createEmptyBoard(),
        linesCleared: 0,
        linesToClear: [],
      };
      const scoreResult = {
        newScore: 1000,
        newLevel: 2,
        newLines: 15,
      };
      const lineEffect = {
        flashingLines: [],
        shaking: false,
        particles: [],
      };
      const gameOverResult = {
        isGameOver: false,
      };

      updateGameStateWithPiece(
        prevState,
        lineClearResult,
        scoreResult,
        lineEffect,
        gameOverResult,
        true // debug mode
      );

      // In debug mode, getRandomTetromino should be called with true
      const tetrisUtils = await import('../utils/game/tetrisUtils');
      expect(tetrisUtils.getRandomTetromino).toHaveBeenCalledWith(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow correctly', () => {
      // Test a complete flow: piece placement -> line clear -> score calculation
      const board = createEmptyBoard();
      board[19] = [...Array(9).fill('X'), null]; // Almost full line

      const piece: Tetromino = {
        type: 'I',
        shape: [[1]] as const,
        position: { x: 9, y: 19 }, // Fill the last cell
        color: '#00FFFF',
      };

      // Process line clear
      const lineClearResult = processLineClear(board, piece);
      expect(lineClearResult.linesCleared).toBe(1);

      // Calculate score
      const scoreResult = calculateScoreIncrease(5000, 25, lineClearResult.linesCleared);
      expect(scoreResult.newScore).toBe(5000 + 100 * 3); // Single line * level 3

      // Create effects
      const lineEffect = createLineEffects(
        lineClearResult.linesCleared,
        lineClearResult.linesToClear,
        lineClearResult.newBoard,
        { flashingLines: [], shaking: false, particles: [] }
      );
      expect(lineEffect.flashingLines).toEqual([19]);
      expect(lineEffect.shaking).toBe(true);
    });
  });
});

