import type React from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { UI_SIZES } from '@/constants';
import { cn } from '@/utils/ui/cn';
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
                variant='primary'
                size='default'
                onTouchStart={handleTouchStart(onRotate)}
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 -translate-y-full mb-1',
                  UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                  'active:scale-95 text-sm mobile-touch-zone select-none'
                )}
                aria-label={t('controls.rotate')}
              >
                ↻
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className='text-center'>
                <div className='font-medium'>{t('controls.rotate')}</div>
                <div className='text-xs text-theme-primary mt-1'>Tap to rotate piece clockwise</div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Horizontal movement and soft drop */}
          <div className='flex items-center gap-1'>
            {/* Move left */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='secondary'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.left)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'bg-gradient-to-r from-theme-secondary to-theme-secondary',
                    'hover:from-theme-secondary/80 hover:to-theme-secondary/80 active:scale-95',
                    'border border-theme-secondary/50 shadow-[0_0_10px_rgba(var(--theme-secondary),0.3)]',
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
                  <div className='text-xs text-theme-primary mt-1'>Move piece left</div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Soft drop (down) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='secondary'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.down)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'active:scale-95 text-sm mobile-touch-zone select-none'
                  )}
                  aria-label={t('controls.moveDown')}
                >
                  ↓
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>{t('controls.moveDown')}</div>
                  <div className='text-xs text-theme-primary mt-1'>
                    Move piece down faster (soft drop)
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Move right */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='secondary'
                  size='default'
                  onTouchStart={handleTouchStart(moveHandlers.right)}
                  className={cn(
                    UI_SIZES.VIRTUAL_BUTTON.STANDARD,
                    'active:scale-95 text-sm mobile-touch-zone select-none'
                  )}
                  aria-label={t('controls.moveRight')}
                >
                  →
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className='text-center'>
                  <div className='font-medium'>{t('controls.moveRight')}</div>
                  <div className='text-xs text-theme-primary mt-1'>Move piece right</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right side: Hard drop button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='default'
              onTouchStart={handleTouchStart(onHardDrop)}
              className={cn(
                UI_SIZES.VIRTUAL_BUTTON.LARGE,
                'active:scale-95 flex flex-col items-center justify-center',
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
              <div className='text-xs text-theme-primary mt-1'>Drop piece instantly to bottom</div>
              <div className='text-xs text-theme-warning mt-0.5'>Awards bonus points!</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});

export default VirtualControls;
