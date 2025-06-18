import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface GameOverMessageProps {
  className?: string;
}

const GameOverMessage = memo(function GameOverMessage({ className = '' }: GameOverMessageProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('absolute inset-0 bg-theme-background/80 flex items-center justify-center', className)}
      style={{
        background: 'var(--overlay-background)',
        backdropFilter: 'blur(var(--overlay-blur))',
      }}
    >
      <Alert className='max-w-md border-theme-error/50 bg-theme-error/10 backdrop-blur-sm'>
        <AlertTitle className='text-center md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-theme-error to-theme-error bg-clip-text text-transparent'>
          {t('game.gameOver')}
        </AlertTitle>
        <AlertDescription className='text-center space-y-2'>
          <p className='text-theme-primary font-mono md:text-base text-sm'>
            {t('game.restart')} (Enter/Space)
          </p>
          <div className='animate-pulse text-theme-error'>◆ ◆ ◆</div>
        </AlertDescription>
      </Alert>
    </div>
  );
});

export default GameOverMessage;
