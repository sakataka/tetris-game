import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface GameHeaderProps {
  showTitle?: boolean;
  variant?: 'default' | 'minimal' | 'compact';
  className?: string;
}

/**
 * GameHeader component for consistent page headers
 *
 * Features:
 * - Cyberpunk-styled title with gradient text
 * - Hologram effects and animations
 * - Configurable variants for different contexts
 * - Internationalization support
 *
 * This component provides a consistent header that can be used
 * across different pages in the React Router implementation.
 */
const GameHeader = memo(function GameHeader({
  showTitle = true,
  variant = 'default',
  className = '',
}: GameHeaderProps) {
  const { t } = useTranslation();

  if (!showTitle) {
    return null;
  }

  const getTitleClasses = () => {
    const baseClasses = [
      'font-bold text-white mb-2 relative',
      'bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent',
    ];

    switch (variant) {
      case 'minimal':
        return [...baseClasses, 'text-2xl md:text-3xl'].join(' ');
      case 'compact':
        return [...baseClasses, 'text-xl md:text-2xl mb-1'].join(' ');
      default:
        return [...baseClasses, 'text-4xl md:text-6xl'].join(' ');
    }
  };

  const shouldShowEffects = variant !== 'minimal';

  return (
    <header className={`text-center ${className}`}>
      <div className={variant !== 'compact' ? 'mb-4 md:mb-6' : 'mb-2'}>
        <h1 className={getTitleClasses()}>
          <span>{t('app.title', 'TETRIS')}</span>
          {shouldShowEffects && (
            <div className='absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent rounded-lg blur opacity-25' />
          )}
        </h1>
      </div>
    </header>
  );
});

export default GameHeader;
