'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface PausedMessageProps {
  className?: string;
}

const PausedMessage = memo(function PausedMessage({ className = '' }: PausedMessageProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`absolute inset-0 hologram flex items-center justify-center ${className}`}
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className='text-center text-white md:p-8 p-4 neon-border rounded-lg'>
        <h2 className='md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'>
          {t('game.paused')}
        </h2>
        <p className='mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm'>
          {t('controls.pause')} (P)
        </p>
        <div className='animate-pulse text-yellow-400'>◆ ◆ ◆</div>
      </div>
    </div>
  );
});

export default PausedMessage;
