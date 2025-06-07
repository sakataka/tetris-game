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
    <div className="flex gap-12 items-start justify-center relative">
      {/* ゲームボード */}
      <div className="relative">
        <TetrisBoard 
          board={gameState.board}
          currentPiece={gameState.currentPiece}
          gameOver={gameState.gameOver}
          isPaused={gameState.isPaused}
          lineEffect={gameState.lineEffect}
          onParticleUpdate={handleParticleUpdate}
        />
        
        {/* ゲームボード周りのエフェクト */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-yellow-400/10 rounded-lg blur-lg pointer-events-none"></div>
      </div>
      
      {/* ゲーム情報 */}
      <div className="relative">
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
        
        {/* 情報パネル周りのエフェクト */}
        <div className="absolute -inset-2 bg-gradient-to-l from-purple-400/5 via-cyan-400/5 to-yellow-400/5 rounded-lg blur-md pointer-events-none"></div>
      </div>
      
      {/* 接続線エフェクト */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 opacity-30 blur-sm pointer-events-none"></div>
    </div>
  );
}