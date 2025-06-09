import { describe, it, expect } from 'vitest';
import { createEmptyBoard, getRandomTetromino, isValidPosition, rotatePiece } from '../utils/game/tetrisUtils';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

describe('tetrisUtils', () => {
  describe('createEmptyBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_HEIGHT);
      expect(board[0]).toHaveLength(BOARD_WIDTH);
    });

    it('should create a board filled with null values', () => {
      const board = createEmptyBoard();
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          expect(board[y][x]).toBeNull();
        }
      }
    });
  });

  describe('getRandomTetromino', () => {
    it('should return a valid tetromino', () => {
      const tetromino = getRandomTetromino();
      
      expect(tetromino).toHaveProperty('type');
      expect(tetromino).toHaveProperty('shape');
      expect(tetromino).toHaveProperty('position');
      expect(tetromino).toHaveProperty('color');
      
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetromino.type);
      expect(tetromino.shape).toBeDefined();
      expect(tetromino.position).toEqual({ x: 4, y: 0 });
    });

    it('should generate different tetrominoes over multiple calls', () => {
      const tetrominoes = Array.from({ length: 20 }, () => getRandomTetromino().type);
      const uniqueTypes = new Set(tetrominoes);
      
      // 20回の試行で少なくとも2種類は出るはず
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid position on empty board', () => {
      const board = createEmptyBoard();
      const tetromino = getRandomTetromino();
      
      const result = isValidPosition(board, tetromino, { x: 3, y: 0 });
      expect(result).toBe(true);
    });

    it('should return false for position outside board boundaries', () => {
      const board = createEmptyBoard();
      const tetromino = getRandomTetromino();
      
      // Left boundary
      expect(isValidPosition(board, tetromino, { x: -1, y: 0 })).toBe(false);
      
      // Right boundary
      expect(isValidPosition(board, tetromino, { x: BOARD_WIDTH, y: 0 })).toBe(false);
      
      // Bottom boundary
      expect(isValidPosition(board, tetromino, { x: 0, y: BOARD_HEIGHT })).toBe(false);
    });

    it('should return false for position with collision', () => {
      const board = createEmptyBoard();
      // Place something on the board
      board[1][4] = '#ff0000';
      
      const tetromino = {
        type: 'I' as const,
        shape: [[1, 1, 1, 1]],
        position: { x: 4, y: 1 },
        color: '#00f0f0'
      };
      
      expect(isValidPosition(board, tetromino, { x: 4, y: 1 })).toBe(false);
    });
  });

  describe('rotatePiece', () => {
    it('should rotate I piece correctly', () => {
      const iPiece = {
        type: 'I' as const,
        shape: [[1, 1, 1, 1]],
        position: { x: 4, y: 0 },
        color: '#00f0f0'
      };
      
      const rotated = rotatePiece(iPiece);
      
      expect(rotated.shape).toEqual([
        [1],
        [1], 
        [1],
        [1]
      ]);
    });

    it('should not modify original piece when rotating', () => {
      const originalPiece = getRandomTetromino();
      const originalShape = JSON.stringify(originalPiece.shape);
      
      rotatePiece(originalPiece);
      
      expect(JSON.stringify(originalPiece.shape)).toBe(originalShape);
    });

    it('should preserve piece properties except shape', () => {
      const piece = getRandomTetromino();
      const rotated = rotatePiece(piece);
      
      expect(rotated.type).toBe(piece.type);
      expect(rotated.position).toEqual(piece.position);
      expect(rotated.color).toBe(piece.color);
    });
  });
});