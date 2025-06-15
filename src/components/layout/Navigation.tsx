import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { type TabType, useActiveTab, useSetActiveTab } from '../../store/navigationStore';

interface NavigationItem {
  key: TabType;
  label: string;
  color: string;
  icon?: string;
}

interface NavigationProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Navigation component for tab-based routing
 *
 * Features:
 * - Cyberpunk-themed tab styling
 * - Centralized navigation state management
 * - Internationalization support
 * - Responsive design considerations
 *
 * This component abstracts navigation logic and prepares for future
 * React Router integration where tabs will become actual routes.
 */
const Navigation = memo(function Navigation({
  className = '',
  variant = 'default',
}: NavigationProps) {
  const { t } = useTranslation();
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();

  const navigationItems: NavigationItem[] = [
    { key: 'game', label: t('tabs.game'), color: 'cyan' },
    { key: 'stats', label: t('tabs.statistics'), color: 'purple' },
    { key: 'theme', label: t('tabs.themes'), color: 'yellow' },
    { key: 'settings', label: t('tabs.settings'), color: 'green' },
  ];

  const getTabTriggerClassName = (color: string) => {
    const baseClasses = [
      `data-[state=active]:bg-${color}-500/20`,
      `data-[state=active]:text-${color}-400`,
      'data-[state=active]:border-b-2',
      `data-[state=active]:border-${color}-400`,
      `hover:text-${color}-400`,
      'text-xs px-3 py-1 rounded-t-lg font-semibold',
      'bg-gray-800/50 text-gray-400',
      'transition-all duration-200',
    ];

    if (variant === 'compact') {
      baseClasses.push('px-2 py-0.5 text-2xs');
    }

    return baseClasses.join(' ');
  };

  return (
    <nav className={`navigation-container ${className}`}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className='w-full'
      >
        <TabsList className='flex-shrink-0 mb-2 space-x-1 bg-transparent p-0 h-auto'>
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.key}
              value={item.key}
              className={getTabTriggerClassName(item.color)}
              aria-label={item.label}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
});

export default Navigation;
