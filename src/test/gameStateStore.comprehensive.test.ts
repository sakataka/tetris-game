import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStateStore } from '../store/gameStateStore';
import { useSettingsStore } from '../store/settingsStore';
import type { GameState, Tetromino, Particle } from '../types/tetris';

// Mock the settings store
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: {
    getState: vi.fn(() => ({
      settings: { gameMode: 'normal' }
    }))
  }
}));

// Mock game utilities
vi.mock('../utils/game', () => ({
  createEmptyBoard: vi.fn(() => Array(20).fill(null).map(() => Array(10).fill(null))),
  getRandomTetromino: vi.fn((debugMode = false) => ({
    type: debugMode ? 'I' : 'T',
    shape: debugMode ? [['I', 'I', 'I', 'I']] : [['T', 'T', 'T'], [null, 'T', null]],
    position: { x: 4, y: 0 },
    color: debugMode ? '#00FFFF' : '#FF0000',
  })),
  processLineClear: vi.fn(() => ({
    newBoard: Array(20).fill(null).map(() => Array(10).fill(null)),
    linesCleared: 1,
    flashingLines: [19],
  })),
  calculateScoreIncrease: vi.fn(() => ({
    newScore: 100,
    newLevel: 1,
    newLines: 1,
  })),
  createLineEffects: vi.fn(() => []),
  updateGameStateWithPiece: vi.fn(() => Array(20).fill(null).map(() => Array(10).fill(null))),
  checkGameOver: vi.fn(() => false),
}));

