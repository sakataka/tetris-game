import { create } from 'zustand';
import { GameState, LineEffectState, Particle, Tetromino, INITIAL_DROP_TIME, SoundKey } from '../types/tetris';
import { createEmptyBoard, getRandomTetromino } from '../utils/tetrisUtils';
import {
  calculateScoreIncrease,
  processLineClear,
  createLineEffects,
  checkGameOver,
  updateGameStateWithPiece
} from '../utils/gameStateUtils';

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
  
  // Game logic action
  calculatePiecePlacementState: (piece: Tetromino, bonusPoints?: number, playSound?: (soundType: SoundKey) => void) => void;
}

export const useGameStateStore = create<GameStateStore>()((set) => ({
  // Initial state
  gameState: INITIAL_GAME_STATE,
  dropTime: INITIAL_DROP_TIME,
  
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
      dropTime: INITIAL_DROP_TIME
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
    })),
  
  calculatePiecePlacementState: (piece, bonusPoints = 0, playSound) =>
    set((state) => {
      // 1. ライン消去処理
      const lineClearResult = processLineClear(state.gameState.board, piece);
      
      // 2. スコア計算
      const scoreResult = calculateScoreIncrease(
        state.gameState.score,
        state.gameState.lines,
        lineClearResult.linesCleared,
        bonusPoints
      );
      
      // 3. ライン消去エフェクト作成
      const lineEffect = createLineEffects(
        lineClearResult.linesCleared,
        lineClearResult.linesToClear,
        lineClearResult.newBoard,
        state.gameState.lineEffect,
        playSound
      );
      
      // 4. ゲームオーバー判定
      const gameOverResult = checkGameOver(
        lineClearResult.newBoard,
        state.gameState.nextPiece!,
        state.gameState,
        playSound
      );
      
      // 5. 最終的なゲーム状態更新
      const newGameState = updateGameStateWithPiece(
        state.gameState,
        lineClearResult,
        scoreResult,
        lineEffect,
        gameOverResult
      );
      
      return {
        gameState: newGameState,
        dropTime: state.dropTime
      };
    })
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
  clearLineEffect: state.clearLineEffect,
  calculatePiecePlacementState: state.calculatePiecePlacementState
}));