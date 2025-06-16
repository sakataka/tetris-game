import { useEffect } from 'react';
import {
  useCurrentSession,
  useEndPlaySession,
  useIsSessionActive,
  useIncrementGameCount,
  useSessionStats,
  useStartPlaySession,
} from '../store/statisticsStore';

/**
 * Unified session tracking hook
 *
 * Consolidates session management functionality:
 * - Session lifecycle management
 * - Game tracking within sessions
 * - Session statistics
 * - Automatic session cleanup
 */
export function useSession() {
  const currentSession = useCurrentSession();
  const isSessionActive = useIsSessionActive();
  const sessionStats = useSessionStats();
  const startSession = useStartPlaySession();
  const endSession = useEndPlaySession();
  const onGameStart = useIncrementGameCount();

  // Start session on component mount if none exists
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
    startSession,

    // Computed values
    currentSessionDuration: currentSession
      ? Math.floor((Date.now() - currentSession.startTime) / 1000)
      : 0,

    gameCountInCurrentSession: currentSession?.gamesPlayed ?? 0,

    // Utility functions
    hasActiveSession: !!currentSession && isSessionActive,
    sessionStartTime: currentSession?.startTime ?? null,
    totalPlayTime: sessionStats.totalPlayTime,
    averageSessionDuration: sessionStats.averageSessionTime,
    totalSessions: sessionStats.totalSessions,
  };
}

// ===== Legacy Compatibility Exports =====

/**
 * Legacy session tracking hook (V1) for backward compatibility
 * @deprecated Use useSession instead
 */
export function useSessionTracking() {
  const session = useSession();

  return {
    currentSession: session.currentSession,
    playSessions: [], // Legacy field, no longer used
    onGameStart: session.onGameStart,
    onGameEnd: () => {}, // Legacy no-op
    forceEndSession: session.endSession,
    isSessionActive: session.isSessionActive,
  };
}

/**
 * Legacy session tracking hook (V2) for backward compatibility
 * @deprecated Use useSession instead
 */
export function useSessionTrackingV2() {
  return useSession();
}
