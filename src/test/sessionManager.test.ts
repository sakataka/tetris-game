/**
 * SessionManager integration tests
 *
 * Tests main SessionManager functionality
 * and localStorage synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../utils/data/sessionManager';

// LocalStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Function to reset SessionManager instance
const resetSessionManager = () => {
  // Reset singleton (for testing)
  // @ts-expect-error - private member access
  SessionManager.instance = undefined;
};

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset SessionManager instance
    resetSessionManager();

    // Mock timers
    vi.useFakeTimers();

    // Get new instance
    sessionManager = SessionManager.getInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionManager.clearAllSessions();
    resetSessionManager();
  });

  describe('Basic session functionality', () => {
    it('should create a new session', () => {
      const session = sessionManager.startSession();

      expect(session).toBeDefined();
      expect(session.isActive).toBe(true);
      expect(session.gameCount).toBe(0);
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should return current session', () => {
      const session = sessionManager.startSession();
      const currentSession = sessionManager.getCurrentSession();

      expect(currentSession).toEqual(session);
    });

    it('should end current session', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeNull();
    });

    it('should track game count', () => {
      sessionManager.startSession();

      sessionManager.onGameStart();
      expect(sessionManager.getCurrentSession()?.gameCount).toBe(1);

      sessionManager.onGameStart();
      expect(sessionManager.getCurrentSession()?.gameCount).toBe(2);
    });
  });

  describe('Session history management', () => {
    it('should save completed sessions to history', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0]?.isActive).toBe(false);
      expect(sessions[0]?.endTime).toBeDefined();
    });

    it('should handle multiple sessions', () => {
      // Create and end 3 sessions
      for (let i = 0; i < 3; i++) {
        sessionManager.startSession();
        sessionManager.onGameStart(); // Add game count
        sessionManager.endCurrentSession();
      }

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(3);

      // All inactive
      sessions.forEach((session) => {
        expect(session.isActive).toBe(false);
        expect(session.gameCount).toBe(1);
      });
    });
  });

  describe('localStorage synchronization', () => {
    it('should persist current session to localStorage', () => {
      const session = sessionManager.startSession();

      // Verify saved to localStorage
      const stored = localStorage.getItem('tetris-current-session');
      expect(stored).toBeTruthy();

      const parsedSession = JSON.parse(stored!);
      expect(parsedSession.id).toBe(session.id);
      expect(parsedSession.isActive).toBe(true);
    });

    it('should persist session history to localStorage', () => {
      sessionManager.startSession();
      sessionManager.endCurrentSession();

      // Verify session history is saved to localStorage
      const stored = localStorage.getItem('tetris-play-sessions');
      expect(stored).toBeTruthy();

      const sessions = JSON.parse(stored!);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].isActive).toBe(false);
    });

    it('should load existing session from localStorage', () => {
      // Manually save session to localStorage
      const testSession = {
        id: 'test-session',
        startTime: Date.now() - 5000, // 5 seconds ago
        gameCount: 2,
        isActive: true,
      };

      localStorage.setItem('tetris-current-session', JSON.stringify(testSession));

      // Create new SessionManager instance (load from localStorage)
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      const currentSession = newManager.getCurrentSession();
      expect(currentSession?.id).toBe('test-session');
      expect(currentSession?.gameCount).toBe(2);
      expect(currentSession?.isActive).toBe(true);
    });
  });

  describe('Statistics calculation', () => {
    it('should calculate session stats correctly', () => {
      // Initial state of session statistics
      let stats = sessionManager.getSessionStats();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.totalGames).toBe(0);

      // Create and end session
      sessionManager.startSession();

      // Simulate time passage
      vi.advanceTimersByTime(60000); // 1 minute

      sessionManager.onGameStart(); // 1 game
      sessionManager.endCurrentSession();

      stats = sessionManager.getSessionStats();
      expect(stats.totalSessions).toBe(1);
      expect(stats.totalPlayTime).toBe(60); // 60 seconds
      expect(stats.totalGames).toBe(1);
      expect(stats.averageSessionTime).toBe(60);
      expect(stats.averageGamesPerSession).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should handle corrupted localStorage data', () => {
      // Set corrupted data to localStorage
      localStorage.setItem('tetris-current-session', 'invalid-json');

      // Verify SessionManager operates normally
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      expect(newManager.getCurrentSession()).toBeNull();
    });

    it('should handle expired session', () => {
      // Session from over 30 minutes ago
      const expiredSession = {
        id: 'expired-session',
        startTime: Date.now() - 31 * 60 * 1000, // 31 minutes ago
        gameCount: 1,
        isActive: true,
      };

      localStorage.setItem('tetris-current-session', JSON.stringify(expiredSession));

      // Verify expired session is handled correctly
      resetSessionManager();
      const newManager = SessionManager.getInstance();

      expect(newManager.getCurrentSession()).toBeNull();

      // Verify moved to history
      const sessions = newManager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0]?.id).toBe('expired-session');
      expect(sessions[0]?.isActive).toBe(false);
    });
  });

  describe('Memory management', () => {
    it('should limit session history to 100 entries', () => {
      // Create 101 sessions
      for (let i = 0; i < 101; i++) {
        sessionManager.startSession();
        sessionManager.endCurrentSession();
      }

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(100); // Keep only latest 100
    });
  });
});
