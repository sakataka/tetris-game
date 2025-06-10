/**
 * Simplified session store (v2)
 *
 * Lightweight Zustand store implementation
 * based on SessionManager service class
 */

import { create } from 'zustand';
import { PlaySession } from '../types/tetris';
import { sessionManager, SessionStats } from '../utils/data/sessionManager';

interface SessionStoreV2 {
  // State (obtained from SessionManager)
  currentSession: PlaySession | null;
  sessions: PlaySession[];
  stats: SessionStats;

  // Actions (SessionManager wrappers)
  startSession: () => void;
  endSession: () => void;
  onGameStart: () => void;
  refreshData: () => void;
  clearAllSessions: () => void;

  // Utilities
  isSessionActive: boolean;
}

export const useSessionStoreV2 = create<SessionStoreV2>()((set) => {
  // Listen to change notifications from SessionManager
  const updateFromManager = () => {
    set({
      currentSession: sessionManager.getCurrentSession(),
      sessions: sessionManager.getAllSessions(),
      stats: sessionManager.getSessionStats(),
      isSessionActive: sessionManager.getCurrentSession()?.isActive ?? false,
    });
  };

  // Initial data loading
  updateFromManager();

  // Listen to SessionManager changes
  sessionManager.addChangeListener(updateFromManager);

  return {
    // Initial state
    currentSession: sessionManager.getCurrentSession(),
    sessions: sessionManager.getAllSessions(),
    stats: sessionManager.getSessionStats(),
    isSessionActive: sessionManager.getCurrentSession()?.isActive ?? false,

    // Actions
    startSession: () => {
      sessionManager.startSession();
      // No explicit state update needed here since SessionManager
      // automatically calls listeners
    },

    endSession: () => {
      sessionManager.endCurrentSession();
    },

    onGameStart: () => {
      sessionManager.onGameStart();
    },

    refreshData: () => {
      updateFromManager();
    },

    clearAllSessions: () => {
      sessionManager.clearAllSessions();
    },
  };
});

// Individual selector hooks (performance optimization)
export const useCurrentSession = () => useSessionStoreV2((state) => state.currentSession);
export const useSessionStats = () => useSessionStoreV2((state) => state.stats);
export const useIsSessionActive = () => useSessionStoreV2((state) => state.isSessionActive);
export const useAllSessions = () => useSessionStoreV2((state) => state.sessions);

// Action hooks (function reference stabilization)
export const useStartSession = () => useSessionStoreV2((state) => state.startSession);
export const useEndSession = () => useSessionStoreV2((state) => state.endSession);
export const useOnGameStart = () => useSessionStoreV2((state) => state.onGameStart);
export const useRefreshSessionData = () => useSessionStoreV2((state) => state.refreshData);
export const useClearAllSessions = () => useSessionStoreV2((state) => state.clearAllSessions);
