import { useEffect, useCallback } from 'react';
import { useSessionActions, useCurrentSession, usePlaySessions } from '../store/sessionStore';
import { SESSION_TIMEOUT } from '../types/tetris';

export function useSessionTracking() {
  const currentSession = useCurrentSession();
  const playSessions = usePlaySessions();
  const { startPlaySession, endPlaySession, incrementGameCount } = useSessionActions();

  // Start session when component mounts (user starts playing)
  useEffect(() => {
    // Only start session if there's no session at all
    if (!currentSession) {
      startPlaySession();
    }
  }, [currentSession, startPlaySession]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endPlaySession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [endPlaySession]);

  // Auto-end session after inactivity
  useEffect(() => {
    if (!currentSession?.isActive) return;

    const inactivityTimeout = setTimeout(() => {
      endPlaySession();
    }, SESSION_TIMEOUT);

    return () => clearTimeout(inactivityTimeout);
  }, [currentSession?.isActive, endPlaySession]);

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