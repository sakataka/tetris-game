import { cn } from '@/utils/ui/cn';
import type React from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { UI_SIZES } from '../constants';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='default'
                size='default'
                onTouchStart={handleTouchStart(onRotate)}
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 -translate-y-full mb-1',
                  UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                  'bg-gradient-to-r from-purple-600 to-purple-500',
                  'hover:from-purple-500 hover:to-purple-400 active:scale-95',
                  'border border-purple-400/50 shadow-[0_0_10px_rgb(147_51_234/30%)]',
                  'text-white font-bold text-sm mobile-touch-zone select-none'
                )}
                aria-label={t('controls.rotate')}
              >
                ↻
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className='text-center'>
                <div className='font-medium'>{t('controls.rotate')}</div>
                <div className='text-xs text-cyan-300 mt-1'>Tap to rotate piece clockwise</div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Horizontal movement and soft drop */}
          <div className='flex items-center gap-1'>
            {/* Move left */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.left)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'bg-gradient-to-r from-cyan-600 to-cyan-500',
                    'hover:from-cyan-500 hover:to-cyan-400 active:scale-95',
                    'border border-cyan-400/50 shadow-[0_0_10px_rgb(6_182_212/30%)]',
                    'text-white font-bold text-sm mobile-touch-zone select-none'
                  )}
                  aria-label={t('controls.moveLeft')}
                >
                  ←
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>{t('controls.moveLeft')}</div>
                  <div className='text-xs text-cyan-300 mt-1'>Move piece left</div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Soft drop (down) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.down)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'bg-gradient-to-r from-yellow-600 to-yellow-500',
                    'hover:from-yellow-500 hover:to-yellow-400 active:scale-95',
                    'border border-yellow-400/50 shadow-[0_0_10px_rgb(245_158_11/30%)]',
                    'text-white font-bold text-sm mobile-touch-zone select-none'
                  )}
                  aria-label={t('controls.moveDown')}
                >
                  ↓
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>{t('controls.moveDown')}</div>
                  <div className='text-xs text-cyan-300 mt-1'>
                    Move piece down faster (soft drop)
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Move right */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.right)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'bg-gradient-to-r from-cyan-600 to-cyan-500',
                    'hover:from-cyan-500 hover:to-cyan-400 active:scale-95',
                    'border border-cyan-400/50 shadow-[0_0_10px_rgb(6_182_212/30%)]',
                    'text-white font-bold text-sm mobile-touch-zone select-none'
                  )}
                  aria-label={t('controls.moveRight')}
                >
                  →
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>{t('controls.moveRight')}</div>
                  <div className='text-xs text-cyan-300 mt-1'>Move piece right</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right side: Hard drop button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='default'
              size='default'
              onTouchStart={handleTouchStart(onHardDrop)}
              className={cn(
                UI_SIZES.VIRTUAL_BUTTON.LARGE,
                'bg-gradient-to-r from-red-600 to-red-500',
                'hover:from-red-500 hover:to-red-400 active:scale-95',
                'border border-red-400/50 shadow-[0_0_15px_rgb(239_68_68/40%)]',
                'flex flex-col items-center justify-center text-white font-bold',
                'mobile-touch-zone select-none'
              )}
              aria-label={t('controls.hardDrop')}
            >
              <div className='text-sm'>⚡</div>
              <div className='text-xs'>{t('scoring.hardDrop')}</div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className='text-center'>
              <div className='font-medium'>{t('controls.hardDrop')}</div>
              <div className='text-xs text-cyan-300 mt-1'>Drop piece instantly to bottom</div>
              <div className='text-xs text-yellow-300 mt-0.5'>Awards bonus points!</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});

export default VirtualControls;
