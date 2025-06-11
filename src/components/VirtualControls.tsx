'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface VirtualControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onRotate: () => void;
  onHardDrop: () => void;
  isVisible: boolean;
  unlockAudio?: () => Promise<void>;
}

const VirtualControls = memo(function VirtualControls({
  onMove,
  onRotate,
  onHardDrop,
  isVisible,
  unlockAudio,
}: VirtualControlsProps) {
  const { t } = useTranslation();
  // Memoize handleTouchStart with useCallback
  const handleTouchStart = useCallback(
    (action: () => void) => (e: React.TouchEvent) => {
      e.preventDefault();
      // Unlock audio on first touch
      if (unlockAudio) {
        unlockAudio();
      }
      action();
    },
    [unlockAudio]
  );

  // Memoize move handlers with useMemo
  const moveHandlers = useMemo(
    () => ({
      left: () => onMove({ x: -1, y: 0 }),
      right: () => onMove({ x: 1, y: 0 }),
      down: () => onMove({ x: 0, y: 1 }),
    }),
    [onMove]
  );

  if (!isVisible) return null;

  return (
    <div className='h-full w-full flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent'>
      <div className='flex justify-between items-center w-full max-w-sm px-4'>
        {/* Left side: D-pad */}
        <div className='relative'>
          {/* Rotate button (top) */}
          <button
            onTouchStart={handleTouchStart(onRotate)}
            className='absolute left-1/2 -translate-x-1/2 -translate-y-full mb-1
                      w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-400 hover:to-pink-400 active:scale-95
                      border border-purple-400/50 shadow-[0_0_15px_rgba(147,51,234,0.5)]
                      flex items-center justify-center text-white font-bold text-sm
                      touch-manipulation select-none'
            aria-label={t('controls.rotate')}
          >
            ↻
          </button>

          {/* Horizontal movement and soft drop */}
          <div className='flex items-center gap-1'>
            {/* Move left */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.left)}
              className='w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none'
              aria-label={t('controls.moveLeft')}
            >
              ←
            </button>

            {/* Soft drop (down) */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.down)}
              className='w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500
                        hover:from-yellow-400 hover:to-orange-400 active:scale-95
                        border border-yellow-400/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none'
              aria-label={t('controls.moveDown')}
            >
              ↓
            </button>

            {/* Move right */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.right)}
              className='w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none'
              aria-label={t('controls.moveRight')}
            >
              →
            </button>
          </div>
        </div>

        {/* Right side: Hard drop button */}
        <button
          onTouchStart={handleTouchStart(onHardDrop)}
          className='w-14 h-14 rounded-lg bg-gradient-to-r from-red-500 to-pink-500
                    hover:from-red-400 hover:to-pink-400 active:scale-95
                    border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.6)]
                    flex flex-col items-center justify-center text-white font-bold
                    touch-manipulation select-none'
          aria-label={t('controls.hardDrop')}
        >
          <div className='text-sm'>⚡</div>
          <div className='text-xs'>{t('scoring.hardDrop')}</div>
        </button>
      </div>
    </div>
  );
});

export default VirtualControls;
