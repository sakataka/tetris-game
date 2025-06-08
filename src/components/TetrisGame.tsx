'use client';

import { useCallback, useEffect, useState } from 'react';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import { useGameState as useGameStateOld } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSounds } from '../hooks/useSounds';
import { 
  useGameState,
  useGameActions,
  useSettings
} from '../store/gameStore';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
// import { useSessionTracking } from '../hooks/useSessionTracking';

export default function TetrisGame() {
  // Zustand状態管理
  const gameState = useGameState();
  const { updateParticles, resetGame, togglePause } = useGameActions();
  const { settings, updateSettings } = useSettings();

  // SSR hydration handling - 簡素化
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Simple hydration check
    setIsHydrated(true);
  }, []);

  // 音効果システム
  const {
    playSound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    initializeSounds
  } = useSounds({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted
  });

  // 従来のhook（徐々に移行）
  const {
    gameState: oldGameState,
    setGameState: setGameStateOld,
    dropTime,
    setDropTime,
    calculatePiecePlacementState,
    INITIAL_DROP_TIME
  } = useGameStateOld({ playSound });

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
    setGameState: setGameStateOld,
    calculatePiecePlacementState,
    playSound
  });

  // ハイスコア管理
  useHighScoreManager({
    gameState: oldGameState,
    playSound
  });

  // セッション管理 - 一時的に無効化
  // const { onGameStart } = useSessionTracking();

  // ゲームループとキーボード入力
  useGameLoop({
    gameState: oldGameState,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleParticleUpdate = useCallback((particles: typeof gameState.lineEffect.particles) => {
    updateParticles(particles);
  }, [updateParticles]); // gameState意図的に除外（無限ループ防止）

  const handleReset = useCallback(() => {
    // onGameStart(); // Track new game start - 一時的に無効化
    resetGame();
  }, [resetGame]);

  const handleTogglePause = useCallback(() => {
    togglePause();
  }, [togglePause]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    updateSettings({ volume: newVolume });
    setVolumeLevel(newVolume);
  }, [updateSettings, setVolumeLevel]);

  const handleToggleMute = useCallback(() => {
    updateSettings({ isMuted: !settings.isMuted });
    toggleMute();
  }, [updateSettings, settings.isMuted, toggleMute]);

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyber-cyan text-2xl font-bold animate-pulse">
          Loading Game...
        </div>
      </div>
    );
  }

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
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
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