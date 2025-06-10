'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { GameState, SoundKey, LineEffectState, Tetromino } from '../types/tetris';
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
import { EFFECTS } from '../constants/layout';

// Define the API interface that will be passed to children
export interface GameControllerAPI {
  // Game state
  gameState: GameState;
  dropTime: number;

  // Audio system
  isMuted: boolean;
  volume: number;
  audioSystemStatus: {
    isWebAudioEnabled: boolean;
    preloadProgress?: {
      total: number;
      loaded: number;
      failed: number;
      progress: number;
    };
    fallbackStatus?: {
      currentLevel: number;
      availableLevels: string[];
      silentMode: boolean;
    };
    detailedState?: {
      initialized: boolean;
      suspended: boolean;
      loadedSounds: string[];
      activeSounds: number;
    };
  };

  // Device detection
  isMobile: boolean;

  // Event handlers
  onReset: () => void;
  onTogglePause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;

  // Virtual controls (for mobile)
  onMove: (direction: { x: number; y: number }) => void;
  onRotate: () => void;
  onHardDrop: () => void;
  unlockAudio: () => Promise<void>;

  // Settings
  settings: ReturnType<typeof useSettings>;
  updateSettings: ReturnType<typeof useUpdateSettings>;
}

interface GameLogicControllerProps {
  children: (api: GameControllerAPI) => React.ReactNode;
}

/**
 * GameLogicController manages game state, audio system, and business logic integration.
 * Responsibilities:
 * - Zustand store integration
 * - Sound system management
 * - Game controls and loop integration
 * - High score and session management
 * - Event handler coordination
 */
export default function GameLogicController({ children }: GameLogicControllerProps) {
  // Zustand store integration
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

  // Mobile device detection
  const { isMobile } = useMobileDetection();

  // Sound system integration
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

  // Stabilized playSound function
  const stablePlaySound = useCallback((soundType: SoundKey) => {
    playSound(soundType);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Game action functions
  const calculatePiecePlacementState = useCalculatePiecePlacementState();
  const movePieceToPosition = useMovePieceToPosition();
  const rotatePieceTo = useRotatePieceTo();

  // Initialize sounds
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // Line clear effect auto-cleanup
  useEffect(() => {
    const hasActiveEffects =
      gameState.lineEffect.flashingLines.length > 0 ||
      gameState.lineEffect.particles.some((p) => p.life > 0);

    if (hasActiveEffects) {
      const timeoutId = setTimeout(() => {
        clearLineEffect();
      }, EFFECTS.FLASH_DURATION);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [gameState.lineEffect.flashingLines, gameState.lineEffect.particles, clearLineEffect]);

  // Piece control actions
  const pieceControlActions = useMemo(() => {
    return {
      onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => {
        movePieceToPosition(newPosition);
        return state; // Zustand integration handles state update
      },
      onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => {
        calculatePiecePlacementState(piece, bonusPoints, stablePlaySound);
        return state; // Zustand integration handles state update
      },
      onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => {
        rotatePieceTo(rotatedPiece);
        return state; // Zustand integration handles state update
      },
    };
  }, [movePieceToPosition, rotatePieceTo, calculatePiecePlacementState, stablePlaySound]);

  // High score and session management
  useHighScoreManager({
    gameState,
    playSound: stablePlaySound,
  });
  const { onGameStart, endSession } = useSessionTrackingV2();

  // Monitor game over state to end session
  useEffect(() => {
    if (gameState.gameOver) {
      endSession();
    }
  }, [gameState.gameOver, endSession]);

  // Game controls integration with API exposure
  const gameControls = useGameControls({
    gameState,
    actions: pieceControlActions,
    playSound: stablePlaySound,
    onStateChange: setGameState,
  });

  // Game loop integration
  useGameLoop({
    isGameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    level: gameState.level,
    dropTime,
    initialDropTime: 1000, // Initial drop time in milliseconds
    actions: {
      movePiece: gameControls.movePiece,
      rotatePieceClockwise: gameControls.rotatePieceClockwise,
      hardDrop: gameControls.hardDrop,
      dropPiece: gameControls.dropPiece,
      togglePause: togglePause,
      resetGame: resetGame,
    },
    onDropTimeChange: setDropTime,
  });

  // Event handlers
  const handleReset = useCallback(() => {
    onGameStart();
    resetGame();
  }, [onGameStart, resetGame]);

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

  const handleParticleUpdate = useCallback(
    (particles: LineEffectState['particles']) => {
      updateParticles(particles);
    },
    [updateParticles]
  );

  // Audio system status computation
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

  // Construct API object
  const gameControllerAPI: GameControllerAPI = {
    gameState,
    dropTime,
    isMuted,
    volume,
    audioSystemStatus,
    isMobile,
    onReset: handleReset,
    onTogglePause: handleTogglePause,
    onVolumeChange: handleVolumeChange,
    onToggleMute: handleToggleMute,
    onParticleUpdate: handleParticleUpdate,
    onMove: gameControls.movePiece,
    onRotate: gameControls.rotatePieceClockwise,
    onHardDrop: gameControls.hardDrop,
    unlockAudio,
    settings,
    updateSettings,
  };

  return children(gameControllerAPI);
}
