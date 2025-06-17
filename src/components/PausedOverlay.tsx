import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import CyberCard from './ui/CyberCard';
import { Button } from './ui/button';

interface PausedOverlayProps {
  isVisible: boolean;
  onResume: () => void;
}

/**
 * PausedOverlay component that displays over the game when paused
 * Provides consistent cyberpunk styling with the rest of the game UI
 */
const PausedOverlay = memo(function PausedOverlay({ isVisible, onResume }: PausedOverlayProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' />

      {/* Dialog Content */}
      <div className='relative z-10 mx-4 w-full max-w-md'>
        <CyberCard title={t('game.paused')} theme='warning' size='lg'>
          <div className='space-y-6 p-2'>
            {/* Pause Message */}
            <div className='text-center'>
              <div className='text-theme-warning text-lg font-bold mb-2'>
                {t('game.gameIsPaused', 'Game is Paused')}
              </div>
              <div className='text-theme-foreground text-sm'>
                {t('game.pauseMessage', 'Press Resume to continue playing')}
              </div>
            </div>

            {/* Resume Button */}
            <div className='flex justify-center'>
              <Button
                onClick={onResume}
                className='px-8 py-3 bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/80 hover:to-theme-accent/80 font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(var(--theme-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-primary),0.5)] border border-theme-primary/50 relative overflow-hidden font-mono'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 blur-sm' />
                <span className='relative'>{t('game.resume')}</span>
              </Button>
            </div>

            {/* Instructions */}
            <div className='text-center text-xs text-theme-muted'>
              <div>{t('controls.pauseHint', 'Press Space or Pause button to resume')}</div>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
});

export default PausedOverlay;
