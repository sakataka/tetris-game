/**
 * Unified Game Controller Hook
 *
 * Replaces the 5-level render prop nesting in GameLogicController
 * with a clean composition hooks pattern.
 */

import { useSettings, useUpdateSettings } from '../store/settingsStore';
import {
  type AudioSystemAPI,
  type DeviceSystemAPI,
  type EventSystemAPI,
  type GameStateAPI,
  useAudioController,
  useDeviceController,
  useEventController,
  useGameStateController,
} from './controllers';

// Combined API interface
export interface GameControllerAPI
  extends GameStateAPI,
    AudioSystemAPI,
    EventSystemAPI,
    DeviceSystemAPI {
  // Settings
  settings: ReturnType<typeof useSettings>;
  updateSettings: ReturnType<typeof useUpdateSettings>;
}

/**
 * Hook that combines all game system APIs into a single interface
 * Replaces the nested render prop pattern with clean hook composition
 */
export function useGameController(): GameControllerAPI {
  // Initialize all subsystem hooks
  const eventAPI = useEventController();
  const deviceAPI = useDeviceController();
  const audioAPI = useAudioController();

  // Settings management
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  // Initialize game state with dependencies
  const gameStateAPI = useGameStateController({
    playSound: audioAPI.playSound,
    onGameStart: eventAPI.onGameStart,
  });

  // Combine all APIs into unified interface
  return {
    ...gameStateAPI,
    ...audioAPI,
    ...eventAPI,
    ...deviceAPI,
    settings,
    updateSettings,
  };
}
