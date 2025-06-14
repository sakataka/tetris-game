'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import CyberCard from './ui/CyberCard';

interface GameStatsPanelProps {
  score: number;
  level: number;
  lines: number;
  size?: 'sm' | 'md' | 'lg';
}

const GameStatsPanel = memo(function GameStatsPanel({
  score,
  level,
  lines,
  size = 'md',
}: GameStatsPanelProps) {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('panels.scoreData').toUpperCase()} theme='cyan' size={size}>
      <div className='space-y-1'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-xs'>{t('game.score')}</span>
          <span className='font-mono text-sm text-yellow-400 font-bold tracking-wider'>
            {score.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-xs'>{t('game.level')}</span>
          <span className='font-mono text-sm text-green-400 font-bold'>{level}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300 text-xs'>{t('game.lines')}</span>
          <span className='font-mono text-sm text-blue-400 font-bold'>{lines}</span>
        </div>
      </div>
    </CyberCard>
  );
});

export default GameStatsPanel;
