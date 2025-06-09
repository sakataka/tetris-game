import { create } from 'zustand';
import { GameState, LineEffectState, Particle, Tetromino, SoundKey } from '../types/tetris';
import { INITIAL_DROP_TIME } from '../constants';
import { 
  createEmptyBoard, 
  getRandomTetromino,
  calculateScoreIncrease,
  processLineClear,
  createLineEffects,
  checkGameOver,
  updateGameStateWithPiece
} from '../utils/game';

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
  
  // Piece control adapters for useGameControls
  movePieceToPosition: (newPosition: { x: number; y: number }) => void;
  rotatePieceTo: (rotatedPiece: Tetromino) => void;
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
      // 0. ピース着地音を再生（ライン消去音より前に）
      if (playSound) {
        if (bonusPoints > 0) {
          // ボーナスポイントがある場合はハードドロップ音
          playSound('hardDrop');
        } else {
          // 通常のピース着地音
          playSound('pieceLand');
        }
      }
      
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
    }),
  
  // Piece control adapters for useGameControls
  movePieceToPosition: (newPosition) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        currentPiece: state.gameState.currentPiece
          ? { ...state.gameState.currentPiece, position: newPosition }
          : null
      }
    })),
  
  rotatePieceTo: (rotatedPiece) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        currentPiece: rotatedPiece
      }
    }))
}));

// Selector hooks for optimized access
export const useGameState = () => useGameStateStore((state) => state.gameState);
export const useDropTime = () => useGameStateStore((state) => state.dropTime);

// 個別アクションフック（関数参照安定化）
export const useSetGameState = () => useGameStateStore((state) => state.setGameState);
export const useUpdateParticles = () => useGameStateStore((state) => state.updateParticles);
export const useResetGame = () => useGameStateStore((state) => state.resetGame);
export const useTogglePause = () => useGameStateStore((state) => state.togglePause);
export const useSetDropTime = () => useGameStateStore((state) => state.setDropTime);
export const useUpdateLineEffect = () => useGameStateStore((state) => state.updateLineEffect);
export const useClearLineEffect = () => useGameStateStore((state) => state.clearLineEffect);
export const useCalculatePiecePlacementState = () => useGameStateStore((state) => state.calculatePiecePlacementState);
export const useMovePieceToPosition = () => useGameStateStore((state) => state.movePieceToPosition);
export const useRotatePieceTo = () => useGameStateStore((state) => state.rotatePieceTo);