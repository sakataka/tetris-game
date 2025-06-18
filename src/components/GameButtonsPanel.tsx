import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui/cn';
import { GAP_SCALE } from '@/constants/layout';
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
  const containerClasses = layout === 'horizontal' ? `flex ${GAP_SCALE.xs}` : 'space-y-2'; // Using 8-point grid
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
          // Simplified button styling
          'bg-theme-primary/20 hover:bg-theme-primary/30',
          'disabled:bg-theme-muted/20 font-semibold',
          'transition-colors duration-150',
          'border border-theme-primary/40 text-theme-primary',
          'disabled:border-theme-muted/40 disabled:text-theme-muted'
        )}
      >
        {isPaused ? t('game.resume') : t('game.pause')}
      </Button>

      <Button
        onClick={() => setShowResetConfirmation(true)}
        size={buttonSize}
        className={cn(
          buttonWidthClass,
          // Simplified reset button styling
          'bg-theme-error/20 hover:bg-theme-error/30',
          'font-semibold transition-colors duration-150',
          'border border-theme-error/40 text-theme-error'
        )}
      >
        {t('buttons.reset')}
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
