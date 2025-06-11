'use client';

import { memo } from 'react';
import { Tetromino } from '../types/tetris';
import GameStatsPanel from './GameStatsPanel';
import NextPiecePanel from './NextPiecePanel';
import ControlsPanel from './ControlsPanel';
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
  className = '',
}: GameTabContentProps) {
  const highScores = useHighScores();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Score information */}
      <GameStatsPanel score={score} level={level} lines={lines} />

      {/* Next piece */}
      <NextPiecePanel nextPiece={nextPiece} />

      {/* Controls */}
      <ControlsPanel />

      {/* Buttons */}
      <GameButtonsPanel
        gameOver={gameOver}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onReset={onReset}
      />

      {/* Score reference */}
      <ScoringPanel />

      {/* High scores */}
      <HighScoreDisplay highScores={highScores} maxDisplay={5} className='text-sm' />
    </div>
  );
});

export default GameTabContent;
