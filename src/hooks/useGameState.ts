import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  GameState,
  Tetromino,
  EFFECT_RESET_DELAY,
  INITIAL_DROP_TIME,
  SoundKey
} from '../types/tetris';
import { 
  createEmptyBoard,
  getRandomTetromino
} from '../utils/tetrisUtils';
import {
  calculateScoreIncrease,
  processLineClear,
  createLineEffects,
  checkGameOver,
  updateGameStateWithPiece
} from '../utils/gameStateUtils';

interface UseGameStateProps {
  playSound?: (soundType: SoundKey) => void;
}

export function useGameState(props: UseGameStateProps = {}) {
  const { playSound } = props;
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
  }, []); // gameState意図的に除外（無限ループ防止）

  const calculatePiecePlacementState = useCallback((prevState: GameState, piece: Tetromino, bonusPoints: number = 0): GameState => {
    // 1. ライン消去処理
    const lineClearResult = processLineClear(prevState.board, piece);
    
    // 2. スコア計算
    const scoreResult = calculateScoreIncrease(
      prevState.score,
      prevState.lines,
      lineClearResult.linesCleared,
      bonusPoints
    );
    
    // 3. ライン消去エフェクト作成
    const lineEffect = createLineEffects(
      lineClearResult.linesCleared,
      lineClearResult.linesToClear,
      lineClearResult.newBoard,
      prevState.lineEffect,
      playSound
    );
    
    // 4. エフェクトタイマー管理（副作用）
    if (lineClearResult.linesCleared > 0) {
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
    
    // 5. ゲームオーバー判定
    const gameOverResult = checkGameOver(
      lineClearResult.newBoard,
      prevState.nextPiece!,
      prevState,
      playSound
    );
    
    // 6. 最終的なゲーム状態更新
    return updateGameStateWithPiece(
      prevState,
      lineClearResult,
      scoreResult,
      lineEffect,
      gameOverResult
    );
  }, [playSound]); // playSound依存関係追加

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