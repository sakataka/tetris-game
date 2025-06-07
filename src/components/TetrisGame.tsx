'use client';

import { useCallback, useEffect } from 'react';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import { useGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSounds } from '../hooks/useSounds';

export default function TetrisGame() {
  // 音効果システム
  const {
    playSound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    initializeSounds
  } = useSounds();

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
  } = useGameState({ playSound });

  // 音声初期化
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // ゲーム操作
  const {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  } = useGameControls({
    setGameState,
    calculatePiecePlacementState,
    playSound
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
        <div className="absolute -inset-4 rounded-lg blur-lg pointer-events-none" style={{
          background: 'linear-gradient(90deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)'
        }}></div>
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
          isMuted={isMuted}
          volume={volume}
          onToggleMute={toggleMute}
          onVolumeChange={setVolumeLevel}
        />
        
        {/* 情報パネル周りのエフェクト */}
        <div className="absolute -inset-2 rounded-lg blur-md pointer-events-none" style={{
          background: 'linear-gradient(270deg, var(--cyber-purple-10) 0%, var(--cyber-cyan-10) 50%, var(--cyber-yellow-10) 100%)'
        }}></div>
      </div>
      
      {/* 接続線エフェクト */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 opacity-30 blur-sm pointer-events-none" style={{
        background: 'linear-gradient(90deg, var(--cyber-cyan) 0%, var(--cyber-purple) 50%, var(--cyber-yellow) 100%)'
      }}></div>
    </div>
  );
}