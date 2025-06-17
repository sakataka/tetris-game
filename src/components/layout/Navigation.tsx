import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { cn } from '../../utils/ui/cn';

interface NavigationItem {
  key: string;
  path: string;
  label: string;
  color: string;
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

  const navigationItems: NavigationItem[] = [
    { key: 'settings', path: '/settings', label: t('tabs.settings'), color: 'cyan' },
    { key: 'statistics', path: '/statistics', label: t('tabs.statistics'), color: 'cyan' },
    { key: 'themes', path: '/themes', label: t('tabs.themes'), color: 'cyan' },
    { key: 'about', path: '/about', label: t('tabs.about'), color: 'cyan' },
  ];

  const activeTab =
    navigationItems.find((item) => item.path === location.pathname)?.key || 'settings';

  const getTabLinkClassName = (color: string, isActive: boolean) => {
    const baseClasses = [
      'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm',
      'transition-all duration-200 border border-transparent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      `focus-visible:ring-${color}-400`,
    ];

    if (isActive) {
      baseClasses.push(
        `bg-${color}-500/20`,
        `text-${color}-400`,
        `border-${color}-400/50`,
        'shadow-lg shadow-${color}-500/20'
      );
    } else {
      baseClasses.push(
        'bg-theme-surface/30 text-theme-muted',
        `hover:bg-${color}-500/10`,
        `hover:text-${color}-400`,
        `hover:border-${color}-400/30`
      );
    }

    if (variant === 'compact') {
      baseClasses.push('px-3 py-1.5 text-xs');
    }

    return cn(baseClasses);
  };

  return (
    <nav className={cn('navigation-container', className)}>
      <div className='flex flex-wrap gap-2 bg-theme-surface/50 p-3 rounded-xl backdrop-blur-sm border border-theme-muted/50'>
        {navigationItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={getTabLinkClassName(item.color, isActive)}
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
