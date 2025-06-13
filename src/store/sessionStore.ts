/**
 * Unified session management store
 *
 * Replaces SessionManager + sessionStoreV2 architecture with
 * a single Zustand store to eliminate synchronization issues.
 * Includes localStorage persistence, timeout management, and statistics.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameError, PlaySession } from '../types/tetris';

const SESSION_STORAGE_KEY = 'tetris-play-sessions';
const CURRENT_SESSION_KEY = 'tetris-current-session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export interface SessionStats {
  totalSessions: number;
  totalPlayTime: number; // seconds
  totalGames: number;
  averageSessionTime: number; // seconds
  averageGamesPerSession: number;
}

interface SessionStore {
  // State
  currentSession: PlaySession | null;
  playSessions: readonly PlaySession[];
  errors: readonly GameError[];
  stats: SessionStats;
  isSessionActive: boolean;

  // Internal state for timeout management
  timeoutId: NodeJS.Timeout | null;

  // Session Actions (enhanced with persistence)
  startPlaySession: () => PlaySession;
  endPlaySession: () => void;
  incrementGameCount: () => void;
  onGameStart: () => void;
  clearAllSessions: () => void;
  refreshFromStorage: () => void;

  // Error Actions
  addError: (error: GameError) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;

  // Utilities
  getActiveSession: () => PlaySession | null;
  getSessionDuration: (sessionId?: string) => number;
  getTotalPlayTime: () => number;

  // Internal methods
  _setTimeoutId: (id: NodeJS.Timeout | null) => void;
  _saveCurrentSession: () => void;
  _clearCurrentSession: () => void;
  _saveSessionToHistory: (session: PlaySession) => void;
  _loadFromStorage: () => void;
  _calculateStats: () => SessionStats;
  _generateSessionId: () => string;
}

const defaultStats: SessionStats = {
  totalSessions: 0,
  totalPlayTime: 0,
  totalGames: 0,
  averageSessionTime: 0,
  averageGamesPerSession: 0,
};

export const useSessionStore = create<SessionStore>()(
  subscribeWithSelector((set, get) => {
    // Helper function to get sessions from localStorage
    const getStoredSessions = (): PlaySession[] => {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return [];

      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    };

    // Helper function to calculate stats
    const calculateStats = (sessions: PlaySession[]): SessionStats => {
      const totalSessions = sessions.length;

      if (totalSessions === 0) {
        return defaultStats;
      }

      const totalPlayTime =
        sessions.reduce((total, session) => {
          if (session.endTime) {
            return total + (session.endTime - session.startTime);
          }
          return total;
        }, 0) / 1000; // Convert to seconds

      const totalGames = sessions.reduce((total, session) => {
        return total + session.gameCount;
      }, 0);

      return {
        totalSessions,
        totalPlayTime,
        totalGames,
        averageSessionTime: totalPlayTime / totalSessions,
        averageGamesPerSession: totalGames / totalSessions,
      };
    };

    // Initial state setup
    const initialSessions = getStoredSessions();
    const initialStats = calculateStats(initialSessions);

    return {
      // Initial state
      currentSession: null,
      playSessions: initialSessions,
      errors: [],
      stats: initialStats,
      isSessionActive: false,
      timeoutId: null,

      // Session Actions (enhanced with persistence)
      startPlaySession: () => {
        const state = get();

        // End existing active session
        if (state.currentSession?.isActive) {
          state.endPlaySession();
        }

        // Create new session
        const newSession: PlaySession = {
          id: state._generateSessionId(),
          startTime: Date.now(),
          gameCount: 0,
          isActive: true,
        };

        // Setup timeout
        const timeoutId = setTimeout(() => {
          get().endPlaySession();
        }, SESSION_TIMEOUT);

        set((currentState) => ({
          ...currentState,
          currentSession: newSession,
          isSessionActive: true,
          timeoutId,
        }));

        // Save to storage
        get()._saveCurrentSession();

        return newSession;
      },

      endPlaySession: () => {
        const state = get();
        if (!state.currentSession?.isActive) return;

        const completedSession: PlaySession = {
          ...state.currentSession,
          endTime: Date.now(),
          isActive: false,
        };

        // Clear timeout
        if (state.timeoutId) {
          clearTimeout(state.timeoutId);
        }

        // Save to history and update state
        state._saveSessionToHistory(completedSession);
        const updatedSessions = getStoredSessions();
        const updatedStats = calculateStats(updatedSessions);

        set((currentState) => ({
          ...currentState,
          currentSession: null,
          playSessions: updatedSessions,
          stats: updatedStats,
          isSessionActive: false,
          timeoutId: null,
        }));

        // Clear from storage
        get()._clearCurrentSession();
      },

      incrementGameCount: () => {
        const state = get();
        if (!state.currentSession?.isActive) return;

        const updatedSession = {
          ...state.currentSession,
          gameCount: state.currentSession.gameCount + 1,
        };

        set((currentState) => ({
          ...currentState,
          currentSession: updatedSession,
        }));

        // Save to storage
        get()._saveCurrentSession();
      },

      onGameStart: () => {
        const state = get();

        // Create new session if no active session exists
        if (!state.currentSession?.isActive) {
          state.startPlaySession();
          return;
        }

        // Increment game count for existing session
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            gameCount: state.currentSession.gameCount + 1,
          };

          // Reset timeout
          if (state.timeoutId) {
            clearTimeout(state.timeoutId);
          }

          const timeoutId = setTimeout(() => {
            get().endPlaySession();
          }, SESSION_TIMEOUT);

          set((currentState) => ({
            ...currentState,
            currentSession: updatedSession,
            timeoutId,
          }));

          // Save to storage
          get()._saveCurrentSession();
        }
      },

      clearAllSessions: () => {
        const state = get();

        // End current session
        if (state.currentSession?.isActive) {
          state.endPlaySession();
        }

        // Clear storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }

        set((currentState) => ({
          ...currentState,
          playSessions: [],
          stats: defaultStats,
        }));
      },

      refreshFromStorage: () => {
        const updatedSessions = getStoredSessions();
        const updatedStats = calculateStats(updatedSessions);

        set((currentState) => ({
          ...currentState,
          playSessions: updatedSessions,
          stats: updatedStats,
        }));

        // Load current session
        get()._loadFromStorage();
      },

      // Error Actions
      addError: (error) =>
        set((state) => {
          const newErrors = [...state.errors, error];
          // Keep only last 50 errors to prevent memory issues
          if (newErrors.length > 50) {
            newErrors.splice(0, newErrors.length - 50);
          }
          return {
            ...state,
            errors: newErrors,
          };
        }),

      clearErrors: () =>
        set((state) => ({
          ...state,
          errors: [],
        })),

      clearError: (errorId) =>
        set((state) => ({
          ...state,
          errors: state.errors.filter((error) => error.timestamp.toString() !== errorId),
        })),

      // Utilities
      getActiveSession: () => {
        const { currentSession } = get();
        return currentSession?.isActive ? currentSession : null;
      },

      getSessionDuration: (sessionId) => {
        const { currentSession, playSessions } = get();

        if (sessionId) {
          const session = playSessions.find((s) => s.id === sessionId);
          if (session?.endTime) {
            return (session.endTime - session.startTime) / 1000; // seconds
          }
        }

        // Get current session duration
        if (currentSession?.isActive) {
          return (Date.now() - currentSession.startTime) / 1000; // seconds
        }

        return 0;
      },

      getTotalPlayTime: () => {
        const { playSessions } = get();
        return playSessions.reduce((total, session) => {
          if (session.endTime) {
            return total + (session.endTime - session.startTime) / 1000; // seconds
          }
          return total;
        }, 0);
      },

      // Internal methods
      _setTimeoutId: (id) => set((state) => ({ ...state, timeoutId: id })),

      _saveCurrentSession: () => {
        const state = get();
        if (typeof window === 'undefined') return;

        if (state.currentSession) {
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(state.currentSession));
        }
      },

      _clearCurrentSession: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(CURRENT_SESSION_KEY);
      },

      _saveSessionToHistory: (session) => {
        if (typeof window === 'undefined') return;

        const sessions = getStoredSessions();
        sessions.push(session);

        // Keep only the latest 100 sessions
        if (sessions.length > 100) {
          sessions.splice(0, sessions.length - 100);
        }

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
      },

      _loadFromStorage: () => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(CURRENT_SESSION_KEY);
        if (!stored) return;

        try {
          const session = JSON.parse(stored);

          // Check if session has expired
          const now = Date.now();
          const timeSinceStart = now - session.startTime;

          if (timeSinceStart > SESSION_TIMEOUT) {
            // Move expired session to history
            const expiredSession = {
              ...session,
              endTime: session.startTime + SESSION_TIMEOUT,
              isActive: false,
            };
            get()._saveSessionToHistory(expiredSession);
            get()._clearCurrentSession();

            // Update sessions and stats
            const updatedSessions = getStoredSessions();
            const updatedStats = calculateStats(updatedSessions);

            set((currentState) => ({
              ...currentState,
              playSessions: updatedSessions,
              stats: updatedStats,
            }));
          } else {
            // Setup timeout for valid session
            const timeoutId = setTimeout(() => {
              get().endPlaySession();
            }, SESSION_TIMEOUT - timeSinceStart);

            set((currentState) => ({
              ...currentState,
              currentSession: session,
              isSessionActive: session.isActive,
              timeoutId,
            }));
          }
        } catch {
          // Delete corrupted data
          get()._clearCurrentSession();
        }
      },

      _calculateStats: () => {
        const sessions = getStoredSessions();
        return calculateStats(sessions);
      },

      _generateSessionId: () => {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      },
    };
  })
);

// Selector hooks for optimized access
export const useCurrentSession = () => useSessionStore((state) => state.currentSession);
export const usePlaySessions = () => useSessionStore((state) => state.playSessions);
export const useAllSessions = () => useSessionStore((state) => state.playSessions); // Alias for compatibility
export const useSessionStats = () => useSessionStore((state) => state.stats);
export const useIsSessionActive = () => useSessionStore((state) => state.isSessionActive);
export const useErrors = () => useSessionStore((state) => state.errors);

// Session action hooks (enhanced with persistence)
export const useStartSession = () => useSessionStore((state) => state.startPlaySession); // Alias for compatibility
export const useStartPlaySession = () => useSessionStore((state) => state.startPlaySession);
export const useEndSession = () => useSessionStore((state) => state.endPlaySession); // Alias for compatibility
export const useEndPlaySession = () => useSessionStore((state) => state.endPlaySession);
export const useOnGameStart = () => useSessionStore((state) => state.onGameStart);
export const useIncrementGameCount = () => useSessionStore((state) => state.incrementGameCount);
export const useClearAllSessions = () => useSessionStore((state) => state.clearAllSessions);
export const useRefreshSessionData = () => useSessionStore((state) => state.refreshFromStorage);

// Utility hooks
export const useGetActiveSession = () => useSessionStore((state) => state.getActiveSession);
export const useGetSessionDuration = () => useSessionStore((state) => state.getSessionDuration);
export const useGetTotalPlayTime = () => useSessionStore((state) => state.getTotalPlayTime);

// Error-related action hooks
export const useAddError = () => useSessionStore((state) => state.addError);
export const useClearErrors = () => useSessionStore((state) => state.clearErrors);
export const useClearError = () => useSessionStore((state) => state.clearError);

// Initialize store on first access (SSR-safe)
if (typeof window !== 'undefined') {
  // Setup window event listeners
  const handleBeforeUnload = () => {
    const state = useSessionStore.getState();
    if (state.currentSession?.isActive) {
      state.endPlaySession();
    }
  };

  const handleFocus = () => {
    const state = useSessionStore.getState();
    state.refreshFromStorage();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('focus', handleFocus);

  // Load initial data
  useSessionStore.getState()._loadFromStorage();
}
