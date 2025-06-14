'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingMessageProps {
  className?: string;
}

const LoadingMessage = memo(function LoadingMessage({ className = '' }: LoadingMessageProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex items-center justify-center min-h-screen', className)}>
      <Alert className='max-w-md border-cyber-cyan/30 bg-cyber-cyan/5'>
        <AlertDescription className='text-center'>
          <div className='text-cyber-cyan text-2xl font-bold animate-pulse font-mono'>
            {t('common.loading')}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
});

export default LoadingMessage;
