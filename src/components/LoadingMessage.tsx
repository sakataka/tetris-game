'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingMessageProps {
  className?: string;
}

const LoadingMessage = memo(function LoadingMessage({ className = '' }: LoadingMessageProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className='text-cyber-cyan text-2xl font-bold animate-pulse'>{t('common.loading')}</div>
    </div>
  );
});

export default LoadingMessage;
