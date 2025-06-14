'use client';

import { memo } from 'react';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import { useHighScores } from '../store/statisticsStore';
import type { Tetromino } from '../types/tetris';
import CombinedStatsNextPanel from './CombinedStatsNextPanel';
import ControlsPanel from './ControlsPanel';
import HighScoreDisplay from './HighScoreDisplay';
import ScoringPanel from './ScoringPanel';

interface GameTabContentProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  className?: string;
}

const GameTabContent = memo(function GameTabContent({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  className = '',
}: GameTabContentProps) {
  const highScores = useHighScores();

  return (
    <div className={`${SPACING.PANEL_INTERNAL} ${className}`}>
      {/* Combined Score & Next Piece */}
      <CombinedStatsNextPanel
        score={score}
        level={level}
        lines={lines}
        nextPiece={nextPiece}
        gameOver={gameOver}
        isPaused={isPaused}
        size='xs'
      />

      {/* Buttons - Hidden per requirement */}

      {/* Controls */}
      <ControlsPanel size='xs' />

      {/* High scores */}
      <HighScoreDisplay highScores={highScores} maxDisplay={3} className='' size='xs' />

      {/* Score reference - always visible, no label */}
      <div className={TYPOGRAPHY.SMALL_LABEL}>
        <ScoringPanel size='xs' />
      </div>
    </div>
  );
});

export default GameTabContent;
