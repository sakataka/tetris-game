'use client';

import { memo } from 'react';
import { NAVIGATION } from '../constants/strings';

export type TabType = 'game' | 'stats' | 'theme';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

const TabNavigation = memo(function TabNavigation({
  activeTab,
  onTabChange,
  className = ''
}: TabNavigationProps) {
  const tabs: { key: TabType; label: string; color: string }[] = [
    {
      key: 'game',
      label: NAVIGATION.GAME_INFO,
      color: 'cyan'
    },
    {
      key: 'stats', 
      label: NAVIGATION.STATISTICS,
      color: 'purple'
    },
    {
      key: 'theme',
      label: NAVIGATION.THEME,
      color: 'yellow'
    }
  ];

  const getTabStyles = (tab: typeof tabs[0], isActive: boolean) => {
    const baseClasses = 'px-4 py-2 rounded-t-lg font-semibold transition-colors';
    
    if (isActive) {
      return `${baseClasses} bg-${tab.color}-500/20 text-${tab.color}-400 border-b-2 border-${tab.color}-400`;
    }
    
    return `${baseClasses} bg-gray-800/50 text-gray-400 hover:text-${tab.color}-400`;
  };

  return (
    <div className={`flex space-x-2 mb-4 flex-shrink-0 ${className}`}>
      {tabs.map((tab) => (
        <button
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