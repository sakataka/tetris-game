'use client';

import { memo } from 'react';
import { Tetromino } from '../types/tetris';
import CombinedStatsNextPanel from './CombinedStatsNextPanel';
import ControlsPanel from './ControlsPanel';
import GameButtonsPanel from './GameButtonsPanel';
import ScoringPanel from './ScoringPanel';
import HighScoreDisplay from './HighScoreDisplay';
import { useHighScores } from '../store/statisticsStore';
import { SPACING, TYPOGRAPHY } from '../constants/layout';

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
    <div className={`${SPACING.PANEL_INTERNAL} ${className}`}>
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
      <HighScoreDisplay highScores={highScores} maxDisplay={3} className='' size='xs' />

      {/* Score reference - collapsible */}
      <details className={TYPOGRAPHY.SMALL_LABEL}>
        <summary
          className={`cursor-pointer text-cyan-400 hover:text-cyan-300 ${TYPOGRAPHY.BODY_TEXT}`}
        >
          Score Reference
        </summary>
        <ScoringPanel size='xs' />
      </details>
    </div>
  );
});

export default GameTabContent;
