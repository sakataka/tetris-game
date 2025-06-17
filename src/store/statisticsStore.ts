/**
 * Unified Statistics and Session Store
 *
 * Combines session management and statistics tracking
 * for simplified state management and better performance
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameStatistics, HighScore, PlaySession } from '../types/tetris';

// Session-related types
export interface SessionStats {
  totalSessions: number;
  totalPlayTime: number; // seconds
  totalGames: number;
  averageSessionTime: number; // seconds
  averageGamesPerSession: number;
}

// Constants
// const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes (for future use)

// Default values
const DEFAULT_STATISTICS: GameStatistics = {
  totalGames: 0,
  totalLines: 0,
  totalScore: 0,
  bestScore: 0,
  averageScore: 0,
  playTime: 0,
  bestStreak: 0,
  tetrisCount: 0,
};

const DEFAULT_SESSION_STATS: SessionStats = {
  totalSessions: 0,
  totalPlayTime: 0,
  totalGames: 0,
  averageSessionTime: 0,
  averageGamesPerSession: 0,
};

interface StatisticsStore {
  // Statistics State
  highScores: readonly HighScore[];
  statistics: GameStatistics;

  // Session State
  currentSession: PlaySession | null;
  playSessions: readonly PlaySession[];
  sessionStats: SessionStats;
  isSessionActive: boolean;

  // High Score Actions
  addHighScore: (score: HighScore) => void;
  clearHighScores: () => void;

  // Statistics Actions
  updateStatistics: (stats: Partial<GameStatistics>) => void;
  resetStatistics: () => void;
  incrementTotalGames: () => void;
  updateBestScore: (score: number) => void;
  addScore: (score: number) => void;
  addLines: (lines: number) => void;
  addTetris: () => void;
  addPlayTime: (time: number) => void;
  updateBestStreak: (streak: number) => void;

  // Session Actions
  startPlaySession: () => PlaySession;
  endPlaySession: () => void;
  incrementGameCount: () => void;
  clearAllSessions: () => void;

  // Computed getters
  getAverageScore: () => number;
  getEfficiency: () => number;
  getActiveSession: () => PlaySession | null;
  getSessionDuration: (sessionId?: string) => number;
  getTotalPlayTime: () => number;
}

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      highScores: [],
      statistics: DEFAULT_STATISTICS,
      currentSession: null,
      playSessions: [],
      sessionStats: DEFAULT_SESSION_STATS,
      isSessionActive: false,

      // High Score Actions
      addHighScore: (score) =>
        set((state) => {
          const newHighScores = [...state.highScores, score]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Keep top 10
          return { highScores: newHighScores };
        }),

      clearHighScores: () => set({ highScores: [] }),

      // Statistics Actions
      updateStatistics: (stats) =>
        set((state) => ({
          statistics: { ...state.statistics, ...stats },
        })),

      resetStatistics: () =>
        set({
          statistics: DEFAULT_STATISTICS,
          highScores: [],
        }),

      incrementTotalGames: () =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            totalGames: state.statistics.totalGames + 1,
          },
        })),

      updateBestScore: (score) =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            bestScore: Math.max(state.statistics.bestScore, score),
          },
        })),

      addScore: (score) =>
        set((state) => {
          const newTotalScore = state.statistics.totalScore + score;
          const newAverageScore =
            state.statistics.totalGames > 0 ? newTotalScore / state.statistics.totalGames : 0;

          return {
            statistics: {
              ...state.statistics,
              totalScore: newTotalScore,
              averageScore: newAverageScore,
              bestScore: Math.max(state.statistics.bestScore, score),
            },
          };
        }),

      addLines: (lines) =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            totalLines: state.statistics.totalLines + lines,
          },
        })),

      addTetris: () =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            tetrisCount: state.statistics.tetrisCount + 1,
          },
        })),

      addPlayTime: (time) =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            playTime: state.statistics.playTime + time,
          },
        })),

      updateBestStreak: (streak) =>
        set((state) => ({
          statistics: {
            ...state.statistics,
            bestStreak: Math.max(state.statistics.bestStreak, streak),
          },
        })),

      // Session Actions
      startPlaySession: () => {
        const newSession: PlaySession = {
          id: `session_${Date.now()}`,
          startTime: Date.now(),
          endTime: null as number | null,
          gamesPlayed: 0,
          isActive: true,
        };

        set((state) => ({
          currentSession: newSession,
          playSessions: [...state.playSessions, newSession],
          isSessionActive: true,
        }));

        return newSession;
      },

      endPlaySession: () =>
        set((state) => {
          if (!state.currentSession) return state;

          const endedSession = {
            ...state.currentSession,
            endTime: Date.now(),
            isActive: false,
          };

          const updatedSessions = state.playSessions.map((session) =>
            session.id === state.currentSession?.id ? endedSession : session
          );

          // Recalculate session stats
          const sessionStats = calculateSessionStats(updatedSessions);

          return {
            currentSession: null,
            playSessions: updatedSessions,
            sessionStats,
            isSessionActive: false,
          };
        }),

      incrementGameCount: () =>
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            gamesPlayed: (state.currentSession.gamesPlayed || 0) + 1,
          };

          const updatedSessions = state.playSessions.map((session) =>
            session.id === state.currentSession?.id ? updatedSession : session
          );

          return {
            currentSession: updatedSession,
            playSessions: updatedSessions,
          };
        }),

      clearAllSessions: () =>
        set({
          currentSession: null,
          playSessions: [],
          sessionStats: DEFAULT_SESSION_STATS,
          isSessionActive: false,
        }),

      // Computed getters
      getAverageScore: () => {
        const { statistics } = get();
        return statistics.totalGames > 0 ? statistics.totalScore / statistics.totalGames : 0;
      },

      getEfficiency: () => {
        const { statistics } = get();
        return statistics.playTime > 0 ? statistics.totalLines / (statistics.playTime / 60) : 0;
      },

      getActiveSession: () => get().currentSession,

      getSessionDuration: (sessionId) => {
        const { currentSession, playSessions } = get();

        if (sessionId) {
          const session = playSessions.find((s) => s.id === sessionId);
          if (!session) return 0;
          return (session.endTime || Date.now()) - session.startTime;
        }

        if (!currentSession) return 0;
        return (currentSession.endTime || Date.now()) - currentSession.startTime;
      },

      getTotalPlayTime: () => {
        const { playSessions } = get();
        return playSessions.reduce((total, session) => {
          const duration = (session.endTime || Date.now()) - session.startTime;
          return total + duration;
        }, 0);
      },
    }),
    {
      name: 'tetris-statistics',
      partialize: (state) => ({
        highScores: state.highScores,
        statistics: state.statistics,
        playSessions: state.playSessions,
        sessionStats: state.sessionStats,
        // Don't persist currentSession - it's runtime state
      }),
    }
  )
);

// Helper function to calculate session statistics
function calculateSessionStats(sessions: readonly PlaySession[]): SessionStats {
  const completedSessions = sessions.filter((s) => s.endTime !== null);

  if (completedSessions.length === 0) {
    return DEFAULT_SESSION_STATS;
  }

  const totalPlayTime =
    completedSessions.reduce((total, session) => {
      return total + ((session.endTime || 0) - session.startTime);
    }, 0) / 1000; // Convert to seconds

  const totalGames = completedSessions.reduce((total, session) => {
    return total + (session.gamesPlayed || 0);
  }, 0);

  return {
    totalSessions: completedSessions.length,
    totalPlayTime,
    totalGames,
    averageSessionTime: totalPlayTime / completedSessions.length,
    averageGamesPerSession: totalGames / completedSessions.length,
  };
}

// Selector hooks for statistics
export const useHighScores = () => useStatisticsStore((state) => state.highScores);
export const useStatistics = () => useStatisticsStore((state) => state.statistics);

// Selector hooks for sessions
export const useCurrentSession = () => useStatisticsStore((state) => state.currentSession);
export const usePlaySessions = () => useStatisticsStore((state) => state.playSessions);
export const useSessionStats = () => useStatisticsStore((state) => state.sessionStats);
export const useIsSessionActive = () => useStatisticsStore((state) => state.isSessionActive);

// Action hooks for statistics
export const useAddHighScore = () => useStatisticsStore((state) => state.addHighScore);
export const useClearHighScores = () => useStatisticsStore((state) => state.clearHighScores);
export const useUpdateStatistics = () => useStatisticsStore((state) => state.updateStatistics);
export const useResetStatistics = () => useStatisticsStore((state) => state.resetStatistics);
export const useIncrementTotalGames = () =>
  useStatisticsStore((state) => state.incrementTotalGames);
export const useUpdateBestScore = () => useStatisticsStore((state) => state.updateBestScore);
export const useAddScore = () => useStatisticsStore((state) => state.addScore);
export const useAddLines = () => useStatisticsStore((state) => state.addLines);
export const useAddTetris = () => useStatisticsStore((state) => state.addTetris);
export const useAddPlayTime = () => useStatisticsStore((state) => state.addPlayTime);
export const useUpdateBestStreak = () => useStatisticsStore((state) => state.updateBestStreak);

// Action hooks for sessions
export const useStartPlaySession = () => useStatisticsStore((state) => state.startPlaySession);
export const useEndPlaySession = () => useStatisticsStore((state) => state.endPlaySession);
export const useIncrementGameCount = () => useStatisticsStore((state) => state.incrementGameCount);
export const useClearAllSessions = () => useStatisticsStore((state) => state.clearAllSessions);

// Computed getters
export const useGetAverageScore = () => useStatisticsStore((state) => state.getAverageScore);
export const useGetEfficiency = () => useStatisticsStore((state) => state.getEfficiency);
export const useGetActiveSession = () => useStatisticsStore((state) => state.getActiveSession);
export const useGetSessionDuration = () => useStatisticsStore((state) => state.getSessionDuration);
export const useGetTotalPlayTime = () => useStatisticsStore((state) => state.getTotalPlayTime);
