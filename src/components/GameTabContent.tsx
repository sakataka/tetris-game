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
      {/* スコア情報 */}
      <GameStatsPanel score={score} level={level} lines={lines} />

      {/* 次のピース */}
      <NextPiecePanel nextPiece={nextPiece} />

      {/* コントロール */}
      <ControlsPanel />

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
      <HighScoreDisplay highScores={highScores} maxDisplay={5} className='text-sm' />
    </div>
  );
});

export default GameTabContent;