describe('GameStateStore - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the store to initial state
    useGameStateStore.setState({
      gameState: {
        board: Array(20).fill(null).map(() => Array(10).fill(null)),
        currentPiece: {
          type: 'T',
          shape: [['T', 'T', 'T'], [null, 'T', null]],
          position: { x: 4, y: 0 },
          color: '#FF0000',
        },
        nextPiece: {
          type: 'I',
          shape: [['I', 'I', 'I', 'I']],
          position: { x: 4, y: 0 },
          color: '#00FFFF',
        },
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
      },
      dropTime: 1000,
    });

    // Mock settings store
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      settings: { gameMode: 'normal' },
    } as any);
  });

  describe('Initial State', () => {
    it('should have correct initial game state', () => {
      const state = useGameStateStore.getState();
      
      expect(state.gameState.score).toBe(0);
      expect(state.gameState.level).toBe(1);
      expect(state.gameState.lines).toBe(0);
      expect(state.gameState.gameOver).toBe(false);
      expect(state.gameState.isPaused).toBe(false);
      expect(state.dropTime).toBe(1000);
    });

    it('should have empty board initially', () => {
      const { gameState } = useGameStateStore.getState();
      
      expect(gameState.board).toHaveLength(20);
      expect(gameState.board[0]).toHaveLength(10);
      expect(gameState.board.every(row => row.every(cell => cell === null))).toBe(true);
    });

    it('should have line effect in initial state', () => {
      const { gameState } = useGameStateStore.getState();
      
      expect(gameState.lineEffect.flashingLines).toEqual([]);
      expect(gameState.lineEffect.shaking).toBe(false);
      expect(gameState.lineEffect.particles).toEqual([]);
    });
  });

  describe('Basic State Management', () => {
    it('should update game state with setGameState', () => {
      const store = useGameStateStore.getState();
      
      store.setGameState({ score: 500, level: 2 });
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.score).toBe(500);
      expect(newState.gameState.level).toBe(2);
      expect(newState.gameState.lines).toBe(0); // Should preserve other values
    });

    it('should toggle pause state', () => {
      const store = useGameStateStore.getState();
      
      expect(store.gameState.isPaused).toBe(false);
      
      store.togglePause();
      expect(useGameStateStore.getState().gameState.isPaused).toBe(true);
      
      store.togglePause();
      expect(useGameStateStore.getState().gameState.isPaused).toBe(false);
    });

    it('should set drop time', () => {
      const store = useGameStateStore.getState();
      
      store.setDropTime(500);
      
      expect(useGameStateStore.getState().dropTime).toBe(500);
    });
  });

  describe('Particle Management', () => {
    it('should update particles in line effect', () => {
      const store = useGameStateStore.getState();
      const mockParticles: Particle[] = [
        { x: 100, y: 200, vx: 1, vy: -2, life: 1.0, maxLife: 1.0, color: '#FF0000' },
        { x: 150, y: 250, vx: -1, vy: -1, life: 0.8, maxLife: 1.0, color: '#00FF00' },
      ];
      
      store.updateParticles(mockParticles);
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.lineEffect.particles).toEqual(mockParticles);
      expect(newState.gameState.lineEffect.particles).toHaveLength(2);
    });

    it('should preserve other line effect properties when updating particles', () => {
      const store = useGameStateStore.getState();
      
      // Set initial line effect state
      store.updateLineEffect({ flashingLines: [1, 2], shaking: true });
      
      const mockParticles: Particle[] = [
        { x: 100, y: 200, vx: 1, vy: -2, life: 1.0, maxLife: 1.0, color: '#FF0000' },
      ];
      
      store.updateParticles(mockParticles);
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.lineEffect.particles).toEqual(mockParticles);
      expect(newState.gameState.lineEffect.flashingLines).toEqual([1, 2]);
      expect(newState.gameState.lineEffect.shaking).toBe(true);
    });
  });

  describe('Line Effect Management', () => {
    it('should update line effect properties', () => {
      const store = useGameStateStore.getState();
      
      store.updateLineEffect({ 
        flashingLines: [18, 19], 
        shaking: true 
      });
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.lineEffect.flashingLines).toEqual([18, 19]);
      expect(newState.gameState.lineEffect.shaking).toBe(true);
      expect(newState.gameState.lineEffect.particles).toEqual([]); // Should preserve
    });

    it('should clear line effect', () => {
      const store = useGameStateStore.getState();
      
      // Set some line effects first
      store.updateLineEffect({ 
        flashingLines: [18, 19], 
        shaking: true,
      });
      
      store.updateParticles([
        { x: 100, y: 200, vx: 1, vy: -2, life: 1.0, maxLife: 1.0, color: '#FF0000' },
      ]);
      
      // Clear line effect
      store.clearLineEffect();
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.lineEffect.flashingLines).toEqual([]);
      expect(newState.gameState.lineEffect.shaking).toBe(false);
      expect(newState.gameState.lineEffect.particles).toEqual([]);
    });
  });

  describe('Game Reset', () => {
    it('should reset game to initial state in normal mode', () => {
      const store = useGameStateStore.getState();
      
      // Modify state
      store.setGameState({
        score: 5000,
        level: 5,
        lines: 20,
        gameOver: true,
        isPaused: true,
      });
      store.setDropTime(200);
      
      // Reset game
      store.resetGame();
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.score).toBe(0);
      expect(newState.gameState.level).toBe(1);
      expect(newState.gameState.lines).toBe(0);
      expect(newState.gameState.gameOver).toBe(false);
      expect(newState.gameState.isPaused).toBe(false);
      expect(newState.dropTime).toBe(1000); // INITIAL_DROP_TIME
    });

    it('should reset game with debug mode consideration', () => {
      // Mock debug mode
      vi.mocked(useSettingsStore.getState).mockReturnValue({
        settings: { gameMode: 'debug' },
      } as any);
      
      const store = useGameStateStore.getState();
      store.resetGame();
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.score).toBe(0);
      expect(newState.gameState.level).toBe(1);
      expect(newState.gameState.lines).toBe(0);
      // Debug mode should affect piece generation (mocked to return 'I' piece)
    });
  });

  describe('Piece Placement Calculation', () => {
    it('should calculate piece placement without bonus points', () => {
      const store = useGameStateStore.getState();
      const mockPiece: Tetromino = {
        type: 'T',
        shape: [['T', 'T', 'T'], [null, 'T', null]],
        position: { x: 4, y: 18 },
        color: '#FF0000',
      };
      
      const mockPlaySound = vi.fn();
      
      store.calculatePiecePlacementState(mockPiece, undefined, mockPlaySound);
      
      // Verify sound was played
      expect(mockPlaySound).toHaveBeenCalledWith('pieceLand');
    });

    it('should calculate piece placement with bonus points (hard drop)', () => {
      const store = useGameStateStore.getState();
      const mockPiece: Tetromino = {
        type: 'T',
        shape: [['T', 'T', 'T'], [null, 'T', null]],
        position: { x: 4, y: 18 },
        color: '#FF0000',
      };
      
      const mockPlaySound = vi.fn();
      
      store.calculatePiecePlacementState(mockPiece, 10, mockPlaySound);
      
      // Verify hard drop sound was played
      expect(mockPlaySound).toHaveBeenCalledWith('hardDrop');
    });

    it('should handle piece placement without sound callback', () => {
      const store = useGameStateStore.getState();
      const mockPiece: Tetromino = {
        type: 'T',
        shape: [['T', 'T', 'T'], [null, 'T', null]],
        position: { x: 4, y: 18 },
        color: '#FF0000',
      };
      
      // Should not throw error when no sound callback provided
      expect(() => {
        store.calculatePiecePlacementState(mockPiece);
      }).not.toThrow();
    });
  });

  describe('Piece Movement Actions', () => {
    it('should move piece to position', () => {
      const store = useGameStateStore.getState();
      const initialPiece = store.gameState.currentPiece;
      
      store.movePieceToPosition({ x: 6, y: 2 });
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.currentPiece.position).toEqual({ x: 6, y: 2 });
      expect(newState.gameState.currentPiece.type).toBe(initialPiece.type); // Other properties preserved
    });

    it('should rotate piece', () => {
      const store = useGameStateStore.getState();
      const rotatedPiece: Tetromino = {
        type: 'T',
        shape: [[null, 'T'], ['T', 'T'], [null, 'T']], // Rotated T-piece
        position: { x: 4, y: 0 },
        color: '#FF0000',
      };
      
      store.rotatePieceTo(rotatedPiece);
      
      const newState = useGameStateStore.getState();
      expect(newState.gameState.currentPiece.shape).toEqual(rotatedPiece.shape);
      expect(newState.gameState.currentPiece.type).toBe('T');
    });
  });

  describe('Store Integration', () => {
    it('should maintain state consistency across multiple operations', () => {
      const store = useGameStateStore.getState();
      
      // Perform multiple operations
      store.setGameState({ score: 1000 });
      store.togglePause();
      store.setDropTime(300);
      store.updateLineEffect({ flashingLines: [19] });
      
      const finalState = useGameStateStore.getState();
      
      // Verify all operations took effect
      expect(finalState.gameState.score).toBe(1000);
      expect(finalState.gameState.isPaused).toBe(true);
      expect(finalState.dropTime).toBe(300);
      expect(finalState.gameState.lineEffect.flashingLines).toEqual([19]);
      
      // Verify unmodified properties remain intact
      expect(finalState.gameState.level).toBe(1);
      expect(finalState.gameState.lines).toBe(0);
      expect(finalState.gameState.gameOver).toBe(false);
    });

    it('should handle rapid state updates correctly', () => {
      const store = useGameStateStore.getState();
      
      // Rapid updates
      for (let i = 0; i < 10; i++) {
        store.setGameState({ score: i * 100 });
      }
      
      const finalState = useGameStateStore.getState();
      expect(finalState.gameState.score).toBe(900); // Last update should win
    });
  });
});