'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import type { Particle, Tetromino, GameState, SoundKey } from '../types/tetris';
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
  useUpdateSettings
} from '../store/settingsStore';
import { 
  useGameState,
  useDropTime,
  useSetGameState,
  useUpdateParticles,
  useResetGame,
  useTogglePause,
  useSetDropTime,
  useCalculatePiecePlacementState,
  useMovePieceToPosition,
  useRotatePieceTo
} from '../store/gameStateStore';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import { useSessionTracking } from '../hooks/useSessionTracking';

export default function TetrisGame() {
  // 🔍 DEBUG: レンダリング回数をトレース
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`🔍 TetrisGame render #${renderCount.current}`);

  // 新しい分割Zustandストア
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const gameState = useGameState();
  const dropTime = useDropTime();
  const setGameState = useSetGameState();
  const updateParticles = useUpdateParticles();
  const resetGame = useResetGame();
  const togglePause = useTogglePause();
  const setDropTime = useSetDropTime();

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
    unlockAudio,
    isWebAudioEnabled,
    getDetailedAudioState,
    getPreloadProgress,
    getFallbackStatus
  } = useSounds({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted
  });

  // 🔍 DEBUG: playSound関数の作成をトレース
  console.log(`🔍 playSound created/updated, isMuted: ${isMuted}, volume: ${volume}`);
  
  // playSound関数の安定化（シンプルなuseCallback使用）
  const stablePlaySound = useCallback((soundType: SoundKey) => {
    console.log(`🔍 stablePlaySound called: ${soundType}`);
    playSound(soundType);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ゲームアクション取得
  const calculatePiecePlacementState = useCalculatePiecePlacementState();
  const movePieceToPosition = useMovePieceToPosition();
  const rotatePieceTo = useRotatePieceTo();
  const INITIAL_DROP_TIME = 1000; // 定数化

  // 音声初期化
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // 🔍 DEBUG: pieceControlActions作成をトレース
  console.log(`🔍 Creating pieceControlActions`);
  
  // useGameControls用のアクションアダプター（playSound依存除去）
  const pieceControlActions = useMemo(() => {
    console.log(`🔍 pieceControlActions useMemo executed`);
    return {
      onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => {
        movePieceToPosition(newPosition);
        return { ...state, currentPiece: state.currentPiece ? { ...state.currentPiece, position: newPosition } : null };
      },
      onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => {
        // 安定化されたplaySound関数を使用
        calculatePiecePlacementState(piece, bonusPoints, stablePlaySound);
        // 状態はcalculatePiecePlacementStateで自動更新される
        return state;
      },
      onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => {
        rotatePieceTo(rotatedPiece);
        return { ...state, currentPiece: rotatedPiece };
      }
    };
  }, [movePieceToPosition, calculatePiecePlacementState, rotatePieceTo, stablePlaySound]); // stablePlaySound追加

  const onGameStateChange = useCallback((newState: GameState) => {
    console.log(`🔍 onGameStateChange called`);
    // 新しい状態が渡されたらZustandストアを更新
    setGameState(newState);
  }, [setGameState]);


  const {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  } = useGameControls({
    gameState,
    actions: pieceControlActions,
    playSound: stablePlaySound,
    onStateChange: onGameStateChange
  });

  // ハイスコア管理
  useHighScoreManager({
    gameState,
    playSound: stablePlaySound
  });

  // セッション管理
  const { onGameStart } = useSessionTracking();

  // 🔍 DEBUG: gameActions作成をトレース
  console.log(`🔍 Creating gameActions`);
  
  // ゲームアクション（関数参照固定）
  const gameActions = useMemo(() => {
    console.log(`🔍 gameActions useMemo executed`);
    return {
      movePiece,
      rotatePieceClockwise,
      hardDrop,
      dropPiece,
      togglePause,
      resetGame
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ゲームループ
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

  // 音声システム状態の取得
  const audioSystemStatus = useMemo(() => {
    const fallbackStatus = getFallbackStatus();
    const detailedState = getDetailedAudioState();
    
    return {
      isWebAudioEnabled,
      preloadProgress: getPreloadProgress(),
      fallbackStatus: fallbackStatus ? {
        currentLevel: fallbackStatus.currentLevel,
        availableLevels: fallbackStatus.availableLevels,
        silentMode: fallbackStatus.silentMode
      } : undefined,
      detailedState: detailedState ? {
        initialized: detailedState.initialized,
        suspended: detailedState.suspended,
        loadedSounds: detailedState.loadedSounds,
        activeSounds: detailedState.activeSounds
      } : undefined
    };
  }, [isWebAudioEnabled, getPreloadProgress, getFallbackStatus, getDetailedAudioState]);

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
              audioSystemStatus={audioSystemStatus}
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