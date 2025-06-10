'use client';

import { memo } from 'react';
import { PANELS, LABELS } from '../constants/strings';
import PanelBase from './ui/PanelBase';

interface GameStatsPanelProps {
  score: number;
  level: number;
  lines: number;
}

const GameStatsPanel = memo(function GameStatsPanel({ score, level, lines }: GameStatsPanelProps) {
  return (
    <PanelBase title={PANELS.SCORE_DATA} theme='cyan'>
      <div className='space-y-2 md:space-y-3'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-sm md:text-base'>{LABELS.SCORE}</span>
          <span className='font-mono text-lg md:text-2xl text-yellow-400 font-bold tracking-wider'>
            {score.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-sm md:text-base'>{LABELS.LEVEL}</span>
          <span className='font-mono text-base md:text-xl text-green-400 font-bold'>{level}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-sm md:text-base'>{LABELS.LINES}</span>
          <span className='font-mono text-base md:text-xl text-blue-400 font-bold'>{lines}</span>
        </div>
      </div>
    </PanelBase>
  );
});

export default GameStatsPanel;
