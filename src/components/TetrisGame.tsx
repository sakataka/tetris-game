'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Particle, Tetromino, GameState } from '../types/tetris';
import TetrisBoard from './TetrisBoard';
import GameInfo from './GameInfo';
import VirtualControls from './VirtualControls';
import LoadingMessage from './LoadingMessage';
import ErrorBoundary from './ErrorBoundary';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSounds } from '../hooks/useSounds';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { 
  useSettings,
  useSettingsActions
} from '../store/settingsStore';
import { 
  useGameState,
  useDropTime,
  useGameStateActions
} from '../store/gameStateStore';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import { useSessionTracking } from '../hooks/useSessionTracking';

export default function TetrisGame() {
  // 新しい分割Zustandストア
  const settings = useSettings();
  const { updateSettings } = useSettingsActions();
  const gameState = useGameState();
  const dropTime = useDropTime();
  const { 
    setGameState, 
    updateParticles, 
    resetGame, 
    togglePause, 
    setDropTime 
  } = useGameStateActions();

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

  // 新しいZustandストアからCalculatePiecePlacementState取得
  const { calculatePiecePlacementState } = useGameStateActions();
  const INITIAL_DROP_TIME = 1000; // 定数化

  // 音声初期化
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // useGameControlsにsetStateアダプターを提供
  const setGameStateAdapter = useCallback((updater: React.SetStateAction<GameState>) => {
    if (typeof updater === 'function') {
      // Zustandのset関数を使用して関数形式のupdaterに対応
      setGameState(updater(gameState));
    } else {
      setGameState(updater);
    }
  }, [setGameState, gameState]);

  const calculatePlacementAdapter = useCallback((prevState: GameState, piece: Tetromino, bonusPoints?: number): GameState => {
    // ここでZustandのcalculatePiecePlacementStateを呼び出して結果を返す
    calculatePiecePlacementState(piece, bonusPoints, playSound);
    return gameState; // 更新後の状態を返す（暫定）
  }, [calculatePiecePlacementState, playSound, gameState]);

  const setDropTimeAdapter = useCallback((updater: React.SetStateAction<number>) => {
    if (typeof updater === 'function') {
      setDropTime(updater(dropTime));
    } else {
      setDropTime(updater);
    }
  }, [setDropTime, dropTime]);

  // ゲーム操作
  const {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  } = useGameControls({
    setGameState: setGameStateAdapter,
    calculatePiecePlacementState: calculatePlacementAdapter,
    playSound
  });

  // ハイスコア管理
  useHighScoreManager({
    gameState,
    playSound
  });

  // セッション管理
  const { onGameStart } = useSessionTracking();

  // ゲームループとキーボード入力
  useGameLoop({
    gameState,
    dropTime,
    setDropTime: setDropTimeAdapter,
    dropPiece,
    movePiece,
    rotatePieceClockwise,
    hardDrop,
    togglePause,
    resetGame,
    INITIAL_DROP_TIME
  });

  // useCallbackでコールバック関数を最適化
  const handleParticleUpdate = useCallback((particles: Particle[]) => {
    updateParticles(particles);
  }, [updateParticles]);

  const handleReset = useCallback(async () => {
    // モバイルでの音声アンロック
    if (isMobile) {
      await unlockAudio();
    }
    onGameStart(); // Track new game start
    resetGame();
  }, [onGameStart, resetGame, isMobile, unlockAudio]);

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
        </ErrorBoundary>
        
        {/* ゲーム情報 - 固定高さで安定化 */}
        <ErrorBoundary level="section">
          <div className="relative min-w-[280px] h-[600px]">
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
                board={gameState.board}
                currentPiece={gameState.currentPiece}
                gameOver={gameState.gameOver}
                isPaused={gameState.isPaused}
                lineEffect={gameState.lineEffect}
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
            </div>
          </ErrorBoundary>
        </div>

        {/* 下部：仮想ボタンエリア - 固定高さ */}
        {isMobile && settings.virtualControlsEnabled && !gameState.gameOver && (
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