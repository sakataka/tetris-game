/**
 * sessionStoreV2 テスト
 * 
 * 軽量Zustandラッパーの機能を検証
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { PlaySession } from '../types/tetris';

// SessionManagerのモック
let mockChangeListeners: Array<() => void> = [];

const mockSession: PlaySession = {
  id: 'session_123',
  startTime: Date.now(),
  gameCount: 0,
  isActive: true
};

const mockStats = {
  totalSessions: 1,
  totalPlayTime: 3600,
  totalGames: 10,
  averageSessionTime: 3600,
  averageGamesPerSession: 10
};

const mockSessionManager = {
  getCurrentSession: vi.fn().mockReturnValue(mockSession),
  getAllSessions: vi.fn().mockReturnValue([mockSession]),
  getSessionStats: vi.fn().mockReturnValue(mockStats),
  startSession: vi.fn().mockReturnValue(mockSession),
  endCurrentSession: vi.fn(),
  onGameStart: vi.fn(),
  clearAllSessions: vi.fn(),
  addChangeListener: vi.fn((listener) => {
    mockChangeListeners.push(listener);
    return () => {
      mockChangeListeners = mockChangeListeners.filter(l => l !== listener);
    };
  })
};

// Notify all listeners
const notifyListeners = () => {
  mockChangeListeners.forEach(listener => listener());
};

vi.mock('../utils/data/sessionManager', () => ({
  SessionManager: {
    getInstance: () => mockSessionManager
  },
  sessionManager: mockSessionManager
}));

// 実際のストアをインポート（モックの後に）
import { useSessionStoreV2 } from '../store/sessionStoreV2';

// ストアのアクセスを簡単にするためのエイリアス
const sessionStoreV2 = useSessionStoreV2;

describe('sessionStoreV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChangeListeners = [];
    
    // Reset mock return values
    mockSessionManager.getCurrentSession.mockReturnValue(mockSession);
    mockSessionManager.getAllSessions.mockReturnValue([mockSession]);
    mockSessionManager.getSessionStats.mockReturnValue(mockStats);
  });

  describe('Store initialization', () => {
    it('should initialize with data from sessionManager', () => {
      const state = sessionStoreV2.getState();
      
      expect(state.currentSession?.id).toBe('session_123');
      expect(state.sessions).toHaveLength(1);
      expect(state.stats.totalSessions).toBe(1);
      expect(state.isSessionActive).toBe(true);
    });

    it('should set up change listener on initialization', () => {
      // The listener should be added during store creation
      expect(mockSessionManager.addChangeListener).toHaveBeenCalled();
    });
  });

  describe('Session management', () => {
    it('should start a new session', () => {
      act(() => {
        sessionStoreV2.getState().startSession();
      });

      expect(mockSessionManager.startSession).toHaveBeenCalled();
    });

    it('should end current session', () => {
      act(() => {
        sessionStoreV2.getState().endSession();
      });

      expect(mockSessionManager.endCurrentSession).toHaveBeenCalled();
    });

    it('should increment game count on game start', () => {
      act(() => {
        sessionStoreV2.getState().onGameStart();
      });

      expect(mockSessionManager.onGameStart).toHaveBeenCalled();
    });

    it('should clear all sessions', () => {
      act(() => {
        sessionStoreV2.getState().clearAllSessions();
      });

      expect(mockSessionManager.clearAllSessions).toHaveBeenCalled();
    });
  });

  describe('Data synchronization', () => {
    it('should refresh data from sessionManager', () => {
      // Update mock data
      const newSession: PlaySession = {
        id: 'session_456',
        startTime: Date.now(),
        gameCount: 5,
        isActive: true
      };

      mockSessionManager.getCurrentSession.mockReturnValue(newSession);
      mockSessionManager.getAllSessions.mockReturnValue([newSession]);

      act(() => {
        sessionStoreV2.getState().refreshData();
      });

      const state = sessionStoreV2.getState();
      expect(state.currentSession?.id).toBe('session_456');
      expect(state.currentSession?.gameCount).toBe(5);
    });

    it('should update state when SessionManager notifies changes', () => {
      // Update mock data
      const updatedSession: PlaySession = {
        id: 'session_789',
        startTime: Date.now(),
        gameCount: 3,
        isActive: false
      };

      mockSessionManager.getCurrentSession.mockReturnValue(updatedSession);
      mockSessionManager.getAllSessions.mockReturnValue([updatedSession]);

      // Trigger change notification
      act(() => {
        notifyListeners();
      });

      const state = sessionStoreV2.getState();
      expect(state.currentSession?.id).toBe('session_789');
      expect(state.isSessionActive).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should provide correct session statistics', () => {
      const state = sessionStoreV2.getState();

      expect(state.stats).toEqual({
        totalSessions: 1,
        totalPlayTime: 3600,
        totalGames: 10,
        averageSessionTime: 3600,
        averageGamesPerSession: 10
      });
    });

    it('should update statistics when refreshed', () => {
      const newStats = {
        totalSessions: 5,
        totalPlayTime: 18000,
        totalGames: 50,
        averageSessionTime: 3600,
        averageGamesPerSession: 10
      };

      mockSessionManager.getSessionStats.mockReturnValue(newStats);

      act(() => {
        sessionStoreV2.getState().refreshData();
      });

      const state = sessionStoreV2.getState();
      expect(state.stats).toEqual(newStats);
    });
  });

  describe('Edge cases', () => {
    it('should handle null current session', () => {
      mockSessionManager.getCurrentSession.mockReturnValue(null);

      act(() => {
        sessionStoreV2.getState().refreshData();
      });

      const state = sessionStoreV2.getState();
      expect(state.currentSession).toBeNull();
      expect(state.isSessionActive).toBe(false);
    });

    it('should handle empty sessions array', () => {
      mockSessionManager.getAllSessions.mockReturnValue([]);

      act(() => {
        sessionStoreV2.getState().refreshData();
      });

      const state = sessionStoreV2.getState();
      expect(state.sessions).toEqual([]);
    });

    it('should handle SessionManager errors gracefully', () => {
      mockSessionManager.startSession.mockImplementation(() => {
        throw new Error('SessionManager error');
      });

      // Should not throw
      expect(() => {
        act(() => {
          sessionStoreV2.getState().startSession();
        });
      }).not.toThrow();
    });
  });
});