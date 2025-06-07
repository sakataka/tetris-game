'use client';

import { useCallback } from 'react';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import { useGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';

export default function TetrisGame() {
  // ゲーム状態管理
  const {
    gameState,
    setGameState,
    dropTime,
    setDropTime,
    updateParticles,
    calculatePiecePlacementState,
    resetGame,
    togglePause,
    INITIAL_DROP_TIME
  } = useGameState();

  // ゲーム操作
  const {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  } = useGameControls({
    setGameState,
    calculatePiecePlacementState
  });

  // ゲームループとキーボード入力
  useGameLoop({
    gameState,
    dropTime,
    setDropTime,
    dropPiece,
    movePiece,
    rotatePieceClockwise,
    hardDrop,
    togglePause,
    resetGame,
    INITIAL_DROP_TIME
  });

  // useCallbackでコールバック関数を最適化
  const handleParticleUpdate = useCallback((particles: typeof gameState.lineEffect.particles) => {
    updateParticles(particles);
  }, [updateParticles]);

  const handleReset = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleTogglePause = useCallback(() => {
    togglePause();
  }, [togglePause]);

  return (
    <div className="flex gap-8 items-start">
      <TetrisBoard 
        board={gameState.board}
        currentPiece={gameState.currentPiece}
        gameOver={gameState.gameOver}
        isPaused={gameState.isPaused}
        lineEffect={gameState.lineEffect}
        onParticleUpdate={handleParticleUpdate}
      />
      <GameInfo 
        score={gameState.score}
        level={gameState.level}
        lines={gameState.lines}
        nextPiece={gameState.nextPiece}
        gameOver={gameState.gameOver}
        isPaused={gameState.isPaused}
        onReset={handleReset}
        onTogglePause={handleTogglePause}
      />
    </div>
  );
}