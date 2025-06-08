'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Particle } from '../types/tetris';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import VirtualControls from './VirtualControls';
import LoadingMessage from './LoadingMessage';
import ErrorBoundary from './ErrorBoundary';
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
    initializeSounds,
    unlockAudio
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

  const handleReset = useCallback(async () => {
    // モバイルでの音声アンロック
    if (isMobile) {
      await unlockAudio();
    }
    onGameStart(); // Track new game start
    resetLegacyGame();
  }, [onGameStart, resetLegacyGame, isMobile, unlockAudio]);

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
    return <LoadingMessage />;
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* デスクトップレイアウト */}
      <div className={`
        hidden md:flex gap-12 items-start justify-center relative h-full p-8
      `}>
        {/* ゲームボード */}
        <ErrorBoundary level="section">
          <div className="relative">
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
        </ErrorBoundary>
        
        {/* ゲーム情報 - 固定高さで安定化 */}
        <ErrorBoundary level="section">
          <div className="relative min-w-[280px] h-[600px]">
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
        </ErrorBoundary>
        
        {/* 接続線エフェクト */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 opacity-30 blur-sm pointer-events-none" style={{
          background: 'linear-gradient(90deg, var(--cyber-cyan) 0%, var(--cyber-purple) 50%, var(--cyber-yellow) 100%)'
        }}></div>
      </div>

      {/* モバイルレイアウト - 完全一画面固定 */}
      <div className="md:hidden h-full flex flex-col">
        {/* 上部：ゲーム + 情報エリア */}
        <div className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pt-4">
          {/* ゲームボード */}
          <ErrorBoundary level="section">
            <div className="relative mb-4">
              <TetrisBoard 
                board={legacyGameState.board}
                currentPiece={legacyGameState.currentPiece}
                gameOver={legacyGameState.gameOver}
                isPaused={legacyGameState.isPaused}
                lineEffect={legacyGameState.lineEffect}
                onParticleUpdate={handleParticleUpdate}
              />
              
              {/* ゲームボード周りのエフェクト */}
              <div className="absolute -inset-2 rounded-lg blur-md pointer-events-none" style={{
                background: 'linear-gradient(90deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)'
              }}></div>
            </div>
          </ErrorBoundary>
          
          {/* コンパクトゲーム情報 */}
          <ErrorBoundary level="component">
            <div className="w-full max-w-sm h-32 overflow-hidden">
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
            </div>
          </ErrorBoundary>
        </div>

        {/* 下部：仮想ボタンエリア - 固定高さ */}
        {isMobile && settings.virtualControlsEnabled && !legacyGameState.gameOver && (
          <ErrorBoundary level="component">
            <div className="h-24 flex-shrink-0">
              <VirtualControls
                onMove={movePiece}
                onRotate={rotatePieceClockwise}
                onHardDrop={hardDrop}
                isVisible={true}
                unlockAudio={unlockAudio}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}