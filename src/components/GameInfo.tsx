'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense, lazy, memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type TabType, useActiveTab, useSetActiveTab } from '../store/navigationStore';
import type { Tetromino } from '../types/tetris';
import { updateDocumentMetadata } from '../utils/metadata/pageMetadata';
import GameTabContent from './GameTabContent';
import MobileGameInfo from './MobileGameInfo';
import StatisticsTabContent from './StatisticsTabContent';

// Heavy component lazy loading
const ThemeTabContent = lazy(() => import('./ThemeTabContent'));
const SettingsTabContent = lazy(() => import('./SettingsTabContent'));

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
}

const GameInfo = memo(function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
}: GameInfoProps) {
  const { t } = useTranslation();
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();

  // Update document metadata when tab changes (preparation for React Router)
  useEffect(() => {
    updateDocumentMetadata(activeTab);
  }, [activeTab]);

  const tabs = [
    { key: 'game', label: t('tabs.game'), color: 'cyan' },
    { key: 'stats', label: t('tabs.statistics'), color: 'purple' },
    { key: 'theme', label: t('tabs.themes'), color: 'yellow' },
    { key: 'settings', label: t('tabs.settings'), color: 'green' },
  ] as const;

  const getTabTriggerClassName = (color: string) => {
    return `data-[state=active]:bg-${color}-500/20 data-[state=active]:text-${color}-400 data-[state=active]:border-b-2 data-[state=active]:border-${color}-400 hover:text-${color}-400 text-xs px-3 py-1 rounded-t-lg font-semibold bg-gray-800/50 text-gray-400`;
  };

  return (
    <div className='text-white h-full flex flex-col'>
      {/* Desktop: Tab Navigation with Content */}
      <div className='hidden md:flex flex-col h-full'>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className='flex flex-col h-full'
        >
          <TabsList className='flex-shrink-0 mb-2 space-x-1 bg-transparent p-0 h-auto'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={getTabTriggerClassName(tab.color)}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <div className='flex-1 min-h-0'>
            <ScrollArea className='h-full'>
              <TabsContent value='game' className='mt-0 h-full'>
                <GameTabContent
                  score={score}
                  level={level}
                  lines={lines}
                  nextPiece={nextPiece}
                  gameOver={gameOver}
                  isPaused={isPaused}
                />
              </TabsContent>

              <TabsContent value='stats' className='mt-0 h-full'>
                <StatisticsTabContent />
              </TabsContent>

              <TabsContent value='theme' className='mt-0 h-full'>
                <Suspense
                  fallback={
                    <div className='space-y-4 p-4'>
                      {/* Theme Selector Skeleton */}
                      <Skeleton className='h-10 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                      {/* Theme Preview Skeleton */}
                      <div className='grid grid-cols-3 gap-2'>
                        <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                        <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                        <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                      </div>
                      {/* Settings Panel Skeleton */}
                      <Skeleton className='h-32 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                    </div>
                  }
                >
                  <ThemeTabContent />
                </Suspense>
              </TabsContent>

              <TabsContent value='settings' className='mt-0 h-full'>
                <Suspense
                  fallback={
                    <div className='space-y-4 p-4'>
                      {/* Language Selector Skeleton */}
                      <Skeleton className='h-10 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                      {/* Audio Panel Skeleton */}
                      <Skeleton className='h-24 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                      {/* Settings Form Skeleton */}
                      <div className='space-y-2'>
                        <Skeleton className='h-8 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                        <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                      </div>
                    </div>
                  }
                >
                  <SettingsTabContent />
                </Suspense>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>

      {/* Mobile: Compact display (game info only) */}
      <div className='md:hidden h-full'>
        <MobileGameInfo score={score} level={level} lines={lines} nextPiece={nextPiece} />
      </div>
    </div>
  );
});

export default GameInfo;
