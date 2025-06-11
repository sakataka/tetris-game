'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import PanelBase from './ui/PanelBase';

const ControlsPanel = memo(function ControlsPanel() {
  const { t } = useTranslation();

  return (
    <PanelBase title={t('controls.title').toUpperCase()} theme='green'>
      <div className='space-y-2 md:space-y-3 text-xs md:text-sm'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>
            {t('controls.moveLeft')} / {t('controls.moveRight')}
          </span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>←→</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.moveDown')}</span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>↓</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.rotate')}</span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>↑</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.hardDrop')}</span>
          <span className='font-mono bg-yellow-400/20 px-2 py-1 rounded text-yellow-400'>
            SPACE
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.pause')}</span>
          <span className='font-mono bg-purple-400/20 px-2 py-1 rounded text-purple-400'>P</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('buttons.reset')}</span>
          <span className='font-mono bg-red-400/20 px-2 py-1 rounded text-red-400'>R</span>
        </div>
      </div>
    </PanelBase>
  );
});

export default ControlsPanel;
