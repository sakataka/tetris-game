import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui/cn';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameButtons } from '../hooks/useGameButtons';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

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
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Map size to shadcn/ui Button size variants
  const buttonSize = size === 'xs' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const containerClasses = layout === 'horizontal' ? 'flex space-x-2' : 'space-y-2';
  const buttonWidthClass = layout === 'horizontal' ? 'flex-1' : 'w-full';

  const handleResetConfirm = () => {
    onReset();
  };

  return (
    <div className={containerClasses}>
      <Button
        onClick={onTogglePause}
        disabled={gameOver}
        size={buttonSize}
        className={cn(
          buttonWidthClass,
          // Cyberpunk pause/resume button styling
          'bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary/80 hover:to-theme-secondary/80',
          'disabled:from-theme-muted disabled:to-theme-muted font-bold',
          'transition-all duration-300 transform hover:scale-105 disabled:scale-100',
          'shadow-[0_0_20px_rgba(var(--theme-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-primary),0.5)]',
          'border border-theme-primary/50 relative overflow-hidden font-mono'
        )}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 blur-sm' />
        <span className='relative'>{isPaused ? t('game.resume') : t('game.pause')}</span>
      </Button>

      <Button
        onClick={() => setShowResetConfirmation(true)}
        size={buttonSize}
        className={cn(
          buttonWidthClass,
          // Cyberpunk reset button styling
          'bg-gradient-to-r from-theme-error to-theme-error hover:from-theme-error/80 hover:to-theme-error/80',
          'font-bold transition-all duration-300 transform hover:scale-105',
          'shadow-[0_0_20px_rgba(var(--theme-error),0.3)] hover:shadow-[0_0_30px_rgba(var(--theme-error),0.5)]',
          'border border-theme-error/50 relative overflow-hidden font-mono'
        )}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-theme-error/20 to-theme-error/20 blur-sm' />
        <span className='relative'>{t('buttons.reset')}</span>
      </Button>

      <ConfirmationDialog
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleResetConfirm}
        title={t('game.resetConfirmation.title')}
        description={t('game.resetConfirmation.description')}
        confirmText={t('buttons.reset')}
        cancelText={t('common.cancel')}
        variant='destructive'
      />
    </div>
  );
});

export default GameButtonsPanel;
