/**
 * Simplified session tracking hook (v2)
 *
 * Simple and efficient hook implementation
 * using SessionManager service class
 */

import { useEffect } from 'react';
import {
  useCurrentSession,
  useIsSessionActive,
  useSessionStats,
  useStartSession,
  useEndSession,
  useOnGameStart,
} from '../store/sessionStoreV2';

export function useSessionTrackingV2() {
  const currentSession = useCurrentSession();
  const isSessionActive = useIsSessionActive();
  const sessionStats = useSessionStats();
  const startSession = useStartSession();
  const endSession = useEndSession();
  const onGameStart = useOnGameStart();

  // Start session on component mount
  useEffect(() => {
    if (!currentSession) {
      startSession();
    }
  }, [currentSession, startSession]);

  return {
    // Session state
    currentSession,
    isSessionActive,
    sessionStats,

    // Session actions
    onGameStart,
    endSession,

    // Computed values
    currentSessionDuration: currentSession
      ? Math.floor((Date.now() - currentSession.startTime) / 1000)
      : 0,

    gameCountInCurrentSession: currentSession?.gameCount ?? 0,
  };
}
