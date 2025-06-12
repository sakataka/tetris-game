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
    <div className={`space-y-2 ${className}`}>
      {/* Score information */}
      <GameStatsPanel score={score} level={level} lines={lines} size='sm' />

      {/* Next piece */}
      <NextPiecePanel nextPiece={nextPiece} size='sm' />

      {/* Buttons */}
      <GameButtonsPanel
        gameOver={gameOver}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onReset={onReset}
        size='sm'
      />

      {/* Controls */}
      <ControlsPanel size='sm' />

      {/* High scores */}
      <HighScoreDisplay highScores={highScores} maxDisplay={3} className='text-xs' size='sm' />

      {/* Score reference - collapsible */}
      <details className='text-xs'>
        <summary className='cursor-pointer text-cyan-400 hover:text-cyan-300'>
          Score Reference
        </summary>
        <ScoringPanel size='sm' />
      </details>
    </div>
  );
});

export default GameTabContent;
