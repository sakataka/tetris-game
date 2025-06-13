'use client';

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { UI_SIZES } from '../constants';

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

  // Event handlers (React Compiler will optimize these)
  const handleTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    // Unlock audio on first touch
    if (unlockAudio) {
      unlockAudio();
    }
    action();
  };

  // Move handlers (React Compiler will optimize these)
  const moveHandlers = {
    left: () => onMove({ x: -1, y: 0 }),
    right: () => onMove({ x: 1, y: 0 }),
    down: () => onMove({ x: 0, y: 1 }),
  };

  if (!isVisible) return null;

  return (
    <div className='h-full w-full flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent'>
      <div className='flex justify-between items-center w-full max-w-sm px-4'>
        {/* Left side: D-pad */}
        <div className='relative'>
          {/* Rotate button (top) */}
          <button
            onTouchStart={handleTouchStart(onRotate)}
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-full mb-1
                      ${UI_SIZES.VIRTUAL_BUTTON.STANDARD} rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-400 hover:to-pink-400 active:scale-95
                      border border-purple-400/50 shadow-[0_0_15px_rgb(147_51_234/50%)]
                      flex items-center justify-center text-white font-bold text-sm
                      mobile-touch-zone select-none`}
            aria-label={t('controls.rotate')}
          >
            ↻
          </button>

          {/* Horizontal movement and soft drop */}
          <div className='flex items-center gap-1'>
            {/* Move left */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.left)}
              className={`${UI_SIZES.VIRTUAL_BUTTON.STANDARD} rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgb(6_182_212/50%)]
                        flex items-center justify-center text-white font-bold text-sm
                        mobile-touch-zone select-none`}
              aria-label={t('controls.moveLeft')}
            >
              ←
            </button>

            {/* Soft drop (down) */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.down)}
              className={`${UI_SIZES.VIRTUAL_BUTTON.STANDARD} rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500
                        hover:from-yellow-400 hover:to-orange-400 active:scale-95
                        border border-yellow-400/50 shadow-[0_0_15px_rgb(245_158_11/50%)]
                        flex items-center justify-center text-white font-bold text-sm
                        mobile-touch-zone select-none`}
              aria-label={t('controls.moveDown')}
            >
              ↓
            </button>

            {/* Move right */}
            <button
              onTouchStart={handleTouchStart(moveHandlers.right)}
              className={`${UI_SIZES.VIRTUAL_BUTTON.STANDARD} rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgb(6_182_212/50%)]
                        flex items-center justify-center text-white font-bold text-sm
                        mobile-touch-zone select-none`}
              aria-label={t('controls.moveRight')}
            >
              →
            </button>
          </div>
        </div>

        {/* Right side: Hard drop button */}
        <button
          onTouchStart={handleTouchStart(onHardDrop)}
          className={`${UI_SIZES.VIRTUAL_BUTTON.LARGE} rounded-lg bg-gradient-to-r from-red-500 to-pink-500
                    hover:from-red-400 hover:to-pink-400 active:scale-95
                    border border-red-400/50 shadow-[0_0_20px_rgb(239_68_68/60%)]
                    flex flex-col items-center justify-center text-white font-bold
                    mobile-touch-zone select-none`}
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
