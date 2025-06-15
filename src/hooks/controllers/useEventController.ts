/**
 * Event Controller Hook
 *
 * Converts EventController render prop pattern to hook composition.
 * Manages session tracking and game lifecycle events.
 */

import { useCallback } from 'react';
import { useSession } from '../useSession';

export interface EventSystemAPI {
  onGameStart: () => void;
  endSession: () => void;
}

/**
 * Hook that provides event system management functionality
 * Replaces EventController render prop pattern
 */
export function useEventController(): EventSystemAPI {
  // Session tracking integration
  const { onGameStart, endSession } = useSession();

  // Event handlers (React Compiler will optimize these)
  const handleGameStart = useCallback(() => {
    onGameStart();
  }, [onGameStart]);

  const handleEndSession = useCallback(() => {
    endSession();
  }, [endSession]);

  // Return API object
  return {
    onGameStart: handleGameStart,
    endSession: handleEndSession,
  };
}
