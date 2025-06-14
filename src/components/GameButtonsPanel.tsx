'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui/cn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameButtons } from '../hooks/useGameButtons';

interface GameButtonsPanelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
}

const GameButtonsPanel = memo(function GameButtonsPanel({
  size = 'md',
  layout = 'vertical',
}: GameButtonsPanelProps) {
  const { t } = useTranslation();
  const { gameOver, isPaused, onTogglePause, onReset } = useGameButtons();

  // Map size to shadcn/ui Button size variants
  const buttonSize = size === 'xs' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const containerClasses = layout === 'horizontal' ? 'flex space-x-2' : 'space-y-2';
  const buttonWidthClass = layout === 'horizontal' ? 'flex-1' : 'w-full';

  return (
    <div className={containerClasses}>
      <Button
        onClick={onTogglePause}
        disabled={gameOver}
        size={buttonSize}
        className={cn(
          buttonWidthClass,
          // Cyberpunk pause/resume button styling
          'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400',
          'disabled:from-gray-600 disabled:to-gray-700 font-bold',
          'transition-all duration-300 transform hover:scale-105 disabled:scale-100',
          'shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]',
          'border border-cyan-400/50 relative overflow-hidden font-mono'
        )}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm' />
        <span className='relative'>{isPaused ? t('game.resume') : t('game.pause')}</span>
      </Button>

      <Button
        onClick={onReset}
        size={buttonSize}
        className={cn(
          buttonWidthClass,
          // Cyberpunk reset button styling
          'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400',
          'font-bold transition-all duration-300 transform hover:scale-105',
          'shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]',
          'border border-red-400/50 relative overflow-hidden font-mono'
        )}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 blur-sm' />
        <span className='relative'>{t('buttons.reset')}</span>
      </Button>
    </div>
  );
});

export default GameButtonsPanel;
