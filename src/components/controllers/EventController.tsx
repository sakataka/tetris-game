'use client';

import { useCallback } from 'react';
import { useSessionTrackingV2 } from '../../hooks/useSessionTrackingV2';

export interface EventSystemAPI {
  onGameStart: () => void;
  endSession: () => void;
}

interface EventControllerProps {
  children: (api: EventSystemAPI) => React.ReactNode;
}

/**
 * EventController manages session tracking and game lifecycle events.
 * Responsibilities:
 * - Session lifecycle management
 * - Game start/end event coordination
 * - Event handler integration
 */
export function EventController({ children }: EventControllerProps) {
  // Session tracking integration
  const { onGameStart, endSession } = useSessionTrackingV2();

  // Stabilized event handlers
  const handleGameStart = useCallback(() => {
    onGameStart();
  }, [onGameStart]);

  const handleEndSession = useCallback(() => {
    endSession();
  }, [endSession]);

  // Construct API object
  const eventSystemAPI: EventSystemAPI = {
    onGameStart: handleGameStart,
    endSession: handleEndSession,
  };

  return children(eventSystemAPI);
}
