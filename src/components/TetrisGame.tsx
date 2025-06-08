'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
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

  // 게임 액션들 취득
  const { 
    calculatePiecePlacementState, 
    movePieceToPosition, 
    rotatePieceTo 
  } = useGameStateActions();
  const INITIAL_DROP_TIME = 1000; // 정수화

  // 음성 초기화
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // useGameControls를 위한 액션 어댑터들
  const pieceControlActions = useMemo(() => ({
    onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => {
      movePieceToPosition(newPosition);
      return { ...state, currentPiece: state.currentPiece ? { ...state.currentPiece, position: newPosition } : null };
    },
    onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => {
      calculatePiecePlacementState(piece, bonusPoints, playSound);
      // 상태는 calculatePiecePlacementState에서 자동으로 업데이트됨
      return state;
    },
    onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => {
      rotatePieceTo(rotatedPiece);
      return { ...state, currentPiece: rotatedPiece };
    }
  }), [movePieceToPosition, calculatePiecePlacementState, rotatePieceTo, playSound]);

  const onGameStateChange = useCallback((newState: GameState) => {
    // 새로운 상태가 전달되면 Zustand 스토어를 업데이트
    setGameState(newState);
  }, [setGameState]);

  // 게임 조작
  const {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  } = useGameControls({
    gameState,
    actions: pieceControlActions,
    playSound,
    onStateChange: onGameStateChange
  });

  // 하이스코어 관리
  useHighScoreManager({
    gameState,
    playSound
  });

  // 세션 관리
  const { onGameStart } = useSessionTracking();

  // 게임 액션들
  const gameActions = useMemo(() => ({
    movePiece,
    rotatePieceClockwise,
    hardDrop,
    dropPiece,
    togglePause,
    resetGame
  }), [movePiece, rotatePieceClockwise, hardDrop, dropPiece, togglePause, resetGame]);

  // 게임 루프
  useGameLoop({
    isGameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    level: gameState.level,
    dropTime,
    initialDropTime: INITIAL_DROP_TIME,
    actions: gameActions,
    onDropTimeChange: setDropTime
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