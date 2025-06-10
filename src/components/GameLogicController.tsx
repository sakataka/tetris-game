'use client';

import { useSettings, useUpdateSettings } from '../store/settingsStore';
import {
  GameStateController,
  AudioController,
  EventController,
  DeviceController,
  type GameStateAPI,
  type AudioSystemAPI,
  type EventSystemAPI,
  type DeviceSystemAPI,
} from './controllers';

// Combined API interface that will be passed to children
export interface GameControllerAPI
  extends GameStateAPI,
    AudioSystemAPI,
    EventSystemAPI,
    DeviceSystemAPI {
  // Settings
  settings: ReturnType<typeof useSettings>;
  updateSettings: ReturnType<typeof useUpdateSettings>;
}

interface GameLogicControllerProps {
  children: (api: GameControllerAPI) => React.ReactNode;
}

/**
 * GameLogicController now serves as an integration layer for specialized controllers.
 * Responsibilities:
 * - Controller composition and coordination
 * - Unified API surface provision
 * - Settings management
 */
export default function GameLogicController({ children }: GameLogicControllerProps) {
  // Settings management (shared across controllers)
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <EventController>
      {(eventAPI) => (
        <DeviceController>
          {(deviceAPI) => (
            <AudioController>
              {(audioAPI) => (
                <GameStateController
                  playSound={audioAPI.playSound}
                  onGameStart={eventAPI.onGameStart}
                >
                  {(gameStateAPI) => {
                    // Combine all APIs into unified interface
                    const gameControllerAPI: GameControllerAPI = {
                      ...gameStateAPI,
                      ...audioAPI,
                      ...eventAPI,
                      ...deviceAPI,
                      settings,
                      updateSettings,
                    };

                    return children(gameControllerAPI);
                  }}
                </GameStateController>
              )}
            </AudioController>
          )}
        </DeviceController>
      )}
    </EventController>
  );
}
