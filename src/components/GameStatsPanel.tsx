'use client';

import { memo } from 'react';
import { PANELS, LABELS } from '../constants/strings';

interface GameStatsPanelProps {
  score: number;
  level: number;
  lines: number;
}

const GameStatsPanel = memo(function GameStatsPanel({
  score,
  level,
  lines
}: GameStatsPanelProps) {
  return (
    <div className="hologram-cyan neon-border p-4 md:p-6 rounded-lg relative overflow-hidden">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyan-400 relative">{PANELS.SCORE_DATA}</h3>
      <div className="space-y-2 md:space-y-3 relative">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">{LABELS.SCORE}</span>
          <span className="font-mono text-lg md:text-2xl text-yellow-400 font-bold tracking-wider">
            {score.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">{LABELS.LEVEL}</span>
          <span className="font-mono text-base md:text-xl text-green-400 font-bold">{level}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm md:text-base">{LABELS.LINES}</span>
          <span className="font-mono text-base md:text-xl text-blue-400 font-bold">{lines}</span>
        </div>
      </div>
    </div>
  );
});

export default GameStatsPanel;