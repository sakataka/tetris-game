'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense, lazy, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tetromino } from '../types/tetris';
import GameTabContent from './GameTabContent';
import MobileGameInfo from './MobileGameInfo';
import StatisticsTabContent from './StatisticsTabContent';

export type TabType = 'game' | 'stats' | 'theme' | 'settings';
// Heavy component lazy loading
const ThemeTabContent = lazy(() => import('./ThemeTabContent'));
const SettingsTabContent = lazy(() => import('./SettingsTabContent'));
import { useSettings, useUpdateSettings } from '../store/settingsStore';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  onReset: () => void;
  onTogglePause: () => void;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  // Audio system status for enhanced display
  audioSystemStatus?: {
    isWebAudioEnabled: boolean;
    preloadProgress?: {
      total: number;
      loaded: number;
      failed: number;
      progress: number;
    };
    fallbackStatus?: {
      currentLevel: number;
      availableLevels: string[];
      silentMode: boolean;
    };
    detailedState?: {
      initialized: boolean;
      suspended: boolean;
      loadedSounds: string[];
      activeSounds: number;
    };
  };
}

const GameInfo = memo(function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  onReset,
  onTogglePause,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  audioSystemStatus,
}: GameInfoProps) {
  const { t } = useTranslation();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  const [activeTab, setActiveTab] = useState<TabType>('game');

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
                  onReset={onReset}
                  onTogglePause={onTogglePause}
                />
              </TabsContent>

              <TabsContent value='stats' className='mt-0 h-full'>
                <StatisticsTabContent />
              </TabsContent>

              <TabsContent value='theme' className='mt-0 h-full'>
                <Suspense
                  fallback={
                    <div className='flex items-center justify-center p-4'>
                      <div className='text-cyan-300 text-sm'>{t('common.loading')}</div>
                    </div>
                  }
                >
                  <ThemeTabContent />
                </Suspense>
              </TabsContent>

              <TabsContent value='settings' className='mt-0 h-full'>
                <Suspense
                  fallback={
                    <div className='flex items-center justify-center p-4'>
                      <div className='text-cyan-300 text-sm'>{t('common.loading')}</div>
                    </div>
                  }
                >
                  {audioSystemStatus && (
                    <SettingsTabContent
                      isMuted={isMuted}
                      volume={volume}
                      onToggleMute={onToggleMute}
                      onVolumeChange={onVolumeChange}
                      settings={settings}
                      updateSettings={updateSettings}
                    />
                  )}
                </Suspense>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>

      {/* Mobile: Compact display (game info only) */}
      <div className='md:hidden h-full'>
        <MobileGameInfo
          score={score}
          level={level}
          lines={lines}
          nextPiece={nextPiece}
          gameOver={gameOver}
          isPaused={isPaused}
          onReset={onReset}
          onTogglePause={onTogglePause}
        />
      </div>
    </div>
  );
});

export default GameInfo;
