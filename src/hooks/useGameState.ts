import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  GameState,
  Tetromino,
  EFFECT_RESET_DELAY,
  BASE_LINE_POINTS,
  TETRIS_BONUS_POINTS
} from '../types/tetris';
import { 
  createEmptyBoard,
  getRandomTetromino,
  placePiece,
  clearLines,
  createParticles,
  isValidPosition
} from '../utils/tetrisUtils';

const INITIAL_DROP_TIME = 1000;

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => ({
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
  }));

  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateParticles = useCallback((newParticles: typeof gameState.lineEffect.particles) => {
    setGameState(prevState => ({
      ...prevState,
      lineEffect: {
        ...prevState.lineEffect,
        particles: newParticles
      }
    }));
  }, []);

  const calculatePiecePlacementState = useCallback((prevState: GameState, piece: Tetromino, bonusPoints: number = 0): GameState => {
    const newBoard = placePiece(prevState.board, piece);
    const { newBoard: clearedBoard, linesCleared, linesToClear } = clearLines(newBoard);
    
    const newLines = prevState.lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    const newScore = prevState.score + 
      (linesCleared * BASE_LINE_POINTS * newLevel) + 
      (linesCleared === 4 ? TETRIS_BONUS_POINTS * newLevel : 0) + // Tetris bonus
      bonusPoints;

    const nextPiece = getRandomTetromino();
    
    // ライン消去アニメーション効果
    let newLineEffect = { ...prevState.lineEffect };
    if (linesCleared > 0) {
      newLineEffect = {
        flashingLines: linesToClear,
        shaking: true,
        particles: [
          ...prevState.lineEffect.particles,
          ...createParticles(linesToClear, newBoard)
        ]
      };
      
      // 既存のタイマーをクリア
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
      
      // アニメーション後にエフェクトをリセット
      effectTimeoutRef.current = setTimeout(() => {
        setGameState(currentState => ({
          ...currentState,
          lineEffect: {
            ...currentState.lineEffect,
            flashingLines: [],
            shaking: false
          }
        }));
        effectTimeoutRef.current = null;
      }, EFFECT_RESET_DELAY);
    }
    
    // Check if game is over
    if (!isValidPosition(clearedBoard, prevState.nextPiece!, prevState.nextPiece!.position)) {
      return {
        ...prevState,
        board: clearedBoard,
        gameOver: true,
        score: newScore,
        level: newLevel,
        lines: newLines,
        lineEffect: newLineEffect
      };
    }

    return {
      ...prevState,
      board: clearedBoard,
      currentPiece: prevState.nextPiece,
      nextPiece: nextPiece,
      score: newScore,
      level: newLevel,
      lines: newLines,
      lineEffect: newLineEffect
    };
  }, []);

  const resetGame = useCallback(() => {
    // エフェクトタイマーをクリア
    if (effectTimeoutRef.current) {
      clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = null;
    }
    
    setGameState({
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
    });
    setDropTime(INITIAL_DROP_TIME);
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused
    }));
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    setGameState,
    dropTime,
    setDropTime,
    updateParticles,
    calculatePiecePlacementState,
    resetGame,
    togglePause,
    INITIAL_DROP_TIME
  };
}