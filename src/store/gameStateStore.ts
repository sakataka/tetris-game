import { create } from 'zustand';
import { GameState, LineEffectState, Particle } from '../types/tetris';
import { createEmptyBoard, getRandomTetromino } from '../utils/tetrisUtils';

// 初期ゲーム状態
const INITIAL_GAME_STATE: GameState = {
  board: createEmptyBoard(),
  currentPiece: getRandomTetromino(),
  nextPiece: getRandomTetromino(),
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  isPaused: false,
  lineEffect: {
    flashingLines: [],
    shaking: false,
    particles: []
  }
};

interface GameStateStore {
  // State
  gameState: GameState;
  dropTime: number;
  
  // Actions
  setGameState: (gameState: Partial<GameState>) => void;
  updateParticles: (particles: Particle[]) => void;
  resetGame: () => void;
  togglePause: () => void;
  setDropTime: (dropTime: number) => void;
  
  // Line effect actions
  updateLineEffect: (lineEffect: Partial<LineEffectState>) => void;
  clearLineEffect: () => void;
}

export const useGameStateStore = create<GameStateStore>()((set) => ({
  // Initial state
  gameState: INITIAL_GAME_STATE,
  dropTime: 1000,
  
  // Actions
  setGameState: (newGameState) =>
    set((state) => ({
      gameState: { ...state.gameState, ...newGameState }
    })),
  
  updateParticles: (particles) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        lineEffect: {
          ...state.gameState.lineEffect,
          particles
        }
      }
    })),
  
  resetGame: () =>
    set(() => ({
      gameState: {
        board: createEmptyBoard(),
        currentPiece: getRandomTetromino(),
        nextPiece: getRandomTetromino(),
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        isPaused: false,
        lineEffect: {
          flashingLines: [],
          shaking: false,
          particles: []
        }
      },
      dropTime: 1000
    })),
  
  togglePause: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        isPaused: !state.gameState.isPaused
      }
    })),
  
  setDropTime: (dropTime) =>
    set(() => ({ dropTime })),
  
  updateLineEffect: (lineEffect) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        lineEffect: { ...state.gameState.lineEffect, ...lineEffect }
      }
    })),
  
  clearLineEffect: () =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        lineEffect: {
          flashingLines: [],
          shaking: false,
          particles: state.gameState.lineEffect.particles // パーティクルは保持
        }
      }
    }))
}));

// Selector hooks for optimized access
export const useGameState = () => useGameStateStore((state) => state.gameState);
export const useDropTime = () => useGameStateStore((state) => state.dropTime);
export const useGameStateActions = () => useGameStateStore((state) => ({
  setGameState: state.setGameState,
  updateParticles: state.updateParticles,
  resetGame: state.resetGame,
  togglePause: state.togglePause,
  setDropTime: state.setDropTime,
  updateLineEffect: state.updateLineEffect,
  clearLineEffect: state.clearLineEffect
}));