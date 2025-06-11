'use client';

import { memo, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Tetromino } from '../types/tetris';
import TabNavigation, { TabType } from './TabNavigation';
import GameTabContent from './GameTabContent';
import StatisticsTabContent from './StatisticsTabContent';
import MobileGameInfo from './MobileGameInfo';
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatisticsTabContent />;
      case 'theme':
        return (
          <Suspense
            fallback={
              <div className='flex items-center justify-center p-4'>
                <div className='text-cyan-300 text-sm'>{t('common.loading')}</div>
              </div>
            }
          >
            <ThemeTabContent />
          </Suspense>
        );
      case 'settings':
        return (
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
                audioSystemStatus={audioSystemStatus}
              />
            )}
          </Suspense>
        );
      default:
        return (
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
        );
    }
  };

  return (
    <div className='text-white h-full flex flex-col min-w-[280px]'>
      {/* Tab Navigation - Desktop only */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} className='hidden md:flex' />

      {/* Content area */}
      <div className='flex-1 overflow-auto'>
        {/* Desktop: Tab switching display */}
        <div className='hidden md:block'>{renderTabContent()}</div>

        {/* Mobile: Compact display (game info only) */}
        <div className='md:hidden'>
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
    </div>
  );
});

export default GameInfo;
