import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useCurrentTheme } from '../../store/themeStore';
import { cn } from '../../utils/ui/cn';

interface NavigationItem {
  key: string;
  path: string;
  label: string;
  icon?: string;
}

interface NavigationProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Navigation component for React Router-based routing
 *
 * Features:
 * - Cyberpunk-themed tab styling
 * - React Router-based active state detection
 * - Internationalization support
 * - Responsive design considerations
 * - Professional menu navigation for settings pages
 */
const Navigation = memo(function Navigation({
  className = '',
  variant = 'default',
}: NavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const currentTheme = useCurrentTheme();

  const navigationItems: NavigationItem[] = [
    { key: 'settings', path: '/settings', label: t('tabs.settings') },
    { key: 'statistics', path: '/statistics', label: t('tabs.statistics') },
    { key: 'themes', path: '/themes', label: t('tabs.themes') },
    { key: 'about', path: '/about', label: t('tabs.about') },
  ];

  const activeTab =
    navigationItems.find((item) => item.path === location.pathname)?.key || 'settings';

  // Define which themes should have enhanced effects
  const gradientThemes = ['cyberpunk', 'neon', 'retro'];
  const hasEnhancedEffects = gradientThemes.includes(currentTheme);

  const getTabLinkClassName = (isActive: boolean) => {
    const baseClasses = [
      'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm',
      'transition-all duration-200 border border-transparent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-theme-primary',
    ];

    if (isActive) {
      baseClasses.push('bg-theme-primary/20', 'text-theme-primary', 'border-theme-primary/50');

      if (hasEnhancedEffects) {
        baseClasses.push('shadow-lg shadow-theme-primary/20');
      }
    } else {
      baseClasses.push(
        'bg-theme-surface/30 text-theme-muted',
        'hover:bg-theme-primary/10',
        'hover:text-theme-primary',
        'hover:border-theme-primary/30'
      );
    }

    if (variant === 'compact') {
      baseClasses.push('px-3 py-1.5 text-xs');
    }

    return cn(baseClasses);
  };

  return (
    <nav className={cn('navigation-container', className)}>
      <div className='flex flex-wrap gap-2 bg-theme-primary/5 p-3 rounded-xl backdrop-blur-sm border border-theme-primary/20'>
        {navigationItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={getTabLinkClassName(isActive)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default Navigation;
