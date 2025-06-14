'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type TabType = 'game' | 'stats' | 'theme' | 'settings';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

const TabNavigation = memo(function TabNavigation({
  activeTab,
  onTabChange,
  className = '',
}: TabNavigationProps) {
  const { t } = useTranslation();

  const tabs: { key: TabType; label: string; color: string }[] = [
    {
      key: 'game',
      label: t('tabs.game'),
      color: 'cyan',
    },
    {
      key: 'stats',
      label: t('tabs.statistics'),
      color: 'purple',
    },
    {
      key: 'theme',
      label: t('tabs.themes'),
      color: 'yellow',
    },
    {
      key: 'settings',
      label: t('tabs.settings'),
      color: 'green',
    },
  ];

  const getTabStyles = (tab: (typeof tabs)[0], isActive: boolean) => {
    const baseClasses = 'px-3 py-1 rounded-t-lg font-semibold transition-colors text-xs';

    if (isActive) {
      return `${baseClasses} bg-${tab.color}-500/20 text-${tab.color}-400 border-b-2 border-${tab.color}-400`;
    }

    return `${baseClasses} bg-gray-800/50 text-gray-400 hover:text-${tab.color}-400`;
  };

  return (
    <div className={`flex space-x-1 mb-2 flex-shrink-0 ${className}`}>
      {tabs.map((tab) => (
        <button
          type='button'
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={getTabStyles(tab, activeTab === tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});

export default TabNavigation;
