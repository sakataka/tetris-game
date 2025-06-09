'use client';

import { memo } from 'react';
import { Tetromino, GameSettings } from '../types/tetris';
import GameStatsPanel from './GameStatsPanel';
import NextPiecePanel from './NextPiecePanel';
import ControlsPanel from './ControlsPanel';
import AudioPanel from './AudioPanel';
import GameButtonsPanel from './GameButtonsPanel';
import ScoringPanel from './ScoringPanel';
import HighScoreDisplay from './HighScoreDisplay';
import { useHighScores } from '../store/statisticsStore';

interface GameTabContentProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  onReset: () => void;
  onTogglePause: () => void;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  // Audio system status for enhanced display
  audioSystemStatus?: {
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
  className?: string;
}

const GameTabContent = memo(function GameTabContent({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  onReset,
  onTogglePause,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  settings,
  updateSettings,
  audioSystemStatus,
  className = ''
}: GameTabContentProps) {
  const highScores = useHighScores();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* スコア情報 */}
      <GameStatsPanel 
        score={score}
        level={level}
        lines={lines}
      />

      {/* 次のピース */}
      <NextPiecePanel 
        nextPiece={nextPiece}
      />

      {/* コントロール */}
      <ControlsPanel />

      {/* 音設定 */}
      <AudioPanel 
        isMuted={isMuted}
        volume={volume}
        settings={settings}
        audioStatus={audioSystemStatus}
        onToggleMute={onToggleMute}
        onVolumeChange={onVolumeChange}
        onUpdateSettings={updateSettings}
      />

      {/* ボタン */}
      <GameButtonsPanel 
        gameOver={gameOver}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onReset={onReset}
      />

      {/* スコア目安 */}
      <ScoringPanel />

      {/* ハイスコア */}
      <HighScoreDisplay 
        highScores={highScores} 
        maxDisplay={5}
        className="text-sm"
      />
    </div>
  );
});

export default GameTabContent;