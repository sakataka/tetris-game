import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface PausedMessageProps {
  className?: string;
}

const PausedMessage = memo(function PausedMessage({ className = '' }: PausedMessageProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('absolute inset-0 hologram flex items-center justify-center', className)}
      style={{
        background: 'var(--overlay-background)',
        backdropFilter: 'blur(var(--overlay-blur))',
      }}
    >
      <Alert className='max-w-md border-theme-warning/50 bg-theme-warning/10 backdrop-blur-sm neon-border'>
        <AlertTitle className='text-center md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-theme-warning to-theme-warning bg-clip-text text-transparent'>
          {t('game.paused')}
        </AlertTitle>
        <AlertDescription className='text-center space-y-2'>
          <p className='text-theme-primary font-mono md:text-base text-sm'>{t('controls.pause')} (P)</p>
          <div className='animate-pulse text-theme-warning'>◆ ◆ ◆</div>
        </AlertDescription>
      </Alert>
    </div>
  );
});

export default PausedMessage;
