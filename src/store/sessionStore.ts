import { create } from 'zustand';
import { PlaySession, GameError } from '../types/tetris';

interface SessionStore {
  // State
  currentSession: PlaySession | null;
  playSessions: readonly PlaySession[];
  errors: readonly GameError[];
  
  // Session Actions
  startPlaySession: () => void;
  endPlaySession: () => void;
  incrementGameCount: () => void;
  
  // Error Actions
  addError: (error: GameError) => void;
  clearErrors: () => void;
  clearError: (errorId: string) => void;
  
  // Utilities
  getActiveSession: () => PlaySession | null;
  getSessionDuration: (sessionId?: string) => number;
  getTotalPlayTime: () => number;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  // Initial state
  currentSession: null,
  playSessions: [],
  errors: [],
  
  // Session Actions
  startPlaySession: () =>
    set((state) => {
      const newPlaySessions = [...state.playSessions];
      
      // End current session if exists
      if (state.currentSession?.isActive) {
        const completedSession: PlaySession = {
          ...state.currentSession,
          endTime: Date.now(),
          isActive: false
        };
        newPlaySessions.push(completedSession);
      }

      // Start new session
      const newSession: PlaySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        startTime: Date.now(),
        gameCount: 0,
        isActive: true
      };
      
      return {
        ...state,
        currentSession: newSession,
        playSessions: newPlaySessions
      };
    }),
  
  endPlaySession: () =>
    set((state) => {
      if (!state.currentSession?.isActive) {
        return state;
      }
      
      const completedSession: PlaySession = {
        ...state.currentSession,
        endTime: Date.now(),
        isActive: false
      };
      
      // Only add if not already in the list (prevent duplicates)
      const existingSession = state.playSessions.find(s => s.id === completedSession.id);
      const newPlaySessions = [...state.playSessions];
      
      if (!existingSession) {
        newPlaySessions.push(completedSession);
      }
      
      return {
        ...state,
        currentSession: null,
        playSessions: newPlaySessions
      };
    }),
  
  incrementGameCount: () =>
    set((state) => {
      if (!state.currentSession?.isActive) {
        return state;
      }
      
      const newCurrentSession = {
        ...state.currentSession,
        gameCount: state.currentSession.gameCount + 1
      };
      
      return {
        ...state,
        currentSession: newCurrentSession
      };
    }),
  
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
        errors: newErrors
      };
    }),
  
  clearErrors: () =>
    set((state) => ({
      ...state,
      errors: []
    })),
  
  clearError: (errorId) =>
    set((state) => ({
      ...state,
      errors: state.errors.filter(error => 
        error.timestamp.toString() !== errorId
      )
    })),
  
  // Utilities
  getActiveSession: () => {
    const { currentSession } = get();
    return currentSession?.isActive ? currentSession : null;
  },
  
  getSessionDuration: (sessionId) => {
    const { currentSession, playSessions } = get();
    
    if (sessionId) {
      const session = playSessions.find(s => s.id === sessionId);
      if (session && session.endTime) {
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
  }
}));

// Selector hooks for optimized access
export const useCurrentSession = () => useSessionStore((state) => state.currentSession);
export const usePlaySessions = () => useSessionStore((state) => state.playSessions);
export const useErrors = () => useSessionStore((state) => state.errors);

// 個別アクションフック（関数参照安定化）
export const useStartPlaySession = () => useSessionStore((state) => state.startPlaySession);
export const useEndPlaySession = () => useSessionStore((state) => state.endPlaySession);
export const useIncrementGameCount = () => useSessionStore((state) => state.incrementGameCount);
export const useGetActiveSession = () => useSessionStore((state) => state.getActiveSession);
export const useGetSessionDuration = () => useSessionStore((state) => state.getSessionDuration);
export const useGetTotalPlayTime = () => useSessionStore((state) => state.getTotalPlayTime);

// エラー関連個別アクションフック
export const useAddError = () => useSessionStore((state) => state.addError);
export const useClearErrors = () => useSessionStore((state) => state.clearErrors);
export const useClearError = () => useSessionStore((state) => state.clearError);