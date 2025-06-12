'use client';

import { memo } from 'react';
import { Tetromino } from '../types/tetris';
import CombinedStatsNextPanel from './CombinedStatsNextPanel';
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
    <div className={`space-y-1 ${className}`}>
      {/* Combined Score & Next Piece */}
      <CombinedStatsNextPanel
        score={score}
        level={level}
        lines={lines}
        nextPiece={nextPiece}
        size='xs'
      />

      {/* Buttons - Horizontal Layout */}
      <GameButtonsPanel
        gameOver={gameOver}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onReset={onReset}
        size='xs'
        layout='horizontal'
      />

      {/* Controls */}
      <ControlsPanel size='xs' />

      {/* High scores */}
      <HighScoreDisplay highScores={highScores} maxDisplay={3} className='text-2xs' size='xs' />

      {/* Score reference - collapsible */}
      <details className='text-2xs'>
        <summary className='cursor-pointer text-cyan-400 hover:text-cyan-300'>
          Score Reference
        </summary>
        <ScoringPanel size='xs' />
      </details>
    </div>
  );
});

export default GameTabContent;
