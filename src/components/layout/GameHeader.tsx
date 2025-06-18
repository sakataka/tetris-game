import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentTheme } from '../../store/themeStore';

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
  const currentTheme = useCurrentTheme();

  if (!showTitle) {
    return null;
  }

  // Define which themes should have gradients
  const gradientThemes = ['cyberpunk', 'neon', 'retro'];
  const hasGradients = gradientThemes.includes(currentTheme);

  const getTitleClasses = () => {
    const baseClasses = [
      'font-bold relative tracking-wider',
      hasGradients
        ? 'bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-tertiary bg-clip-text text-transparent'
        : 'text-theme-primary', // Use primary color for better brand consistency
    ];

    switch (variant) {
      case 'minimal':
        return [...baseClasses, 'text-lg md:text-xl mb-1'].join(' '); // Smaller for mobile
      case 'compact':
        return [...baseClasses, 'text-2xl md:text-3xl mb-1'].join(' ');
      default:
        return [...baseClasses, 'text-4xl md:text-6xl mb-2'].join(' ');
    }
  };

  const shouldShowEffects = variant !== 'minimal' && hasGradients;

  return (
    <header className={`text-center ${className}`}>
      <div className={variant !== 'compact' ? 'mb-4 md:mb-6' : 'mb-2'}>
        <h1 className={getTitleClasses()}>
          <span className='relative z-10'>{t('app.title', 'TETRIS')}</span>
          {shouldShowEffects && (
            <div className='absolute -inset-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-tertiary rounded-lg blur opacity-20' />
          )}
          {/* Subtle glow for all themes */}
          {!hasGradients && variant !== 'minimal' && (
            <div className='absolute inset-0 bg-theme-primary opacity-10 rounded blur-sm' />
          )}
        </h1>
      </div>
    </header>
  );
});

export default GameHeader;
