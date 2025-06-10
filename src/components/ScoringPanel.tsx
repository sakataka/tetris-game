'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import PanelBase from './ui/PanelBase';

const ScoringPanel = memo(function ScoringPanel() {
  const { t } = useTranslation();

  return (
    <PanelBase title='SCORING' theme='yellow'>
      <div className='space-y-2 text-xs md:text-sm'>
        <div className='flex justify-between items-center text-gray-300'>
          <span>1 LINE</span>
          <span className='font-mono text-blue-400'>100 × LV</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>2 LINES</span>
          <span className='font-mono text-green-400'>200 × LV</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>3 LINES</span>
          <span className='font-mono text-yellow-400'>300 × LV</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>4 LINES</span>
          <span className='font-mono text-red-400 font-bold'>700 × LV</span>
        </div>
        <div className='text-center text-red-400 text-xs animate-pulse mt-2'>★ TETRIS BONUS! ★</div>
        <div className='flex justify-between items-center text-gray-300 border-t border-gray-600 pt-2'>
          <span>{t('scoring.hardDrop').toUpperCase()}</span>
          <span className='font-mono text-purple-400'>DIST × 2</span>
        </div>
      </div>
    </PanelBase>
  );
});

export default ScoringPanel;
