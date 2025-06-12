/**
 * Dedicated session management service class
 *
 * Simple architecture that centralizes PlaySession tracking,
 * localStorage synchronization, and unified timeout management
 */

import { PlaySession } from '../../types/tetris';
import { timeoutManager } from '../timing/TimeoutManager';

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

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: PlaySession | null = null;
  private timeoutId: string | null = null;
  private changeListeners: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
    this.setupWindowListeners();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Get the current active session
   */
  public getCurrentSession(): PlaySession | null {
    return this.currentSession;
  }

  /**
   * Get all session history
   */
  public getAllSessions(): PlaySession[] {
    if (typeof window === 'undefined') return []; // SSR support

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Start a new session
   */
  public startSession(): PlaySession {
    // End existing active session
    if (this.currentSession?.isActive) {
      this.endCurrentSession();
    }

    // Create new session
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      gameCount: 0,
      isActive: true,
    };

    this.saveCurrentSession();
    this.resetTimeout();
    this.notifyListeners();

    return this.currentSession;
  }

  /**
   * End the current session
   */
  public endCurrentSession(): void {
    if (!this.currentSession?.isActive) return;

    const completedSession: PlaySession = {
      ...this.currentSession,
      endTime: Date.now(),
      isActive: false,
    };

    // Save to session history
    this.saveSessionToHistory(completedSession);

    // Clear current session
    this.currentSession = null;
    this.clearCurrentSession();
    this.clearTimeout();
    this.notifyListeners();
  }

  /**
   * Process when game starts
   */
  public onGameStart(): void {
    // Create new session if no active session exists
    if (!this.currentSession?.isActive) {
      this.startSession();
    }

    // Increment game count
    if (this.currentSession) {
      this.currentSession = {
        ...this.currentSession,
        gameCount: this.currentSession.gameCount + 1,
      };
      this.saveCurrentSession();
      this.resetTimeout();
      this.notifyListeners();
    }
  }

  /**
   * Calculate session statistics
   */
  public getSessionStats(): SessionStats {
    const sessions = this.getAllSessions();
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        totalPlayTime: 0,
        totalGames: 0,
        averageSessionTime: 0,
        averageGamesPerSession: 0,
      };
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
  }

  /**
   * Add change listener
   */
  public addChangeListener(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Clear session history (for development and testing)
   */
  public clearAllSessions(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.endCurrentSession();
  }

  // === Private Methods ===

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // SSR support

    const stored = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!stored) return;

    try {
      const session = JSON.parse(stored);

      // Check if session has expired
      const now = Date.now();
      const timeSinceStart = now - session.startTime;

      if (timeSinceStart > SESSION_TIMEOUT) {
        // Move expired session to history
        this.saveSessionToHistory({
          ...session,
          endTime: session.startTime + SESSION_TIMEOUT,
          isActive: false,
        });
        this.clearCurrentSession();
      } else {
        this.currentSession = session;
        this.resetTimeout();
      }
    } catch {
      // Delete corrupted data
      this.clearCurrentSession();
    }
  }

  private saveCurrentSession(): void {
    if (typeof window === 'undefined') return; // SSR support

    if (this.currentSession) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  private clearCurrentSession(): void {
    if (typeof window === 'undefined') return; // SSR support

    localStorage.removeItem(CURRENT_SESSION_KEY);
  }

  private saveSessionToHistory(session: PlaySession): void {
    if (typeof window === 'undefined') return; // SSR support

    const sessions = this.getAllSessions();
    sessions.push(session);

    // Keep only the latest 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = timeoutManager.setTimeout(() => {
      this.endCurrentSession();
    }, SESSION_TIMEOUT);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      timeoutManager.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private setupWindowListeners(): void {
    if (typeof window === 'undefined') return; // SSR support

    // Process when page unloads
    const handleBeforeUnload = () => {
      this.endCurrentSession();
    };

    // Process when page focus returns
    const handleFocus = () => {
      this.loadFromStorage();
      this.notifyListeners();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
  }

  private notifyListeners(): void {
    this.changeListeners.forEach((listener) => listener());
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
