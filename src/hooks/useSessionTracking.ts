import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSessionTracking() {
  const { 
    currentSession, 
    playSessions, 
    startPlaySession, 
    endPlaySession, 
    incrementGameCount 
  } = useGameStore((state) => ({
    currentSession: state.currentSession,
    playSessions: state.playSessions,
    startPlaySession: state.startPlaySession,
    endPlaySession: state.endPlaySession,
    incrementGameCount: state.incrementGameCount
  }));

  // Start session when component mounts (user starts playing)
  useEffect(() => {
    if (!currentSession?.isActive) {
      startPlaySession();
    }

    // End session when page unloads
    const handleBeforeUnload = () => {
      endPlaySession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also end session on cleanup
      endPlaySession();
    };
  }, [currentSession, startPlaySession, endPlaySession]);

  // Auto-end session after inactivity
  useEffect(() => {
    if (!currentSession?.isActive) return;

    const inactivityTimeout = setTimeout(() => {
      endPlaySession();
    }, 30 * 60 * 1000); // 30 minutes of inactivity

    return () => clearTimeout(inactivityTimeout);
  }, [currentSession, endPlaySession]);

  const onGameStart = useCallback(() => {
    if (!currentSession?.isActive) {
      startPlaySession();
    }
    incrementGameCount();
  }, [currentSession, startPlaySession, incrementGameCount]);

  const onGameEnd = useCallback(() => {
    // Game end doesn't necessarily end the session
    // Session continues until user is inactive for 30 minutes
  }, []);

  const forceEndSession = useCallback(() => {
    endPlaySession();
  }, [endPlaySession]);

  return {
    currentSession,
    playSessions,
    onGameStart,
    onGameEnd,
    forceEndSession,
    isSessionActive: currentSession?.isActive ?? false
  };
}