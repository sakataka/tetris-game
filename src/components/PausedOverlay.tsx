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
        <CyberCard title={t('game.paused')} theme='primary' size='lg'>
          <div className='space-y-6 p-2'>
            {/* Pause Message */}
            <div className='text-center'>
              <div className='text-theme-foreground text-sm'>
                {t('game.pauseMessage', 'Press Resume to continue playing')}
              </div>
            </div>

            {/* Resume Button */}
            <div className='flex justify-center'>
              <Button
                onClick={onResume}
                variant="primary"
                size="lg"
                className='px-8 font-bold font-mono'
              >
                {t('game.resume')}
              </Button>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  );
});

export default PausedOverlay;
