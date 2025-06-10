'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
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
import { useSettings, useUpdateSettings } from '../store/settingsStore';
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
  useRotatePieceTo,
  useClearLineEffect,
} from '../store/gameStateStore';
import { useHighScoreManager } from '../hooks/useHighScoreManager';
import { useSessionTrackingV2 } from '../hooks/useSessionTrackingV2';
import { useInitializeLanguage } from '../store/languageStore';
import { EFFECTS } from '../constants/layout';
import '../i18n'; // Initialize i18n

export default function TetrisGame() {
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
  const clearLineEffect = useClearLineEffect();

  // Language initialization
  const initializeLanguage = useInitializeLanguage();

  // モバイルデバイス検出
  const { isMobile } = useMobileDetection();

  // SSR hydration handling - 簡素化
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Simple hydration check
    setIsHydrated(true);
    // Initialize language once on mount
    initializeLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

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
    getFallbackStatus,
  } = useSounds({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted,
  });

  // playSound関数の安定化（シンプルなuseCallback使用）
  const stablePlaySound = useCallback((soundType: SoundKey) => {
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

  // ライン消去エフェクトの自動クリア
  useEffect(() => {
    const hasActiveEffects =
      gameState.lineEffect.flashingLines.length > 0 || gameState.lineEffect.shaking;

    if (hasActiveEffects) {
      const timer = setTimeout(() => {
        clearLineEffect();
      }, EFFECTS.RESET_DELAY);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [gameState.lineEffect.flashingLines.length, gameState.lineEffect.shaking, clearLineEffect]);

  // useGameControls用のアクションアダプター（playSound依存除去）
  const pieceControlActions = useMemo(() => {
    return {
      onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => {
        movePieceToPosition(newPosition);
        return {
          ...state,
          currentPiece: state.currentPiece
            ? { ...state.currentPiece, position: newPosition }
            : null,
        };
      },
      onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => {
        // 安定化されたplaySound関数を使用してピース着地処理を実行
        calculatePiecePlacementState(piece, bonusPoints, stablePlaySound);
        // calculatePiecePlacementStateがZustandストアを直接更新するため、
        // onStateChangeは呼ばれないが、Reactの再レンダリングで状態は反映される
        return state;
      },
      onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => {
        rotatePieceTo(rotatedPiece);
        return { ...state, currentPiece: rotatedPiece };
      },
    };
  }, [movePieceToPosition, calculatePiecePlacementState, rotatePieceTo, stablePlaySound]); // stablePlaySound追加

  const onGameStateChange = useCallback(
    (newState: GameState) => {
      // 新しい状態が渡されたらZustandストアを更新
      setGameState(newState);
    },
    [setGameState]
  );

  const { movePiece, rotatePieceClockwise, dropPiece, hardDrop } = useGameControls({
    gameState,
    actions: pieceControlActions,
    playSound: stablePlaySound,
    onStateChange: onGameStateChange,
  });

  // ハイスコア管理
  useHighScoreManager({
    gameState,
    playSound: stablePlaySound,
  });

  // セッション管理（V2 - 簡素化版）
  const { onGameStart } = useSessionTrackingV2();

  // ゲームアクション（適切な依存配列で更新）
  const gameActions = useMemo(() => {
    return {
      movePiece,
      rotatePieceClockwise,
      hardDrop,
      dropPiece,
      togglePause,
      resetGame,
    };
  }, [movePiece, rotatePieceClockwise, hardDrop, dropPiece, togglePause, resetGame]);

  // ゲームループ
  useGameLoop({
    isGameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    level: gameState.level,
    dropTime,
    initialDropTime: INITIAL_DROP_TIME,
    actions: gameActions,
    onDropTimeChange: setDropTime,
  });

  // useCallbackでコールバック関数を最適化
  const handleParticleUpdate = useCallback(
    (particles: Particle[]) => {
      updateParticles(particles);
    },
    [updateParticles]
  );

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

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      updateSettings({ volume: newVolume });
      setVolumeLevel(newVolume);
    },
    [updateSettings, setVolumeLevel]
  );

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
      fallbackStatus: fallbackStatus
        ? {
            currentLevel: fallbackStatus.currentLevel,
            availableLevels: fallbackStatus.availableLevels,
            silentMode: fallbackStatus.silentMode,
          }
        : undefined,
      detailedState: detailedState
        ? {
            initialized: detailedState.initialized,
            suspended: detailedState.suspended,
            loadedSounds: detailedState.loadedSounds,
            activeSounds: detailedState.activeSounds,
          }
        : undefined,
    };
  }, [isWebAudioEnabled, getPreloadProgress, getFallbackStatus, getDetailedAudioState]);

  // Show loading until hydration is complete
  if (!isHydrated) {
    return <LoadingMessage />;
  }

  return (
    <div className='h-screen overflow-hidden'>
      {/* デスクトップレイアウト */}
      <div
        className={`
        hidden md:flex gap-12 items-start justify-center relative h-full p-8
      `}
      >
        {/* ゲームボード */}
        <ErrorBoundary level='section'>
          <div className='relative'>
            <TetrisBoard
              board={gameState.board}
              currentPiece={gameState.currentPiece}
              gameOver={gameState.gameOver}
              isPaused={gameState.isPaused}
              lineEffect={gameState.lineEffect}
              onParticleUpdate={handleParticleUpdate}
            />

            {/* ゲームボード周りのエフェクト */}
            <div className='absolute -inset-4 rounded-lg blur-lg pointer-events-none game-board-glow'></div>
          </div>
        </ErrorBoundary>

        {/* ゲーム情報 - 固定高さで安定化 */}
        <ErrorBoundary level='section'>
          <div className='relative min-w-[280px] h-[600px]'>
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
            <div className='absolute -inset-2 rounded-lg blur-md pointer-events-none info-panel-glow'></div>
          </div>
        </ErrorBoundary>

        {/* 接続線エフェクト */}
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 opacity-30 blur-sm pointer-events-none connection-line-glow'></div>
      </div>

      {/* モバイルレイアウト - 完全一画面固定 */}
      <div className='md:hidden h-full flex flex-col'>
        {/* 上部：ゲーム + 情報エリア */}
        <div className='flex-1 overflow-hidden flex flex-col items-center justify-center px-4 pt-4'>
          {/* ゲームボード */}
          <ErrorBoundary level='section'>
            <div className='relative mb-4'>
              <TetrisBoard
                board={gameState.board}
                currentPiece={gameState.currentPiece}
                gameOver={gameState.gameOver}
                isPaused={gameState.isPaused}
                lineEffect={gameState.lineEffect}
                onParticleUpdate={handleParticleUpdate}
              />

              {/* ゲームボード周りのエフェクト */}
              <div className='absolute -inset-2 rounded-lg blur-md pointer-events-none game-board-glow'></div>
            </div>
          </ErrorBoundary>

          {/* コンパクトゲーム情報 */}
          <ErrorBoundary level='component'>
            <div className='w-full max-w-sm h-32 overflow-hidden'>
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
          <ErrorBoundary level='component'>
            <div className='h-24 flex-shrink-0'>
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
