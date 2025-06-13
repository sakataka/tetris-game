'use client';

import type React from 'react';
import { useSession } from '../../hooks/useSession';

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
  const { onGameStart, endSession } = useSession();

  // Event handlers (React Compiler will optimize these)
  const handleGameStart = () => {
    onGameStart();
  };

  const handleEndSession = () => {
    endSession();
  };

  // Construct API object
  const eventSystemAPI: EventSystemAPI = {
    onGameStart: handleGameStart,
    endSession: handleEndSession,
  };

  return children(eventSystemAPI);
}
