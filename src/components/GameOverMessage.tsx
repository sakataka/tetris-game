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
      className={cn('absolute inset-0 hologram flex items-center justify-center', className)}
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Alert className='max-w-md border-red-400/50 bg-red-500/10 backdrop-blur-sm neon-border'>
        <AlertTitle className='text-center md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent'>
          {t('game.gameOver')}
        </AlertTitle>
        <AlertDescription className='text-center space-y-2'>
          <p className='text-cyan-400 font-mono md:text-base text-sm'>
            {t('game.restart')} (Enter/Space)
          </p>
          <div className='animate-pulse text-red-400'>◆ ◆ ◆</div>
        </AlertDescription>
      </Alert>
    </div>
  );
});

export default GameOverMessage;
