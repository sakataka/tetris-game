import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrentTheme } from '@/store/themeStore';
import { cn } from '@/utils/ui/cn';
import { Button } from '../ui/button';
import BackgroundEffects from './BackgroundEffects';
import GameHeader from './GameHeader';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  headerVariant?: 'default' | 'minimal' | 'compact';
  backgroundVariant?: 'default' | 'minimal' | 'intense';
  className?: string;
}

/**
 * MainLayout component for consistent page structure
 *
 * Features:
 * - Responsive cyberpunk design foundation
 * - Configurable header, navigation, and background
 * - Flexible content area with proper spacing
 * - Optimized for both current tabs and future React Router pages
 *
 * This layout will serve as the foundation for all pages when migrating
 * to React Router, providing consistency and reusability.
 */
const MainLayout = memo(function MainLayout({
  children,
  showNavigation = true,
  showHeader = true,
  headerVariant = 'default',
  backgroundVariant = 'default',
  className = '',
}: MainLayoutProps) {
  const { t } = useTranslation();
  const currentTheme = useCurrentTheme();

  // Define which themes should have gradients
  const gradientThemes = ['cyberpunk', 'neon', 'retro'];
  const hasGradients = gradientThemes.includes(currentTheme);

  return (
    <div
      className={cn(
        'min-h-screen relative overflow-hidden',
        hasGradients
          ? 'bg-gradient-to-br from-theme-surface to-theme-surface/60'
          : 'bg-theme-surface',
        className
      )}
    >
      {/* Background effects */}
      <BackgroundEffects variant={backgroundVariant} />

      <div className='relative z-10 min-h-screen flex flex-col'>
        {/* Header */}
        {showHeader && (
          <div className='flex-shrink-0 pt-8 px-4'>
            <div className='flex items-center justify-between mb-4'>
              <GameHeader variant={headerVariant} />
              <Link to='/'>
                <Button variant='secondary' size='sm'>
                  {t('tabs.game')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        {showNavigation && (
          <div className='flex-shrink-0 px-4 mb-4'>
            <Navigation />
          </div>
        )}

        {/* Main content area */}
        <main className='flex-1 px-4 pb-8'>
          <div className='max-w-7xl mx-auto h-full'>
            <div className='float-animation h-full'>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
});

export default MainLayout;
