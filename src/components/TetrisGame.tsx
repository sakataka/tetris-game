'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Particle } from '../types/tetris';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import VirtualControls from './VirtualControls';
import { useGameState as useLegacyGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSounds } from '../hooks/useSounds';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { 
  useSettings
} from '../store/gameStore';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import { useSessionTracking } from '../hooks/useSessionTracking';

export default function TetrisGame() {
  // Zustand状態管理
  const { settings, updateSettings } = useSettings();

  // モバイルデバイス検出
  const { isMobile } = useMobileDetection();

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

  // レガシーhook（段階的移行中）
  const {
    gameState: legacyGameState,
    setGameState: setLegacyGameState,
    dropTime,
    setDropTime,
    calculatePiecePlacementState,
    resetGame: resetLegacyGame,
    togglePause: toggleLegacyPause,
    updateParticles: updateLegacyParticles,
    INITIAL_DROP_TIME
  } = useLegacyGameState({ playSound });

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
    setGameState: setLegacyGameState,
    calculatePiecePlacementState,
    playSound
  });

  // ハイスコア管理
  useHighScoreManager({
    gameState: legacyGameState,
    playSound
  });

  // セッション管理
  const { onGameStart } = useSessionTracking();

  // ゲームループとキーボード入力
  useGameLoop({
    gameState: legacyGameState,
    dropTime,
    setDropTime,
    dropPiece,
    movePiece,
    rotatePieceClockwise,
    hardDrop,
    togglePause: toggleLegacyPause,
    resetGame: resetLegacyGame,
    INITIAL_DROP_TIME
  });

  // useCallbackでコールバック関数を最適化
  const handleParticleUpdate = useCallback((particles: Particle[]) => {
    updateLegacyParticles(particles);
  }, [updateLegacyParticles]);

  const handleReset = useCallback(() => {
    onGameStart(); // Track new game start
    resetLegacyGame();
  }, [onGameStart, resetLegacyGame]);

  const handleTogglePause = useCallback(() => {
    toggleLegacyPause();
  }, [toggleLegacyPause]);

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
    <div className={`
      flex gap-12 items-start justify-center relative
      md:flex-row md:gap-12
      max-md:flex-col max-md:gap-6 max-md:items-center max-md:px-4
      ${isMobile && settings.virtualControlsEnabled ? 'max-md:pb-32' : 'max-md:pb-8'}
    `}>
      {/* ゲームボード */}
      <div className="relative max-md:order-1">
        <TetrisBoard 
          board={legacyGameState.board}
          currentPiece={legacyGameState.currentPiece}
          gameOver={legacyGameState.gameOver}
          isPaused={legacyGameState.isPaused}
          lineEffect={legacyGameState.lineEffect}
          onParticleUpdate={handleParticleUpdate}
        />
        
        {/* ゲームボード周りのエフェクト */}
        <div className="absolute -inset-4 rounded-lg blur-lg pointer-events-none" style={{
          background: 'linear-gradient(90deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)'
        }}></div>
      </div>
      
      {/* ゲーム情報 */}
      <div className="relative max-md:order-2 max-md:w-full max-md:max-w-md">
        <GameInfo 
          score={legacyGameState.score}
          level={legacyGameState.level}
          lines={legacyGameState.lines}
          nextPiece={legacyGameState.nextPiece}
          gameOver={legacyGameState.gameOver}
          isPaused={legacyGameState.isPaused}
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
      
      {/* 接続線エフェクト - デスクトップのみ表示 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 opacity-30 blur-sm pointer-events-none max-md:hidden" style={{
        background: 'linear-gradient(90deg, var(--cyber-cyan) 0%, var(--cyber-purple) 50%, var(--cyber-yellow) 100%)'
      }}></div>

      {/* Virtual Controls for Mobile */}
      <VirtualControls
        onMove={movePiece}
        onRotate={rotatePieceClockwise}
        onHardDrop={hardDrop}
        isVisible={isMobile && settings.virtualControlsEnabled && !legacyGameState.gameOver}
      />
    </div>
  );
}